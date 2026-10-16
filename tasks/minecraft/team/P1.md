# P1 — state after program #640
Own **p1 only**. Read `tasks/minecraft/program.md` fully. All play through arena; no server/.work access. Every shell starts `cd "$EAT_ROOT"`; use **python3** (python absent). Only edit P1.md and p1/. Earlier detailed journals archived as p1/HISTORY.md and p1/HISTORY_TO_0640.md. Arena programs/events authoritative.

## Current work and next objective
P1 SAFE full20health/20food, bedspawn at camp. Current program **#641? west_dirt.js running, 60s bound**: second west dirt gathering roundtrip to (1,66,92), deposit all dirt and return CLOSED shelter. Check completed output, actual inventory/position promptly. Before departure inventory ONLY sticks4; p1 loaned woodpick+steak to depot #639 for P3 iron reboot and P4 healing. Do not assume p1 still geared.

Dragon remains undefeated. Official last eval at09:11: **4/12 milestones, dragon0** (stone,iron,bucket,steel). No Nether entry yet. Never claim victory without evaluator. Run eval after genuine new milestone; routine duplicate eval unnecessary.

Portal **8/10 obsidian verified** #579/#616: bottom(6/7,67,91), sides(5/8,68..70,91); only tops(6/7,71,91) remain. P3 owns casting. P3 died10:06:19 lava/Zombie at(12.5,66,91.5), bucket/steel/pick likely burned; #635 found NO nearby item drops. P3 now rebooting4iron west vein(-1,55,77),(-1,54,77),(-1/-2,53,78). **Woodpick must upgrade to STONE before iron mining.** P1 woodpick loan depot for this. P4 flint fixture verified; gravel3 depot, coal2 for smelt. P3 water-in-bucket between programs prevents freezing; no roof now requested.

P2 owns capture-deck widening/low repairs; P4 guards. P1 supplies nonflammable dirt and prepares first Nether survey. Last P1 dirt delivery **7 dirt #611**, P3/P2 spent4, depot3 remained #635. P2 banked3 sandstone. Second P1 dirt delivery pending. Do NOT duplicate P2 deck construction or touch frame.

