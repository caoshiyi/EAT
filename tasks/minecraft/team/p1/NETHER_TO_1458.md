# 13:23 live overrides
P1 endpointbeforeACTIVE#1362 =(-29,63,-41), backSouth(-29,63/64,-40), floor62/roof65. TunnelNorth#1272 two cells31->33, #1277 eight33->41, fullsealed20hp20food each. TablefullWESTwall(-30,63,-31), not carried; #1254 actualGOLDingot1+nugget1.
#1360 ironcourier actualfreshIRONpick0wear received13:22:32; fullbackseal independentlyobserved. Currentinventorybasalt21,blackstone4,slabs2,berries13,ingot1,nugget1,quartz1,axe,stonepick127,shield. Currenttunnel_north_iron.js handlesiron250 andderivesactualorigin, max12North andsealedend; no longportalreturns. Oldportal/cubby scriptswrongposition forP1.
Portalreplacement: originalx1/2,z2 interiorAIR preserved; newportalx3/4,y65..67,z3. Newleftpost(2,65..67,3)OBS blocksoldcooldowntile2,65,3. P4ownsoldcubbySEALED1,65,4; itsNorthcoldexit1,65,3->1,65,2AIR->1,65,1. OWreturnfromNorth4,66,1->4,65,2->new4,65,3; P2#1282actualroundtrip. DoNOTreigniteoldframewithoutP4egresscoordination. NORTH1,65,1 routejoininFORWARD_ROUTE.json safe; oldfirstEAST3/4,65,3 nowportal andinvalid.
Kindfilters: magma type=mob/kind=Hostile mobs. Oldtypehostile-only NONEclaims incomplete. Usekind+explicitnames, actualfloorhotchecks, freshrelativeheight/LoS. P3 couriercube7.4m fivebelow blockedretreat too; changedawayretreat+freshabsent allowedresume. No generalclearanceclaim.

# 12:48 latest — gold and new component
#1186 VERIFIED3oredug, GOLDNUGGET6 actuallyretained,20hp20foodRESEALtrue101.5s. Firstore(-21,64,-30)cuthead65netherrack/feet64ore, floor63basalt. Second(-22,64,-30)head65basalt/feet64ore. Third(-22,63,-30)footorecutfromprevious21,64 thenarrival63; node22,64 nowUNSUPPORTED andmustNOTbereplayed. Return63->21,64 directlyworked. Thirdpickup0, doNOTclaim3oreworthloot.
#1199 BFSvirtualopen137nodes revealsnewlowerWESTcomponent afterthirdorecut. Exactproposalpath inarenarecord#1199; max80nodes to(-29,63,-30), variesy59..65, onlyproposednotphysical. Brownsnear(-27,61,-28),(-26,60,-27). Nextwalk/surveytargetsnewland; nofallchaseforlostnuggets. P1table1berries13 current, sparepickreceiverrunning.

# Latest overrides — 2026-10-16 12:44 UTC
#1133 VERIFIED128s: 56outsteps +reverse; target(-18,65,-27);12dryceilingblocks dug y68..69 alongcarvedNWpath; 8newbasaltfloor64bridges, no NPCs nearby, 20hp20food deadFALSE, fullRESEALtrue. Newnodes fromprevious(-14,65,-23): (-14,-24),(-15,-24),(-15,-25),(-16,-25),(-16,-26),(-17,-26),(-17,-27),(-18,-27), allfeet65. Safefootbridge currentlyonewide, no rails, doNOTsprint/diagonal/chase.
#1159 PARTIALparcel: TABLE1+BERRIES10 actualreceived, DOOR0; #1168 dooritem1060 east8.242,65,3.368. Runtimefalseflagcorrected; no fullreceiptclaim. P4auditfirstthroworientation, optionaldoorrecovernotcritical. Currentclosedplugs genericbasalt/blackstone. Tablecarried, notplaced.
OWportalACTUALDOOR#1104 supersedesoldergatebelow: lower6,68,90 Southhingeleft, OPENgapX6.40625, explicitopen+wait4/manualcross. Rearcapsintact. DoNOTuseoldgateonlyhelpers.
ACTIVE#1171 goldapproach200s from12:43:18: no roofmining, max6newcells,targetwithin2.3bodydistance of(-21,-30), full20col oregeometrysurvey, thenback+RESEAL. No goldminingyet.

--- Older evidence below ---
# P1 Nether navigation / shelter — live evidence

## Safe room #1033
Body1.5,65,4.5; fullfloor1,64,4 BASALT; FULLwalls x0/2,y65/66,z4 andx1,y65/66,z3/5; FULLroof1,67,4 COBBLE. Entrance1,65/66,3 plugs. Topfront1,67,3 bottomslab isreferenceonly, canremain. Bottomslabfoundations2,64,4 +1,64,5; west0,64,4 naturalbasalt. DO NOTassumeadjacentfloor: firstbuildfailednoreferenceeast. 9cobble+3slabsbuiltroom. Portal1.543,65,2.5 unmodified. Toexplore, remove2frontplugs, actualrecover2cobbleBEFOREleaving, returnexactbodyroomthenreplaceboth, reverifyall8walls/roof/floor+airhead. StopSEALED, avoidmandatoryOWnightreturns.

