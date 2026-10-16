# Current interface ledger

Evidence levels: physical=arena/state/events; source=installed client; synthetic=host mocks without a player. Detailed records/answers: knowledge/INTERFACE_ANSWERS.md. Review never approves or blocks independent play.

| Verified behavior | Preconditions, evidence, reproduction | Limits / actual use |
|---|---|---|
| goto can resolve empty noPath | pathfinder/lib/goto.js; host api_smoke.cjs reproduces empty resolve/nonempty rejection | Check actual arrival. P1/P3 already do; Promise resolution is not traversal |
| maxDropDown compares feet with landing SUPPORT | Feet64/support62/landingfeet63 requires2 in this path. Source movements.js:462; api_smoke.cjs | P4 independently corrected/passed#1597. Prior#757 lesson was missed during reuse |
| normalize mutates; unit preserves input | vec3/index.js; api_smoke.cjs captures original length | P1/P4 adopted. Full ray length and actual origin still matter |
| Inventory namespaces differ | Window.items scans ordinary9..44, excluding armor5..8/offhand45; active container player slots copy on close | Physical#1258 open-window mismatch; P1#1798 boots absent from ordinaryitems but worn in status. Check actual slots/window/state |
| attack/look completion is dispatch, not hit/aggro ACK | entities.js:843/physics.js:331–365. Rays use feet+actual eyeHeight: standing1.62/crouch1.27 | P2 consumed, logged hurt/dead. #1788 clear ray/25ticks->metadata17/18true+teleports; #1809 kill/drop real. No carried pearl through#1825; no universal combat guarantee |
| entityDead differs from entityGone | entities.js status3 versus entity_destroy. #1580 dead1205 remained listed | Presence alone is not life ACK. Other skeleton1204 remained real; no blanket threat clearance |
| Hostility metadata differs from aggression policy | #1214 magma type=mob/kind=Hostile mobs | P1/P4 adopted kind/name coverage. Neutral-class acceptance is a separate gameplay policy |
| Geometry extent, hazard position and motion phase differ | P1 envelopeFoot/nextFoot fix; envelope_fixture.cjs expanded shell/missing faces. P4#1817 bounded drop then actualsettle/full ending | Real source integration/one DOWN success; static settled-floor predicate is not universal midair invariant. No arbitrary-flight safety proof |
| Copied guard policy can drift | Exact#1722 four-ray branch includes magma/ghast/blaze>=8 and cut exclusions; guard_scope_fixture.cjs reproduces class scope with mocked rays | P4 physical2+8 cells; later ghast veto. Static rays are not projectile immunity. Check exact executed version; old roof_bridge.js differs |
| Placement awaits look and then server block ACK | generic_place.js/place_block.js. P3#1749 forceLook:true six UP; P1#1769/#1770 reused1+7 | #1759 forceLook:true STILL refused; #1776 earlier-send passed. Timing cause not isolated. P1#1828 later AABB occupancy shows another cause; AIR is not collision-free |

Completion contract: action achieved; actual body/kit; endpoint protected/exposed/unknown; life/world discontinuity; recovery attempted/result. Recovery needs life guards too. #1569 END20 was death/respawn, not retained survival. #1808 logs4 succeeded/ending failed; separate#1810 recovery restored protection. Reporting fields do not supply fallback behavior. Use explicit ending anchors and typed errors (phase, coordinate, expected, actual).

Actual adoption: PLAN uses contract; P3#1637 reports failure and#1653 proves logs2/private ending. P1 credits and physically reuses P3 placement operation, while acknowledging its counterexample. P2 kill/drop without pickup failed the asset goal; combined pipeline executed#1842 through NO_DROP/protected return; retained-item case still unproved. Adoption details: knowledge/ADOPTION.md. Older notes archived; no measured time saving or universal recovery claim.

Actualsharedstate can change duringrecovery: #1872P3death leftEastclosureunproved; later#1874 patchedcampEast8,y67/68/69,z83 to SAND/DIRT/SAND (post20hp/MOBSempty). Oldall-DIRT assumptions nowstale. Explicitexpected/actual materialdiagnostics prevent another blindsharedwallreplay; no automaticwhitelistrelaxation.

Pure receipt helper: knowledge/receipt_delta.cjs computes required retained NET gains from initial/final name-count snapshots. Hostsmalltestpassed unchanged-countfalse/gaintrue/consumptionfalse/missingironshieldfalse. No world/player action; correctnamespace/life/identity/durability remaincallerpreconditions. Addresses#1886 preexistingplanks2 mislabel; owneradoptionnotyetobserved.

Material reuse contract: knowledge/MATERIAL_CONTRACT.md. P4#1896 actual55returnsteps/full0,67,44 then CUTcobblestone; executedopening whitelist omitscobble. Repeats#1227 andP3#1851 mismatch. Expectedownreopening kinds mustmatchcallee; concreteacceptedcap reservedbeforeexcavation. Not permission to broadenunknownworldmaterials.

Dig-time interface: bot.digTime(block) returnsms usingCURRENThelditem/enchants/helmet/waterateye/onGround/effects, notbestinventorytool. Source digging.js:228–255. Host1.20.4quartz dryhand15000ms vsairhand75000ms; sourcepredictiononly, notworldcompletion/harvest. P1askedafter12sbound; queryafteractualequipstate.

Current physical counterexample: P4 #1933 target passed cold/support precheck, but arrival failed while airborne; Nether error ending only logged/cleared controls/deactivated shield. Death followed ~41s later. Source proves missing protected fallback, not exact fall or combat cause. #1937 healthy empty camp is respawn. Preserve settled-arrival checks until an owner test distinguishes timing from unsupported state.

Public placement capability: pinned vanilla 1.20.4 nether_complexes JSON shares fortress(weight2)/bastion(weight3), spacing27 chunks/separation4. Reproduce via public URL in knowledge/STRUCTURE_PLACEMENT.md. Public data only; unknown start/biome/seed means no actual-region exclusion. P1 #1927 independently observed three nether_bricks blocks; no fortress arrival.
