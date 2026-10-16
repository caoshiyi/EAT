# P1 current — 11:18 UTC, iteration 2 (handoff consolidation begun)
Own p1 only and P1.md/p1/. Fully read program.md. All shell commands `cd $EAT_ROOT`, python3 only. No server/.work/tools edits, no peer control. Continue until evaluator dragon1/phaseend. **Official P4 eval11:03: 5/12 milestones, dragon0, deaths30**; later 4+deaths, no newer official neededyet.

## Actual p1 / next actions
#958 current **BEDBACK(6.561,67.5625,83.7),health20food17**, STONEAXE1, WOODPICK1, COBBLESLAB5, **OWN SHIELD offhand raised** (normal return preserves). Nofoodcarried. STONEPICK1actuallyBANKED #948 forP3bootstrap. Door6CLOSED. Firstinsideplacement#948 refusedwrongarrival SAFELY; revised#958 succeededwithoutleavingcamp.
**STEP FIX VERIFIED #958:** replaced FULLcobble(6,66,80) with **cobblestone_slab typebottom** SAMEcell; target79stillAIR. Northgroundfeet66 ->slab80feet66.5 ->door81feet67. **NEWENTRY MUSTNOJUMP**. P3ownsoneDAYphysicalnojumpentrytest, pending. Do NOTuseoldjumpuntil80.35helperafterthischange.
P1nextusefuloutcome DAYlocalfarmharvest (food17/noreserve); then ONE **stationaryNetherlanding spider fight** onlyifhealth/food safe. P4ownsNethercover, coordinate avoidduplicateentry. P2diedNether11:16:~30, drops~11:21:30expiry; optionallootafterhazardclear, neverblindchase. P1combatmethod mustfull1.6sREALcooldown sinceequip beforefirstswing, shieldduringwait, forcedaim, no movementbeforehostilegate. Existingpartialdoorhitdid1.95damage, don'tassume9.

## Critical current world
PortalOW frame x5/8,y68..70,z91; bottom6/7,67,91; top6/7,71,91 ALL10OBSIDIAN. P3ignite#896 actual6portalblocks. OWfront6,67,90 AIR/floor66SAND (oldfeet68obsolete). Entry GoalBlock(6,68,91) actualhopWORKED#902/#917.
**NETHER portal actual(1.543,65,2.5); safeadjacent(1.5,65,3.5) BASALTfloor** observed#902. Safe tile now requiresFRESHcheck: P2#953 diedafterSPIDER arrival(2.3,66,1.1) pushedbodyintoFIRE(8.9,65,2.3). NetherlandingcurrentlyUNSAFE, do NOTreusefirstprobe nohostilesassumption.
P2topology#91651connectedfullblockfeetnodes; East(10,66,1), South(1,65,4), North(-1,67,-6), West(-4,65,-6). NW #917 firstGoalXZ(-3,-3-ish) NO_PATH; this is unavailablecolumn, **notproofallNWblocked**. Noexcavation/miningperformed.
#902 scan: nohostiles32 THEN, nofortressbricks96/spawner48/warped48/crimson48 inloadedchunks; actualbiomenameempty soBASALTflooronlyinference. Gold(-21/-22,64,-30)40m; deeper(-8/-9,48,-30) notdirecttarget. NW32scan nomushrooms. P2EASTprobe#953 diedbeforephysicalrouteproof.

## Camp / safety
Chest7,67,82 table6,66,82 furnace5,66,80 bedfoot6,67,83/head7,67,83. Inside predicate FULLXYZ: 5.3<x<7.7,82.2<z<84,67<=y<68.5 ANDcloseddoors. BEDBACK83.7 saferthanrespawn82.5: zombiecanoverlapDOORCELL81.9 despitecloseddoor andreachfrontbodies. P1#942 dooropen/axe/close hurt zombie5400 HP8.192->6.239, knockedoutdoorcell; #944NO_TARGET, NOkillclaim. Spiderrooflastseen7.5,70,83.2; norththreatsneededbeforeopening.
Furnace canopen/takefromINSIDE. **NeverblindtakeOutput**: #799 expectedporkbutP3changedtoiron; took1iron, #802actualBANKEDimmediately; no loss. Checkexpectedtype beforemutation.
ChestFULLcausedP2faileddeposit/falseannouncement; #933/#934 correctedactualP4axe/pick/torchbanked. Transfersrequireactualrecipient/depotcounts. P4shieldloanP3diedwithit, wasNOTbanked; P4DAYrecoveredactualoffhandshield~11:15, loanresolved. P1OWNnewshieldcrafted#936 from1iron6planks, notP4loan.

## Failures / changed method
P1deaths10:48:27 outside7.3,66,80.7 (#821return); 11:07:39 outside5.6,66,72.4 (#917return). Do notnightrepeatdoorhelperalone. #821finallycheckeddeathonlyONCEthencontinuedonrespawn; END20/20/deadtrue NOTroundtrip. #917 near()returnedfalseIGNOREDthenopeneddoorfarfromfront; misalignmentthrewOUTSIDEHP10, diedbeforeobservation. Need strictactualfrontarrival, activehostilehandling/shield, closeonfailurewheninreach, and emergencyaction BEFOREprogramendoutside. Neveridleoutsideplanning.
`door_lib.js` v5 hascallbacklifecheck before/afternav/manualpulses plusstrictXalignment. StillOLDjumpentry: updateNOJUMP forverifiedslab80 beforeuse. Wholefieldfinally mustskipobsoleteactions ondeath andnestedcleanup. P1insidekit/shieldnowstable; nofieldwithoutchangedprotection.

## Durable progress / supplies
**11BERRYBUSHES** x1,y66,z93..99 (7) +x0,y66,z95..98(4); TORCH2,66,96. #733 initial5planted, #8054berriesbanked, #869harvest4+4seed->6newplants+2berriesbanked,36.5s20/20roundtrip. Growth/nightregrowthobserved; farmcheapvs80mtrip(9berrycost8hunger). Freshagecheckbeforeharvest.
#767 actual4pigkills/8rawpork, cookedall8 with6planks; severalactuallybanked+shared, nowdepotfoodempty perP4, P2porklostNether, P1porklostOW. Foodurgent beforelongbranch. Bone1/arrow2BANKED #892; bone->3bonemeal availableforfarmifstillpresent. P3coal3banked#909; newiron4banked#914, P1used1shield, othersinspectactualcounts.

## Tools / memory
`first_nether.js` #90253.7s VERIFIEDenter+safeadjacent+stepout16.5scooldown+OW+closedcamp20/20; reusableentry/return FIRSTgeometryonly, stalehostileassumptionnowfalse. `nether_nw_probe.js` #917 NO_PROGRESS and FAILEDOWreturn; don'trerununchanged. `inside_slab.js` #948 SAFEarrivalabort(no placement), #958 inlinearena issuccessful80replacement. `craft_lib.js` adaptedP4manualtool output0shiftclick+actualinventory: planks/sticks/axes/pick/shield/slabpassed. `farm_expand.js` #869actualroundtrip11cropverified. `stone_kit_trip.js` #8816cobble->stoneaxe/pickactual, returned18.5hp16food, surfaceDrop2fallcost2.5hp (use1surface/2knownstairs).
Detailediterationlogs `p1/ITER2_TO_0958.md`, `p1/ITER2_LOG.md`, prior`HISTORY_START_ITER2.md`, `HISTORY_TO_0640.md`, `HISTORY.md`. Arena programs/events authoritative, notjournallabels. Updatehandoffeachmajorchange; consolidationbegun11:18 (~43min).
