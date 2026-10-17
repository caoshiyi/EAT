# Execution findings index — iteration 9

Evidence classes: **source** = installed client code, **host** = synthetic offline test, **world** = owner-executed arena records. A source correction alone is not physical reliability. Engineer has run no player program.

| Finding | Minimal caller correction | Evidence and limits |
|---|---|---|
| Global oxygen can be another entity's air | Read current `bot.entity.metadata[air_supplyKey]`; reject missing self data | Exact callback host test; world4017 selfraw300/global390 and4031 self300/global400. Historical sender unlogged; no underwater qualification. See P1_OXYGEN_REPLY.md. |
| `JSON.stringify(bot.controlState)` loses all control properties | Enumerate seven `getControlState` values explicitly | Exact accessor host test; world4017/4031/4041 explicit values. `{}` never proves allfalse. |
| `setGoal(null)` leaves a saved placement-return position | Suppress documented LOS branch during manual phase; don't mistake suppression for cancellation | Exact branches host-tested with seeded return. Only pathfinder's own placement callback sets it. Original3958 cause unproved; re-enabling LOS can re-arm it. See P1_MANUAL_CONTROL_REPLY.md. |
| `bot.dig` can complete on optimistic local AIR | Single-flight target/tool checks; same unenchanted tool wear + stable target + actual crossing corroborate | Exact plugin host test with zero incoming packets. P2/P3 normal cuts physically passed. Ordinary blockUpdate is not intrinsically server-origin. See P2_DIG_REPLY.md. |
| Outer timeout invalidates captured bot; race alone leaves work active | Reserve recovery inside outer budget; cancel underlying goal/dig, guard late continuations | P4#3706 outer65s failed during retreat; later fresh repair. P2#4045/4048 internal-budget exits closed in same program. No universal jitter/expiry proof. |
| Recovery helper differs from actual recovery caller | Patch the executed return path, with independent cleanup attempts and actual ending | P3#3633 bypassed go's hit guard; #3772 revised return passed normally, damage branch untested. See P3_REPLY.md. |
| Capsule walls need not anchor the central roof | One extra side-head top block before center roof; count foundations/supports before commitment | Host adjacency fixture; world failures3777/3784 and separate repairs. New natural-roof endings don't test extra-anchor branch. See CAPSULE_ROOF_REPLY.md. |
| Midstep body overlaps future cap | Stop, settle, verify actual height/support and body fit; recheck after awaits | World3828 overlap consistent with refusal; rollback passed. New mushroom refusal3841 is separate. Downshaft3869 lost health; separate3875 repaired. See P4_MIDSTEP_REPLY.md and P4_HURT_REPLY.md. |
| Copied crouch condition changed downstep behavior | Exclude downward movement from edge-holding crouch | P3#4014 failed; #4016 separate repair; corrected4019 short controlled return passed8.278s. Later4025/4033/4041 normal stages passed. Not arbitrary descents. See P3_BRIDGE_REPLY.md. |
| Upward failure returned while suffocation continued | Check stable block above cut; local breathing/ending repair in actual UP catch; life/coordinate guard for later incident scripts | World4009 returnedUP_POST; death event4s later. Gravity cause unisolated because head/above types unlogged. Camp20HP empty was new life. See P1_UP_DEATH_REPLY.md. |
| Receipt reads wrong window or cursor state | Close appropriate container, park cursor, then recompute retained inventory | World3891 IRON2 arrived after stale pre-close check;3897 sword succeeded.4037 planks12 oncursor;4039 parked;4044 crafts succeeded. Underlying cursor cleanup cause unisolated. See P3_IRON_RECEIPT_REPLY.md / CRAFT_CURSOR_NOTE.md. |
| Position-dependent matching sees null-position palette entries | Name-only matching + positioned `useExtraInfo` predicate | Exact registry/handler host test and P1#3747 error; owner fix predated reply. See P1_PALETTE_REPLY.md. |
| Optional dig raycast can reject its own target by strict distance | Owner-qualified default face with actual ACK/receipt; don't assume reach means visibility | Host epsilon counterexample; P1 default3761 passed before reply. Historical physical cause unisolated. See P1_RAYCAST_REPLY.md. |
| Mounted physics ticks stop | Wall/event waits with state checks while mounted | Exact source/host plus historical3114 timeout. Boat avenue retired; don't repeat investigation. |
| Syntax failures before action | Optional compile-only checker; never invoke compiled body | syntax_check.cjs catches exact3866/3884 errors, no player execution. Behavioral correctness remains untested. See SYNTAX_CHECK.md. |

