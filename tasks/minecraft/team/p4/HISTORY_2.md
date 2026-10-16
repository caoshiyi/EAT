# P4 current handoff — 09:24 UTC

Own p4 only. Program.md read fully. Objective: EnderDragon victory. Last official evaluator known4/12, dragon0 (p1alsoeval09:13); noNether/dragonclaim.

## Current execution
P4 finallyreturnedcamp #443 manual_enter.js: (6.74,67,82.22), INSIDE closeddoors, hp18food13. Bedactivated #443; repeat #448 confirmswhitebedfoot(6,67,83), messageonlysleepatnight (consistentprioractivation); actualrespawnnotyetdeath-tested. Current active #guard_patrol.js small8secondguardtest + returninsideshelter, toolcap35s; inspectendpointbeforeidle. Have stoneaxe,2cobble,2logs,3torches,2arrows. Reservedstonepick returneddepot forp3casting/icework. Nofood onp4 orindepot. P1ownsfoodroundtrip, p3ownsrekit/cast, p2deepcavebootstrappingescape.

Camp: chest(7,67,82), embeddedtable(6,66,82), bedfoot(6,67,83),head(7,67,83). P1movedfurnaceto(5,66,80) OUTSIDE. P4builtwallsroof; P1raisinginsideceiling69 toTOPslabs69.5 forbedheadroom. P2doors(6/7,67,81), closedinside; verifyintact becausebrokeneveryfewprograms. Exactsafeholding(6.4,67,82.5). Outsidechestaccess(7.5,66,80.5) is UNSAFE andp1diedthere.

Rekit: p1smeltedrecovered4iron, p3nowholds bucket1+iron1+stoneaxe+stonepick, needsflintsteel. Previousbuckets/steel/armorloss mostlydespawned; only3obsidian remainframe. Use4ironfornewbucket+steel, NOTshields now. P1shield+axe, p4axe, p3axe; P2'searlier shieldlostatcampdeath. P3castplanez91x5..8y67..71; p4guard avoidsfluid/frame. Sourcefreezeverifiedneedsroof. Depotlatest #448 logs5/planks3/coal6/gravel3/sticks2/stoneaxe1/stonepick1/woodaxe1/feathers6/misc, BUTp4justtookaxe+coal1+stick1+logs2 andreturnedpick; inspectactualcontents.

Priorities: keepcloseddoorstableidle; completeportalwhileactivelyguarded; foodurgency (p4food13,p3food14); quarry/buildprotectivecastwallsifguardalone insufficient. Bedcheckpointoneacharrival. Don'trestartdistantmininguntilportalready unlesskitrequiresore.

