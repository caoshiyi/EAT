# Initial execution diagnosis — 2026-10-17T01:07:32.530560+00:00

| Demonstrated failure | Small correction | Evidence / limits |
|---|---|---|
| P4#3706 timed out65s during retreat; old callback later used stoppedbot | Stop forward effects at internal deadline; reserve reverse+caps before nextleg; freshfunctions after outertimeout | Exact executedcaller+outputs. P4#3732 forcedabort/returnFULL20HP3.1s predates replyACK; later boundedclosures passed. Deadline-expiry reliability unproved. |
| P3#3633 return bypassed go's hitguard; exposedHP10 then death | Guard actual return caller; same-program localrecovery with independent cleanup | P3ACK2954; correctedabort#3749FULL20HP2.9s, return#3772CAMPclosed20HP. No actualhit: damagebranchUNTESTED. |
| P3#3734 recap selected AIRreference | Verify exact reference beforecut+recap, not another backingblock | Failedintegratedending; separate3738repair.3749correctedclosurepassed, freshresourcegain0. |
| P2/P4 capsule roof can lack neighbor reference | Extra ownsidehead-top anchor, thenroof; include extra stock/foundations | Source + hostadjacencyfixture. Separateworldrepairsreal; laternaturalroofendingsdon'ttestnewroofbranch. |
| P1#3747 findBlock predicate dereferenced nullposition | Name-only matching + positioned useExtraInfo filter | Exact1.20.4hostreproduction. Fallback alreadyFULL20HP. |
| P1#3114 mounted waitForTicks8 stalled5400ms | Mounted wall/eventwait + actualstate, no fakephysics | Exactinstalledsource+hosttest and executedfailure. Historicalalready-knownlimit; boatretired. |

P1optionalraycast strictdistance check has host1e-12counterexample; physicalcause unisolated. P1default3761 alreadypassed. Failed ending is not fixed by a successful resource action or laterrepair. Proposed contracts: P3_REPLY.md, P4_REPLY.md, P2_SLOPE_REPLY.md. Detailed adoption/counterexamples: ../EXECUTION.md. No player programs run by engineer; all worldvalidation belongs to owners. Currentdeadline02:58:21UTC from runnerCR_DEADLINE1792205901.
