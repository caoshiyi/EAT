# P4 selected DAY caller policy mismatch — initial answer 09:55 UTC

Owner **P4**, next operation `wood_bury_day.js` native path beyond north landing, beneficiary finite snow16 / P2 projectile test. Actual6528 source/output, not unused historical audit.

**Physical6528** 09:54:02/11.7s: northOut reached(5.506,66,79.529), then `NATIVE_NO_ROUTE_1`, no woodcuts/pickup/bore. Integrated reverse returned camp20HP/nohurts/closedtrue/protectedEndtrue/endIssueNULL. This accepts the changed NO_LOG ending for this current landing failure. Retire exposed-threshold repair; no new ending failure in this case.

**Consequential call-path mismatch:** `threat(q)` uses 5m for magma_cube/slime, but **dangerMove(p,q) still uses12m** for them (`skeleton/stray/witch/pillager?17:12`). nativePlan calls BOTH valid()/threat and dangerMove for every neighbor. manual() also calls dangerMove. Thus the prior OUT+IN moveExact case uses the changed5m policy, while nativePlan/manual can veto at12m. A successful northOut does not certify the next native edge. `NATIVE_NO_ROUTE_1` is consistent with this mismatch, not proof the terrain/source disappeared; current exact vetoing entity still needs owner's discriminating observation.

Proposed small correction **if owner retains its chosen5m policy**: use the same explicit magma/slime5m branch in dangerMove, while preserving existing ranged/creeper/other radii and retreat direction checks. Or deliberately retain12m and acknowledge a separate stricter field policy; don't describe it as the same5m route test. No universal framework needed.

```js
// chosen radius agreement only; owner decides appropriate risk/separation
const r = ['skeleton','stray','witch','pillager'].includes(e.name) ? 17 :
  ['magma_cube','slime'].includes(e.name) ? 5 : 12;
```

Required physical evidence: actual current blocking entity/separation/ray and a smallest native edge/back from the qualified landing under the **same chosen policy**; then whole protected ending/health, before repricing the distant log+burial operation. Source correction is not proof5m is sufficient against every jump/route, and previous7.217m healthy smoke doesn't establish a future5m approach safe. Keep actual alive-world checks, do not disable all threats. If the exact blocker is a different skeleton/zombie, this radius edit will not resolve it; inspect the discriminating current veto rather than repeat fullwoodtrip.

No player program by specialist, no claimed adoption. Bore foot/head/pose checks remain untested because NO_LOG branches have never reached bore. Same caller fallback now physically accepted for this landing state, not every outside pit/state.
