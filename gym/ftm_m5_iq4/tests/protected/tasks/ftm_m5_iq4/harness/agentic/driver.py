"""Record and replay agentic traces on a FreeToken-metal checkout (runs in that checkout's venv).

build (the naive checkout): runs a real coding-agent loop (agent_env.py) through the serving
  path's own pieces: each turn's prompt is the conversation rendered by the checkpoint's chat
  template with ftmetal's TokenizeManager (tools, reasoning effort, the reuse_len a next turn
  shares), the reply is sampled with the checkpoint's recommended parameters, split by the
  qwen3 reasoning parser and the qwen3_coder tool-call parser exactly as `ftm serve` does, and
  the parsed tool calls are executed against a scratch copy of the repository. The next turn
  re-renders the whole conversation, so its prompt shares with the previous one only what the
  template reproduces (as for a real client). Also records upstream FreeToken's decode
  benchmark (an AIME-25 prompt, 256 tokens), the free-running probe prompts, and at every
  response position the top-20 log-probabilities (the KLD reference) and the top-2 margin.

eval: every turn's recorded prompt is submitted as is (with its reuse_len), and every step's
  token is replaced by the recorded one (teacher forcing), so every implementation does the
  same work; records each step's prediction, its log-probabilities at the reference's top-20
  tokens, and the timings. Then (unless --no-probes) generates freely from each probe prompt
  with the recommended sampling, for the tool-call validity gate, untimed.

The harness relies only on: Scheduler(EngineConfig(model_path=..., kv_reserve_tokens=CONTEXT),
eos_token_ids) serving prompts of up to CONTEXT tokens (scheduler.engine.max_seq_len),
add_request(uid, input_ids, params, reuse_len) / run_until_idle / prompt_admissions / send_result,
Engine.forward_batch(batch, args), engine.sampler.sample(logits, args) called once per
forward_batch with that step's final target-model logits [rows, vocab] and whose returned tokens
are the ones the engine emits, and Req.uid / Req.device_len (the sequence length including the
step's input). Without speculation a step has one row per request (rows == len(batch.reqs)).
A speculating engine verifies several positions per request in one step and sets
args.sample_rows to one (uid, base, drafts) per logits row: the row predicts position
base + len(drafts), where base is the request's device_len when forward_batch is entered, and drafts (ints or an int32
mx.array) are the draft tokens fed at positions base .. base + len(drafts) - 1. In eval mode
a row whose drafts all equal the recorded tokens gets the recorded token from sample(); any
other row gets the engine's own sample, so a verify step learns nothing it did not predict.
Draft-model logits never go through engine.sampler.sample.

usage: driver.py build --model DIR --repo CHECKOUT --out TRACE.json [--env ENV.py]
       driver.py eval --model DIR --trace TRACE.json --out OUT.json [--sessions N] [--no-probes]
"""

from __future__ import annotations

import argparse
import importlib.util
import json
import sys
import time
import uuid
from pathlib import Path

import mlx.core as mx
import numpy as np
from ftmetal.core import SamplingParams
from ftmetal.engine.config import EngineConfig
from ftmetal.scheduler.scheduler import Scheduler

EOS = (248044, 248046)
TOPK = 20
MAX_TURNS = 8
WARMUP_TURNS = 2
MAX_NEW = 1024
PROBE_MAX_NEW = 768
SEED = 20261017
# The context every engine must serve: upstream FreeToken's offload recipe budget.
CONTEXT = 32768
# A built prompt leaves at least this much of CONTEXT for its reply (MAX_NEW) and the next turn.
PROMPT_ROOM = 2048
TEMPLATE_KWARGS = {"reasoning_effort": "low"}


