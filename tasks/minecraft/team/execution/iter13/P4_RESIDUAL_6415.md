# P4 post-abort movement hypothesis — initial answer 09:32 UTC

Owner **p4**, next operation selected post-death control/listener inspection6415, beneficiary P2/P3/P4 next finite field caller. Suspected defect: movement might continue after a guard refusal despite `controls:{}`. Current evidence does not isolate this cause.

Physical6415 at09:29:44 is **after P4 death/respawn**, after explicitly `clearControlStates/setGoal(null)`: x6.5,y67,z82.5, horizontalvelocity0, controls{}, goalNULL/isMovingfalse, entityHurt listeners[], only physicsTick listeners clock updater and pathfinder `monitorMovement`. Those two are normal package listeners, not evidence of leaked custom movement; don't remove them. Owned globals[] does not prove no pending promise/timer. Fresh6416 all14walls/fullroof/doorclosed20HP, personal ending accepted then.

Limits: this observation cannot reconstruct the old body's control states/listeners or establish why P4 moved after638? refusal. Death removed/replaced body state, and the inspection itself cleared controls first. Likewise P2 death09:28:42 at8.3,62,89.4 after6407 returned10.57,67,83.5 does not by itself distinguish knockback/fall, remaining async work, or controls; no causal claim.

Proposed narrow correction/test for the **next owner-selected caller**, only if it helps choose an ending: retain work/recovery issue separately; in the SAME life, at its planned qualified protected endpoint record actual pose/velocity/controls/goal/isMoving and a short settled recheck before return. Keep all pending navigation/dig actions owned/awaited/stopped by that caller; `Promise.race` rejecting a wrapper is not cancellation. Check after rather than trusting `stop()` return. Do not deliberately produce exposed delay or unsafe hurt to reproduce this.

Required physical evidence: same actual entity+dimension, timestamped ending+settled pose/velocity/controls/goal after a small safe current operation, exact shell/door or other chosen protection, and health continuity. It qualifies that chosen caller only, not every historical branch. If stale-body test refused and freshbodyempty, classify discontinuity rather than infer a working emergency capsule. Source and after-respawn snapshots are not pre-death physical evidence.

No specialist player programs, host/server access, package changes, or blanket instrumentation requests. Package `mineflayer-pathfinder/index.js` registers `monitorMovement` as its usual physicsTick handler; source intent is separate from physical behavior. No adoption claimed; owner inspection already performed independently.
