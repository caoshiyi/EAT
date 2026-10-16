# Iteration4 current reusable operations (read P4.md first)
- Own player p4 only. Active body/endpoint in P4.md; old iteration3 helper origins INVALID now.
- `enclosed_route_probe.js`: RO snapshot bounded 3D natural-rock capsule route toward Enderman273 floor(-36,56,47); fullnatural envelope is sufficient policy, not necessary. `enclosed_wide_height_probe.js` y45..75 yielded samepartialcomponent; not global no-path proof.
- `enclosed_route_execute.js`: small3 then8 physical prefixes; entire excavated-volume exterior checked full; target rays exclude proposed cut volume; actual-arrival and sealed endpoint required. No reusable origin assumed; consumes exact-origin proposal.
- `enclosed_hand_one.js` #1628 and `enclosed_hand_three.js` #1641: hand basalt/blackstone cuts physicallypass, no harvestclaim; preservespicks. Hand mining changes latency, not need for cold floor/roof/closure. Timer10s hand vs6s pick.
- `covered_bridge_one.js` #1675/#1689/#1704: full future floor/roof/sides/front built BEFORE cut, then actual pass+newfullshell. Vector dir supportsWEST/NORTH; NORTH1 and4 physicallypassed. Config EXACTorigin; do not rerun oldprefixedconfig.
- `cheap_roof_two.js` #1722: two WEST floor+lowroof steps then fullendpoint -19,65,48 HP20/18. Retainsprojectile current+next eye/torso four actual fullrock rays; target cells excluded beforecut. MAGMA bothfeet TOPgap>6/dist>=8/fullfloors policy copiedfrom P1 fieldproof, firstownphysical2 testpassed. This is a changed hazard policy versus oldbelow+ray helper, not a software bugfix or universal safety claim.
- `cheap_roof_eight.js`: pending at this write from EXACT-19,65,48 toward-27; inspect actualpost before reuse. Endpoint construction first; failure tries protectedpartial then reverse tooldroom. Recovery is conditional, not guaranteed: accept onlyactual ROOF_BRIDGE_POST sealed/onGround/deadfalse.
- `advance_capsules.py`: host arena-only orchestrator max3segments, firstsmall1 accepted; later3stopped firstNAV_BOUND as intended. Records outputs+actualheaders after each segment. It invokes only p4, never readsserver. Current fixed bundle is natural enclosed; do not use for cheapbridge.
- `record_observations.py`: arena record RO -> own JSONL, now ENDPOINT_ACTUAL/ROOF_BRIDGE_POST supported. Smalllast3 added1 then dedup0, broadlast45 added19. Inventory/controllerreceipt is physical, JSON policyfields alone not proof beyond their predicate.

Critical interfaces: maxDropDown2 allows one-feet-block descent because installed getLandingBlock compares supportY (64feet-62support=2). #1593 max1 noPath/unchanged; #1597 max2 SAMEedge physicalPASS. Manual bounded flat/down controller #1613 passed where native3s timedout; retained actualXYZ/onGround. Use .unit with capturedlength; .normalize mutates. Enderman entity.position is base; standingeye1.62 is not crouched1.27. Live gaze/hurt/dead/drop still unverified as of15:15.

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