class Hooks:
    def __init__(self, scheduler: Scheduler, build: bool) -> None:
        engine = scheduler.engine
        self.build = build
        self.forced: dict[int, np.ndarray] = {}
        # uid -> (first response position, reference top-k ids [n, TOPK]) for eval-mode KLD.
        self.ref_ids: dict[int, tuple[int, np.ndarray]] = {}
        # (row keys (uid, position), argmax predictions, top-k ids, top-k log-probs, row valid)
        self.steps: list[tuple[list[tuple[int, int]], mx.array, mx.array, mx.array, mx.array]] = []
        self.event_times: dict[int, list[float]] = {}
        self._reqs: list = []
        self._calls = 0
        forward_batch = engine.forward_batch
        sample = engine.sampler.sample

        def rows_of(args) -> list[tuple[int, int, object]]:
            rows = getattr(args, "sample_rows", None)
            if rows is None:
                return [(uid, base, ()) for uid, base in self._reqs]
            return [(int(uid), int(base), drafts) for uid, base, drafts in rows]

        def hooked_sample(logits, args):
            self._calls += 1
            rows = rows_of(args)
            if len(rows) != logits.shape[0]:
                raise RuntimeError(f"{logits.shape[0]} logits rows but {len(rows)} sample rows "
                                   "(set args.sample_rows when a step verifies drafts)")
            keys = [(uid, base + len(drafts)) for uid, base, drafts in rows]
            lf = logits.astype(mx.float32)
            logp = lf - mx.logsumexp(lf, axis=-1, keepdims=True)
            if build:
                ids = mx.argpartition(-logp, TOPK - 1, axis=-1)[:, :TOPK]
            else:
                refs = []
                for uid, pos in keys:
                    ref = self.ref_ids.get(uid)
                    i = pos - ref[0] if ref is not None else -1
                    refs.append(ref[1][i] if ref is not None and 0 <= i < len(ref[1])
                                else np.zeros(TOPK, dtype=np.int32))
                ids = mx.array(np.stack(refs).astype(np.int32))
            sampled = sample(logits, args)
            # A row is valid when its context is the recorded sequence (always, unforced).
            valid, tokens = [], []
            for uid, base, drafts in rows:
                seq = self.forced.get(uid)
                n = len(drafts)
                if seq is None:
                    valid.append(mx.array(True))
                    tokens.append(0)
                elif base + n >= len(seq):
                    valid.append(mx.array(False))
                    tokens.append(0)
                elif n == 0:
                    valid.append(mx.array(True))
                    tokens.append(int(seq[base]))
                else:
                    ref = mx.array(seq[base:base + n].astype(np.int32))
                    valid.append(mx.all(ref == mx.array(drafts).reshape(-1).astype(mx.int32)))
                    tokens.append(int(seq[base + n]))
            valid = mx.stack(valid)
            forced = mx.array([uid in self.forced for uid, _, _ in rows])
            self.steps.append((keys, mx.argmax(logp, axis=-1), ids,
                               mx.take_along_axis(logp, ids, axis=-1), valid))
            if not self.forced:
                return sampled
            flat = sampled.reshape(-1)
            out = mx.where(forced & valid, mx.array(np.array(tokens, dtype=np.int32)), flat)
            return out.astype(sampled.dtype).reshape(sampled.shape)

        engine.sampler.sample = hooked_sample

        def hooked_forward_batch(batch, args):
            self._reqs = [(req.uid, req.device_len) for req in batch.reqs]
            self._calls = 0
            out = forward_batch(batch, args)
            if self._calls != 1:
                raise RuntimeError("engine.sampler.sample must run once per forward_batch")
            return out

        engine.forward_batch = hooked_forward_batch
        send_result = scheduler.send_result

        def hooked_send_result(events):
            now = time.perf_counter()
            for event in events:
                self.event_times.setdefault(event.uid, []).append(now)
            return send_result(events)

        scheduler.send_result = hooked_send_result

    def take_positions(self, uid: int, start: int, end: int):
        """(predicted tokens, top-k ids, top-k log-probs) at each position in [start, end)."""
        preds: dict[int, int] = {}
        ids: dict[int, np.ndarray] = {}
        lps: dict[int, np.ndarray] = {}
        for keys, tokens, step_ids, step_lps, step_valid in self.steps:
            rows = [i for i, (u, p) in enumerate(keys) if u == uid and start <= p < end]
            if not rows:
                continue
            values, ok = np.array(tokens).reshape(-1), np.array(step_valid).reshape(-1)
            step_ids, step_lps = np.array(step_ids), np.array(step_lps)
            for i in rows:
                if not ok[i]:
                    continue
                pos = keys[i][1]
                preds[pos], ids[pos], lps[pos] = int(values[i]), step_ids[i], step_lps[i]
        self.steps = [s for s in self.steps if all(u != uid for u, _ in s[0])]
        missing = [p for p in range(start, end) if p not in preds]
        if missing:
            raise RuntimeError(f"request {uid}: no prediction from the recorded context for "
                               f"positions {missing[:8]}...")
        span = range(start, end)
        return ([preds[p] for p in span], np.stack([ids[p] for p in span]),
                np.stack([lps[p] for p in span]))


