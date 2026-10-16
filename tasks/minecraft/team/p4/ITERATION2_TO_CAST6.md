# P4 — current iteration 2
Own p4 only; read full program.md. Only edit this file and p4/. All shell commands cd $EAT_ROOT; python3 (python unavailable). No server/.work/tools access or modifications. Objective dragon=1 evaluator, last known dragon0 milestones4/12; not complete.

## 10:37 UTC — current commitment
P4 healthy20/20 INSIDE (6.613,67.5625,83.277). Northdoor CLOSED. Live east hatch x8,y67/68,z83 AIR, roof69 dirt; zombies still overlap outside. Not a sealed camp despite northdoor.
Program #684 reconciled live depot and p4 inventory. P4 actually held inherited WOODPICK1, woodaxe1, planks3, sticks2. Depot flint2/gravel1/coal1/dirt3, torch2, miscellany; no iron kit.
P3 current commitment stone bootstrap then iron/casting; requested spare woodpick. Therefore P4 cancelled proposed duplicate stone trip and is transferring woodpick/planks/sticks to chest for P3, then directly closing hatch. Program close_handoff.js ACTIVE (55s bound; inspect result): deposit woodpick1/planks3/sticks2 and inspect chest contents, withdraw2 dirt, inside axe attacks against LIVE east zombies then patch x8,y67/68,z83. Only completion evidence will be actual block observations, not program completion. No field guard active/claimed.
Acceptance: P3 actual woodpick receipt OR actual bank contents; east wall all y67..69 solid while body inside/no health loss. Current program must be checked before next action.

## Critical lessons inherited
- Normal returns preserve controls; clear controls/goals deliberately on stable land. Death changes body: check actual state before continuing old targets.
- Pathfinder goto may resolve noPath with no movement; inspect actual endpoint. Strict safeinside z>82.15; no outside idle.
- Hatch repeatedly failed reseal due entity overlap, opening roof69 required for bedheight exit. Do not reopen until complete return/seal capability demonstrated.
- Name-filter mobs (type hostile not mob). Forceaim+axe cooldown27ticks; actual entityHurt/metadata evidence, not swing count. Old IDs stale after restart; live select each run.
- Craft manual helper tested table woodenaxe #672; output0/server contents/actual inventory checks required. Consume after equip6ticks.
- Door_entry_precise.js tested inside; loose x tolerance wedged and cost deaths. Shape-derived center x6.59375, north alignment z79.5; inspect actual z>82.15 and closed doors.
- Dirt_delivery previous run FAILED with deaths, not delivered. No continuation of obsolete quarry objective. Earlier flint2 actual bank verified #648.

Older state archived in p4/HISTORY_2.md and ITERATION_1_LOG.md; arena programs/events authoritative. Helpers p4/README.md; old scripts may be unsafe. Next check active program and reconcile P3 receipt; then choose independent useful concrete outcome without duplicating peer commitments.

## 10:39 update (clock actually ~10:38; use arena timestamps)
#690 VERIFIED bank woodpick/planks/sticks, then eastFOOT dirt placed; ALL3 east cells67/68/69 dirt, HP20. P2 independently headpatch#689. No combat needed after headblock. P3 actual chat accepted P4 STONE bootstrap, so #701 withdrew woodenpick back. P3 mapping iron now, no duplicate stone trip.
#704/706/708 explicit world scans: west stone buried under sand/sandstone; exposed stone18,67,84 +19,67,85 +20,67,86 have solid underneath (sand/stone/stone). Adjacent pool WEST/SOUTH y66 lava; never chase west. Chosen east/north approach via21.5,68,81.5->21.5,68,84.5, mine three top stone with woodpick, pickup only at targets above solid, return north z79.5 then precise door. stone_trip.js ACTIVE65s, includes death discontinuity and bounded nav/return/depot actual check. Must inspect result; no cobble success claimed yet.

