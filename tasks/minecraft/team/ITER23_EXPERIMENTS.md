# P4 iteration23 independent experiments

Opening 2026-10-18 15:55 UTC (first file publication after state check). Only p4 controlled. Rules/program and P4/P1/P2/ITER22_REVIEW read fully; ITER23_PLAN absent at opening. No tools/server/.work access, internet, packets, other-player programs or void17–19 methods.

Opening saved-world evaluator: dragon0, milestones11, deaths170 (61/45/26/38), programs10213. Save refused; not a live synchronization. Live status p4(-8.486,26,-37.7),20HP/20food,GRAVEL1; p1 Y66 wooden pick/stick2/cobble1/dirt1/sapling1; p2 Y26 gravel6/flint3. No actor in End.

## H1: native dry escape vs material/tool dependency
Proposed to integration_lead at15:56:27 via arena chat. Whole budget <=8minutes from proposal, through16:04:27. Competing explanations: a native dry walking route from valley exists; or reaching surface needs additional material/tool construction. Small discriminator: completed no-dig/no-place path from actual accessible valley cell to dry high landing; path model is not traversal. If model qualifies, bounded first actual segment plus reclosed return within same budget. No stock gathering chain. Read-only model may remain inconclusive for global reachability.

Preflight: opening_probe.js reviewed: no mutation/controls beyond clearing, no inventory changes, no interactions. Small current-cell planner first. Hypothetical outside start explicitly labeled; still-sealed door means it cannot claim actual access. Existing P4 refuge remains independent of model.

Lead agreement: P2#10224/chat8729–30 at15:57:36 adopted independent discriminator, due16:05. Original earlier deadline16:04:27 retained. No user questions required.

Actual results:10219 small current-cell SUCCESS; hypothetical valley Y60 maxDrop1 completed noPath after464ms; Y40 SUCCESS38nodes.10223 changed explicit water exclusion + maxDrop2/3 and ordinary parkour completed noPathY60; model best endpointY56 near(-64.5,-76.5), not a surface. All path nodes zero cuts/placements. This is loaded-world/settings negative, not universal impossibility or actual traversal.

Changed hypothesis: could <=6 hand cuts bridge upper component?10227 was an INVALID discriminator: digCost100 made any cut exceed pathfinder100 move-rejection threshold. Admitted in chat10229 immediately, no world changes. Corrected10231 digCost1: small cut model SUCCESS2cuts (not the intended door—it chose roof/side stone), UPPER_Y60 SUCCESS13cuts, VALLEY_Y60 TIMEOUT4s with2cuts in partial best path. Thus no <=6cut whole route established, and no minimum-cut claim. Upper sampled columns confirm roof/dirt toY64. No actual interaction is licensed by modeled cuts; any future cut needs fresh occupied-camera visibility/reach and supported fluid-safe state.

Decision published ~15:59: retire native dry escape; recommend P1 primary carrier. Whole original budget not consumed; no stock/escape/physical-segment chain because prerequisite surface model failed. P4 remains refuge(-8.48595,26,-37.7),20HP/20food/GRAVEL1; no p4 death or world mutation. Await actual lead adoption/use, not claimed merely from delivery of report.

Actual recipient adoption: lead chat8749–50 at15:59:52 explicitly adopted native-dry negative and made P1 carrier. P1 chat8747–48 reported real stonepick cut/retained enclosure, independently active main stream; my result supplies routing allocation, not that tool achievement.

## H2: a single supported gravel placement connects dry route
Proposed15:59:36, accepted15:59:52 by lead, due16:10 (my <=8minute clock ends16:07:36). Changed explanation: direct no-construction failure may be only one missing step/bridge, rather than substantial materials. Small observation: complete no-dig route toY65 with actual oneGRAVEL, supported-only placement, drop3 and normal one-block towers, then complete retained return required before any travel. Fresh reviewed one_gravel_model.js is read-only.

10241 small current goal SUCCESS, zero placement. Upper(-64.5,56,-76.5)->Y65 completednoPath134ms, bestY57 withoneplacement; valley(-8.5,26,-35.5)->Y65 completednoPath380ms, bestY56. These are loaded-world/settings negatives, not global impossibility; no synthetic inventory/world/physics. No traversal, no use claim, no cuts/placements. Published16:00 before deadline. Per lead8749 reserve-body instruction, retire escape modeling/stock after this result; do not turn into another recovery chain. Lead adopted first negative; second report's later adoption requires records.

