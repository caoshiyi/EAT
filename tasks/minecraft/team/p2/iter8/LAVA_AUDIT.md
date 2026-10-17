# Lava failure audit — 2026-10-16 23:43 UTC

Decision/beneficiary: P1/P2 next surface or Nether traversal. Does pathfinder preflight SUCCESS plus lava in blocksToAvoid qualify a travel controller?

Measured: P2program3371 opened bufferN, collectedBLACKSTONE2 onlyafteractualN2bodyarrival, restoredNcaps, then WALK HURT_STOP at1.4999,66,-0.413 withHP12. Event23:32:33 says p2 discovered the floor was lava at1.5,66,-0.4 inNether. FreshOverworld20HP EMPTY isNEWLIFE; p2deathstat23. No blaze rod. GenericNetherroute avenueFAILED/CLOSED. No nakedcorpseattempt. E+Nbuffercaps wereclosed beforewalk; OWgateP1actualCLOSEDACKseparate.

Competing explanations:
1. A* admitted a lava body/landing cell despite blocksToAvoid.
2. Valid nodes led to unsafe physical interpolation/jump near lava (actualwalk didNOT follow historicaltrail: savedtrailturnsWEST0,65,1 beforeNORTH0,66,-1; failurewasX1.5).
3. Stopping onHURT interrupted a jump over/near lava; low-health recovery was then disabled.
ExactoldNetherblocks/executednodepath were not logged, so do not claim a confirmed cause for contact or specificLAVAcell. No server/worldfile inspection.

Installedsource facts:
- `mineflayer-pathfinder/lib/movements.js`: lava is DEFAULT in blocksToAvoid. getBlock.safe excludes avoided IDs. safeOrBreak + canDig=false rejects unsafe body blocks. Adding lava again is NOT a repair. getLandingBlock explicitly rejects unsafe liquid. MAGMA as physical SUPPORT is a separate missing-floor-check concern, not proof of this death.
- `index.js`: enablePathShortcut defaults FALSE; claiming default smoothing caused death is unsupported. Disabling diagonalneighbors does NOT whitelist the saved route. Genericgoal fromN2 to-23,-29 replansitsown path.
- `lib/physics.js`: simulateUntil stops immediately when state.isInLava. canStraightLine, canWalkJump and canSprintJump then test reached(state) WITHOUT rejecting isInLava; reached tolerance is±.35XZ and <1Y, no grounded requirement. index.js614..625 uses these predicates for ordinary movement, even shortcutdisabled.
- `nether_stage.js` OWNimplementation: go rejects damaged or health<16. Recovery reused go, so afterHP12 it failed HURT_STOP. This is a measured source defect; low-health retreat must bypass the actionHP admission while still enforcing life/world/boundedending. Do not mistake successfulnormalburials for this failurebranch qualification.

Cheapest informative test COMPLETED: `node tasks/minecraft/team/p2/iter8/physics_lava_smoke.cjs`. SYNTHETIC source-logic fixture supplies a simulatedisInLava=true state within target tolerance; allTHREEinstalledpredicates returnTRUE. FarlavacontrolFALSE; exactsafestateTRUE. This proves a logicalgap, NOT actual3371causality or a worldqualifiedfix.

Recommendation: reject explicit simulatedisInLava before accepting reached; log actualcontrollerpath/velocity/hazardfootprint; separate recoveryadmission from forwardhealthguard. For next Nether test enforce exacthistoricfootsteps/hardhazardfootprint and qualify<=5m BEFORElongroute. No libraryglobal/prototypepatch or toolsfileedit performed (could affectotherplayers). P1maychoose its own integration; WORLDsmalltest stillrequired. This finiteaudit iscomplete/released, notanindefinitewatch.

Worldcontinuity afterdeath: 3377foot5.5,67,84.5 firstburyvetoedCOBBLE66 beforecut; 3379showedcobbleplatformaboveAIRquarry/oxygen400/FOES0. 3384freshnearbySand4site6,66,85, fourSandcuts→sandstone1→cap64, actualNEWLIFEprivate6.5,62,85.55 FULL10faces/20HP20food EMPTY. Preservethisnewpod, distinctfromP1legacy6,z82/83volume.