def make_scheduler(model: str) -> Scheduler:
    scheduler = Scheduler(EngineConfig(model_path=model, kv_reserve_tokens=CONTEXT),
                          eos_token_ids=set(EOS))
    if scheduler.engine.max_seq_len < CONTEXT:
        raise RuntimeError(f"the engine serves {scheduler.engine.max_seq_len} tokens < {CONTEXT}")
    return scheduler


def submit(scheduler, hooks, uid, input_ids, reuse_len, params):
    """Run one request to completion; its tokens and timing record."""
    start = time.perf_counter()
    scheduler.add_request(uid, np.asarray(input_ids, dtype=np.int32), params, reuse_len)
    events = scheduler.run_until_idle()
    wall = time.perf_counter() - start
    tokens = [e.token for e in events if e.uid == uid]
    cached = next((a.cached_tokens for a in scheduler.prompt_admissions if a.uid == uid), None)
    scheduler.prompt_admissions = [a for a in scheduler.prompt_admissions if a.uid != uid]
    times = hooks.event_times.pop(uid, [start + wall])
    record = {
        "prompt_tokens": len(input_ids),
        "cached_tokens": cached,
        "generated": len(tokens),
        "wall_s": wall,
        "ttft_s": times[0] - start,
        "decode_s": times[-1] - times[0],
    }
    return tokens, record


# ---------------------------------------------------------------------------------------------
# build


class Agent:
    """The serving path's chat pieces, as `ftm serve` composes them for one model."""

    def __init__(self, model: str) -> None:
        from ftmetal.server.function_call_parser import FunctionCallParser
        from ftmetal.server.reasoning_parser import ReasoningParser
        from ftmetal.tokenizer import TokenizeManager, load_sampling_defaults

        self.tm = TokenizeManager(model)
        self.defaults = load_sampling_defaults(model)
        self.FunctionCallParser = FunctionCallParser
        self.ReasoningParser = ReasoningParser

    def tokenize(self, uid, messages, tools, kwargs):
        from ftmetal.message.tokenizer import TokenizeMsg

        msg = TokenizeMsg(uid=uid, text=messages, sampling_params=self.defaults,
                          chat_template_kwargs=kwargs, tools=tools)
        user = self.tm.tokenize(msg)
        return [int(t) for t in user.input_ids], int(user.reuse_len)

    def params(self, max_tokens: int, ignore_eos: bool = False) -> SamplingParams:
        d = self.defaults
        return SamplingParams(temperature=d.temperature, top_k=d.top_k, top_p=d.top_p,
                              max_tokens=max_tokens, ignore_eos=ignore_eos)

    def parse(self, tokens: list[int], tools) -> tuple[str, str, list[dict], bool]:
        """(reasoning, content, tool calls, finished) of a reply, as the server parses it."""
        finished = bool(tokens) and tokens[-1] in EOS
        text = self.tm.tokenizer.decode(tokens[:-1] if finished else tokens,
                                        skip_special_tokens=False)
        reasoning, content = self.ReasoningParser("qwen3", force_reasoning=True).parse_non_stream(
            text)
        calls = []
        if tools:
            parsed = self.FunctionCallParser(tools, "qwen3_coder").parse_non_stream(content)
            content = parsed.normal_text
            for call in parsed.calls:
                calls.append({"id": "call_" + uuid.uuid4().hex[:12], "type": "function",
                              "function": {"name": call.name,
                                           "arguments": json.loads(call.parameters or "{}")}})
        return reasoning.strip(), content.strip(), calls, finished


def record_turn(hooks, uid, input_ids, reuse_len, tokens, record):
    _, ids, lps = hooks.take_positions(uid, len(input_ids), len(input_ids) + len(tokens))
    top2 = np.sort(lps, axis=-1)[:, -2:]
    return {
        "input_ids": input_ids,
        "reuse_len": reuse_len,
        "response": tokens,
        "margins": [round(float(m), 4) for m in top2[:, 1] - top2[:, 0]],
        "ref_ids": ids.astype(int).tolist(),
        "ref_lps": np.round(lps, 5).tolist(),
        "build": record,
    }


