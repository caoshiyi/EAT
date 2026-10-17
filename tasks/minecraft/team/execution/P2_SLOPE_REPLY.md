# P2 slope fallback reply — 2026-10-17T01:03:30.532975+00:00

Read iter9/EXECUTION_REQUEST.md and actual stage600.js `go -> finally settle -> native(q) -> pod(q)` caller. Flat capsule#3750 FULL20 is physical evidence for that flat ending, not midstep behavior.

**Minimal new caller condition: clear movement, settle, then choose a fresh actual support cell; before capsule walls, ensure the body fits within that cell.** `position.floored()` alone is unsafe midjump/midfall/over an edge. `onGround` alone can also be true while body overlaps two support cells. A planned target is not the actual endpoint.

Your existing settle loop is a useful start: <=40ticks until onGround/integerY, then native(q). Add current-life/dimension checks and a wall deadline for that settle; physics ticks can stall, and recovery time must include this wait. After settling set y=`Math.round(actual.y)` only if |actual.y-y|<=.05 and the expected floor at y-1 is freshly FULL. A tiny negative y error can make floor() select the lower cell; do not round x/z across a cell edge.

For your single-cell capsule, require |actual.x-(q.x+.5)|<=.18 AND same forz before placing adjacent walls, with stable actualy/onGround and two body cells clear. The .18 margin fits a standing0.6wide body within1block with.02slack; your entity width is the authoritative value. Recenter only on verified full support with bounded motion and no unsafe neighbor; re-read after motion. If not possible, capsule(q) is not an available fallback: preserve the precise failed condition and use another owner-chosen local ending immediately. Do not place a wall through the actual body or declare shell(planned) protective.

Important caller detail: `pod(q)` itself first calls `go(q)`, which is another movement operation and may throw. The nominal go ends within Euclidean.22 of center; .22 permits .02body overlap beyond cell boundary. Revalidate actual body fit after pod's centering, before first placement. Do not mark currentIndex from stale route progress; offroute actual capsule may have index=-1 and needs explicit representation before any later route executor uses it.

Cap helper also needs `if(!ref)throw Error('CAP_NO_REF')` before `blockAt(ref)`; its reference offsets omit negativeZ, so NO_REF is possible even with support there. This is a source finding only, not a current demonstrated cap failure; no automatic broadening of allowed references/shared writes.

Discriminating owner test you proposed is appropriate: a ONE-height transition, forced abort only once actual landing can be recovered, actual settledbody/nativefloor/fit, capsuleFULL/samelife/HP/elapsed. Abort at controlled landing exercises actual recovery; abort while unsupported is a different risk case and not necessary just for software proof. No extra test quota or approval gate; adapt and proceed independently.
