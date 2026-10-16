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
