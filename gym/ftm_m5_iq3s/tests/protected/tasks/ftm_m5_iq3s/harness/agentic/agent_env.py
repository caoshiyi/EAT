"""The coding-agent environment the agentic traces are recorded in.

A Claude-Code-shaped agent: OpenAI-format tool schemas rendered by the checkpoint's chat
template, a system prompt with the repository's AGENTS.md, and tools that really run against a
scratch copy of a FreeToken-metal checkout (edits change the copy; shell commands are limited
to read-only inspection). driver.py build runs the model in this loop; the recorded prompts and
responses are then replayed token for token by driver.py eval.
"""

from __future__ import annotations

import json
import shlex
import shutil
import subprocess
import tempfile
from pathlib import Path


def fn(name: str, description: str, properties: dict, required: list[str]) -> dict:
    return {
        "type": "function",
        "function": {
            "name": name,
            "description": description,
            "parameters": {"type": "object", "properties": properties, "required": required},
        },
    }


TOOLS = [
    fn(
        "read_file",
        "Read a file from the repository. Returns up to `limit` lines (default 150) starting "
        "at line `offset` (1-based, default 1), each prefixed with its line number. Read the "
        "parts of a long file you need rather than the whole file.",
        {
            "path": {"type": "string", "description": "Path relative to the repository root."},
            "offset": {"type": "integer", "description": "First line to read (1-based)."},
            "limit": {"type": "integer", "description": "Number of lines to read."},
        },
        ["path"],
    ),
    fn(
        "grep",
        "Search file contents with a regular expression (ripgrep syntax). Returns matching "
        "lines as path:line:text, at most 80 of them. Prefer this to reading whole files when "
        "you look for a symbol.",
        {
            "pattern": {"type": "string", "description": "The regular expression."},
            "path": {"type": "string", "description": "File or directory to search (default .)."},
            "glob": {"type": "string", "description": "Only search files matching this glob."},
            "ignore_case": {"type": "boolean", "description": "Case-insensitive search."},
        },
        ["pattern"],
    ),
    fn(
        "glob",
        "List the files matching a glob pattern such as python/**/*.py, sorted by path.",
        {"pattern": {"type": "string", "description": "The glob, relative to the root."}},
        ["pattern"],
    ),
    fn(
        "list_dir",
        "List a directory recursively up to `depth` levels (default 2), skipping build output.",
        {
            "path": {"type": "string", "description": "Directory relative to the root."},
            "depth": {"type": "integer", "description": "How many levels to descend."},
        },
        ["path"],
    ),
    fn(
        "run",
        "Run a shell command in the repository root and return its exit code and output. Use "
        "it for git (log, diff, show, blame), wc, and similar inspection; the sandbox has no "
        "GPU, so do not start the engine or the test suite.",
        {
            "command": {"type": "string", "description": "The command line."},
            "timeout_s": {"type": "integer", "description": "Timeout in seconds (default 60)."},
        },
        ["command"],
    ),
    fn(
        "edit_file",
        "Replace exactly one occurrence of old_text with new_text in a file. Fails when "
        "old_text is absent or occurs more than once; include enough context to make it unique.",
        {
            "path": {"type": "string", "description": "Path relative to the repository root."},
            "old_text": {"type": "string", "description": "The exact text to replace."},
            "new_text": {"type": "string", "description": "The replacement."},
        },
        ["path", "old_text", "new_text"],
    ),
    fn(
        "write_file",
        "Create a file, or overwrite an existing one, with the given content.",
        {
            "path": {"type": "string", "description": "Path relative to the repository root."},
            "content": {"type": "string", "description": "The complete file content."},
        },
        ["path", "content"],
    ),
    fn(
        "todo_write",
        "Record your plan as a short checklist. Each item has a status: pending, in_progress "
        "or done. Rewrite the whole list each time.",
        {
            "items": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "text": {"type": "string"},
                        "status": {"type": "string", "enum": ["pending", "in_progress", "done"]},
                    },
                    "required": ["text", "status"],
                },
            }
        },
        ["items"],
    ),
]

SYSTEM = """You are an expert software engineer working as a coding agent in a git checkout of \
FreeToken-metal, an LLM inference engine for Apple Silicon written in Python on MLX with C++ and \
Metal extensions. You complete the user's task by calling tools; each tool's result comes back in \
the next message.

# How you work
- Understand before you change: list directories, grep for the symbols involved, and read the \
code paths that matter. Never guess what a file contains.
- Be economical: read the parts of files you need, search instead of reading everything, and stop \
exploring once you can answer.
- Call tools one at a time and use what each result tells you to choose the next step.
- For a task with several steps, keep a short checklist with todo_write.
- When you change code, follow the repository's conventions (AGENTS.md below): match the style, \
naming and comment density of the surrounding code, and keep changes minimal.
- You cannot run the engine or the tests in this sandbox; reason from the code instead.
- When you are done, reply without a tool call: a concise answer that names the files, functions \
and line numbers that support it, or a summary of the change you made.

# Answer style
Write in complete sentences for a teammate who has not seen your exploration. Lead with the \
answer, then the evidence. Use backticks for file, function and class names. Keep it short.

# Repository instructions (AGENTS.md)
{agents}
"""

