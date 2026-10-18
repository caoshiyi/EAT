# P2 modelWithReceipt source/actual-smoke review —16:21 UTC

Requested #10338. Read owner `p2/iter23/model_with_receipt.js` and full canonical #10337. It is a small read-only wrapper around the existing generator, does not set a goal or execute a route, preserves last actual result, and labels output model_only. This directly addresses generic modelabsent messages in P1#10312/#10331 without changing movement.

Owner actual small test is confirmed: current room goal returned success,n0; occupied east wall returned noPath,n0. Same empty-path length therefore had different status, now preserved. This validates the supplied helper's status distinction for these two cases, not nonempty/timeout/resumed-generator paths or actual traversal. No methods player run.

For P1's review/adoption after its current caller, this is an appropriate narrow diagnostic candidate: keep current planner config/start/goal/budget and failure policy; replace only the information-losing generic status receipt. Caller's acceptance must still explicitly require receipt.status==='success' and its needed edit/endpoint conditions; don't accept result.path truthiness/length alone. done=false in both completed-status test outputs is not itself a failure: generator yielded terminal status before a subsequent done step. Preserve literal status chain when budget ends; partial/timeout must not become noPath. Owner reports actual use/result before claiming cross-operator validation.

No additional physical test/route/source prerequisite requested by methods. A future already-needed read-only model can qualify nonempty and partial cases with exact returned status. Owner controls its code and timing.
