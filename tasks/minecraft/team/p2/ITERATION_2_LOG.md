# P2 current — iteration 2 live
Own p2 only; files P2.md and p2/. Full program.md read. All shells `cd $EAT_ROOT`, python3. Earlier long history p2/HISTORY.md and arena records.

Actual start status: inside camp (6.5,67.56,83.7), HP20 food20. Inventory coal1, rotten_flesh3, sand5, snowball8, sticks3. No axe/pick/dirt. Prior journal and plan kit claims STALE. #681 preceding programme found NO north door target; no damage/combat outcome.

Question before experimentation: can sealing EAST HEAD cell(8,68,83) first exclude zombies despite entity-blocked footer(8,67,83)? Expected: head cell accepts block while zombie feet overlap footer, closing path; failure if entity bounding boxes prohibit head too. Budget 2 minutes, at most2 placements, stop on HP<14/death or repeated refusal. Coordinate P4 combat; do not modify frame or other shared work. If headpatch fails, stop this experiment and propose alternative enclosure at inner edge or kill observed hostiles.

Next independent decision: safe stone bootstrap/iron alternative rather than repeated sand stair into gravity. Need live surface stone exposure scan before any excavation; no cave descent without verified return route. Portal remains 8/10 as last verified, no Nether. Evaluator needed after actual milestone; dragon not defeated.

Verified outcome #689 HEAD dirt placed DOWN from roof, no refusal/damage; #694 fresh HEAD confirmed but footer withdraw failed (P4 already held remainingdirt). P4 #690 then footer; #700 ALL3eastcells dirt. Head-first hypothesis SUCCESS, no need killcamp zombies before sealing. Do not reuse hatch.

Next question: near-surface iron(26/27,62,105) found #700 may avoid west11m staircase/sand clearing. Budget 3minutes map+compare only; expected solid safe floor, <=5m overburden, no adjacentwater/lava; stop on unknown unloaded blocks or hazards. No excavation/competing iron work until communicate findings to P3. Independent of P4 stone bootstrap.
#705 alternative conclusion: iron26/27,62,105 = TWO only, dirt65..67/stone63..64, no gravity/fluid scanned24..29,103..107,60..72. Safer overburden than west but insufficient4kit; shared fallback, no competing excavation. Budget finished, stop mapping.

#710 active daywood.js: no tool required, max3logs, westpooldetour2,87->2,96->2,104->9,107, boundednav4.5s each and automatic return/deposit. Fullstate/deathguard; verify endpoint promptly. Potential actual groundY65 near104 while target67; catches routeunreached insteadofblindcontinuation. Official eval run at708programs: dragon0,milestones4/12,deaths28. Told team own routinecheck; do not infer newprogress.

#710 outcome FAIL/SAFE: no logs, incorrect waypointY67 at2,104(actual65); returned closedinside HP20 no losses in22.7s. #718 exact surface map corrected waypoint2/8,65,104->9,65,107. #727 revised woodtrip ACTIVE. Second comparable failure => STOP woodtrip, no controller rabbit hole.
#724 coal1 actuallydeposited(total2). #725 movedbedhead7.7,83.7: mustmoveSOUTH83.7 beforeEAST; chestblocksEast atz83.1. Fixed door helper reused copiedP1 v2. Officialeval remains4/12 dragon0.

#727 SUCCESS wood: 3barehand logs10,y66..68,z108, BANKactual3, 39.6s fulltrip; INSIDEHP20food20 noloss. daywood.js correctedroute is reproducible fallback, no needmorelogs now.
#738 deck actual all6intendedcells nonflammableALREADY BUILT: floor10,67,90 grass/11,67,89&90 dirt, southrail10/11,68,91 dirt, front9,68,90 grass. Central3WOOD7,68..70,89 remains; guard9,67,88 snow (underlyingneedsinspect). P2 announced exclusive replacement3central+guard, not frame/caps. #741 dirt_safe2.js ACTIVE 8dirt max quarry1,66,92, avoidsP1berrycolumn1,94..98, automaticinsidebank. Only gather surfacey66, feet66; nofloorunderdig.

#741 FAIL no targets/newdirt; BANKDIRT1 was preexisting, NOT a delivery. Quarry depleted. #746 verified adjacentSAND onlysnowabove; changedresource not repeateddirttest. #752 SUCCESS8sand mined sameheight66 fromfeet66, bank13total(5old+8new), 32.1s HP20inside. #759? craft_sandstone3.js active withdrawing12sand+1dirt, verifiedmanualcraft3sandstone; inspect beforebuild.