## Iteration 3 validated / limits
- `door_sender_v1.js` #1160: table1 and berries10 actualrecipientP1, door landed EAST8.242,65,3.368; PARTIAL. FullreceiptACKfalse. P4 roundtrip68.9s campTRUE20/20 no death. Do not rerun three-item toss unchanged.
- `toss_settle_small.js` #1184: ONE camp BASALT low-value test, aimEAST wait6ticks thenWEST wait6ticks -> actualitemWESTdx-.443. P3autopickup verified by arena inventory. Supports waiting after aim; does NOT prove Nether throw.
- `spare_sender_v2.js`: ONEfreshpick payload, wait6ticks afteraim, actualrecipienttoken required. #1202 abortedpreflightMagma beforemovement; no physicalhandoff yet. P1nextcourierDAYonly; coordinatefreshARM, don't send whileownerexplores.
- `clear_portal_cube.js` #1217: ONEaxeswing, actualmagma2191entityDead, no nearbycube after30t, noownhurt andactualclosedOWcamp20hp18food. Immediateblockerremoved, not permanentclear. Savedsource re-raises shield aftergateinteraction; originalrun didnot include this correction.
- `farm_parcel.js` #1145 harvest10bushes ->berries2to19, body18hp16food inside but strictpostthrew. Immediate `settle_farm.js` #1148 BOTHdoorsclosed/fullXYZ andate2; #1156 full20/20 afterhealing. Damage2 observed, no death. Cause of strictpostfailure unproved; startup/readiness hypothesis reported byP3 independently. Not a damage-free farm claim.
- `wood_new34.js` #1178 actualBANK3logs (cut4), loanwoodaxe returned,20hp19food30.9s. Source34,y68..71,z90 DEPLETED; don't reuse unchanged.
- `own_stonepick.js` #1187 actualfreshpick crafted from1log3cobble; bankwoodpick+2planks+2sticks. P1reservedpick remainedbanked atthatpoint. `prepare_spare.js` withdrawsreservedpick ONLYifownfresh+recipientfresh counts2 verified.
- `northeast_branch.js` #1231 actualroute0,66,-4; NEXTfloor1,65,-4MAGMA, refused, mined0/added0. Returnedcamp20/20deadFALSE59.7s. `northeast_cover_v2.js` changes to raisedcoldfloor atY66 andfeet67; activefirsttrial pending, do not claim capabilityyet.
- `hazard_filter.js`: sourcefragment combining type/kind/named hazards. ActualMagma typeMOB/kindHostile counterevidence means old hostile-only NONE claims incomplete. Fullcoldfloor/feet/head check and mobgate solve different problems.

## Latest actual state — iteration3 14:36
Authoritative P4.md TOP overrides old helpers. NEWsealedanchor feet(9,63,80), backWEST(8,63/64,80) full, Southwall9,63/64,81+floor9,62,81, roof9,65,80. Old77South78 OPEN after#1528adoption; cannot use old room as protectedfallback without resealing.
- `shelf_room_supported.js` #1528 first physical proof: actual12step77->9,63,80, supportfloor-first shelter construction, actual full8walls/roof/floor, HP20food18/deadfalse,26basalt remaining. STRICTOLD77start; DO NOT rerun atnewanchor.
- `shelf_step_six.js` #1515 actualsixstep prefix+reverse/reseal77; `shelf_step_twelve.js` #1524 actual12+reverse/reseal77. Both strictoldanchor. #1519 stoppedGHAST beforeopening. Neither firsttrialadopted.
- `shelf_room_twelve.js` #1526 partial2EASTwallblocks thenNOREF, reverse/reseal77healthy. Changed supportfloorfirst resolvedactualfailure #1528.
- `shelf_occluded_proposal.js` READONLY existingcoldfloor4direction boundedA*. Snapshotproposals only. #1530 neworigin9,63,80 partialEastup to20,64,79; NOT physicalnextpathproof, target20,56,109 unreached.
- `shelf_newroom_east_three.js` NEWSTRICT9,63,80/sourceparsePASS, #1532 ACTIVE90s at14:36; actualresultneeded. Opens/resealsEAST10,63/64,80, returnsnewanchor. Proposalorigin checked.
- `preflight_1434.js` #1522 four pure currentORnext radiusfixturesPASS; actualfreshmobscan. Integrationonlymatches correctedP4six/twelve/newhelpers, not oldercurrent-onlysources orP1.
- `P3_RETURN_DEATH_AUDIT.md` independentactualsourceaudit targetrisk-veto canthrowoutofreturnfinally; cleanupunconditionallyloweredshield/no protectedfallback. Originalpacketdeliveredbutreturnfailed/death14:06 remains. No replacement P3 tactic tested.

Ray `.unit()` with capturedlength; normalize mutates. Magma kind/name filter. Current+next hazardcandidates; >=8m twooccludedMagma exception is CHANGEDacceptancepolicy, no generalsafetyclaim. Projectile64 unchanged. Hypothetical futurecut can change cover; field guard aftereverycut/place/move. Reverse omitsoutboundveto to avoid knowncourierdeadlock. A healthy body requires death/event reconciliation before continuityclaim.

14:37 #1532 actualFAILEDforwardgate afterheadcut, 0steps, head10,64,80 RESEALED; current9,63,80 FULL20/18/deadfalse, basalt25/picks55+72. No furtherunchangedretry. Thishelperparsedandreturnedprotectedbut EASTpathNOTphysicallyvalidated. #1530 proposedup/Eastpathremainsvirtual.