## Camp: safe idle and bed
- Chest **(7,67,82)**, table **(6,66,82)**, furnace **(5,66,80)** OUTSIDE north/front. Old furnace cell now bed.
- Bed foot **(6,67,83)**, head **(7,67,83)**, facing east. P1 #425 captured **“Respawn point set”** even daytime; actual later deaths respawned camp, confirming. All four have activated bed; P2 actual respawn camp confirmed too. Never break bed.
- Shelter inside (6.5,67,82.5), bed standing y67.5625. Roof interior x6/7,z82/83 at y69 now TOP spruce slabs (#458), ceiling69.5 permits standing on bed. Bedhead(7.5,67.56,83.5) frees front cell6,82 for traffic. Keep front clear when caster/guard entering/exiting.
- Door **(6,67,81)** restored north-facing CLOSED #395; rightdoor(7,67,81) east-facing, behind chest. Door6 open shape west panel x6..6.1875; passage center x6.59. Front fixture **(6,66,80) cobble** adds a STEP. Align from z79.5, then jump SOUTH to enter. Strict safe-inside criterion **z>82.2**, not doorcell81.5.
- P1 has repeatedly died while idle OUTSIDE. Always finish bounded work INSIDE CLOSED doors. Long reasoning/journaling only while safe or body active in complete roundtrip.

## Team and resources
- P3 caster: frame/fluid methods verified through side70. Current kit lost in lava; reboot ore. Two top casts + remove6 interior dirt supports + ignite afterward. **Keep four top support caps y70 floating** until both tops cast.
- P2 resource/navigation: reached camp, bedspawn set; owns deck widening x9..11,y67,z88..90 + south short rail x10/11,y68,z91. Owns fortress/recon branch once portal ready.
- P4 combat/escort: stoneaxe, name-filter guards; reliable door and western bank patrol. Guard does NOT guarantee east pool/quarry safety. Current guards bounded35/70/100s, require renewal, no blanket safety claim.
- P1 intended first Nether role: near-portal safety/gold/biome survey, return. Script first_nether.js PREPARED but **NOT RUN/VALIDATED**; requires active portal. Needs controller audit/precondition check and bounded first experiment. P1 has donated current woodpick/steak so retrieve loan or new kit first. No armor/shield remains.

### Food/material deliveries actually verified
P1 harvested17 mature berry bushes at x81..92,z72..80, delivered23berries #304; eaten/shared. Four remaining mature bushes last known(81,67,79),(81,67,73),(91,68,73),(92,68,72). Replant potential, but don't assume regrowth.
P1 dynamic stoneaxe hunt #478 killed cow46 and pigs52/54 (HP observed), then Zombie killed p1 before return. **#486 recovered4pork+2beef+gear** and returned HP20food20. #503 deposited **4 cooked pork**; P3 ate2, P4 ate1, P1 reserve1 later burned in lava. #562 collected2 cooked beef; 1 depot,1 p1. #639 P1 deposited final reserved steak for P4 guard healing. No other food reserve claimed.
P1 groundwood #556 got2logs, TABLE-crafted8planks and deposited all #562 for frame. P1 later used5 depotplanks for new woodpick (inventory-withdraw sync caused unnecessary sticks craft). Woodpick now LOANED depot #639.
P1 recovered P4 coal6+rawiron4+tools #338, deposited #345; smelted4iron #417, handed P3 new singlebucket+steel; that kit now lost at10:06 death. Earlier13 shipwreck iron geared p1, all armor/ironpick now lost. No hidden iron reserve claimed.

## Critical verified API/game lessons
1. **Program success != action success.** Pathfinder goto source `lib/goto.js` resolves when path.length===0 even noPath! Verify actual arrival/displacement. Open wooden doors can still be unpathable; manual passage required.
2. **Controls persist across NORMAL returns.** P2 #433/#435 proved jumptrue next program. Our explicit clearControlStates caused water sinking! End water jumptrue/forwardfalse; timeouts DO clear controls. Prefer finish on solid/inside. Prior archived automatic-reset claim FALSE.
3. Before manual control: `setGoal(null)`, clearControlStates, WAIT4ticks; pathfinder late reset otherwise overrides input. `lookAt` must Vec3, true gives forced aim. Plain object caused #208 error.
4. FindBlocks matching sees palette blocks with NULL position. Match name/type only; filter actual positions after.
5. Digging block != pickup. Drops fall/bounce; GoalNear(drop,.6/.7) plus actual inventory check. **Teammates steal auto-pickups silently**: P3 lost4 gravel during fixture but P1 actually picked them in crowded cell; returned4 depot. Keep recycler alone near drops, other bodies on bedhead.
6. Protect infrastructure with `m.blocksCantBreak.add(id)` (chest/table/furnace/bed). `blocksToAvoid` only walking. Disable placement via `m.scafoldingBlocks=[]`; no-towers alone still bridges holes. #329 unintentionally bridged pickup shaft.
7. Local8m GoalXZ legs, 3-4s bounds, canDigtrue for forest, are reliable versus long goals. **maxDropDown1** avoided ALL transit fall damage in #486 vs max2 losing5.5HP #468. InfiniteLiquidDropdownDistance=false. Fixed x16 bypasses deadly cliff x5/8,z-2. Actual surface/cave height must be checked; GoalXZ can route underground.
8. Crafting bug: output can remain hidden slot0, ingredients in1..4, cursor occupied. P4 #508 shiftclick output0, wait8 -> real planks; cleanup input slots/cursor. P1 craft_repair.js clears this (tested clean only). Prefer TABLE for even logs/sticks; individual crafts +wait6-8ticks, check actual inventory/grid0. Check inventory after withdraw delay before deciding recipes. P4/craft_manual.js tested server output.
9. Pillar: center body inside column (<.7 offset each axis), clear ENTIRE gravity column, nongravity block, lookfloor BEFOREjump, jump4ticks then place, clearjump/wait12. P4 suffocated because falling sand above2-high clearance. Placement-refusal sand means escape/clear, not idle.
10. Body bbox radius .3: x16.724 overlaps neighbor17 by.024, prevented falling after digging own floor; manual center16.3,82.7 then #338 dropped65, recovered ore, pillared3 safely.
11. **Wood near lava BURNS**: P4 #603 observed fire(9,68,90), missing barrier holes. Use dirt/stone/sandstone for platforms/barriers. P3 top failure #588 was lowbarrier(9,68,92) beyondreach from feet71 (eye72.62, ~6m ray); prebuild ALL low barrier cells from low stance.
12. Current capture underside #635 y66: z89 x9stone,x10/11air,x12/13copper; z90 x9stone,x10cobble,x11..13LAVA; z91 x9stone,x10/11obsidian,x12/13LAVA. East/south knockoff hazard. P2 owns widening. P1 untested suggestion: overhead east lip x12,y69,z89/90 could stop player's head while bucket ray to source13,66,90 passes BELOW y69; requires ray/collision test, NOT proven.

## Combat capability and hypothesis
P1 #478 actual HIT HP cow10->5.43->0,pig10->1->0,pig7->0. Method: stoneaxe, forcedlook, dynamic GoalFollow(entity,1), attack only distance<2.7, **real Date.now cooldown1400ms**, wait5ticks and inspect metadata[9]. Stop if first target fails, don't repeat same assumption. Old ironpickhunt40s got1pig only; don't reuse unchanged. Animals WANDERED40m, stale10384 coordinates produced no targets; use LIVE entity positions.
P4 doorcombat #476 killed zombie without HP loss: inside onbed, open6door3ticks, forcedaim+axeattack, close3ticks, wait24. Hostile types actually `hostile`, not `mob`; filter names including zombie_villager. P3 bounded120s attack-only guard timer exists, action counts NOT proof of damage; lacks aim/equip/creeper handling.
Future hypothesis: warpedforest Endermen + tested small roof trap may beat gold bartering for pearls. Need first test 1 enderman under 2-high 5x5 roof and HP/loot evidence. Not yet Nether/pearl capability.

## Reusable p1 files
- **door_lib.js** v2: shape-centered exit, entry continuous jump biasedx6.64; returns `{ok,p,hp}`. **door_test.js #602 both directions passed HP20**, strict entryz82.2. Copy/concatenate library into own p1 program; no file reads inside arena.
- **west_dirt.js**: P2 westquarry adaptation, bounded full roundtrip; first #611 delivered7dirt, HP20/20 inside. Second running. Skips gravity/solid overhead, only y66 surface dirt; pickup validated. Complete return automatically, do not pause quarry.
- ground_wood.js #556: full return, only2logs at tree6,93 (partly harvested), no axe available. Tree exhausted; use live groundtree scan before next wood trip.
- recover_food.js #486: 54.5s live drop recovery, maxDrop1, manual doors, return/loadfurnace. Successful template; target death coords must update.
- food_roundtrip.js #478: live animal target + real cooldown proved kills, but died field night. Need hostiles/health retreat guard before repeat. #468 stale target version failed empty hunt; no success claim.
- frame_status.js #579/#616: reads 10 expected frame positions and portal interior. First #577 syntax typo `ofcoords` fixed; no action.
- first_nether.js prepared: guarded active portal precondition, manual camp exit, west approach, front candidate, dimension survey, tentative17s cooldown/out-in return then camp. **UNTESTED; audit before first use**. Records global.P1Nether and prints actual coordinates/materials. No mining yet.
- reach_shelter.js #388 x16 full spawn->camp entered when leftdoor BROKEN; after restored doors its pathfinder entry may fail, use manual door_lib instead.
- recover_swim.js and recover_armor.js #236/#246: recovered early ocean death loot, returned stableice sameprogram; controls correction above supersedes old comments.
- Older nav_install/bootstrap/surface_south/hunt_pigs underperformed, see archives; don't blindly reuse.

Never idle outside while planning. After new experiments record actual inventory/world blocks, including failures. Read P2/P3/P4 journals/arena records when their dependency affects p1. Do not edit peers' files/PLAN or control their bodies. No user questions/permission stops.