## Walking proof
P2safe-movements factory adapted in `cubby_walk.js`: no dig/bridge/diagonal/parkour; finalgetNeighbors excludesHOTdestinationFLOOR/feet/head. `blocksToAvoid(MAGMA)` ALONE notenough P2#1041. P1firstgraphmissedHOTfloorcheck (73unsafe nodes), correctedBEFOREmovement#1048 ->50safe nodes.
#1050 sixphysicalsteps+back+reseal13.6s HP20food20. #1056 FULL21steps+back+reseal32.6s HP20food20. Everyactualstep targetdistance<.65,onGround, fullnonHOTfloor; graphisnotworldproofuntilwalked.
Pathnodes (#1056 allphysicallyverified bothdirections):
```
[1,65,4],[1,65,3],[2,65,3],[3,65,3],[4,65,3],[4,65,2],
[4,66,1],[3,65,1],[2,65,1],[1,65,1],[0,65,1],[0,65,0],
[0,66,-1],[0,66,-2],[0,66,-3],[0,66,-4],[0,67,-5],
[-1,66,-5],[-1,67,-6],[-2,66,-6],[-3,66,-6],[-4,65,-6]
```
The NWroute FIRSTgoesEAST to4,66,1 thenaroundportalnorth. BlindGoalXZ(-3,-3) isunavailablecolumn(#917), notproofNWblocked.

## Frontier actual #1056
Body(-3.5,65,-5.5), footnode(-4,65,-6), nohostiles32 then.
- NORTH(-4,-7): y64BASALT,65BLACKSTONE,66BASALT,67BASALT,68AIR. Candidatecontrolled2-highdrycut withfloor64retained, side/upfluid+gravitychecksFIRST.
- WEST(-5,-6): y64..68 ALLAIR -> VOID/no walk.
- SOUTH(-4,-5): y64..68 ALLAIR -> VOID/no walk.
- EAST(-3,-6):64BASALT,65BASALT,66..68AIR -> knownreturnfoot66.
`cubby_dry_cell.js` nextboundedtrial walks21, attemptsONE Ncell onlyifdry/solidfloor/no gravity/nearfluid, logsactualdig+arrival+loot, thenback+reseal. Check latestarenaoutcome, no claimyet.

## Targets / absence limits
Gold(-21/-22,64,-30),(-22,63,-30); deeper(-8/-9,48,-30/-31)NOTdirect. Othergold(-18,62,-41),(-30,71,-34),(-27,64,-43),(-33,79,-39).
Brownmushrooms(-26,60,-27),(-27,61,-28); RED(13,89,-32),(12,89,-33)high24m -> NOTeasyfoodsource.
No netherbricks96/warped48/crimson48 inloadedchunks fromfrontier; NOTglobalabsence. Basaltfloor, biomenameempty/unreliable.
P2NetherdeathspiderpushedFIRE8.9,65,2.3. P4#995 NOhit/kill, spiderHP2 near9,65,3.4 thenunchased. P1#1023/#1033/#1040/#1056 freshMOBSnone16/24/32; noSPIDERkillclaim.

OWgate/front maychangeunderP3: originalfrontfeet67 +GoalBlock6,68,91 hopworked. Newfeet68/GATE6,68,90 wasPLANNEDonly asof#1038, don'tuseuntilP3actualverifiedresult. RearCAP8solids67..70verified#1035. AlwaysfreshworldscanbeforeOWreturn/entry. NewOWcampNOJUMPslab80verified#958/#975; copiedoldjumphelpersSTALE.

## First excavation VERIFIED #1077
`cubby_dry_cell_v2.js`39.7s20hp19food,22physicalsteps. Newnode **(-4,65,-7)** head66BASALT/foot65BLACKSTONE dug; floor64BASALTretained; ceiling67nongravity; nearbyfluid/firecheckempty. ActuallootBasalt1+Blackstone1, returnedSEALED. NextN(-4,-8):64Basalt65Blackstone66Basalt67Basalt68Basalt. W(-5,-7)VOID64..68; E(-3,-7)64..66Basalt,67..68air. Noore/fortressyet.
Important closurefix: #1062 recoveredonlyONEplug ->failedtopseal; #1066 top66DOUBLEslab FULLshape repaired. #1077 moveFRONT(1,65,3)+wait20t BEFOREbudgetverification, recovered1cobble+2slabs; closingacceptsBasalt/Blackstone/fullblocks OR2slabmerge. Nowtopplug66BASALTfull, bottom65COBBLE. Oldhelperexpects2COBBLE stale. Genericv2ready.
`cubby_dry_batch.js` activeMAX4northcells, completepathnotold21cap, currentworldrefresh +reportnextfloor, reverse+reseal. Inspectactualprogrambeforeclaimingadditionalcells.
OWgateNOWACTUAL #1049 closed6,68,90/newfrontFEET68, leftpost5,67..69,90SAND. OnOWreturn MUSTopen gatebeforewalkingNORTH6,68,89 thenclose; oldfrontfeet67sourceSTALE. ReadP3currentgatehelper/ENTRY80 beforeexitNether.