P3 requested review #750. Consequential discovery #757: maxDropDown1 rejectsordinary1blockdescendingstep because package compares feet64 to destinationSUPPORT62(delta2), not feet63. Readonly pair actualstair getLandingBlock(max1)=undefined/max2=(-1,63,82). P3 notifiedrecommendmax2+boundedphysicalstep; whole route NOTyetverified. Full evidence p2/pathfinder_drop_review.md.

#762 craft CONFIRMED sandstone3+dirt1 actualinventory. #766 verified centralstand visiblefromground7.5,67,87.5 (top70 withinreach), so avoid climbing/overpool. #770 replace_stand.js ACTIVE: remove3woodTOPDOWN then sandstoneBOTTOMUP(sideattach6,68,89 forlowest), guardtile9,67,88 dirt. Returnauto; partialbuildpossibleonerror, inspectexactworld beforeclaim. P3sourcefind has ledteamadoptingmaxDrop2; P3 physicaltrial#769 currentlyactive.

#770 SUCCESS centralstand7,y68/69/70,z89 sandstone3, guard9,67,88 dirt; 3oldplanks ACTUALLYBANKED; returninsideHP20food20,30.4s. Scopecompleted noframe/capchange. #773 crafted ownwoodaxe from3reclaimedplanks, actualwoodaxe+stick1+snowball8+flesh3.
#778 axe_wood.js ACTIVE max5logs tree18,65,106 via2,65,104->8,65,104->15,65,104->17,65,105 (surfaceverified#776). Depotlogsdepleted, needtools/fuel/Netherbuildingkit. HP20food20start, day9261. Automaticreturn+banklogs, inspectresult.
P3 #769 and P4 #765 BOTH physicalmaxDrop2success; plannerreview resolved. Don't repeat manualcontrollerexperiments. P3 weststairnowfeet58,z77, beforeiron55; P4 shallow2ore suppliesreserve.

#778 woodSUCCESS 4logs BANKED (5dig, high5thdrop notcollected),41.5s,inside20hp17food. #784 withdrew2logs ->8planks actualmanualcraft. #786 ordinarytablecraftSTICKS+WOODPICK bothactual, left3planks+3sticks. #788 kit=woodaxe+woodpick,dirt6,planks3,sticks3,snowball8,flesh3; ate1pork=HP20food20; bankdirt5/pork4 then.
#791 deck_walk_test.js ACTIVE: physicalguardtile9.5,68,88.5 ->capture10.5,68,89.5, inspectbucketreach/ray13/14,66,90, returnvia9.5,68,88.5->8.5,67,87.5 theninside. MaxDrop2, noParkour/dig/placement, stopclosehostileorHP14. No fluids/frame changes. Existingcastingstancegroundtestonly; notproofbucketpickup.

#792 physicalcapturedeckSUCCESS: ground10.5,68,89.5 ONGROUND, outboundguard9.5,68,88.5 andreturnnorth8.5,67,87.5 allpassedHP20inside17.9s. Source13,66,90 isFLOW2; fresh14,66,90SOURCE0 distance4.94/rayclear (bucketreachborderline). ToldP3 shift11.2..11.5 ifneeded; notclaimedbucketpickup.

New bounded alternative question announced#807: can recovering2already-minedrawiron avoidnextkitreboot? Budget ONE60s trip, stopifdropsabsent/geometrychanged/HP<14, no newore. #808 actualTWOdrops at(-.52,53,78.43),(-1.875,53,78.875). Mainblocker missingSTONEhead(-1,55,78); west54headalsoinspect. Shaftrefilledsandstone54..57, dryfloor53verified. P3busycasting; coordinatedP2ownrecoveryonly, nopeerdiversion.
#809? recover_iron_reserve.js ACTIVE. 4downknownsandstone, clear2headSTONEwithwoodpick, pickupsidecells, returnshaft/pillar4DIRT, bankraw+reclaimedsandstone. ActualstartHP20food20; carry6DIRTescape. CheckexactjobID/output andbodyPROMPTLY; noextendedrecovery iffailure.