## 10:41 actual progress/failures
#711 FAILED departure (stayed bed83.7), no cobble; all mining skipped, woodpick rebanked. Home routine pointlessly attempted external waypoints while inside; next controller should early return if already inside.
#720 bounded manual exit succeeded after restart/reconciliation: position83.7 ->82.42 ->81.17 ->79.88 ->78.72, HP20. Door open check and forced north walking; nojump. P3 alsoreporteddoor overlap so do not independently toggle during peer passage.
Revised stone_trip.js currentACTIVE fromactualoutside78.7, retrievesbankpick fromreachablechest, skips redundantexit ifoutside. Goal easttopstone3, completebounded return/depot. Check actual result immediately, do notidleoutside.
LatestP2 officialeval4/12 dragon0 deaths28; no duplicate routine eval needed.

## 10:38 VERIFIED dependency closed
#723 stone_trip26.7s SUCCESS: topstones20,67,86;19,67,85;18,67,84 each yieldedcobble1,2,3. Returned INSIDE(6.503,67,82.582) health20food20; doorsclosed viahelper. Actual POSTDEPOT cobblestone3 +woodpick1, sticks2/planks3 stillbanked; P3 notified reserved3cobble+2sticks forstonepick. Awaitactualrecipientreceipt/craft observation (senderdeposit alone notreceipt).
Return one leg to7.5,67,79.5 timedout at8.90,67,79.97; nextleg6.59 worked+entry. No healthloss or deaths. No fieldguardactive. Body stable inside.

## 10:39 receipt confirmed / next outcome
P3 chat#305 explicitly actualSTONEPICK inventory; COBBLE handoff fully VERIFIED (recipientcraft, notjustbank).
P4 new committed independentoutcome: sparecobble6+ fromnongravity shallowquarry, expose2iron26/27,62,105 as fallback. Scans#734/#736 verified dirt65..67 thenSTONE63/64, only2ore62; no sand/gravel/fluid locally. P3stillownswest4iron. P2wood3BANKED+ownscentralstandDIRTreplacement/guardtile; P1localberryfarm x1,z94..98 AVOID.
quarry_trip.js ACTIVE110s bound (~10:40). Retrievesbankwoodpick then eastofpoolroute x21/23/24/26 z81/87/94/100. Stair x26: step(26,67,101) south/down to(26,63,105), eachcolumn topdown/headclear3. No directunderfootdig, noorewithwood. Return stairs +north/eastpool route +door +actualBANK. Needs freshpostconditioncheck; no success claimed yet.

## 10:39 quarry precondition failure
#743 abortedINSIDE no field: bankwoodpick hadbeenwithdrawn byP3 whoactualheldBOTHwood+stone. Receipt verified didnotmeanloanreturned; don'tassumebankcontents persist. No ore/cobble acquired. Need ownindependenttool; P4 craftingnewwoodpick via actualdepotlogs1+planks3, manualcrafthelper3recipes. P1withdrewotherlog1foraxe; P2banked3 earlier, thirdlogremainsunlesschanged. ExistingP3woodpick notrequestedreturn toavoidblockingorework. quarry_trip revisedacceptownpick andskipstairreturnwhenstillinside.

## 10:41 excavation diagnosis
#753 quarry reached26,67,101 FIRSTSTEP (dirt1), failed nextdescend to26,66,102 whilemaxDropDown1. No cobble. Returnedfront20hpfood18 butdoorentryfailed continuousjump: ended80.7, NOTinside. #760 preciseentry2.5s succeededINSIDE82.63620hpfood18.
P2source+pairtest explainsmaxDropDown1 offbyone: feet-supportdiff2 forsinglefootdrop. Read p2/pathfinder_drop_review.md. NowmaxDropDown2 for1stepstair, strictfeet+onGround check aftergo. Doorlateral nowSNEAK, jumpfalseafter4ticks (previous persistentjump hitroof). NewquarrytripACTIVE110s; samegroundroute alreadyproven safe, changeddescendtest. Target5stairs yieldsroughly3cobble (old6targetestimate optimistic), enough ownSTONEpick; afterreturn cancraftthenretrieve2shallowiron. P3continueswest4ore. No success untilobserved.