Lead8763–64 at~16:02 explicitly adopted H2 negative/reserve-body, then accepted distinct read-only transport audit.

## H3: transport budget / replacement-tool assumption
Proposed16:01:18 <=8min(original16:09:18), lead accepted~16:02 due16:11. Competing explanations: existing two picks suffice for a priced historic core vs missing tool capacity forces another stock chain. Small observation is actual carried durability compared with exact allowed historical physical cuts; current geometry remains conditional. TRANSPORT_AUDIT.md records exact outcomes, superseding naive93cut/current-bound reasoning. More recent14LOW404moves/22cuts/193.6s differs from13's24cuts/191s. CombinedP1 tools184nominal vsdated93core, so no automatic replacement quota. Current fullroute/closure cost unknown. No new world effects.

Observer helper watch.py small --seconds0 test succeeded; subsequent long read-only poll exposed inclusive --since returning the last chat again. Fixed filtering in source; currently running earlier process may repeat that last line, so do not interpret repeats as new actions. It never runs player programs or changes the world. All literal captures append to ownwatch.jsonl.

## H4: carrier fallback coverage, <=6min from16:06:45 to16:12:45
Proposed native local enclosure near each8-node segment vs only endpoint protection. Expanded explicit static candidates to include actual P1#10268-style two-cap underfoot bore, not just lateral door-room. Source is P1#10246 OLD135node candidate, not current ordered route. No p1 control, source/caps/edits. Lead acceptance pending; bounded own read-only diagnostic proceeds.

10276 loose empty-boundingbox foot/head/anchor model found17/17 samples; stricter AIR-only10278 found11/17, SIX no-candidate samples, zero unknown reads. **Reporting error:** chat10280 mistakenly claimed stricter17/17 because I batched summary send with the run before reading output. Immediately retracted in10282; actual11/17 governs. Neither result proves surface entry reachability, occupied-camera visibility, executable closure or whole-route retention.

10284 exact changed observation: all SIX original candidates at indices64/72/80/104/112/120 have one-layerSNOW shapes[] at foot/anchor, SAND below (sandstone at first sample). Vegetation explanation superseded. Loosemodel admitted transparentSNOW without executable replaceable-target/reach proof and admitted fullSAND without complete gravity-support audit. Strict11/17 is a conservative candidate count; not proof no shelter elsewhere. Publish recommendation: preserve conditional bore helper on demonstrated dirt/plank assumptions, qualify actual snow/sand separately or choose known-air/dirt candidate; no stockquota or all17claim. No physical effects, p4still20HP/refuge. H4 ends before16:12:45; remaining work only recipient adoption verification.

Actual H3 recipient adoption: lead chat8812–14 at16:12:39 explicitly accepted two-pick184 arithmetic/no replacementpickquota and current-cost refresh atHOME. H4 recipient adoption is still unverified; no owned/helper physicaluse claim.

## Minute20 recommendation (16:14 UTC)
Retire H1/H2 escape; both adoptednegative, no p4exposure. Adopt two-tool budget correction (lead actualACK). Revise primary carrier route around body/shortcut hazards and samecaller closure. P1 reports10304 fouractualnodes/retainedfull20HP; this is reported until separately inspected, not HOME. Original16:14HOME target unmet. New operation requires changed method, not rewriting priorclock. No objective effect, no currentEndactor. P4#10303 three literal full10face samples20HP/20food/GRAVEL1/eye1.62/pose omitted; no edits/deaths.

Small offline verification failure: plain node--check rejected refuge_audit.js top-levelawait because arena wraps async, not because body malformed. No arena run occurred on that failure. Adopted P1 owned iter22/check_program.py (read, not edited); actual async-wrapper PARSE_OK then10303 completed three full samples. Useful recipient use of P1 checker now demonstrated. Observer fixed once-test16:12:57 correctly emitted onlynew chat8812–14, no last-entry duplicate; initial600s observer completed normally.

16:14:39 actual P1#10304 completed output read fully: fourWALK_END HP20 and fourFALLBACK_FULL all10true plus terminalfull; now independently verified, not merely reported. Own refuge ID correction10303(not10302) published16:15; data identical.

