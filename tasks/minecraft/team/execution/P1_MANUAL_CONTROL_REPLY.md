# P1 manual movement / returningPos — initial reply 2026-10-17T01:31:40.807793+00:00

Read EXECUTION_REQUEST.md, exact shallow_test caller, and installed pathfinder index.js. Your hypothesis is SOURCE-VALID but not yet the physical explanation of #3958.

`setGoal(null) -> resetPath` clears path/controls and releases locks, but does not clear private returningPos. `monitorMovement` then processes LOSWhenPlacingBlocks&&returningPos before its path-empty/goal handling. `moveToBlock` issues `lookAt` plus forward even with goalnull/path0. Thus isMoving=false/isBuilding=false/isMining=false are not sufficient to exclude this branch.

Important provenance limit: the ONLY returningPos assignment in installed source is pathfinder's own successful placement callback (line560). Direct bot.placeBlock/_placeBlockWithOptions calls do not populate it. If this life used only direct placement and paths with scaffolding disabled, there may be no saved returningPos. Do not assume it exists just because controls stalled. Actual history/runtime value is unobserved.

Your documented LOSWhenPlacingBlocks=false opt-out suppresses that branch during manual control. It does NOT erase saved returningPos: restoring true can reactivate it later, including idle with goalnull. Do not describe toggling as cancellation or blindly restore true in finally as if the stale state vanished. Pick an explicit owner policy for subsequent no-placement pathfinding/manual phases; no tools edits or private-field bypass needed.

Caller confounders to log: actual target coordinates q, actualyaw, actual controls at physics-event boundaries, elapsedprogress, onGround/isInWater, goal/moving/mining/building. Current surfGo records no progress and repeatedly sets jump=true, so a collision, lip, or competing callback cannot be distinguished from steering override in #3958. A changed LOS setting plus changed geometry/control code would not isolate cause. Preserve bounded actual ending before extended diagnostics.

Source finding applies to a pending helper operation, not all manual movement. A small host reproduction follows; physical validation remains yours. No permission gate/no engineer body action.

Separate URGENT prerequisite for the subsequent water proof: read P1_OXYGEN_REPLY.md. Installed globaloxygen can be overwritten by OTHER entities; use ownentityair metadata (index1verified) rather than global400/20 for breath qualification. This is independently reproduced source behavior, not an explanation of the current dry approach failure.

Host result PASS: returning_pos_test.cjs executes exact installed resetPath/setGoal/moveToBlock/monitor prefix with a synthetic savedreturn. Goalnull/path0 stillaims+forward; LOSfalse suppresses; restoringtrue steersagain. Stubbed hostbot, no network/playeraction. This proves the source path's behavior when savedreturn EXISTS, not that #3958 had one.

## Concrete new instrumentation defect — 2026-10-17T01:32:47.132404+00:00

Read #3968 MANUAL_TICK controls{} while actualmovement progressed8m. Installed physics.js defines bot.controlState properties via Object.defineProperty without enumerable:true. Therefore JSON.stringify(bot.controlState) returns{} regardless of held controls. It is NOT evidence controls were cleared or that no callback changed them. Use explicit keys:
```js
const controls = Object.fromEntries(
  ['forward','back','left','right','jump','sprint','sneak']
    .map(k => [k, bot.getControlState(k)])
);
```
Log before/after tick at the relevant boundary if distinguishing manual writes from monitor writes. Existing endpoint reports of controls{} similarly cannot prove allfalse, though actual clearControlStates calls are independent source evidence.

#3968 with LOSfalse moved8m, then UNEXPECTED_WATER and wet burial lost HP to7.362; endinggeometricFULL had watertrue/globalair-1. This doesnotqualify a dry shelter. Separate#3973doorplacementrefused but bodybecameAIR/AIR; #3974 currentcheck AIR/AIR/FULL andsameHP7.362, so immediatehealthlosswasnotcontinuing atthatcheck. Do not claim successfuldoor or isolateddamagecause. Readselfoxygen correction before anybreathclaim. Globalair20 alone is not sufficient.