P3's portal comparison found the same path in26/35/27ms with106neighbor calls; it did not reproduce the historical actual start, and does not support a current entity-predicate CPU bottleneck. Revised actual entry4000 passed. See P3_PORTAL_PATH_REPLY.md.

Actual assets are separate from score: P4 pearl was banked3945 with fresh bank0→1 receipt. Official score is only `python3 tools/eval_minecraft.py`; execution has not run it because no disputed outcome needed an independent check. Details, adoption ACKs, failures and later results remain in ../EXECUTION.md. Current continuation pointer: NEXT.md; active read-only monitor13303, current deadline02:58:21UTC from runnerCR_DEADLINE1792205901.

## Boat stale passenger / latest P4 caller review (02:04 UTC)
- BOAT_PASSENGER_NOTE.md: actual historical2724 kill + later2731 deadHP0 passenger counterexample. Installed set_passengers ignores removed IDs; bot._client cleanup misses bot event. Exact passenger_snapshot_test.cjs PASS. Exclude dead/gone/invalid/noncurrent entities before trusting capture. No adopted world validation yet.
- P4_CONTROL_LOOP_REPLY.md: actual4062 scaffolding=[] means no ordinary new returningPos seed; earlier saved return unknown. Conditional goalnull steering source reproduced earlier; controls{} meaningless. Reachable lateequip→dig continuation lacks goal/generation guard, but actual execution after4062 timeout unobserved.
- P3#4088 work80 cutoff closed actual58nodes/FULL20HP81.68s;4095 separate13nodes/FULL20HP12s. Budget recovery evidence, not target response/pearl.

## Wet/new-life/camp-return followup (02:17 UTC)
- P1_WET_ENDING_NOTE.md: actual4103 DROP_CENTER_POST wet/unprotected selfraw168/global400; death02:08:13 drowned. Warning02:08:37 afterdeath. Drychecks precedeawaitcenter; postwaitbodyrevalidation missing; airIcons defined unused, finalpassivejump noobservedrecovery. Proposedboundedwetbranch source-only.
- P1_OXYGEN_REPLY.md freshnesslimit:4105newlifeownraw-19 persists4115dry/headAIR/grounded/FULL. Ownnamespace doesnotguarantee freshafterrespawn; keyedselfairpacketfreshness/lifeepoch needed.
- P4_OW_RETURN_NOTE.md:4120 goto staging throws before returnCamp; catchlogonly, failedexposed17.5HP then Zombie death02:13:55. Alert02:13:30/note02:13:51 didnotproveadoption/rescue.
- 4125repairwasNEWLIFEalreadyclosedcamp; protectedEndfalse leftinitialized, notcurrentpredicate. Report actualsafeCamp separatelyfromoperationsuccess.
- Installedgoto empty-path branch resolves BEFOREstatusnoPath/timeout. goto_empty_path_test.cjs PASS host. Actual4120/25pathstatusnotlogged; keepgoactualarrivalpostcheck, no uniquehistoricalcause.
- Automaticalertcounterexample4125: reportedprotectedflagcanbeuninitialized/stale. Alertisreportinspectiontrigger, notproofphysicalexposure. Owneractualpredicate/endingstillneeded.

## Iteration10 current override — 03:06 UTC

Current deadline05:01:33UTC (`CR_DEADLINE1792213293`), nonplaying monitor36866. See ../EXECUTION.md and OBSERVATION_CONTRACT.md; above iteration9 monitor/deadline are historical. Actual corrected P1 caller4399 filters self/key, phases and age in oxygen predicate; WETpose headAIR,0SELF/690OTHER, qualificationfalse. Actual doorpose/HP20 useful but no air reserve measured. Whole-returnfailedLAND_BOUND; separate4415closedcamp20HP/7false repairs ending. Missing metadata neither depletes nor restores air; unknown does not gate independent dry-body/escape evidence. P3 correctedentry4379 healthy forcedabort reentry passed; lowHP/hurt route remains unqualified. P2 forcedlook source ordering reply adoptedACK3356; live target-damage test pending. Exact evidence/replies iter10/.
