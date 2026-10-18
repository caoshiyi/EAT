# P1 fresh crafting-state audit —20:36 UTC

P1 requested <=3min docs/runtime-FROM-RECORDS-only at20:34:53 (10963/chat9667–68), deadline20:37:53; no newplayerqueue. Recipient P1 localtoolpreparation/HOMEbedcandidate. P3 delivered10966 at20:35:51 (~58s). Actualrecipientcleanup/singlecraftpending; donorhandoffnotphysicaluse.

## Exact observed states, not intended16planks

FULL LIVE10960 tree_wood_pocket.out: initialLOG1; threeordinarylogfloorcuts/subsequentpickup; source logs<4 gatepassed, callerrequested `recipesFor(planks,null,4,null)` then `craft(recipe,4,null)`. **PLANKS_ACTUAL20:34:06.542 LOG2+PLANK4**. ThenonePLANKroofcap. Terminal20:34:08.653 **LOG2+PLANK3+BUTTON1**, HP20food20/three10FULL. This provesnewsource/cover but NOTfourrecipeoperations/16planks. Sourcepreconditionandreturnedcraftalone do notprovebalance.

Fresh actual LIVE10962 craft_state20:34:53.463 currentWindowNULL, ordinaryinventoryLOG2slot9/BUTTON1slot10/SAPLING2slot36/PLANK3slot37. **Handgrid slot4 PLANK3, slot0 BUTTON1**. Recipeplanks resultcount4, deltaLOG-1/PLANK+4, shapelessinShapeNULL/outShapeNULL. Handgrid notempty; buttonresult fitsplankingredient. Cause UNKNOWN: not uniquely runtimecountsemantics/slotlag/recipebug. Don't countpotentialoutputslot0 asreceivedextraitem.

## Documented interface

Installed Mineflayer docs/api.md2068–77 explicit `craft(recipe,count,table)` count=OPERATIONS, examplecount2=>8sticks. recipesFor1654 thirdarg isminimumRESULTCOUNT, notoperations. Existing priorP3CRAFT_API.md documented sameoperationsemantics; do notsilently rewrite docs as itemcountbasedonone anomalouscase. PriorP1actualsingleoperationstickcraft10724 produced4sticks, consistentwithoneop, but does notresolvebatchambiguity.

Docs2189 `await bot.putAway(slot)` putsitematthatwindow slot intoordinaryinventory, Promise. This is normalUIaction, no directinventoryedits/packets. CurrentWindowNULL stillhasplayerinventoryhandgrid; actualP1mustconfirm inventorywindow boundaries/slot andbodybeforeonecall.

## Changed small gate handed off

1. Currentfreshbody/health/window/slots/cursor capture. DoNOTtakeoutputslot0BUTTON; thatwouldcraftunwantedbutton. Avoidnewbatchcraft/automaticretry.
2. ONE `await bot.putAway(4)` foractualPLANK3input, waitticks, dumpallhandinputs1..4/output0/currentWindow/cursor/ordinaryinventory. Requireinputsclear/cursorclear (outputshouldclear) beforemorecraft. API availabilitynotP3physicallytestedbecauseowninventoryempty; P1ownsactualone-actiontest.
3. QueryfreshfundedLOG->PLANKrecipe, craftcount1 ONLY. Wait/dumpagain; requireactualordinaryLOG-1/PLANK+4 andcleanhandgrid/cursor acrossdelayedobservations beforeanotheroperation. Ifunexpected, stopandreconcileactualslots, do notassumetargetquantity.

This resolvescurrentpreparationwithminimalsmalltestandwithoutexposingretained20HPbody. It does notpromise16planks, toolcraft, tableaccess, HOMEarrival/bedreceipt or Enduse. OriginalfailedP2courierremainsretired; P1newsourceisindependentfreshbodyandneedsitsownwhole-operationclockbeforebedwork.

## Sources/limits

ReadFULLactual10959/60/62 records viaowncapturep1_craft_state_2035.raw.txt, ownpriorCRAFT_API andactual10724singlecraft, installeddocs1654/1668/2068/2189. No excluded17–19/clientmaterial/internet/server/.work/tools edits. P4independentlycorrectedcountclaim, so exactinventorycorrectionisshared/ownerfirst, notP3exclusivecredit. P3nophysicalcraft/newmaterialqueue inthisaudit. Actualadoption/result mustappend.

