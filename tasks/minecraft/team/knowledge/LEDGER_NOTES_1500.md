# Shared interface knowledge — initial 2026-10-16 14:45 UTC

Evidence levels: **physical** means arena output/state/events; **source** means client implementation only; **synthetic** means no player acted. Plans are not capabilities. Review does not approve or block independent play.

| Capability / limitation | Preconditions and reproduction | Evidence / adoption |
|---|---|---|
| Program return does not preserve survival | Inspect endpoint, then later status/events; distinguish respawn from retained inventory | Physical #1474 packet delivered then14:06:11 death; #1482 sword crafted then14:08:21 death. Proposed common ending contract below; adoption not yet demonstrated |
| Current inventory while a container is open may differ from window player slots | Check the active window's player slots or close it and recheck body inventory | Physical #1258; installed inventory.js:434–453 closeWindow copies container player slots to bot.inventory, set_slot selects active window. P2 adopted close-before-inventory in prior records |
| Threat classification must include actual entity metadata | Inspect entity `name/type/kind`; do not assume all hostiles have type='hostile' | Prior physical #1214 magma_cube type='mob', kind='Hostile mobs'; P1/P4 adopted, latest integration still requires source-specific check |
| Candidate selection must include current OR proposed next position before next-position policy | Pure boundary test: distances14.5/13.5 with radius14 must select candidate; both14.5 must not | #1522 pure fixture passed; P4 six-step source fixed. P1 covered_advance8 now also fixed (14:45 source review). Predicate test alone does not prove gameplay safety |

Proposed minimal field-ending record: action result; actual dimension/position/health/inventory; endpoint protection with actual predicate; observed death/world transition; recovery attempted/result. A refusal without protection must explicitly report exposed/unknown. This contract is a proposal, not demonstrated recovery code. Gameplay solutions remain player-owned.

API source verified14:45: Vec3.normalize mutates the vector; .unit() returns a distinct scaled vector. Capture original ray length before normalization or use .unit(). Evidence vec3/index.js:185–200; adopted by P1/P4 prior code. bot.attack dispatch does not verify reach/cooldown/hit; lookAt completion does not prove aggro (entities.js:843, physics.js:331–365). No current enderman gameplay proof.

Adoption observed: PLAN14:44 explicitly incorporates proposed field-ending contract; that is organizational adoption only. P1 staged construction/current-vs-destination separation physically tested #1555/#1556 with real sealed endpoints, not adoption of guaranteed recovery. Focused answers: knowledge/INTERFACE_ANSWERS.md.

Live failure14:47: recovery scripts also require life-discontinuity detection. #1569 START0.1667->END20hp was respawn continuation: eventSkeletondeath14:47:08 and EMPTYinventory, independentlyevaldeaths40. #1564 extracted2rawiron but returndoor failed; no ore bank. No safe-recovery adoption demonstrated.

Navigation interface (source + host synthetic, not gameplay): installed goto.js resolves when path_update has path=[] BEFORE testing noPath/timeout. Host api_smoke.cjs reproduced empty noPath resolves/nonempty noPath rejects, exit0. Always check actual arrival/world/onGround as appropriate; a resolved Promise is not arrival. P1/P3 current helpers already check arrival (pre-existing adoption). Reproduce `node tasks/minecraft/team/knowledge/api_smoke.cjs`; no player used.

Observed new adoption14:46:50P2 explicitly says shared answer consumed and damage ACK/drop will be logged separately. #1580 then logs HURT_ACK5+DEAD_ACK skeleton1205; #1584P3 simultaneously logs4hurt+sameDEAD. This demonstrates event-based combat observation, not sole-killer attribution or enderman-specific capability. P3 explicitly acknowledged recovery life-guard failure14:48:27; acknowledgement alone does not implement a fix.

Drop configuration: getLandingBlock compares start FEET y with landing SUPPORT y, then returns support+1 feet. One-block descent64->63 needs maxDropDown>=2 for support62 in this code path. Source movements.js:462–471 plus api_smoke.cjs max1reject/max2accept; P4 independent live correction and lower-cell success14:50. This is coordinate semantics, not arbitrary safety proof. Prior #757 had already exposed it; current reuse initially missed that lesson.

Discovery/adoption14:53: P1 current header explicitly says INTERFACE_ANSWERS consumed; PLAN14:50 cites answers and contract. P2 current header14:52 still says “No KNOWLEDGE.md present” although this exact file exists since opening and P2 publicly consumed focused answer. This is a stale discovery assertion, not evidence no answer was used. Owners should read exact path rather than infer reviewer/document absence.

P1 actual adoption14:55: chat1120–1121 acknowledges focused envelope answer; current covered_advance8/covered_north24 now use separate envelopeFoot=planned cell and nextFoot=current during construction. Source integration verified, broad field safety not implied. Separate #1625 finish/backplug failure ended adoptedfalse; #1630 physicalroofpatch restored actual shelter. Successful fallback is conditional.

P3 field-ending contract physically adopted #1637: reports actionSucceeded=false/endpointProtected=false/lifeDiscontinuity=false/ok=false after failed outward and recovery path. Recovery label incorrectly stays not-needed despite RECOVERY_FAILED; outcome false is truthful but that field needs typed attempted/failed state. #1642 separate protectedcamp return20/20 preserves kit. Neither establishes successful wood acquisition. Current later source adds endpointType/fallback-refuge; not yet physical proof.
