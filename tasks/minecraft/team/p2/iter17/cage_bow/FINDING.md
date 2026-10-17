# Caged-crystal bow collision model — finite independent work, NOT live proof
P1 upcoming normalBow/crystal experiment is the beneficiary; secondremainingcrystal33.5,Y80,-24.5 is actuallycaged (P4second_geometry). New question beyond earlier free-spacearcs: can a lowbody normalarrow trajectory avoidtower/cage? Whole18:06→18:12:31 <8min; no sourcequota, items, playerroute, cagebreak, shot, Endentry orpeeredits. Firstplainbowshot remainsactor's priority.

Model uses exact publicmatched1.20.4 SpikeFeature: radius2 cylinder x²+z²<=5, obsidianY<height79, bedrockcentreY79, cage offsets-2..2 atY79..82 withperimeterorroof. ExactpublicCrossCollisionBlock mapping confirms NORTH=a/EAST=b/SOUTH=c/WEST=d; SpikeFeature setsconnectionsaccordingly. Installed1.20.4 prismarine-block collision shapes reproducebars. PublicAbstractArrow.findHitEntity invokesProjectileUtil overload with .3 inflatedtargetAABB (P3matchedcgb115); fullbow3/.99/.05 physics alreadymatched. This modelsnormalcollision, no syntheticIDs/network bypass.

Smalltrusttest beforelargersearch: rayboxentry, roofcentralpostblocks, roofquadrantgapclear (3fixturesPASS). Initialmodulepath error failedbeforefixtures; correctedexplicitEAT_ROOT modulepath, retainedATTEMPTS.txt. Bounded110sec search completednormally; 10,800nominalgridaim/launch/branch combinations,3813clearMODEL,80sampledfor128deterministictriangularperturbationtrials each. This is not exhaustiveoptimality or measuredserverprobability. Search ignores surroundingterrain, otherpillars, actorcover/motion, actualblockmutations andincominghazards.

One bestSAMPLED candidate for actualtower translatedfrommodel:
- Feet(57.748711,55,-10.5); spawn(57.748711,56.52,-10.5).
- Aim(33.5,81,-24.5), highbranch; yaw1.04719755, pitch1.41305227.
- Nominalendpoint89.723271ticks, modeltargetcollision88.977723ticks (~4.45s) throughrooflatticegap.
- 52/128deterministicnoise trials hitMODEL; NOTa probabilityguarantee/arrowquantityrequest. Actualshotreceipt/terrainray/pose stillUNQUALIFIED.

The olderSnowtemplate85tickcap wouldrejectthis90tickcandidate. At18:25P2read actualcurrentp1/iter17/bow_arc_lib.js:110tickcap/.050000000745gravity alreadycoversit. Earliercurrent85wordingissuperseded; noflightwindoweditneeded. Anyextendedreceiptwindow belongsafterimmediatephysicallyprovedLOWescape, neverwaitingexposedforcollision. Newbowcaller mustfirstqualifyactualnormalshot/ordinaryammo withP1'spreparedrecoverablefloor-smoke, thencurrentworldpaths/crystaleffect/retainedending. Model says possibleordinarycageroofgap exists, not that thisexactworldorigin isready orsafe. Released8323/retirethisaudit; do notmakeanothermodelundernewlabelorautomaticstockchain.
