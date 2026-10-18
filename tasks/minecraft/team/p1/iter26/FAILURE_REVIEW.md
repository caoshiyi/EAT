# P1 iteration26 failure review — 23:34 UTC
The dragon objective is unmet. Preparation throughput did not compensate for failure to reach a legal objective action.

## Actual lethal sequence
LIVE11365, captured live_low_shared_2.out: first health-loss stop at23:16:47.420 near(25,8,240/241), HP17.333 to12.333. walkLow catches every travel exception as a pause, including the explicit HP-loss exception, computes a nearest guide point and permits another travel. This converts a safety stop into retry. Finally seal derives a floored cell while residual movement crosses its boundary, then tries to cap a now occupied foot. Placement fails, four lateral boundaries remain open, only6/10 full. P1 dies to Piglin at23:16:50, kit gone. Controller did not read/react promptly: output was read approximately23:18. This is a control/recovery failure, not success with a later unrelated death.

Required change before adopting any copied walker: first HP loss, death, dimension change or body hazard must escape the retry catch. run_checked's later rejection cannot repair an in-program retry. Endpoint closure requires fresh stopped/settled/recentered body, actual unoccupied target and verified receipts, not an earlier floored position. Need qualified hostile response too; no such complete response was tested.

make_abort_candidate.py preserves historical low_shared.js, creates low_abort_candidate.UNEXECUTED.js. reproduce_retry.js locally models the catch: historical code calls travel twice after first HP loss; candidate calls once then propagates original travel HP loss. Reproduction output is LOCAL MOCK ONLY, not a Minecraft survival or closure test. Candidate remains unexecuted and is not a ready-to-run recovery method.

## Recovery and uncertainty
Respawn23:18:43 was20HP at(2.5,64,-32.5), empty. By23:23:13 position(0.991,57,-29.564),8.333HP/17food. Cause of the intervening movement/damage is UNKNOWN; do not attribute to a specific mob/fall without evidence.
11387 created supported dirt pocket54/full8.333/DIRT2.11402 courier failed source-roof premise before departure; cleanup made full pocket51/DIRT1/unchangedHP. Actual roof material should have been freshly inspected before hardcoded admission, and generic cleanup dug deeper even though initial full pocket was already safe. No HOME travel, bed transfer, kit retrieval or objective action occurred.
Whole bed transfer23:30 missed and retired. Original22:22/22:32/22:47 gates all missed. Definitive refreshed handoff saved23:32:11, eleven seconds late; earlier provisional existed but had stale current-life claims. Corrected P1.md and approach journal now explicitly supersede those.

## Operational lessons
Read actual endpoint immediately; a program returning and printing TERMINAL does not imply closure. Own serial runner rejects FAIL and endpoint health loss, but cannot substitute for safe in-program exception semantics. Keep public arena records and raw outputs as evidence; preserve failed caller independently of successful cleanup. Do not repeat kit preparation after access/life dominates and the whole-operation gate is gone. P2's independent protected live End access23:32:42.402 is useful and not P1 progress; P2 owns all subsequent actions.

## 23:43 follow-up evidence and uncertainty
Actual11387 terminal roof(0,56,-30) WAS dirt.11402 sixminuteslater rejected name!='dirt', but DID NOT LOG actual failed material. Therefore why exact-name admission failed is UNKNOWN: do not assert grass growth, broken roof or geometry shift without a fresh relevant observation. Cleanup unnecessarily dug3 despite source admission failure; safer future recovery must first audit current full ending and retain it when already protected.
G3#126 higher64stance failed candidatewait90s but retained61/THREE10FULL18.778HP. It emitted NO public position sampling, so no new trajectory reason can be inferred. B live11437 uses changed fresh rings plus actual trace; current20HP at64, not yet an attack result.