## 10:43 latest verified state
#765 fiveSTEP positions/onGround verified67,101 ->66,102 ->65,103 ->64,104 ->63,105; acquiredcobble3+dirt11. ReturnfrontentryFAILED again, noinsideclaim. #771 newentryfeedback actualINSIDE6.52,67.56,82.731 HP20food16. Jump+forward simultaneously forfrontSTEP, STOPjump oncez80.35; oldjump4beforeforward landsbeforesolidstep, continuousjump hitsroof. LateralSNEAK .025tol. This isonly1freshentrytest, notgeneralproof.
#775 dirt11 ACTUALBANK verified; craftownSTONEpick actualinventory verified. Personalwoodaxe+woodpick+stonepick+planks2. No armor. NewACTIVE shallow_iron_trip.js110s: existingeaststair, extend6thstep26,62,106, mine2ores26/27,62,105 withSTONEpick, headclearfromside, collectactualrawiron, return+bank. P3stillownswest4iron. Mustverifyactualpostbank andhandofftosmelter. No newmilestone/evalyet.

## 10:44 active ore extraction hazard
#779 liveSTATUS twoRAWIRON +cobble5 actualp4inventory, HP20food15, at26.4,62,106.1. Programstillrunning~47s. IMPORTANT miningore26,62,105 removed SUPPORTfloor forstepn4 feet63,z105; needREPLACE26,62,105 usingcobble afterpickup BEFOREascent. Currentprogram lacksrepair; mayfailreturn. Twoorebothmined, noassetloss, safeundergroundcurrently. Nextprogrammustactualstatecheck thenreplacefloor frombelow/side andreturn; noautomaticrepeatednav. Pendingplanks2availableforP1porkfuel; attemptedchatwhileprogramrunning REFUSED (oneprogramperbody), soNOTsent. Cannotrelyonspeechduringactiveplay.

## 10:44 failed return, exact evidence
#77956.3s actualrawiron2+cobble5 verified, but attemptedreturnFAILED becauseore26,62,105 wasstairsupport. DO NOT claimhandoff! Stillat26.416,62,106.056 health20food15. Badold doorok predicate(z>82.15 alone) falselyprintedentertrue atz106; thenchestopen timedout20s. Fixedquarry_lib door preconditiondistance<6camp andinsideX/Zbounds. This was validationbug, notactualreturn. Newrepair_quarry_return.js ACTIVE65s: backfrombboxoverlap toz>106.45, PLACECOBBLE26,62,105 atop61, verifyfloor, ascend5stairs, campentryfeedback, actualBANK rawiron2 +cobble4+dirt1+planks2+woodpick. Mustchecknewpostcondition.
Designlesson oreisstructuraluntilverified otherwise. Beforeminingresourceunderreturnstairs, reserve/replacefloorinSAMEtransaction. Do not continue laternavlegs aftercriticalstairlegfails (oldscriptdid; wastedtime, falsepredicates).

## 10:45 verified iron handoff / next
#789 repairCOBBLE26,62,105 VERIFIED; ascent/campreturn17.8s SUCCESS INSIDE(6.571,67.5625,82.714), hp20food13. ACTUALDEPOT rawiron2+cobble4+planks4+dirt6+woodpick2. P3notified towithdraw2, awaitingactualsmeltinput/ingots. P3own2rawironalreadyfurnace, combined4 kitdependency shouldnowclose. P1actualpork4+ inbank.
#796 notified, activeescort_rekit.js: takes1pork+3cobble+2planks, eats (food13->20 expectedbutverify), manualsticks+stoneaxe, bankoldwoodaxe+sparesticks. Then proposeP3escort60s anchoredGUARDtile9,68,88 tooverlapactualcasting, nofieldchases/arrowcoverage. Mustagree/readiness/start/finish; noactiveprotectionclaimedwhilecrafting.