## H5: transient dragon damage vs late healed state, <=5min16:15:11->16:20:11
Exact permitted9665 completed output/source has zero dragonHP measurements around attack: ATTACK_EFFECT only records player's17.5->16.5HP and real crystal179gone. Independent9673 starts with P4alreadyY63 on return fromY76 attack; 50samples/4.91s minDragonHP200 is later, no synchronized attack-window minimum. **Inconclusive** between zero damage and transient damage+later healing. Publish16:16, no damage claim/no inference that crystal damage mechanism is falsified. Lead redirect16:16 accepted lesson as first-use logging requirement; stop separateaudit.

Read-only combat_recorder_fragment.js was reviewed, then actual small OW10319 test: auto-budget259ms,8polls/missingDragon8/dragons[], exact listenercounts before/after[2,0,0], no world actions or fictitious HP200. Self-review caught stop/snapshot recursion on deadline BEFORE run and corrected closingguard. This only tests missing-entity/autostop/cleanup, not actual End HP or event branch. Optional future operator integration requires their review/actual use; no adoption claim. Source+smokeoutput saved. Do not create an instrumentation preparation chain.

## H6: bounded dated library supply audit, lead redirect16:16, due16:22
RecipientP1 currentfutureEnduse choice. Competing explanations: ordinary visible cobweb/string+oak/table in library permit a bounded alternative vs apparent supply has unresolved harvesting/receipt/access. Use exact permitted pre17/20+ completed records only; no current stock/bed claim. Lead recipe10314 is reported inventoryrecipe4string->wool, table3wool+3planks->bed; no source/craft/use adopted yet. No new play/source chain.

H6 completed16:19 LIBRARY_SUPPLY_AUDIT.md: real ordinaryOAK3+STRING1 P1#9671; realSTRING3 P4#9803 thenactualBOW1 #9807 after raisedTABLE149,-36,2232 stance. Laterbed-source sequence9833/9843/9856/9860/9873 remainscraftfalse despite cut/receipt/bridge partials, finalWOOL1/STRING5 notBED. CurrentP1 hasnoSword; provenweb harvest usedWOOD_SWORD, so currenttoolsupply is an untesteddependency. No12webquota or oldretainedinputgap; firstactualnormalhit stillpriority. Deliveredbefore16:22; recipient adoption pending. No world effects.

H6 actual lead adoption8862–63 at16:20:47: dated supplymechanics accepted, failed bedwholechain/noquota adopted.

## Urgent H4 follow-up nearHOME,16:22–23
P1#10336 actual nearHOME HP20 transit but endingexposed after targetstep/postconditionfailure and borelowerfacesreject. Refreshed exact remote cached candidate geometry10345 (no interactions): standing5,64,97 AIR/head65AIR, below63GRASS/62DIRT/61STONE; four side columns62/63FULL, westanchor4,64,97AIR overGRASS63. This is static dirt/plank-bore geometry, no entry/occupied-camera/use proof.

Another reporting mixup:10344 called2,64,94 a STRICT-air candidate, but exact earlierstrict row128 was5,64,95;2,64,94 belonged toLOOSEmodel and fresh10345hasSNOW. Corrected in nextsharedreport using literal outputs. After comparable reporting mixups, changed own method: prepare report asownedtext, inspect evidence+rendered exact text in one completedcall, then send in a SEPARATEcall. No more adaptive run+success-report batching or recalling exact IDs/coordinates from memory. The prior strict17/17 count andID10302 mistakes remain retracted. No p4worldeffects/deaths.

## H7: completed generator geometry,16:26:07->16:31:07 wholebudget
Distinct independent challenge: current terrain changes/stale cachedroute vs optimization of continued partial paths corrupting node geometry. Read-only same-world paired optimizePath true/false and per-node actual fullFOOT check.10356 smallcurrent goal SUCCESS; paired field crashed on my typo `return100` (identifier), before any world action. Failure source/output retained; corrected separate fixedcaller.

10358 actual same EAST20.5,68,55.5->HOMEentry5,64,97: both optimized and unoptimized SUCCESS46nodes after17partialyields, zero returnedfeetinsidefullblocks. Local10360 from1.5,64,90.5 ->HOME bothTIMEOUT3.5s/eightnodepartial/zeroinvalidfoot. Occupied1,64,91 goal bothTIMEOUT, notnoPath. No reproduction of hypothesized optimizer corruption; do not globally disable it or claim modelinaccessibility. This does not explain old P1 mismatch. Fresh actual support/body/height validation remains necessary. Published16:28 beforebudget; no third modelretry, no worldchanges/p4loss. Exact scripts/outputs and staged inspected h7_report.txt retained.

