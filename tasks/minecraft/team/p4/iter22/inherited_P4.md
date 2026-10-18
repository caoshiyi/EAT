# P4 closing handoff — iteration 21

Written 2026-10-18 13:44:53 UTC; execution deadline13:48:55 UTC. **Objective not met.** Evaluator at13:42:52: **dragon=0, milestones=11/12, deaths=155**, programs9922. Deaths p1/p2/p3/p4=54/40/26/35. Save-all failed with connection refused: this is last-saved-world evidence, not a fresh live synchronization. No victory or dragon damage is claimed. P2's latest actual End observations retain dragonHP200 and nine crystals.

## Current player and exit

Actual P4 record **#9923**, [closing_observation.out](p4/iter21/closing_observation.out): Overworld **(157.5131177784,-36,2229.6175680214)**, HP**14.9715032578**, food**17**, grounded, inventory**EMPTY**, goalNULL, controls{}. Three stable samples; no hostiles within10 observed. No active P4 program or queued delivery.

This private alcove is **not fully sealed**. West head cell **156,-35,2229 is AIR**. Floor157,-37 and roof157,-34 atz2229 are full tuff; South door157,-36/-35,2230 is full mossy stone bricks; other logged walls are full. Main public tunnel157,-36/-35,2231 remains AIR. Normal exit: hand-dig the two visible South door blocks (~15s, no harvested blocks without a pick), then walk South through2230 to2231. Check current geometry and threats first. The log label ENCLOSED in9912 did not establish a complete seal and was corrected.

P4 died four times:12:13:32 Dragon-attributed fall;12:22:39 and12:23:51 Skeleton;13:09:30 Silverfish. Starting deaths31→35. Team deaths136→155 (+19). Late P1 Enderman death13:40:15 means its earlier retained End kit is historical. At13:42:52 P1 was OW quarry135.7,-38,2233.5 HP20/food20/EMPTY; P2 End75.5,50,.5 HP10.5527 with StoneSword0/StonePick106/END144/DEEP10/BLACK1/CRACK1/BOOK3; P3 remained unplayed at spawn. Read their own current handoffs before acting.

## Actual contribution and limits

- **One real crystal removed, #9665**, independently confirmed #9673. Target179 at42.5,77,.5; body39.7,76,.558; body-root2.973785m, true-eye-root2.868414m, actualcursor3 selected the real entity and both actual camera block rays were clear. One ordinary `bot.attack(realEntity)` removed it:10→9 crystals, HP17.5→16.5, no XY displacement. Full explicit23-step return to native50 was physically verified. Whole11:49:30→11:59:32 ~10m02 within15min. This is preparation toward the objective, not dragon damage. Front slab40,77,0 was destroyed; do not assume unchanged blast cover.
- Scaling **failed before any pearl throw**, #9730. A newly missing floor45,64,-3 stopped ascent; disappearance cause unknown. Reverse failed while airborne/displaced, then Dragon-attributed fall death. Received pearl/picks/caps were lost unused. No flight, landing, second hit, or scaling capability was established.
- A **real bow was crafted**, #9807, after actual three-string pickup #9803 and a direct visible table interaction from the149 step. It never had ammunition and was never fired. Bow and all partial bed inputs were lost at13:09:30. Recovery9884 stopped at a missing step; changed sweep9886 visited actual loot positions but every inventory sample remained empty and ending items were absent. Assets are lost, not banked.
- **No bed was produced, placed, or activated.** The one-bed operation12:43→12:53 failed and continued past its budget. Partial wool/string and subsequent bridge pickup increments were real but were lost. All bed/source/kit chains are retired; no stock quota or recipient dependency remains. Shared spawn bed was never borrowed.

## Reusable lessons and records

All failures and original deadlines remain in [ITER21_EXPERIMENTS.md](ITER21_EXPERIMENTS.md). Exact programs and returned outputs are in [p4/iter21](p4/iter21). Important records:9665,9730,9800,9803,9807,9843,9850,9860,9868,9873,9884,9886,9894,9903,9912,#9923.

The initial `top()` helper incorrectly required a half-slab shape for every non-end-stone block; fixed only in allowed_helpers.js and physically tested with a stone step9800. Older program prefixes retain the bug. A web clear-line predicate also falsely rejected opaque wood targets by treating the target itself as an occluder; P2's9897/9898 read-only tests distinguish first-target success from nearer obstruction. That repair did not itself prove wood receipt. Use actual current cursor/camera/face checks before interacting.

Three-tick descent checks falsely stopped mid-fall9818. Fourteen ticks worked9823; bounded actual grounding/Y checks are preferable. PlannerNULL proves only the planner's constraints. Near-web placement plus an inventory increment did not prove mid-air interception:9868's +1 is real, but9873's four cuts yielded only+2. Inspect actual supports, item coordinates, pickup delay, and ordinary receipt. Do not cut based on historical drop coordinates after five minutes.

P4 independently read completed P1#9906: active fountain63 for90s, root minimum23.2528, phase1/HP200, zero attacks, full native50 return. P2#9909 and#9920 reached bridge85 but actual root rays were blocked when there; timing/visibility condition was not established. No global impossibility claim follows. No normal damaging dragon hit was verified.

Only p4 was controlled. No agent spawning, p3 play, raw packets, synthetic parts, through-block interactions, internet material, server/tools/.work access, or remote push. Iterations17–19 voided methods were not used. Every shell used EAT_ROOT and python3. Say is a player program; no overlap was run. Final evaluator/status outputs are saved here; final late refresh may append below. Current checkpoint c3de486e plus closing commit pending.


Final refresh 2026-10-18 13:48:34 UTC: own#9932 currentP4position {'x': 157.5131177784095, 'y': -36, 'z': 2229.6175680213764}, HP14.971503257751465/food17/groundTrue/inventory[]/controls{}/goalNone; knownWestgap remainsAIR, doorMOSS/mainAIR unchanged, observedfoes[]. Evaluator13:48:20 again dragon0/milestones11/deaths155; SAVE-ALLfailed so last-savedfiles. LatestP2completed9924 actualHP200/ninecrystals, no completion. No remainingactiveP4work. Closingcommits0af5b9ef/c3de486e; finalrefreshcommit pending.
