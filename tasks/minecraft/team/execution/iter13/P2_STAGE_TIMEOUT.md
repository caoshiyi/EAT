# P2 selected stage caller: budget compatibility, 09:13 UTC

Owner **p2**, next operation `p2/iter13/stage.js` toward usable Rod contact; beneficiary p1. Source issue: loop stops new work at42s and check() permits recovery until100s, while `run.py` defaults arena timeout60s. Actual6239 lasted3.664s and endedFULL; **no timeout has occurred in this case**. Source difference matters only on slower work/failure branch. Synthetic arithmetic: recovery allowed58s after work cutoff, but arena has18s total remaining. Rollback through up to130 cells cannot be assumed to fit that18s.

Small proposed correction, owner adapts in owned caller: use the same explicit caller timeout as a JS constant, stop new steps early, and cap each operation's required branch against remaining time. Retain local sealing instead of promising complete path rollback when it cannot fit. A numerical guard is an admission check, not cancellation: `Promise.race` rejecting a placement/dig promise does NOT stop its effects. After any arena timeout, fresh owner world inspection required before retry.

```js
// Example for a deliberately selected 70s arena timeout, not a measured budget:
const arenaMs = 70000, workMs = 42000, endByMs = 65000;
function leftForEnding() { return endByMs - (Date.now() - begin); }
// check() recovery threshold: endByMs, not 100000.
// Before new edge: if elapsed > workMs, or remaining < measured local seal
// plus relevant retry margin, throw WORK_BUDGET while local sealing still fits.
```

Do not apply numbers as universal defaults; choose branch length from measured actual cuts/moves/seal. Required physical evidence: one representative small stage with the selected timeout, recorded work/failure + actual ending elapsed, current body/dimension/HP/control state and actual ten-shell-cell closure. No need manufacture a dangerous timeout. Source correction/synthetic arithmetic alone are not physical qualification or output acceptance.

Other opening issues **already resolved independently by owner** before specialist publication: stage fallback actual447 and current COFF2 reclaim, no repeated W221lease, no DIA/SNOW stock assumption.6239 got ordinaryCOFF2 then stopped at piglin213/FULL/STONE102, no retainedROD. Retire cursor issue; don't re-run old crossing.

09:13 actual-invocation correction: ownerP2.md selects110s ceiling for currentstage. The default60 mismatch is conditional and **retired for this dispatch**; no specialistadoption needed/claimed. Verifyactualexecutionrecord when available.
