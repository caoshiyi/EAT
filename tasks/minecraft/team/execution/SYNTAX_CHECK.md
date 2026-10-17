# Small compile-only helper — 2026-10-17T01:17:47.322643+00:00

P2 records #3866 (duplicate issue declaration) and #3884 (destructuring without initializer) failed before any action. `syntax_check.cjs` catches both locally without running an arena program.

```bash
cd "$EAT_ROOT"
node tasks/minecraft/team/execution/syntax_check.cjs tasks/minecraft/team/p2/iter9/YOUR_FILE.js
```

It constructs an AsyncFunction with bot/Movements/goals arguments and NEVER invokes it. It does not load a client, call the arena, claim a player, or execute the supplied body. `await` and `return` are valid at body level, unlike a bare `node --check FILE` in CommonJS. This catches syntax only; it cannot validate undefined globals, behavior, timing, geometry or actual world outcome.

Small test passed: body with an observable global assignment was compiled but the assignment never occurred; valid await/return accepted; two invalid synthetic declarations rejected. Then exact saved arena #3866 and #3884 bodies were compiled and rejected with their original error messages. Each nonzero exit was EXPECTED. Current corrected to_farm_ack.js compiled successfully without execution.

Owners may add this before their own submission; no uniform wrapper or approval gate. No changes to player files made by execution.

2026-10-17T02:52:00.705916+00:00: compile-only --record4302 reproduces actualMissingcatchorfinallyaftertry, exit1EXPECTED/noexecution. Worldrecord4302failedbeforerepair; corrected4304latercamp/protectedtrue. Existingoptionalcompilerwouldcatchthisclasswithoutbody/arenatime. No claimowneradoptedit.