WARMUP = {
    "name": "warmup_mha_pool",
    "task": "What does python/ftmetal/kvcache/mha_pool.py store per token? Be brief.",
}

SESSIONS = [
    {
        "name": "scheduler_admission",
        "task": "Requests sometimes wait a long time before their first token while another "
        "long prompt is being prefilled. Find where the scheduler decides which batch runs "
        "next, and explain how chunked prefill interacts with decode.",
    },
    {
        "name": "sampler_test",
        "task": "Add a unit test that checks greedy sampling returns the argmax for a batch of "
        "3 rows whose maxima sit at different vocabulary positions. Look at the sampler and "
        "the existing kernel tests first, and put the test where similar tests live.",
    },
    {
        "name": "offload_eviction",
        "task": "Explain how the MoE offload cache picks which expert to evict when a layer "
        "needs an expert that is not resident, and whether the GPU waits for the read.",
    },
    {
        # A long session: follow-up user messages until the conversation nears the context
        # budget (driver.PROMPT_ROOM), as a long coding-agent session grows.
        "name": "prefix_reuse_long",
        "task": "Walk me through how a multi-turn conversation reuses the KV cache between "
        "requests: where a new request's prompt is matched against cached prefixes, and what "
        "is reused for the full-attention layers.",
        "followups": [
            "What happens for the linear-attention (GDN) layers when a prefix is reused? Show "
            "me where their state is saved and restored.",
            "Now find how the prefix cache evicts entries under memory pressure. Which function "
            "decides, and what does it free first?",
            "Are there tests that check a reused prefix gives the same logits as a fresh "
            "prefill? Read them and tell me what they cover and what they miss.",
            "How do sliding-window attention layers interact with prefix reuse? Point to the "
            "code.",
            "Sketch, in your reply only, how you would make the prefix cache survive a server "
            "restart: what would have to be persisted, and where it would plug in.",
            "Which three files matter most for prefix reuse, and what does each one do?",
            "Look at how the scheduler accounts cached tokens when it admits a request. Is "
            "there any way a request could be admitted and then not fit?",
            "Summarize everything we found in a short list of risks, most important first.",
        ],
    },
]

# AIME 2025 I, problem 1: upstream FreeToken's decode benchmark prompt family
# (benchmarks/bench_decode_moe.py: an AIME-25 problem, thinking on, the checkpoint's default
# effort and sampling, 256 decode tokens).
DECODE_BENCH = {
    "name": "decode_aime25",
    "messages": [
        {
            "role": "user",
            "content": "Find the sum of all integer bases $b>9$ for which $17_b$ is a divisor "
            "of $97_b$.\nPlease reason step by step, and put your final answer within "
            "\\boxed{}.",
        }
    ],
    "decode_tokens": 256,
}

SAFE_COMMANDS = {"git", "wc", "ls", "cat", "head", "tail", "rg", "grep", "find", "sort", "uniq",
                 "sed", "awk", "du", "file", "stat", "tree", "echo", "pwd", "diff", "nl", "cut"}
GIT_SAFE = {"log", "diff", "show", "blame", "status", "grep", "ls-files", "rev-parse", "shortlog"}
RESULT_CHARS = 6000
SKIP_DIRS = {".git", ".venv", "build", "__pycache__", ".pytest_cache", "node_modules"}


def clip(text: str, limit: int = RESULT_CHARS) -> str:
    if len(text) <= limit:
        return text
    return text[:limit] + f"\n... [{len(text) - limit} more characters truncated]"


