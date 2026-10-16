# P1 — 10:44 UTC iteration 2
Own p1 only. Read program.md fully. All shells `cd $EAT_ROOT`, python3 only. Own files P1.md and p1/. No server/.work, no peer control. Dragon victory only officialeval dragon1. Last P2eval4/12dragon0deaths28; no new milestone yet.

## Actual current / next
p1 INSIDE(6.609,67,82.522),health20food18, woodaxe1/sticks2/sapling1/dirt1. Door6CLOSED verified#785; laterpeertrafficmaychange. Foodwork now successful: depot5cookedpork at#787 plus2rawfinishingfurnace5,66,80 with2planksfuel. Need retrieve last2cooked (~10:44:20), bank, verify furnaceinputempty so P3can smeltiron withcoal1depot. P1 should next testfarmharvest+torch fornightgrowth, maybeexpand; not another expensivefarhunt.

## Verified this iteration
- #682 initial20hp17food toolnone, eastwallhole/livezombies. P2headpatch/P4footer; P1#721 independentlyALLDIRT y67/68/69 at8,83.
- #691 FAILEDolddoor exitx6.726,z82.3, nofood. #703 SNEAKalignmentfixed; fourwildbushes81..92,z72..79 harvestedage3->1; actual9berriesbanked, returnedhealth20food12. #721ate4->20food.
- #733 planted5localbushes **x1,y66,z94..98** age0, return20/20. #761growthages0/2/0/1/0 provesgrowth. Harveststilluntested. Avoidbushcolumn; routex2.5clear. NearbycampsoilSAND, orcharduseswestquarryDIRT65.
- #744 manualcraftwoodaxe verified (1log). #749 pig100despawn/HP0/rawpork1, cooked+depot#756. ThatinitialporkusedbyP3? receiptunverified.
- #767 herd115..129,66,139..147: fourpigs actualkillsHP0/despawn, loot8RAW, furnace8input4planks, 96.6sroundtrip BUT entryFAILEDoutside(5.34,66,75.6) health19food10. #780 immediaterecovery3.9s INSIDE82.52. #785doorclosed, took5cooked,ATE1food18, BANK4. #7871morecookedbanked=5, added2planksfuel forlast2raw; extra2planksbanked. P2/P4/P3 maywithdraw, inspectactualchest.