Lead16:29:41 actualH7negativeadoption: nooptimizationdisable/rewrite. NewH8 supportrequested.

## H8: navigation waypoint leads,16:29:41->16:37
Requested recipientP1 afteractualtransition. Reversed permitted13 return-route JSONs intoexplicit outbound feetcellarrays; preserved all LOW405feet cells from12ROAD12, matched14 actualdatedclosingBODY cells via literalreturns/Math.floor. Tables distinguish failedupperMAGMA legs and changed14buriedconnectorY53, shaftX-54/Z64, LOW, actualdestinationportal/OWL. No new cost recount/sourcequota/oldcodeexecution. WAYPOINT_LEADS.md/JSON delivered16:35:42 before16:37; exactscriptneverprescribed.

Duringaudit freshnesscrisis: live16:31:04 P1HP7,16:32:05 HP1 atOWLportalfront; urgentlysharedbothcapturedstates. P3unplayed alsoHP4.5 observed; no p3control. P1 actual10372 emergencyordinarycut/unsupportedfrontfloorrepair/portalentry succeededHP1->NetherHP2. Native-retention10373 lateractualFULL/HP3. No p4interactions or rescue claim.

H8 sourcepreflight caught bench Z-coordinate error BEFOREpublication: actualBLACKSTONE65/TABLE66/BASALT67 column(1,y,5), not7; correcteddocusing literal7097/source. Sourcearraysremainexact. Actual P1chat8917–19 at16:36:23 read/adopted waypointLEADS ascoordinates only, proposedactualbenchconnectoruse; physicaluse ofartifactstillpending. This is source-reviewadoption, not movementcredit.

## Minute40 recommendation / corrections
Published16:35:42, ~1m42late vsnominal16:34. Initialnote adopted10372transition but assumed nextretainedconnectorstillpending frompartialterminal; new10373fullresult arrived inchatduring H8publication. Stale partialending advice immediately superseded after FULL10373outputread16:35:56: FOURall10FULL/HP3food17/groundtrue/BASALT2/bothpicks at1.35638,65,4.501. Actual protectedNether wholeoperation succeeded before16:36, not merely transition. CurrentlowHP explicit; revise nextprotectedleg/fooddecision, no automatickitquota. No optimizerblame fromH7; keep nodegeometry checks and before-action/minimumHP recording. Do not batch dependent statefulreports without readingnewchat between them; H8+review batching contributed to staleadvice.

Own10380 threefreshfull10face samples20HP/20food/GRAVEL1/nofoes, eye1.62/poseomitted. Evaluator16:36:22 saveddragon0/milestones11/deaths170/programs10380, SAVEFAILEDconnectionrefused. Not synchronizedlive or victoryproof. No p4physicalchanges/deaths throughminute40. CurrentobjectiveeffectNONE/noEndactor. Continuefeasiblework, provisionalcommitted17:24/whole10017:34.

H8 actualrecipientuse VERIFIED: P1#10391 bench_connector_corrected.out read FULL16:42–43: literal 3benchcuts/ordinaryreceipts, actualone-up1,66,6.7, EXACTBLACKSTONE65/TABLE66/BASALT67 at(1,y,5) restored, twoBASALTpatches andFOUR10FULL+terminalfull/HP3. P1explicitlyadopted H8coordinates withfreshqualification. This verifies useful waypoints, not the rest of the oldroute or causalcredit for P1's implementation.

## H9 proposal superseded / optional ONE-gravel support, through16:44
16:38:59 proposed materially different existing-stock fullhealthP4 route usingfarY56+9pillars, not H1/H2zero/oneplacement; no physicalwork beforeteamdecision. Lead'salreadyqueued16:38 allocationinsteadrequested optionalONEcurrentGRAVEL handofftoP2, samewholebudgetprep->P2actualpillaruse16:44, requireordinaryGRAVEL3 beforedonating1/retaining2caps. Accepted16:40:41; fullhealthforkNOTstarted. No independent new quarry/source allowed.

donate_one_gravel.js source reviewed/asyncPARSE_OK16:42:02: actualP2nearY26/within4m gatebeforeopening; headcut ordinaryGRAVEL2 gate protectsagainstFLINT/dropfailure, thenfootcut/pickup3gate; actualvisibleentity/ray/normaltoss1; samecallerreclosure2 +freshall10audit. This is PREPARED, NEVEREXECUTED. It is not a testedhelper.