class Sandbox:
    """A scratch copy of a checkout (sources only) that the tools act on."""

    def __init__(self, repo: Path) -> None:
        self.dir = Path(tempfile.mkdtemp(prefix="ftm_agent_")).resolve()
        self.root = self.dir / "FreeToken-metal"
        subprocess.run(["git", "-c", "advice.detachedHead=false", "clone", "-q", "--local", str(repo), str(self.root)], check=True)

    def close(self) -> None:
        shutil.rmtree(self.dir, ignore_errors=True)

    def path(self, rel: str) -> Path:
        p = (self.root / rel.lstrip("/").removeprefix("workspace/")).resolve()
        if p != self.root and self.root not in p.parents:
            raise ValueError(f"{rel}: outside the repository")
        return p

    def call(self, name: str, args: dict) -> str:
        try:
            return clip(getattr(self, "tool_" + name)(**args))
        except AttributeError:
            return f"error: unknown tool {name}"
        except TypeError as e:
            return f"error: bad arguments for {name}: {e}"
        except Exception as e:  # noqa: BLE001 - a tool error is the agent's to handle
            return f"error: {e}"

    def tool_read_file(self, path: str, offset: int = 1, limit: int = 150) -> str:
        lines = self.path(path).read_text().splitlines()
        offset = max(int(offset), 1)
        chunk = lines[offset - 1 : offset - 1 + int(limit)]
        body = "\n".join(f"{offset + i:6d}\t{line}" for i, line in enumerate(chunk))
        rest = len(lines) - (offset - 1 + len(chunk))
        return body + (f"\n... ({rest} more lines)" if rest > 0 else "")

    def tool_grep(self, pattern: str, path: str = ".", glob: str | None = None,
                  ignore_case: bool = False) -> str:
        rg = shutil.which("rg")
        if rg:
            cmd = [rg, "-n", "--no-heading", "--max-columns", "200", "-e", pattern]
            cmd += ["-g", glob] if glob else []
        else:
            cmd = ["grep", "-rnIE", "--exclude-dir=.git", "--exclude-dir=.venv", "-e", pattern]
            cmd += [f"--include={glob.split('/')[-1]}"] if glob else []
        if ignore_case:
            cmd.append("-i")
        cmd.append(str(self.path(path)))
        out = subprocess.run(cmd, capture_output=True, text=True, timeout=60).stdout
        lines = [line.replace(str(self.root) + "/", "")[:240] for line in out.splitlines()]
        more = f"\n... ({len(lines) - 80} more matches)" if len(lines) > 80 else ""
        return ("\n".join(lines[:80]) + more) or "no matches"

    def tool_glob(self, pattern: str) -> str:
        hits = sorted(
            str(p.relative_to(self.root)) for p in self.root.glob(pattern)
            if not SKIP_DIRS & set(p.relative_to(self.root).parts)
        )
        return "\n".join(hits[:200]) or "no files"

    def tool_list_dir(self, path: str = ".", depth: int = 2) -> str:
        base = self.path(path)
        out = []

        def walk(d: Path, level: int) -> None:
            for p in sorted(d.iterdir()):
                if p.name in SKIP_DIRS:
                    continue
                out.append("  " * level + p.name + ("/" if p.is_dir() else ""))
                if p.is_dir() and level + 1 < int(depth):
                    walk(p, level + 1)

        walk(base, 0)
        return "\n".join(out[:300])

    def tool_run(self, command: str, timeout_s: int = 60) -> str:
        if any(c in command for c in ";&`$><\n"):
            return "error: only read-only inspection commands (optionally piped) are allowed"
        for stage in command.split("|"):
            argv = shlex.split(stage)
            if not argv or argv[0] not in SAFE_COMMANDS:
                return "error: only read-only inspection commands (optionally piped) are allowed"
            if argv[0] == "git" and (len(argv) < 2 or argv[1] not in GIT_SAFE):
                return "error: only read-only git commands are allowed in this sandbox"
            if argv[0] == "sed" and any(a.startswith("-i") for a in argv):
                return "error: use edit_file to change files"
            if argv[0] == "find" and any(a in ("-delete", "-exec", "-execdir") for a in argv):
                return "error: find may only list files here"
        p = subprocess.run(command, shell=True, cwd=self.root, capture_output=True, text=True,
                           timeout=min(int(timeout_s), 120))
        return f"exit code {p.returncode}\n{p.stdout}{p.stderr}"

    def tool_edit_file(self, path: str, old_text: str, new_text: str) -> str:
        p = self.path(path)
        text = p.read_text()
        n = text.count(old_text)
        if n != 1:
            return f"error: old_text occurs {n} times in {path}"
        p.write_text(text.replace(old_text, new_text))
        return f"edited {path}"

    def tool_write_file(self, path: str, content: str) -> str:
        p = self.path(path)
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(content)
        return f"wrote {path} ({len(content.splitlines())} lines)"

    def tool_todo_write(self, items: list) -> str:
        return "todo list updated:\n" + "\n".join(
            f"[{'x' if i.get('status') == 'done' else ' '}] {i.get('text', '')}" for i in items
        )


def system_prompt(repo: Path) -> str:
    return SYSTEM.format(agents=(repo / "AGENTS.md").read_text())


def tool_names() -> dict[str, list[str]]:
    """Each tool's name -> its required parameters."""
    return {t["function"]["name"]: t["function"]["parameters"]["required"] for t in TOOLS}


if __name__ == "__main__":
    print(json.dumps(tool_names()))