10:46:35 HOSTRESTART interrupted recovery; arena tool exit3 'game not reachable'. NO recoveryprogramrecord persisted; stateverifiedp2OUTSIDEfront6.7,66,78.7 HP20food20 inventoryALL6DIRT (no dig occurred). Events leave/restart/join all4. No death. Restart is discontinuity; do notinferjobcompleted.
OneFINALretry recover_iron_reserve.js startingfromACTUALfront allowed aftermodifiedprecondition; existingdropsrequired, livegeometrychecked beforedig. Do not repeatafterthis attempt; iffail returninside andcloseexperiment. Program currentlyactive ~10:47, IDnotyetreturned. Originaltimelimittrip60s; externalrestartlostinitialactionrecord; thisretry explicitlybounded80stool/38sdigretreat.

#814 SUCCESS33.4s recovery: RAWIRON2+SANDSTONE4+COBBLE2 ACTUALLYBANKED, INSIDEHP20food20. Replacedshaft54..57 withDIRT insteadofsandstone, topfeet58; headclear55,78 andwest54 cleared. No death. ExperimentCLOSED, do notrerun (dropsgone). Interruptedfirstprogramnotrecordedafterhostrestart; actualsuccessonly#814.
#825 reserve2rawiron started inEMPTYfurnace, fueledOWN2planks. P2ownsoutputretrieval/bank, announcednopeerinterference. ~20s smelt, inspectactualoutputbeforeclaim. Ownkit nowwoodaxe/pick,dirt2,plank1,sticks3,snowball8,flesh3; HP20food20inside.

#865 SUCCESS5logsactualbank41s, tree22,y66..70,106, inside20/20. #857 stoneaxeactual+woodaxebank. #873 shieldactualoffhand fromlastbankiron1+6planks. #887 portabletable+pork1 currentkit20/20. Woodfieldprefightday321forestclear; priornighttripdeferredhostiles observed. P3dryroute#879success32.5s; CAST6armed aftermultiple guardSYNCfailures, noframeprogressyet.

11:03 planned NEXT QUESTION only (not executed): ifP1spawndata showsWARPED nearby, testONEenderman under5x5 nonflammableROOF atfeet+2,60scap, stopsHP<14/nohit10s/2failures. Expected roofprevents3highentity entry, playercenter canhitoutsidebody<3m; inspectactualentityHurt/HP/loot ratherthanswingcount. Geometry caveat: gaze fromROOFCENTER towardtallendermanEYES mayhitroof; ifprovokingbygaze, useprotectededge1.5m towardDISTANT>=5m target, thenretreatcenter beforeapproach. Directbodyhitwhenwithin3 alsoaggros. Theoryonly; no roofbuilt orendermantestedyet. IfnoWarpedspawnhint, don't blindlybuildtrap; chooseinformedexplorationroute afterP1scan.
#900 portalblocknether_portal independentlyread, #P3 IGNITE6verified11:02:27. P2ownkit24snowballs now(8+16depotwithdraw), shieldstoneaxe,woodpick,portabletable,pork1,flesh3,dirt2,planks3,stick1. AwaitP1firstNetherdata; no duplicateprobe. No recentnewpersonaldeath.

#953 FAILED EASTNetherprobe27.6s, spiderarrivalignoredbeforefirstnav, lost12HPthenFIREwhilefightingSPIDER death8.9,65,2.3. NOcarving/physicalfrontierproof. Respawnemptycamp20/20. WARNEDteam#955. #926 chestFULL preventeddeposit, #927 falseclaimcorrected#932; actualP4geardeposit#933, P1planks2#934. ActualP4ownreceipt#950. Newownoutcome#963 SOUTH2x2annex announced, geometry#964 flatfloor66, gatherown12sand+2logs; do notuseP4reserved6cobble orP3portalgateparts. NOannexblocksplacedasofthisnote.

11:50 boundedindependentquestion: unusedUPPERfilled_map1 maylocatenearbyBURIE Dtreasure and changegear-resupply choice. Budget2minutes read-onlyheldmap packet metadata ONLY; no movement. Expected mapscale+playerinmapicon+redX => estimateworldtarget usingplayerposition andiconsdelta. Stopifoffmap/noicons/no packet; NOblindmaptravel/toolrabbit-hole. Worldclientpacketonly, nofiles/serveraccess. ReturnmapUPPERbeforeclaim.