P2actualstatuses16:42:02,16:42:48,16:43:30 and16:44:23 remainedY24 near(-4.5,-28.5), no readyrecipientposition atP4approach. No head/footcuts, no toss, no ordinary3 test or recipientreceipt/use. Wholedeadline16:44 missed; negativeclosurepublishedafterfresh16:44:23 status, actualpublicationtimeinarenachat. Source hypothesis remainsUNTESTED, not falsified. No automaticretry or newsourcechain. P4fullrefuge/20HP/20food/GRAVEL1 unchanged. Leadfood16:50 notassumedavailablebyP1.

## H10: changed existing-stock farplateau proposal, allowed1min model only
Leadredirectreceived10404 at16:44:47: after own2egressfailures, only1minfreshclosed-body->farY56/ascent/protectedendpointmodel; ifqualified12existingGRAVEL P2->P4 transferby16:48; price WHOLE prep->surface->food->actualP1USE beforephysicaltravel. No quarry/toolkit.

Mypreparationexceeded1min gate (due16:45:47); actual10408 finished16:47:08,81slate. Rootcauseownexcessplanning before minimalobservation, not declaredclockreset. Actualhypotheticaloutside(-8.5,26,-35.5)->(-65,56,-77) SUCCESS113nodes/zeroedits; exactcolumnroof2STONE+4DIRT+1GRASS then9pillarproposal,12staticsoil-borecandidates. PositivecomponentONLY. FreshEGRESSfloor(-9,25,-36/-35)=AIR, doorabove28SNOW; so selectedoutsideY26startisfloating/currentactualegressunqualified. Causeunlogged; do NOTattributeautomaticallytoP2quarry. Routefromactualsealedbody/repair/transfer/physicalsurface->P1foodUSE not fullypriced.

Mixednegativepublished10413 at16:48:57, recommendingRETIREcurrenttransfer/foodoperation aftergatefailure. No physicalP4travel/cuts/toss, no ordinary12receipt or materialuse, no receiverfoodpromise. Potentialactual12gravelroute remainsOPEN underchangedbudget/currentactualstart, notglobalinaccessible. No automaticnewsource/recoveryloop. Prepareddonationcaller alsofailscurrentfloor/aboveentrypreconditions; neverexecuteasstalehelper.

16:50checkpoint ac845170: all owneddata/currenthandoff preserved; H10notanactualsurface/foodcapability. Continuefeasibleboundedworkthrough17:34, provisionalcommittedby17:24. Methodsrequestedexact10407executionisolation(nextrecordschat) instead ofthirdroute/modelrewrite.

## Material changes after provisional checkpoint d63c6096,16:54:10
Provisionalcommittedearly, not final. Actual10421threefull10faces20HP/20food/GRAVEL1 preserved. Workcontinues to17:34. CompactLESSONS.md added withdemonstratedlimits/errors; no newphysicalqueue.

P2DEATH livecanonicalevent17:06:31 Zombie(-7.5,24,-30.7), independentlyread17:07:55 afternewemptybody STATUS. Alert10443published17:08:15: oldGRAVEL/FLINT/fooddependencyinvalid. Fresh evaluator17:08:15 SAVEDdragon0/11/deaths171 (61/46/26/38), SAVEFAILED; unlikeearlier170thisnow includesactualnewdeath. P3unplayedHP4.5; P4no deaths. Do not mislabelnewemptytree20HPbodyasa successfulmaterialretainingascent. P2later acknowledged failedreturnbranch anddangerousanalysisdelaywhileexposed.

## H11: new-body nearby ripe food, <=90s from17:10:22
Distinctpostdeathassumption: sourcefood nearnewP2canopy10.5,72,-38.5 vsnoneimmediate. Earlierzerofoodread wasHOMEz50..120, adifferentregion. Ownread-only10449 finished17:10:23: sampledspawnx[-5,30],z[-50,5],y63..77, ZEROunknownblocks, ELEVENsweet_berry_bushALLage3/grasssupport. Closest(13,68,-25)14.866m,(8,67,-25)15m,(7,67,-25)15.166m fromnewbody. Fullsortedactualdata preserved. No movement/source/interaction, no physicalrouteorharvestqualified.

