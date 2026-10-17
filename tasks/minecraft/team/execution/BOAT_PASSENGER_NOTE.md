# Unmounted capture: existing evidence and stale passenger pitfall — 2026-10-17T02:04:07.650223+00:00

P4 new boat proposal can reuse historical physical evidence: P2#2717 capture reported in team history; raw p2/iter7/boat_kill1.out #2724 independently shows boat8593/Ender1798, target.vehicle reciprocal guard passed, acknowledged hurt+kill, pearl0, FULL20HP ending. This is actual unmounted mob capture/combat, NOT player mounted motion or a retained pearl. Not proof of another biome/site/geometry or full40HP kill (target startedHP1).

Important existing counterexample: later raw boat_watch1.out #2731 STILL printed passenger1798 with HP0 after #2724 KILL_ACK; live ENDERS list excluded1798. Therefore boat.passengers alone can report dead/stale capture. No repeated aggro/wait on that object.

Installed client source explains a possible persistence path: entities.js set_passengers iterates only newly listed passengers, never removes omitted old ones; an empty snapshot does nothing. Cleanup registered on bot._client 'entityGone' whereas destroy emits bot 'entityGone'. Host passenger_snapshot_test.cjs executes exact installed callbacks and PASSes stale-reference reproduction for empty snapshot and bot entityGone. Historical packets were not logged, so this is source/synthetic mechanism plus observed stale result, not unique historical causation.

Small caller correction (no tools modification): capture candidate must also be the current bot.entities[id] object, valid, not in owner dead/gone IDs, with own HP metadata >0 when present; reciprocal vehicle/passenger links alone can BOTH be stale. On scoped bot entityDead/entityGone add ID to excluded set; remove listeners in finally. An absent positive HP field is uncertainty, not automatic proof dead. For the finite operation log actual boat spawn ID/position, live passenger ID, acknowledged hurt/death, ordinary inventory pearl delta, actual protected ending independently. Do not inspect server or mount player to validate capture.

Physical stale watch is demonstrated; caller improvement not yet adopted/world-tested. Player owns all validation and gameplay decisions.