## Dependencies / coordination
P3 actualRAWIRON2inside at10:44; P4 actualRAWIRON2 atshallowquarry26,62,106; combined4enoughbucket+steel but NOTbanked/ingotsyet. P3ownsportalcasting, P4kit/ironbackup. P2 #770 centralstand7,y68..70,z89SANDSTONE+guardtile9,67,88DIRT; deck safetyallnonflammable verifiedP2#738. Frame8/10lastknown; tops6/7,71,91 missing. Do not duplicateframe/build.
Camp chest7,67,82 table6,66,82 furnace5,66,80 bedfoot6,67,83/head7,67,83. BEDHEAD7.3,83.7 freesfronttraffic. All bedbound. Inside strictz>82.2+closeddoors. Furnace canopen/takefromINSIDE (#756,#785,#787) so neveridleoutsidewhilecooking.

## Methods / failure lessons
- `door_lib.js` nowv4: v3SNEAKmicroalignx6.59375,.025 tolerance (passed3trips), plus #780feedback REAIMSOUTHaftereveryactivateBlock; jumpONLYuntilz80.35. Peerdooractivation canturnaimtowarddoor whileforwardheld: suspectedcause#767backwardexit. #780physicalentryworked. Alwaysinspectactualendpoint+door; evenclosecanraceresultopen(#780), explicitrecheck#785closed. Neverallowpathfinderstalegoalaftermanual.
- `craft_lib.js` adaptedP4manualtool, outputslot0shiftclick+actualinventory. Planks/tableaxe passed. No hiddenpersistentconfig.
- maxDropDown1safeSURFACE but rejectsone-stepunderground duefeet-supportdiff2. P2sourceexplained; P4/P3 physicallypassedmaxDrop2 stairs. Don't blindlyglobalincreaseonsurface.
- Normalprogramreturnpreservescontrols; clearonDRYground. Deathlistenersabortobsoletework. Promise/goto/actionlabelsarenotworldproof.
- `p1/README.md` helperindex, `p1/ITER2_LOG.md` detailedprogress, priorhistory inHISTORY_START_ITER2.md/HISTORY_TO_0640.md/HISTORY.md. Existinghelpershaveoldassumptions: copycurrentdoorlib notstaleembeddedv2/v3.

## 10:45 critical correction / activefarm
#799 overlappingP3 furnacechange: expectedporkbutACTUALrawiron3/outputIRON1. TookoutputIRON1, detected actualinventory, immediately#802BANKEDIRON1 andnotifiedP3; no loss. **Never blindtakeOutput onsharedfurnace: checkEXPECTED itemtype before mutation.** P3previouschatavoid10sarrivedafterstart. P1handsOFFfurnaceuntilP3kitdone. ActualdepotPORK5 at#799 afterpeermeals. P3ownsremaining3ironoutput+1bankediron. #799farm0/2/1/2/0 day12381 nohostiles25m. Tooktorch1from2depot.
`farm_cycle.js` ACTIVE60scap: v4door (feedbackreaim+jumpuntil80.35), localwestfarm, plantTORCH2,66,96 fornightgrowth; harvestonlyage>=2 andverifyberries, return+bank. Do not assume outcome. Ifnightnearbyhostiles8m abort. P1currentstarthealth20food18.

## 10:49 FAILED / current actual override
#810actualkit woodpick1/pork1/dirt3/woodaxe; #8124sandstone crafted. #821 FRONT reached(6.5,68.024,90.491),clearedONLYsnow6,68,90; portalAIR. **DIEDZOMBIE10:48:27 (7.3,66,80.7) duringreturn**. `finally` checked!died onlybeforelongreturn andcontinuedentryonrespawn; END20/20/deadtrue is NOTsuccessfulroundtrip. Fix deathcheckbeforeANDaftermovement, stopentirefinallywhenflagchanges. No furthernightfieldtripwithoutchangedprotection.
#829 currentactualp1INSIDE(6.615,67.5625,82.927) FULL20/20 **INVENTORYEMPTY**, doorCLOSED. Dropsfresh: woodpick(5.918,67,80.875), axe(10.177,67,80.875),pork(9.15,67,80.875),sandstone4(9.786,67,77.073),dirt3(.516,65,81.208),sticks2(4.395,66,76.407). CHEAPKIT: doNOTrepeatnightdeathforrecovery. Hostilezombies(3.77,66,74.82),(-.61,66,85.16),(4.29,67,90.46); P4abortedguarddueSKELETON. P3insidefullkitwaterbucket/steel; needsactualphysicalarrowprotection beforefield. P2smeltreserveiron2; suggestshieldP4fromdepotLOG1+PLANK2=6planks ifstillpresent. P4ownscombat/shieldtest. Physicalcoverworkerneeded; P4shielddoesNOTcoverP3.

## 10:52 rekit / tools
#847 CURRENTactual P1 INSIDEBEDHEAD(7.242,67.5625,83.7),20hp20food; **woodpick1,woodaxe1,cookedpork1,SANDSTONE4** actualwithdrawn. P4 recoveredwoodpick andbanked; doesNOTproveotherdropsrecovered. P1remainingdropscheap, allowdespawnifunsafe. Depotafterwithdrawpork2/iron1/cobble3/sand10/berries4 plusP3RESERVEDwaterbucket/steel/stonepick. DO NOTtakeP3kit.
`door_lib.js` **v5 optionalcheckcallback** before/after every navandpulse: `alive=()=>{if(died||bot.health<=0)throw Error('LIFE_DISCONTINUITY')}`; pass to p1Door(mode,alive)/p1Go(goal,ms,alive). Wholefinally must nestedcleanup and skipreturnwhen dead. #846newfirst_nether.js parsed+PREFLIGHT_NOT_LIT/no movement; teleport/control/cooldownstillUNTESTED. Oldversionarchivedfirst_nether_OLD_UNVALIDATED.js. Newprobe70-100s plan: verifiedfront6.5,68,90.5 -> litportal, actualdimension, findsafeadjacenttile, survey, wait16.5sOUTSIDEportal, reenter, actualOW+closedcamp. Deathstopsobsoletework. Requireliveportal+kit+safeapproachbeforeexecution.
P4 shieldactualentity_status29+HP20 demonstratedblock (#840), damage TYPE/sourceunknown. P3dryroute activeunderexplicit60sREADY; no fieldcastyet. P2coverassessment15blocks+geometrycost, advisesDAYCASTifarcherblocksagain. Nightfielddamage causedP1death, avoidrepeatwithoutchangedprotection.

## 10:56 farm expansion VERIFIED, nextstone
#86936.5s fullroundtrip **health20food20/no death**. Harvest2ripeoriginalbushes96/97age3->1. Combined4bankseeds+4harvest=8; planted6newbushes actualx0,y66,z95..98 andx1,y66,z93/99. **11bushes total**, torch2,66,96; 2berriesBANKED. Farmnightgrowth #848 time21801 observed96/97age3 after#805harvest97age2->1 near12381, so regrowth occurredwithtorch/night interval. No causalclaimfromlightmetadata(unreliable values).
CURRENTp1 INSIDE6.579,67,82.687 20/20, woodaxe1/woodpick1/pork1/sandstone4. Next independentDAYcobble6 fromP4dryshallowstair26,105 tobuildstoneaxe+stonepick. P4ownsrecovery/escort; doNOTduplicateitsgear. P2actual5logsBANKED #865, taking2logsforownshield;3logsavailable, reserve1logforP1sticks/materials ifneeded. P3DRY3waitdeadline10:57:11 (freshREADYmustprecedes), elsearmlessfreshsession. P3kitstillBANKEDRESERVED.

## 11:03 FIRST NETHER actual state
#899 independentlytop6/7OBSIDs, front6,z90 nowfloor66SAND+air67..69; P3removedfrontdirt, usefeet67. P3#896/IGNITEchat actualPORTAL6 verified11:02:27. **P1 #902 first_nether.js ACTIVE120s, status20s actual(1.5,65,3.5) dimensionthe_nether,health20food20**. ThusENTRY achieved, return NOTYETverified. Newprobe usesGoalBlock6,68,91 fromfrontfeet67 (actualhopworked), safeadjacenttile cooldown16.5s, localsurvey, returnOW/camp. Checkcompletionimmediately. No victory: dragonstill0 lastofficial.
#881 stonekittrip60.9s actualCOBBLE6->STONEAXE+STONEPICK; sparewoodtools+2planksbanked. Surface maxDrop2 cost2.5hp, stairs2needed; use1longsurface/2knownstairs. Incidentalbone1/arrow2BANKED #892. Ateownpork->full20hp20food; withdrew1sparepork. Before#902kitstoneaxe/pick,4sandstone,pork1. Currentdirtextra1 likelyportalinteriordrop pickup, actualstatusseen.