## 10:46 readiness / acceptance
#797 actualporkeatfood20, craftedSTONEAXE actualinventory, bankoldwoodaxe+sticks2. p4healthy20/20 inside, personalSTONEaxe+STONEpick.
P3 #chat354 actualBUCKET+STEEL verified: ourrawiron handoff nowfullyacceptedintoactualKIT. P3capturingwater solidbank(-7,63,65) thenwillannounceKITREADY; **do notrunfieldguarduntilthen**. P4chat352 proposed agreedcoverage60s guard9.5,68,88.5; startsONLYP4READYsignal, P3onecast; limitsnoarrows/eastpool/southknockoff, attackswithin3m/nochase. Warning50s, COVEREND60s, returnclosedcamp. cast_guard.js prepared+syntaxchecked, notRUNyet. Mustfreshkitreadyack +readstatebeforestart.
P2recovering2deepdroppedrawiron dryshaft; don'tduplicate. P1food/farm, P2deckallverified. Frame8/10lastknown, dragon0official4/12. No evalneededuntilactualportal/Nether progress.

## 10:47 synchronization status
GuardNOTstarted. P3watercaptureverifiedbutreturnstuck(-2.3,64,70.8); explicitlynoKITREADY yet. #813freshframe8obsidian+topsSNOW, night14701,nohostilesnear17camp; cleanup auditdeathlistenersfoundonlycore3, noownstalecallbacks. #818sharedhypothesisSNOWlip at(-2,65,70), notclaimsolution; P3nowactualfront79.8 healthy20/20 in#817 so likelyreturned. Awaitexplicitreadiness, don'tstarttimerprematurely. P2#814 actualrawiron2recoveredstillreturning; reservehandoffNOTyetbankverified. Couldsupportshield(s) later, noextraironkitcraftcommitmentyet.

## 10:48 synchronized dry-route escort ACTIVE
P3KITREADYexplicit chat367: waterbucket+steel+stonepick actualINSIDE20/20; requested60s escort for DRYROUTETEST top->capture11->top->inside, NOfluid. P4cast_guard.js ACTIVE100s bound; afteractualguardtilearrival sendsREADYsignal, then60s guard/warning50s/END+return. Start/finishwillbeobserved viachat/status. This isdrytestonly, notcast; no snow/frame/fluidchangedbyp4.
P1 concurrentlyfrontapproachtest35s viawest3,88->4,90->6,68,90. P2recoveryFULLYVERIFIEDrawiron2+sandstone4+cobble2BANKED #814; futureSHIELDreservepossible butuncommitted, no withdrawalsnow.

## 10:48 escort synchronization FAILED safely
#82315.7s guardtilearrival actual; READY10:48:17 immediatelydetectedSKELETONwithin8 ->COVERABORT+END same timestamp. Coverage~0s, NOdryroutecompletion/protectionclaim. P4actualRETURNinside6.581,67.56,82.71420hp20food. Noattacksourbot; HURTevents wereambientmobs, notattributedtous.
P1death10:48:27 at7.3,66,80.7 duringprogram#821return; laterlogs20hp reflectNEWBEDBODY, notproofoldreturn. P1lostkitdropsfront. P3shouldstayinsideuntilnewreadinessplan. P4notifiedactualfailedsync promptly. BetterindependentcontributionnowSHIELDcraft/test fromreserveiron2 recoveredP2. Askedcoordinatewood6/iron1, actualresourcesmustreconcilebeforewithdraw.

## 10:50 shield readiness experiment
#834 actualSHIELDcrafted/equippedoffhand, 1reserveIRONleftbank. Usedlastlog1+planks2=6wood. Activationrequest metadata8=3, clientusingHeldItemFALSE; doNOTtrustthatclientflag. DamageblockingstillUNPROVEN.
#839 proposedSMALL10s fieldshield/torchprobe, P3explicitstayinside(noREADYforwork). shield_probe.js ACTIVE55s: guardtileactualarrival, freshnamedhostiles scan (notonlytype), creeper/skeleton<8abort; torch8,68,88 onlyifsupported+air; raiseoffhand, logservermetadata/entity_statusself +health; lower+return. This ispreflight, NOTcoveredP3operation. Newpacketcallbackremovedfinally; noattacksplanned. Checkactualposition/HP/stateafter.
P1suggestedphysicalarrowcoverforP3 (ourshielddoesNOTprotectworker); P2ownsgeometryreview. Do notduplicateconstruction. P3bucket/steel/stonepick BANKEDRESERVED, drytestonlyownaxe/dirt whenfutureREADY.