def build_session(scheduler, hooks, agent, env, sandbox, system, task, uid_base,
                  max_turns=MAX_TURNS, followups=()):
    """One agent conversation: up to max_turns model calls per user message; when the model
    answers without a tool call, the next of followups becomes the next user message, until
    a prompt would leave less than PROMPT_ROOM of the context."""
    messages = [{"role": "system", "content": system}, {"role": "user", "content": task}]
    pending = list(followups)
    turns = []
    k = 0
    calls_left = max_turns
    while calls_left > 0:
        uid = uid_base + k
        input_ids, reuse_len = agent.tokenize(uid, messages, env.TOOLS, TEMPLATE_KWARGS)
        if len(input_ids) > CONTEXT - PROMPT_ROOM:
            print(f"  turn {k}: prompt {len(input_ids)} leaves < {PROMPT_ROOM} of the context, "
                  "session ends", flush=True)
            break
        k += 1
        calls_left -= 1
        mx.random.seed(SEED + uid)
        tokens, record = submit(scheduler, hooks, uid, input_ids, reuse_len,
                                agent.params(MAX_NEW))
        turns.append(record_turn(hooks, uid, input_ids, reuse_len, tokens, record))
        reasoning, content, calls, finished = agent.parse(tokens, env.TOOLS)
        turns[-1]["parsed"] = {"tool_calls": calls, "content": content, "finished": finished,
                               "reasoning_chars": len(reasoning)}
        print(f"  turn {k - 1}: prompt {len(input_ids)} (reuse {reuse_len}), {len(tokens)} new, "
              f"calls {[c['function']['name'] for c in calls]}, finished {finished}", flush=True)
        if finished and not calls and pending:
            messages.append({"role": "assistant", "content": content,
                             "reasoning_content": reasoning})
            messages.append({"role": "user", "content": pending.pop(0)})
            calls_left = max_turns
            continue
        if not finished or not calls:
            break
        messages.append({"role": "assistant", "content": content,
                         "reasoning_content": reasoning, "tool_calls": calls})
        turns[-1]["parsed"]["results"] = []
        for call in calls:
            result = sandbox.call(call["function"]["name"], call["function"]["arguments"])
            messages.append({"role": "tool", "tool_call_id": call["id"], "content": result})
            turns[-1]["parsed"]["results"].append({"chars": len(result), "head": result[:160]})
    # The probe: the session's second prompt (a tool result just arrived), generated freely.
    probe = turns[1] if len(turns) > 1 else turns[0]
    return turns, {"input_ids": probe["input_ids"], "reuse_len": probe["reuse_len"]}


def build(args) -> None:
    sys.path.insert(0, str(Path(__file__).resolve().parent))
    if args.env:
        spec = importlib.util.spec_from_file_location("agent_env_alt", args.env)
        env = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(env)
    else:
        import agent_env as env

    repo = Path(args.repo)
    agent = Agent(args.model)
    scheduler = make_scheduler(args.model)
    hooks = Hooks(scheduler, build=True)
    system = env.system_prompt(repo)
    out_path = Path(args.out)
    if out_path.exists():
        out = json.loads(out_path.read_text())
        print(f"resuming: {len(out.get('sessions', []))} sessions recorded", flush=True)
    else:
        out = {"version": 2, "eos": list(EOS), "template_kwargs": TEMPLATE_KWARGS,
               "sampling": vars(agent.params(MAX_NEW)), "seed": SEED, "context": CONTEXT,
               "probes": [], "sessions": []}

    def save() -> None:
        out_path.write_text(json.dumps(out))

    if "warmup" not in out:
        sandbox = env.Sandbox(repo)
        print(f"session {env.WARMUP['name']}", flush=True)
        try:
            warm, _ = build_session(scheduler, hooks, agent, env, sandbox, system,
                                    env.WARMUP["task"], 1_000_000, WARMUP_TURNS)
        finally:
            sandbox.close()
        out["warmup"] = {"name": env.WARMUP["name"], "turns": warm}
        save()
    for i, s in enumerate(env.SESSIONS):
        if i < len(out["sessions"]):
            continue
        sandbox = env.Sandbox(repo)
        print(f"session {s['name']}", flush=True)
        try:
            turns, probe = build_session(scheduler, hooks, agent, env, sandbox, system,
                                         s["task"], (i + 1) * 1000,
                                         followups=s.get("followups", ()))
        finally:
            sandbox.close()
        out["sessions"].append({"name": s["name"], "turns": turns})
        out["probes"].append({"name": s["name"], **probe})
        save()
    bench = env.DECODE_BENCH
    uid = 900_000
    input_ids, reuse_len = agent.tokenize(uid, bench["messages"], None, {})
    mx.random.seed(SEED + uid)
    tokens, record = submit(scheduler, hooks, uid, input_ids, reuse_len,
                            agent.params(bench["decode_tokens"], ignore_eos=True))
    out["decode"] = {"name": bench["name"],
                     "turns": [record_turn(hooks, uid, input_ids, reuse_len, tokens, record)]}
    print(f"decode bench: prompt {len(input_ids)}, {len(tokens)} tokens", flush=True)
    save()


