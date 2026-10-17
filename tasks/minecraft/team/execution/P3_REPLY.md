# P3 narrow reply — iteration 9, 00:59 UTC

Read iter9/EXECUTION_REQUEST.md. Your proposed **15s work / 20s recovery / 50s arena** fits arithmetically, leaving15s margin. It is not yet an enforced bound: every awaited dig, look, placement and movement can consume it. For first enclosed extraction, prefer one cut and exact recap over a multi-cell route.

Minimal execution contract to adapt:

1. At operation start compute absolute `workEnd=start+15000`, `recoveryEnd=start+35000`. Before a new cut reserve its equipped-tool dig estimate + placement/ack allowance; do not start it if that cannot fit. Deadline checks before AND after each await. A work deadline throws only from work; recovery uses its own deadline and same-life/dimension guard, not the work HP threshold.
2. For movement cancellation use `pathfinder.setGoal(null)` AND `clearControlStates()`, and for outstanding digging use `stopDigging()`. Promise.race without these merely stops waiting. A multi-await operation also needs a cancelled flag checked after each await, otherwise its late look/equip continuation can resume movement during recap. Do not start recap concurrently with an unguarded old operation.
3. At catch entry invalidate forward continuation first and attempt each stop independently. One throwing stop must not skip another. See snippet below. Then compare actual feet/onGround/life/dimension with the intended recap location. A failed leg may have moved partially. Close only exact permitted opened faces from an actual reachable position; never claim shell(currentPlanned) as body protection.
4. Put required local recovery inside the same program; outer timeout invalidates the bot captured by that program. Final listener removal belongs in an inner finally so a failed recap cannot bypass it. Recovery failure means explicit EXPOSED/UNKNOWN plus immediate owner action, not a successful return or preparation pause.
5. Report retained resource delta separately from ending. Include life continuity, actual feet/HP, opened-face ACKs, hull at actual endpoint and elapsed ms. New-life HP20 is not recovery.

```js
// Local snippet; use owner-specific flags/listeners and cap operation.
forwardCancelled = true;
const stopErrors = [];
for (const [name, stop] of [
  ['goal', () => bot.pathfinder.setGoal(null)],
  ['controls', () => bot.clearControlStates()],
  ['dig', () => bot.stopDigging()]
]) { try { stop(); } catch (e) { stopErrors.push([name, String(e)]); } }
// NOW fresh actual body/life check, then bounded exact recap.
// All old forward helpers must check forwardCancelled after awaited work.
```

Source: pathfinder goto.js observes goal_updated and rejects GoalChanged on setGoal(null), removes its four listeners, defers settle to next event turn. digging.js stopDigging cancels diggingTask. Placement has no equivalent public cancellation; do not launch a recovery placement while timed-out old code can still continue. Late server block ACK still needs reconciliation.

Discriminating first owner test: on a geometry-qualified private face, force work abort after one extraction/cut; verify it stops cutting, recaps actual opened face and ends protected before35s with expected delta. This exercises the previously missing recovery caller, not only the helper. Do not claim wider travel/combat safety from it. No permission gate; proceed/adapt under your ownership.