20:37 SB_G25-3 P1#26 FULLread: actualsurfaceapproach8.157,60,2.3/HP17.2667 at20:36:02 failedcenterstance, **NO ATTACK_ATTEMPT/contact**, emergencyreturnthenlife/dimensionchanged/death; finalfreshOW7.5,72,-40.5/HP20EMPTY. BossDeletedfraction1 duringdeath isnotdamage/victory. HealthySBEndkitnowlost; P1releasedG3 andP3explicitrelease10969 at20:37:19. P3SBbed1querycaptured/noresetdependency, LIVEbeduntouched. New G4copy requestedfromLIVEtreepocket. P3caveat: copyordinaryinventorydoesNOTprovesametransienthandgrid/cursor; freshlycomparebothslots0..4/cursor/window beforeclaimingcleanuptransfers. No newP3program/craftaction.

## Actual LIVE adoption verified within requestbudget

FULL LIVE10968 `clean_craft_one.js/.out` read20:37:46, exactownedcopyLIVE_p1_10968_craft_adoption.raw.txt. PRE20:37:05.673 ordinaryLOG2/PLANK3/BUTTON1 andinput4PLANK3/result0BUTTON1. Actual`putAway(4)` thenGRID_CLEARED20:37:06.177 ordinaryPLANK6 andallhandgrid0..4empty. FreshrecipeidentifiedLOG-1/PLANK+4. ONEcraft actual20:37:06.678 ordinaryLOG1/PLANK10 andgridempty; delayedPOST20:37:07.182 samevalues/expectedTRUE. Body8.5299056,69,-25.6791969/20HP20foodunchanged. Thus exactchangedcleanup+single-operation method physicallyadopted inrecipientLIVE, notacknowledgementonly. Request20:34:53->retainedPOST **2m14.182**, independentread37:46/reportbefore38 (reportmaysecondsafter37:53 but actualuse/verificationwithin). Query3mdeadline20:37:53 metbyactualrecipientuse+independentread. No subsequenttool/bed/Enduse credit yet.

Theactualinputplanksaccountforpreviouslyhidden3 ordinaryplanks; cleanuprecovers them. This doesnotuniquelyexplainoriginalbatch4count/extraBUTTON1 or proveallbatchcountsbroken. Continueordinaryoneoperation+actualpostconditions ifuncertain. Table/rod/craftcapabilitiespreviouslyretaineddonotremove this observedtransientgrid bottleneck. P3recommendation10966 at20:35:51 precededactual10968; recipientcodeusesexactputAway(4)+onecraft, P4independentcountcorrectionalsoacknowledged. No newP3playerqueue/materials/action.

20:42 agreednewbedclock/sourceupdate: P1explicit20:38:08 clockfromactualrespawn20:30:22->20:50:22 actualP1beduse, includesalreadyspentrecovery/wood/tools, NOTrollingstart/restartedoldcourier. P3ACK10981 andholdsLIVEsourceuntilactualHOMEarrival+solidcapblock; recipientmayadoptusefulsourceknowledge/directactualvisiblepickupifbestfromarrivalgeometry, no mandatorydonorproduction. ActualdonorSB#21appliestoP3samebodyonly; P1newpose/receipt/use mustverify. LatestLIVE10983 20:39:50 tree8.5299,67,-25.679/20HP20food, LOG2/STICK2/WOOD_PICK1/BUTTON1/SAPLING2, handgridempty/cursorNULL/windowNULL. Earlier10980only7full/10, TABLEroof8,69,-26; labelnotfulltreepocket. P3sourceaudit10987 at20:41:25: firstplankoperationLOG3->2 occurredbeforehanddirtyerror; fiveplanksusedcaps, cannotcallnogeneration. Onefreshvalidatedcount1 canfundremaining3gaps, actualrepairpending. No batchrootcauseproof.

20:44 recipientnewsource: FULL10986 ONEcraftatnewY67againexpectedLOG-1/PLANK+4; FULL10989actual3gapcaps/THREE10FULL andTABLEharvest/replaceroof/THREE10FULL terminal20:41:48.564 HP20. This is downstreamactualreuseofthecleanup/singlecraftcapability; earlier7/10superseded. FULL10991 supporteddownsourceyieldedCOBBLE1/WOODpickwear1/DIRT8/TABLE1/STICK2/LOG1, terminal11.3321798,62,-25.506227/20HP20food/three10full20:43:13.257, thenfurtherstone-supportguardstop. P3sideSTONE12,62/63,-26 leadfromfreshmodel10990 delivered; no actualsidecutsclaimed. Newbeddeadline20:50:22 unchanged, actualHOMEpickup/usepending.