## Tested lessons / operational tools
- Every shell: cd "$EAT_ROOT"; use python3 (no python). say is a bodyprogram, refused while p4 busy.
- **Safe end state requires stable solidfloor/onGround and headair**, not merely air/oxygen400. Temporarysurfacing thenidle sankp4to29 anddrowned. Do NOT finish inwater. center_swim.js #387 finallyachieved(-2.2,61,-23.3) solidgrass/headair; laterbank diggingdestroyedfloor. water_escape_land/lower/emergency_surface were UNRELIABLE. center_swim_land2 #398 reachedstablegrass(0.7,59,-24.5), but routeis not universal.
- **Do not mine any blocks BELOW player's feet when gatheringdirt.** Old dirt.js excluded only floored-coordinate support, but bodyoverlapsneighborcells: #390 dugneighbor support andfell~16blocks. Use dirt_safe.js (y>=footfloor), not dirt.js.
- GoalXZ can dive underground. Fixed-heightGoalNear can tunnelhills. Best testedtravel: surface_route.js derives actualgroundheight for10-blocklegs, maxDropDown1, avoidwater/lava, protectutilityIDs, capgoto7.5s, wait4ticks aftercancel. #263 z45->79 in10.6s healthy. Barehandplayercanstallatsteeprise; collectdirtat/abovefeet forautotower.
- `bot.pathfinder.setGoal(null)` + clearControlStates + wait4ticks before manualcontrols. stop() in sameprogram caused subsequentgoto immediatePathStopped.
- Protect sharedutilities with m.blocksCantBreak.add(blockID), not blocksToAvoid (walkingonly). Sharedoriginaltable/furnace disappeared; p4picked7iron unexpectedly, exactresponsibleactionunproven.
- Interruptedcraft left cursor+grid dirty, causinghangs/missingmaterials. repair_inventory.js #173 VERIFIED: deposit selectedItem onemptyinventoryslot>=9; shiftclickcraftslots1..4 out; checkgridnull/cursornull. #191 subsequentlog->4planks worked. Craft individually andverifycount.
- Toss transfer repeatedly repicked, even senderinventory temporarilydecreased. Chest transfer #194/#198 VERIFIED actual7iron incontainer, p3withdrew andcraftedkit. Use chests andverifyrecipient.
- Equip correctpick immediatelyBEFOREeachoredig, notonlyprogramstart: pathfinderchangesequipment andtoolcanexpire. Oldcoal attempt brokeblockbutcoal0/pickgone.
- mine_local.js #301 SUCCESS:4rawiron+5coal in27s; wait20ticks afterdig forfallingitems, pickupGoalNear.6 with3.5sec cap, eachinventorychecked. Oreinitialposition maynotbe finaldrop position.
- Pillar onstablecolumn worked (#103,+7height/12s; #108,+8/19s): digceiling+2, equipblock, settle4ticks/prelookdown, jump4ticks/place, wait12. **Never pillar under sand/gravel.** #310 sandfilledtarget, thenidle trappedhead; p4suffocated(16.5,62,82.3)08:58:40. P1recoveredallrawiron/coal/tools #338. Placementrefusal because cell became sand is an activehazard, not mere timing. pillar_travel.js checksgravityceiling; do not blindlyreuse pillar_camp underpool.
- Guards must match zombie_villager/husk/drowned/stray etc, not only zombie. Old guard.js omittedzombie_villager, so emptyhostilelistwasincomplete. Updatedguard includesnames; notyetcombatvalidated. Offhandshield alone does not imply blocking: documented bot.activateItem(true) raisesoffhand; testbounded beforeapproach. Don'tidleoutside whilewritinglongnotes.
- Cold biomewater source FROZE: p3 #337 ice(6,67,92); #339 breakingice restoredwater andobsidian. Cover mutablewater sources withsolidroof toblocksky. P2roofplanx5..8,z92,y73, separatefromframe; kitmaynowbedropped.

## Useful world progress and next actions
P4constructedcamp shelter andfurnace; stone/wood/fuel/depot exist. P1delivered23berries+wool3+iron1+feathers6; p2spentiron1 onshield, otherresourcesmustinspect. Earlierp4feathers3+wool1 remainspawnbasechest(10,66,-35), table(10,66,-36), furnace(11,66,-35).
Priorities oncamparrival: (1) active combat/safecloseddoor holding; (2) inspectdepot+recoveronlywithclearownership; (3) bedcheckpoint usingwool3/planks, validateeachplayerrespawnpoint before dangerouswork; (4) smelt4rawiron+1coal, craft2shieldsforp3/p4; (5) resumeportalcast undercoveredwaterwithguard. Do notspendanotherlongphaseonunprotecteddropchasing.

Detailedhistoricalexperiments preserved in [p4/ITERATION_1_LOG.md](p4/ITERATION_1_LOG.md); arena programs/events/chat are authoritative fornewerstate.

## Latest execution 09:17
#403 dryescape reached(-1.5,62,-22.5); dirt_safe gathered7dirt without supportloss. #409 route advanced to(8.1,64,-2.3), stalled atcliff. #412 pillarused7dirt butnet5height (no blocksleft), stable(8.1,69,-2.3). #413-415 goto returnedWITHOUTerrorbutworldpositionunchanged. #422 verifiedGoalNear isEnd=false and getPathTo status=noPath path[]. Frontz-2 isairgap, z-1 dirt69+grass70 ->ledgetop71, twoaboveplayer. Newledge_step.js lowergrass70 thenjumponegap tofloor70. Activechainthen3surface_routecalls. Addedrouteactualdisplacementcheck tostopno-progressrepeat. Do nottrustgotoresolution asreachproof.
P1nowverifiedINSIDEcampcloseddoor6 andsmelting/bed priority. P4should notduplicatebedwork; onarrivalhelpguardand2shields.

## 09:31 tested local support
#465 patrol test neverreachedbank (manualfirsteaststepneededjump), butreturnedinside safely. NOcoverageclaimed. #473 flint_safe hazardstop sawzombie andclosed/retreated; nofallinggravel loss.
#474 observedzombie11194 at(6.7,67,81.78), **type='hostile'**, not'mob'. Oldtypefiltermissesallhostiles; oldnameguardalsoomittedzombie_villager. Useexactnameorhostiletype.
#476 door_combat.js SUCCESS: insidebed(6.5,67.56,83.13), openDOOR6, forceaim+stoneaxeattack, wait3ticks, close, wait24. Hurt-event11194 thenentitygone +MonsterHunter advancement; p4health18unchanged. Zombiealreadyinjured soonehitkilled; no claim3-hitfullfighttested. Safeoperationalalternative toblindcharge. P4food12now, nofooddepot; p1foodtripowner.
Retestingflint_safe.js onsolidfloor(6,66,80), gravelcell(6,67,80), playerdoorway(6.5,67,81.7), finalcloseddoorinside. Willdepositflintforp3kit ifsuccess.

# 09:34 flint dependency RESOLVED
#490 flint_outside.js SUCCESS: moved to(6.5,66.77,79.6), same-height supportedgravel(6,67,80),2cycles yieldedflint1. Depositedflint1+gravel2 in depot, returnedinside(6.5,67,82.63), doorsclosed, hp18food12. P3notifiedtakeflint forsteel. Earlier #480 stablefloorstilllostpickupbecausebodytoo far/crowded; entitydropsjustoutside, notcaveloss. P1alsoacknowledgedpickingp3's4gravel in crowdedroom: alwayscheckpeerinventoriesbeforeassuminglostphysics.
P1foodcombat nowproven butdiedat(74.9,70,108.3); rawpork4+beef2 retrievalunderp1 ownership. BEDRESPAWNactual verifiedp1backinside afterdeath. Daytime1179 perchat. P4stillnofood, hp18food12; guardnextwhilep3casts, avoiddistantmining.

## Control persistence CORRECTION (p2 tested #433/#435)
Normalprogramreturn doesNOTclearcontrols. ExplicitourclearControlStates causedwater sinking; timeoutsDOclear. Leavingjumptrue canholdwatercolumnwhileplanningnextstep (still notsafeunderice); do not repeat earlierautomatic-reset explanation. Offhandshield mustactivateItem(true) toblock; do notdeactivatewhileexposedidle. API confirmed offHandboolean.

## 09:36 active support
#494 guardroute FIXED byjumpingfirsteaststep: bankreached(7.04,68.25,87.75),8sscantheninsidecloseddoors,nohealthloss. Newguardintervalglobal.p4guardMs=35000; guard_patrol.js #499 active, tooltimeout62s. P4axe,hp18food12,nofood. P3newkit1bucket+steel+pick+axeconfirmed #495; awaitingp1cookedfood beforecast. P1recoveredpork4+beef2 #486, depotstillnofood, cookingoutputnotyetverified.
P4craftinglogs->planks in guard_ready skipped unexpectedly; logs2stillinventory, noresultclaim. Torchescrafted4, inside1placed (actualstatus3remain), not4remainingasinitialinstantlog.

## Craft resolution anomaly now TESTED
#506 craft_test returnedwithout4planks initems; #508 inspected grid0=planks4, grid4=log1, cursornull. Inputwasnotconsumed, merelyinrecipegrid. Shiftclickoutputslot0 (`await bot.clickWindow(0,0,1); wait8ticks`) yielded ACTUALplanks4 inventory, allgridnull. Thisexplainsguard_readylogs->planksskips/materialhiding. Promisecompletion notoutputretrieval. Aftercraft inspectoutput0 andclaimitifpresent; thencheckactualinventory+clearcursor/grid ifinterrupted. Notaserverdupe/loss.
#499 activeguard35s atbank followedinsideclosed:51.7stotal, hp18food12unchanged. Noenemyduringinterval. P1cookingpork4, foodallocationp3two,p4one,p1one; pendingdeposit. P3newkitbucketsteelverified.

## 09:39 followup
#518 craft_manual.js smalltest SUCCESS: servercomputedstick4, shiftclickclaimedactual4, cleaninventory. cfgglobal.p4craft defaultsname'stick',times1; optionaltable coords. Tablerecipes notyettested. HelperREADME in p4/README.md marks safevsunsafe experiments.
Foodpork4 nowdepot verifiedp1#503, allocationp3two,p4one,p1one. Active meal.js->guard_patrol.js chain: p4takingallocated1porkthen35s escort, toolcap62s. Inspectmealhealth/food after; don'tassume.

## 09:42 eating/door coordination correction
#520 meal returnedbutDIDNOTeat: food12,pork1remained. Readinventory.js: heldItemChanged finishes eatingTask, so equip'slateevent canresolveconsumeearly. #529 eat_settled waits6ticksafterequip ->ACTUALfood20, health19, porkgone. VERIFIED. Usewaitafterequipforeating, notpromisealone.
#530 escort35s active, p4fed. P3requestsdoor6leftopenbriefly; changedNEXTguardexit toleave6OPENwhileactivelyescorting, close7only, closeallafterreturninside. Avoiddoorchurn blockingcaster; closeddoorisstableidlepolicy, notvetoontemporaryactivepassage. P1askedtomovebedheadfreefrontcell. Currentguardloadedoldcode, nextcallwillhonoropenhandoff.

## 09:47 casting support
#544 guard100s completed115.7stotal, 20hp20food, returnedclosedinside. P3 #541 left69OBSIDIANGAIN ->5/10 frame; right69failednoReachableLavaSource, notfreeze. P4proposed1blockcaptureplatform(10,67,89) from9barrier tobringfreshx13sourceswithin4.5eye reach, testownedP2/P3. Usecobble1 foroverlava (woodfloorsflammable), planksremote fixtures.
#549 craft_manual no-tablelog recipe VERIFIED: planks2->6, loggone. #551 actuallyBANKEDplanks6,cobble1,sticks4,arrows2; depot totalsplanks6,gravel3,coal2,stick5,cobble1,feathers6 etc. P4nowaxe+torches3only, full20/20. GlobalguardMs reset35000, #552? currentlyguarding. P2gathering12dirt aftercastleadaskedmaterialsinsteadofroof. P1hasbedrespawn, lostnewquarrykittozombie/lavaadjacentpool; avoidquarryeastedge.

## TOP CAST FAILURE ANALYSIS — 10:00 UTC
Observed p3#588: raisedstand71, then solid(9,68,92) placementnoBlockUpdate timeout. CodecastOne raisesfirst, THENbuildsbarrier9,y68..q.y,z91/92. Fromknownstand(7.5,71,89.5) eyes72.62 totargetsupport(9.5,68,92.5) is~5.9blocks, beyondnormalplacementreach. Inference: out-of-reachlowbarrier, samefamilyasprebuildTOPinteriorissue. Smalloperationaltest: inspectactual9,68,92 andneighbors; prebuildALLbarrierx9,y68..71,z90..92 fromLOWstance BEFOREraising, thenretrytopcasts. Don'tredesignfluidmethod; q71/backsupportsalreadyprebuilt. P4guardbusy until#596 ends, willsharechatthen; thisnoteavailableimmediately.

## Guard/entry latest verified
#568 fieldattacksagainst14456/14397 logged; mobknockbackobserved butnohurteventcapturethen, nofullkillclaim. Creepertriggeredretreat; body20/20 endedOUTSIDE85.5. #571 retreatfrontfailedx7.3 becauseflintfixturefloor6,66,80 creates1blockstep. #574 front_entry_step: alignNORTHat79.5 thenjumpSOUTH, inside82.62VERIFIED. #582guardend80.7NOTinside duex6.482clipsopenhinge(~6.4875minclearcenter). #586 preciseentryrestoredinside. Guardnowreadsopenshape center6.59375 andmicroaligns, strictz>82.15.
#589 FULLPATROLreturninside6.63,67,82.61 verified20/20. #596 anchorcloser8.21,68,88.7,70smonitor, returnedinside6.64,67,82.60 closed20/20 in86.9s. Noattacks/nearbyhostilesduring#596. P4onlystoneaxe+torch3 currently. P3standing71 afterfailedtopbarrierplacement; inference/smalltestsentchat.
