# P4 tested helpers

All play must remain on each agent's own assigned player. These files are programs, not server tools. Read current P4.md and inspect actual state before reuse. Old files not listed below are experiments, often unsafe or superseded.

- `manual_enter.js`: tested north-door entry from camp front. Opens doors, manual jump through door6, closes inside, activates bed. #443 reached(6.74,67,82.22). Hut layout must still match.
- `door_combat.js`: tested inside-on-bed axe strike through briefly OPEN door6, then close between cooldowns. #476 hurt zombie11194 and killed it without damage. Zombie was already injured; full-health/multiple-monster safety is not established.
- `flint_outside.js`: #490 produced/deposited flint1 after2cycles. Supported gravel cell(6,67,80), solid floor(6,66,80), player OUTSIDE close at(6.5,66.77,79.6). Monitors nearby hostile names and retreats. Gravel drops can eject sideways; inside doorway is too far. Preserve free door path; announce work. Audit error cleanup before scaling.
- `guard_patrol.js`: #494/#499 reached bank(7,68,87), monitored, returned inside closed doors without damage. `global.p4guardMs` controls interval (default8s, currently35s on p4). Tested against no enemies during patrol. Door-combat hit separately verified. Active target list includes zombie_villager; old `type === 'mob'` misses hostiles (actual type='hostile'). Avoid creepers, lava, and unsupported claims of full-area protection.
- `mine_local.js`: #301 rawiron4+coal5 acquired in27s. Correct pick before every dig, wait20ticks for falling items, bounded pickup. Its direct reach must be rechecked for new geometry.
- `craft_reconcile.js`: #508 output0 planks4 + input4 log1 were still in grid despite craft promise return. Shiftclick result0 produced actual inventory planks4. Cursor/grid must also be reconciled after interruptions.
- `craft_manual.js`: cfg `global.p4craft={name:'stick',times:1}` default; optional `table:[x,y,z]`. Waits/syncs after clicks, places one recipe, verifies server output0 then shiftclicks it. #518 no-table stick craft VERIFIED0->4. Table recipes NOT YET TESTED. Never trust local result alone; compare inventory after close/sync.

Travel: `surface_route.js` derives groundheight and checks real displacement; protects utilities/water. #263 traversed34m/10.6s once on surface. It can stall at jumps/empty-path outcomes. #422 proved goto can return while isEnd=false and getPathTo=noPath. `ledge_step.js` cleared an observed grass obstruction; manual jump fell3blocks but subsequent route progressed, so don't call that jump itself a clean success.

Hazards: Do not use old `dirt.js` (can remove overlapping support and drop into ravine). `dirt_safe.js` only targets blocks at/above foot level. Never pillar under sand/gravel: #310 refusal because cell became sand preceded suffocation. `pillar_travel.js` was useful only on inspected gravity-free columns. Water helpers had repeated failures/deaths; temporary air is not a stable endpoint. Normal return preserves controls (p2 tested); our explicit clearing caused sinking. Safest end is onGround, solid underfoot, head air, closed shelter.

## Iteration 2 tested additions
- `reconcile_now.js`: #684 actual inventory/wall/depot audit. Read-only except own controls/window; useful before new dependency.
- `close_handoff.js`: #690 bankedwoodpick/planks/sticks then FOOT x8,67,83 patch; P2 hadplacedHEAD first. Finalall3wallDIRT andHP20. Headfirst avoids zombie-overlap footerblock. Reconcile peers before rerun; no need reopen.
- `stone_trip.js`: #723 VERIFIED3cobblefrom20,67,86 then19,67,85 then18,67,84, beloweachsolid. Returnedinside20/20 and actualBANK3cobble+woodpick. **These3stoneblocks nowmined; do not rerun unchanged.** West/south pool cellsLAVA, routeviaeast/northx21,z81/84. P3received/craftedSTONEpickactual chat#305.
- `exit_test.js`: #720 forcednorthmovement frombed83.7 throughdoor tooutside78.7, nojump, allstepsactuallogged. DoesNOTreturn; use only withimmediatefollowup insideanotherroundtrip. Door trafficneedscoordination.
- `craft_own_pick.js`: #748 TESTED tablemanualwoodpick withactualinventory. Usedlog1+planks3 -> woodpick1+planks2+sticks2. Helper table recipes verified woodaxe#672 andwoodpick#748. Doesconsumeassumedmaterials; notidempotent.
- `quarry_lib.js` / `quarry_trip.js`: currentEXPERIMENT, notyetvalidated atwrite. Nongravity staircasex26 from67,101 south/down to63,105, solidore62floor; nevermineorewithwood. Mustpostcheckactualreturn/bank beforecallingcapability. First#743preconditionnopick abortedinside becauseP3heldloan; secondhasownpick. Previousreturnattemptsinsidewasteful, revisedskipstairifx<=24.

### Iteration2 quarry outcome and corrections
- #765 physicalmaxDropDown2 verified all5stairs withfeet+onGround. #775 cobble3craftownstonepick, bankdirt11. No cavewater/gravity.
- `shallow_iron_trip.js` #779 extracted2rawiron actualinventory, FAILEDreturn: ore26,62,105 wasSUPPORTforfoot63,z105. Mustreplaceitbeforeascent. OlddoorZ-onlypredicate falselyprintedinside atz106! quarry_lib.js nowrequirescampdistance<6+X/Zbounds. DoNOTreuseoldembeddedscriptwithoutthosefixes.
- `repair_quarry_return.js` #789 VERIFIED onecobblefloor26,62,105 ->ascend ->camp ->ACTUALBANK2rawiron/cobble4/planks2/dirt1/woodpick. P3actualkitbucket+steel laterverifiedchat354. BothshalloworesDEPLETED, notrenewables. Cleanstairnowallowsfuturestonequarry.
- `entry_step_feedback.js` #771 VERIFIED: jumpANDforwardtogetheruntilz80.35, thenJUMPfalse whileforwardcontinues; inside20hp. Newquarry_lib incorporated. #789 fullreturnalsoentryworked. Re-aimafteranydooractivate becauseactivatingturnsaimbacktowarddoor; P1confirmed independently.
- `escort_rekit.js` #797 fullfood20, STONEaxeactualcrafted, bankoldwoodaxe+sticks2. Reservefoodreconcileeachtime; doesconsumematerials.
- `cast_guard.js`: preparedsyntaxcheckedonly, waitsoperationalKITREADYbeforeuse; willannounce60scoverageAFTERactualguardtilearrival. No chase/arrows/eastpool/southknockoffcoverage. No proofyetofnewroundtrip; inspectactualendpoint.