## 10:51 shield actual block evidence / synchronized retry
#84027.4s smallprobeSUCCESS: actualGUARDtile9.5,68,88.5 onGround, namedhostileswithin18 onlyzombie2339/spider2810, noinitialskelly/creeper. Servermetadata8=3 whenraised; usingHeldItemFALSE. ReceivedSELF entity_status29 during10s raisedshield, HP20unchanged; SOURCE/TYPEnotobserved, so blockproofyes/arrowproofNO. Loweredmetadata8=2 afterdeactivate, returnedINSIDE6.559,67.56,82.71420/20. TorchNOTplaced(basepreconditionnotmet), stillowned. IncidentallyworldpickedWOODPICK1 (likelyP1dropbutoriginunproven), willBANKforP1.
P3explicitchatnewreadinessdryrouteNOW, kitBANKED,20/20, willdepartimmediatelyuponREADY. cast_guard.js ACTIVE100s: bankrecoveredwoodpick, freshguardtile+threatpreflight BEFOREREADY, shieldraised,60scoverage, lower/attack/raise onmelee, no chases, skelly/creeperrangeabort,10swarning,ENDreturn. Awaitactualoverlap/result.
P2coverassessment suggests15blockwallsnotroof, changesclimb; preferDAYCAST aftercurrentnight ifarcherblocknotrecurring. DoNOTbuildduplicatecover. Weare~17minutesintorun, beginhandoffconsolidationbyminute45 (~11:19 UTC).

## 10:53 synchronization failure and tool change
#84576.8s guardREADY10:51:43 ->WARN10:52:33 ->END10:52:43. P3stillinside/noactiveoperationthroughobservations, so assistance DIDNOTOVERLAP operation. NOdryroutecompletionclaim. Actualcombat useful: forcedaxe+cooldown+lower/raise shield killedzombies2489,2490,2757,2339 (observedmetadataHP0), P4HP20food20 andprotectedreturn. RecoveredwoodpickBANKED actualcounts1+1, P1notifiedavailable.
DoNOTrepeatsameagent-level60sloop aftertwofailedsyncs (firstskellyabort, secondagentdelay). Newprogram-levelbarrier proposal p4/ESCORT_SYNC.md, tokenDRY2; P3mustSTARTlistenerprogram +ARMED, thenP4observesRUNNINGandapproaches, sendsnonceREADY; P3autostarts. 90scoverage/WARN75/END90 ormatchingFINISHED+actualinside. P4awaitsARMED; noactiveguardnow. Bodyinside20/20 shield+stoneaxe+stonepick+torch1+rottenflesh.

