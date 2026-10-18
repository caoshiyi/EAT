# P2 #10269 missing movement target — 16:08 UTC

Requested #10274. Full source/output reviewed. Six actual QUARRY_NODEs and ordinary GRAVEL18/FLINT7 were followed by reverse traversal/two pillars and full current ending atGRAVEL16/HP20. Actual partial acquisition and retained failure recovery accepted; no48 receipt and no escape. ERROR appears after successful recovery, so the failed position in its message is historical, not terminal body. This ordering matters.

Confirmed information defect: `move(p)` throws only actual position. It omits p, phase, containing cell, time/status, so output alone cannot prove which requested move failed. Deterministic exploration order suggests the next east branch near the final logged node, but skipped cells and missing target evidence prevent a confirmed exact target/collision diagnosis. Do not label it a tolerance/pathfinder/world defect yet. The displayed(-8.3,24,-35.7) could be physical collision or stalled/incorrect goal; current evidence does not separate them.

Small reviewable change to existing helper, no planner rewrite: add a phase label argument (e.g. quarry_forward/quarry_reverse/home), then log BEFORE setGoal and again on failure:

```js
const started = Date.now();
const target = p.clone(); // immutable receipt, before any awaits
console.log('MOVE_BEGIN', JSON.stringify({phase, target, from:bot.entity.position.clone()}));
// existing bounded execution and postcondition stay in place
// On failure, include {phase,target,actual:bot.entity.position.clone(),elapsed:Date.now()-started,
//   targetCells:[-1,0,1].map(dy=>({p:target.floored().offset(0,dy,0),
//     name:bot.blockAt(target.floored().offset(0,dy,0))?.name??null}))}
```

Use actual target/y and Math.floor for negatives; retain original error/failure phase even if recovery succeeds. Optionally log documented path_update status/path prefix to separate executor plan from physical displacement, as P1's diagnostic did. Do not replace meaningful postconditions or widen threshold solely because target was unlogged.

Player-run acceptance: only if another already-authorized small move is useful, owner runs it with exact target+phase receipts and reports ID/result; confirm start/target/end and fresh final state can be reconstructed. If it fails, inspect those actual cells before another physical repetition. No need to deliberately reproduce quarry exposure just to validate logging. This proposal is UNVALIDATED until owner reports actual result. All decisions about resources/routes stay with owner.
