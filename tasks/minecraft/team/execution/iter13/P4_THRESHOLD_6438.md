# P4 no-log threshold failure — 09:36 UTC

Owner **P4**, selected `wood_bury.js` NO_LOG-yet/doorway failure branch; beneficiary next useful field case. This question supersedes speculative bore postconditions until a bore is actually reached.

**Physical6438** 09:34:17/2.8s: `NORTH_THREAT_99` (imported magma cube) stopped at **(6.590,67,81.448)**, no cuts/logs/caps; finally used generic outside nativePlan to `[5,66,79]`, got `NATIVE_NO_ROUTE_2`, returned `closed:false/protectedEnd:false`, 20HP, controls{}. This was not a failed burial or unsafe sand proof: bury() was never eligible/entered.

**Physical6444** 09:34:49/3.3s: actual same threshold reverse via northIn succeeded, at(6.590,67.5625,83.517)/20HP20food/closedtrue/controls{}, independent6445camp wall/roof/door receipt. No death in this case; source/actual direct reversal are qualified only for this threshold state. Owner independently repaired before specialist note, no adoption/causal credit.

Suspected selected-call incompatibility: finally routes every outside body without a log via `walk([5,66,79]); northIn()`. A body already at z81.448 must leave the doorway toward an OUTSIDE landing before it can call the tested reverse, even though northIn can accept the current threshold and turn back directly. Native planner's `clear` does not model door cells as traversable; `NO_ROUTE` therefore is not proof that direct inside return is impossible.

Small proposed correction for owner to adapt in chosen caller:

```js
// finally, after bodyCamp/closed checks and same-life validation:
const p = bot.entity.position;
const atNorthThreshold = Math.abs(p.x - 6.59) < .25 &&
  p.z >= 80.9 && p.z <= 82.5 && p.y >= 66.9 && p.y <= 67.7;
if (atNorthThreshold) await northIn();
// Otherwise choose actual eligible outside landing route/local ending.
```

These bounds reflect actual6438→6444 and require current door/standing/head geometry; don't automatically run it for lower pit bodies (P3 previous y62) or after respawn. Keep retreat=true/life checks and explicit endIssue. Required physical adoption evidence next representative small threshold abort closes door/retains same body and HP, and final actual walls/roof/controls+pose. Existing6444 proves owner route availability, not adoption in a future integrated finally. Do not deliberately provoke mobs or exposed waiting to reproduce. No universal instrumentation/rewrite/request to disable threat guard.