## 10:54 critical death / current actualbody
#855 DRY2 eventbarrier: READYtheninstantSKELETONabort. P3listenercorrectlycanceledBEFOREdeparture, returned/nooperation. SynchronizationMECHANISMworkedonabort, dryrouteNOTtested.
P4returnFAILED dooralignment afterwaypoints: ended(9.277,67,80.7)19.2HP OUTSIDE. Within~15s whiletools/journal, ZombieKILLEDp4 at(12.7,67,82),10:54:11. ActualstatusnowNEWBEDBODY(6.5,67,82.5)20/20 EMPTY. Nooldsequencecontinuation. OWNshield/stoneaxe/stonepick/torch/flesh dropsfresh12.7,67,82, despawn~10:59:11. MustoneboundedDAYrecoverywithfreshhostiles/burnpreflight, no nightrepeat. P2offersDAYhelp, coordinateavoidpickupduplication.
P2freshskeletons3154(11.2,67,81.6),3156(10.1,67,87.7)20HP atday23341~10:54:23; DAY~10:54:56. DoNOTguardretryuntilday+actualhazardsresolve. P3ARMED_DRY3 active#859 wait180s (~deadline10:57:11), kitBANKED. NeedP4gear+safeentrybeforetokenP4_COVER_READY_DRY3. Ifcan’tmeetdeadline, explicitabort/newtoken; nosilentlatework.
Underlyingreturnbug: go()permitted1.3distance evenmisplaced; lateraldoorfromx>7.5canclipfixture/chest, movingnorthalignmentmustcompleteBEFOREopen/entry. Doorentryrequiresfreshactualx~6.59 atz79.5, notassumeplannerwaypointarrival. P1v5pulseddooractualtested, useorrepairownwithstartingcheck beforefuturefield.

## 10:56 navigation assumption fixed / recovering
#867 DAY501, gearDROPS actualshield(9.32,67,83.05), axe(13.16,68,82.06),pick(14.93,68,81.95),torch(14.66,68,80.62), nohostilesnear22 exceptcreeper22,68,68. DAYrecoveryOWNp4 nowACTIVE#87060s, shieldalreadypickedat6selapsed,20/20.
Criticalnavbugreview: own go() used GoalNear(fractionalx.5,z.5,r.6); goalscompareINTEGERnodes, so nearestdiagonalnode .707away meansNOvalidgoal! Plannerapproached thenreturnedempty, loose1.3actualcheckallowedwrongnearbycells. Fixedquarry_lib toGoalBlock(floor(x),floor(y),floor(z))+actualgoal.isEnd. Recoveryusesactualsurfaceheightscansforwaypoints, no fixedYassumptions. Returnnorth(9,79)->(6,79), requiresz<80+x<7.1 BEFOREdoor. Thischangesfailingtestratherthanrepeatmicroalignmentblindly.
DRY3#859armedwait180deadline~10:57:11, now~10:56:17. New sync_guard tokenDRY3, exactABORTtoken(no appendedreasonbecauseP3listenerexactmatch), preflightSKEL/CREEPERbuffer12m beforeREADY whileguardaborts8m; actualID/position/distance nowlogged. UseONLYafterrecoverypostconditions+actualP3programstillRUNNING.

## 10:59 actualdayrecovery / castingnow
#87018.5s DAYrecovery VERIFIED all4gear: shieldoffhand+STONEaxe+STONEpick+torch1; returnedINSIDE6.62,67.56,82.74220/20. Noarmor. ExactGoalBlock+surfacehelper worked. #876 DRY3failedBEFOREREADY onlywrongfootY8,68,87 actual67, nothazard. #877 immediateexactreturn7s INSIDE20/20. Correctedroute uses8,67,88 now. DoNOTrepeatolderheight68.
P3declinedprotocolwaitloops, independently#879 DRYROUTE32.5s ACTUALLYVERIFIED top71->capture11feet68->top71->CLOSEDinside20hp. Criticalkitbankedduringtest. P3nowARMED_CAST6#885 running(~50selapsed10:59:15), kitheldwaterbucket+steel+stonepick, oneTOP6cast. P4sync_guard.js tokenCAST6 ACTIVE125sbound; exactGoalBlockroute8,67,88->9,68,88, preflight12m, READYafteractualtile,90scoverage/15swarn. Nestedfinallycleanup nowruns evenreturnfails. NeedactualSTARTED/workerpositions/finishedprotectedreturn andP3obsidianread forcompletedcastclaim.
Bowhuntpreflight #883 revealedNOsurfaceSPIDERS (allloadeddeepunderground), soNOhunt/no stringclaimed. Oreinvestigation#888 listsfallbackiron23/24,y51/52,z95/96 nearourshallowstair; coal11..15,y57..59,z80..84 iffuturekitneeded. No newminingcommitmentwhileCAST6escortactive.
