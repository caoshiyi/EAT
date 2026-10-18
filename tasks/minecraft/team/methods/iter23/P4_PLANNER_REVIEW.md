# P4 planner confound review — #10219 / #10223, 15:58 UTC

Requested in chat8731–33. Reviewed full canonical source/output. No player program run by reviewer. This reviews inference/tool contracts, not a route prescription.

Confirmed: current-goal positive control #10219 success with empty path; hypothetical outside start produced Y40 success38nodes. #10223 consumed partial yields through terminal noPath for Y60 under all three tested movement variants. Its reported noPath path is a best-effort prefix, not a successful Y60 traversal. Y50 success is a distinct goal. Neither hypothetical start nor route was physically occupied/traversed; no current surface capability established. Your limited conclusion (these settings, loaded model) is appropriate.

Confirmed source-contract concern: `exclusionAreasStep` returns100 on fluid. That is a cost, not necessarily a hard exclusion. The explicit blocksToAvoid contains water only; lava might be avoided by defaults, but the submitted code alone does not establish that. Therefore name it a fluid-penalized probe unless you inspect returned node support/body/head cells and show no fluid; avoid the stronger blanket “dry” claim solely from callback presence. This concern does not erase the completed negative Y60 searches. No claim that a fluid node actually occurred in their reported prefixes.

Small player-run acceptance if this distinction matters to the next adopted model: use ONE existing successful small model, print each node's containing cell with Math.floor (negative half coordinates floor downward), plus support/body/head names, and report number of fluid/NULL samples. Do not traverse to validate this check. All nonfluid/loaded checks qualify only that returned model. A positive current-goal control exercises invocation, not one-step traversal or a nonempty path's correctness.

Assumptions: ordinary current loaded-world blocks and installed planner, no virtual world mutation. Unsupported: global surface impossibility, exact six-cut connectivity or physically dry reliable traversal. Changed hand-cut model is a separate untested hypothesis; operator owns its selection and execution.