# ---------------------------------------------------------------------------------------------
# eval


def replay(scheduler, hooks, session, uid_base):
    turns_out = []
    for k, turn in enumerate(session["turns"]):
        uid = uid_base + k
        prompt, response = turn["input_ids"], turn["response"]
        hooks.forced[uid] = np.array(prompt + response, dtype=np.int32)
        hooks.ref_ids[uid] = (len(prompt), np.array(turn["ref_ids"], dtype=np.int32))
        # A reply ends as it did when recorded: a forced EOS stops it (the overlap loop has
        # then already run the EOS step, whose KV the next turn reuses), else the length cap.
        stops = response[-1] in EOS
        params = SamplingParams(temperature=0.0, max_tokens=len(response) + stops)
        tokens, record = submit(scheduler, hooks, uid, prompt, turn["reuse_len"], params)
        preds, _, lps = hooks.take_positions(uid, len(prompt), len(prompt) + len(tokens))
        hooks.forced.pop(uid)
        hooks.ref_ids.pop(uid)
        record.update(forced_ok=tokens == response, predicted=preds,
                      cand_lps=np.round(lps, 5).tolist())
        turns_out.append(record)
    return turns_out


def probe(scheduler, hooks, spec, uid, trace):
    s = trace["sampling"]
    params = SamplingParams(temperature=s["temperature"], top_k=s["top_k"], top_p=s["top_p"],
                            max_tokens=PROBE_MAX_NEW)
    mx.random.seed(trace["seed"] + uid)
    tokens, record = submit(scheduler, hooks, uid, spec["input_ids"], spec["reuse_len"], params)
    hooks.steps = [st for st in hooks.steps if all(u != uid for u, _ in st[0])]
    return {"name": spec["name"], "tokens": tokens, **record}


def evaluate(args) -> None:
    with open(args.trace) as f:
        trace = json.load(f)
    sessions = trace["sessions"][: args.sessions]

    start = time.perf_counter()
    scheduler = make_scheduler(args.model)
    load_s = time.perf_counter() - start
    hooks = Hooks(scheduler, build=False)
    print(f"engine up in {load_s:.1f}s, active {mx.get_active_memory() / 2**30:.2f} GiB",
          flush=True)

    warm_start = time.perf_counter()
    replay(scheduler, hooks, trace["warmup"], 1_000_000)
    warm_s = time.perf_counter() - warm_start
    print(f"warmup session {warm_s:.1f}s", flush=True)
    mx.reset_peak_memory()

    out_sessions = []
    timed = [(i, s) for i, s in enumerate(sessions)]
    if not args.no_decode:
        timed.append((899, trace["decode"]))
    for i, session in timed:
        turns = replay(scheduler, hooks, session, (i + 1) * 1000)
        wall = sum(t["wall_s"] for t in turns)
        gen = sum(t["generated"] for t in turns)
        print(f"session {session['name']}: {wall:.1f}s, {len(turns)} turns, {gen} generated",
              flush=True)
        out_sessions.append({"name": session["name"], "wall_s": wall, "turns": turns})
    peak = mx.get_peak_memory() / 2**30

    probes = []
    if not args.no_probes:
        for j, spec in enumerate(trace["probes"][: args.sessions]):
            probes.append(probe(scheduler, hooks, spec, 2_000_000 + j, trace))
            print(f"probe {spec['name']}: {probes[-1]['generated']} tokens", flush=True)

    result = {"load_s": load_s, "warmup_s": warm_s, "peak_gib": max(peak, mx.get_peak_memory()
              / 2**30), "sessions": out_sessions, "probes": probes}
    with open(args.out, "w") as f:
        json.dump(result, f)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("mode", choices=["build", "eval"])
    parser.add_argument("--model", required=True)
    parser.add_argument("--repo", help="build: the checkout the agent works in")
    parser.add_argument("--trace", help="eval: the recorded trace")
    parser.add_argument("--out", required=True)
    parser.add_argument("--sessions", type=int, default=None, help="only the first N sessions")
    parser.add_argument("--no-probes", action="store_true")
    parser.add_argument("--no-decode", action="store_true")
    parser.add_argument("--env", help="build: an agent environment module file instead of agent_env.py")
    args = parser.parse_args()
    if args.mode == "build":
        build(args)
    else:
        evaluate(args)


if __name__ == "__main__":
    main()