Positivechangesknowledge: newspawnhasripefoodleads; priorHOMEzero remainsvalidforitsregion. Publishedafterliteraloutput/stagedreportinspection, before90s gate. Explicit immediateenclosurefirst; no revived17:15foodpromise, currentwholepath/hostiles/ordinaryreceipt/courier/P1USEnotqualified. DatedP1#10268 ordinaryBERRY3 supportcut isconditionalmechanismreference only. Actualrecipientadoption/use pending.

H11 body scope superseded: P2secondDEATH17:12:14 Skeleton(9.5,72,-39.7), independentlyread17:13:43. Newempty20HP body(-7.5,57,-26.5); firstcanopybodywaslost. Earlier11ripefoodcoordinatesremaindatedworldevidence, but15mproximityreferstoLOSTbody anddoesnotqualifycurrentundergroundegress/courier. Correctedsharedreportafterfreshrecord. No actualfoodharvest/recipientuse wasobserved. P2firstdeathmaterial30+GRAVELandsecondemptybodylossbothcount; no camouflageassurfacecapability.

17:11:54 liveP2HP8.7/food17/empty capturedbeforeseconddeath; urgent10454at17:12:21 reiteratedimmediateclosure. Causewasnotinferredfromthatstatus; subsequentcanonicalSkeletoneventgoverns. P4cannotcontrolanotherbody. Ownfullrefuge/20HP/GRAVEL1retained.

17:14:17 evaluator SAVED0/11/deaths172 (61/47/26/38), SAVEFAILED, programs10458. This supersedes earlier171score; currentobjectiveunmet. P4currenthandoff45fbc914 includesbothdeaths/H11lostbodylimits; originalprovisionald63c6096 remainsdatedearlycheckpoint, notfinal.

17:16:26 lead requested prospective P1 use of combat_recorder_fragment beforeEndaction. Actualintegration/use pending; no Endbranchqualification. Follow-up reminder: default60sautostop mustcoveractualcaller, markbefore/afteraction andcheck elapsed/reason/polls/missingDragon beforeclaimingactionwindow; stopfinally. No instrumentationsourcechain or Endsuccessclaimed.

16:29: actual P1#10359 home_native_room_finish.out fullyread: sixDIRECT_POST HP20 andfourHOME_FULL all10true+terminalfull, realnearHOMEbody6.5748,64,97.497. This usedP1originalSIDEroom6,64,97, notmyofferedunderfootbore5,62,97, so noownH4physicaladoptioncredit. Lead previouslycalledurgentgeometryuseful; literalrecipientuseofownhelperstillunverified.

17:20:01 before-minute90 refresh: actualP4#10465 threefull10face samples20HP/20food/GRAVEL1/nofoes, no ownworldchanges/deaths. P1statusnowNether(-36.5,57,48.3)/3HP16food/BASALT1+bothpicks; do not infercallercompletionfromstatus. P2secondnewbodyOW(-7.5,56,-24.5),DIRT2/20HP, no oldstock. FrozenPROVISIONAL_CLOSING receivedmaterialoverride; final17:34checks stillpending.

## Closing actual evidence,17:34–35 UTC
Own#10479 threefull10face samples17:33:09–11:20HP20food/GRAVEL1/samebody/controls{}/goalNULL/nofoes. Finalstatus17:34:22 agrees. Evaluator17:34:23 SAVEDdragon0/11/deaths172 (61/47/26/38), SAVEFAILED, programs10479. Canonicalevents confirm twoP2deaths only; no p4death orworldedit/transfer thisiteration.

Important partial-failure audit: completedP1 adjacent_controlled_shaft.out #10477 TIMED OUT165s, lastvisibletruncateddiglogY15 butsnapshotY8. No terminal/full-shell audit completed. Y8status alone is NOT retainedLOW/oldshaftentry/404traversal/End proof. Sharedalert10481at17:35:12 requestedownerfreshpostconditions/repair; no outcome claimed for that repair. Exactcompletedoutput archivedp1_10477_closing_read.txt.

All P4observerCLI processes completed and their sessions were closed; no gameplay/transfer/taskqueue remains. Feasiblecontinuationthrough17:34/min100 completed, finalclosingmetadata/checkpointfollowed. FINAL_CLOSING.md/P4.md are current, PROVISIONAL_CLOSING.md retains dated snapshot plusmaterialoverride. No push.
