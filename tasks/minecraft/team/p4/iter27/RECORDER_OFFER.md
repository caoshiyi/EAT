# Small complementary contribution: hazard recorder
Drafted by23:57 UTC. New hazard_recorder.js is 30 lines, public Mineflayer API only. Capture area_effect_cloud and dragon_fireball alongside root/crystals, ground, HP, real position at5-tick cadence and health/entity events. No movement/action/private properties. Reader must distinguish loaded entity positions from visibility and collision proofs.

Adoption test: P4 will request a short shared token after current P2 operation to run read-only 10ticks in actual protected OW room and check rows, times, exact unchanged state, removed listeners, bounded log. This tests plumbing ONLY, never End danger/geometry. P2 may inspect and independently use on its own body if useful; do not delay already-started experiment for it. P2 already owns an event observer, so including just cloud/fireball names and periodic snapshots may be simpler than importing this whole helper.

Decision-changing encounter observations: HP loss while stationary grounded/fullcaps with a nearby cloud rejects blanket roof-immunity; earlier loss before placement error rejects error-as-sole-cause. Cloud presence alone never proves damage source; sample omission never proves no cloud exists.

23:57 synthetic event-plumbing test PASSED (recorder_small_test.cjs/out): seven expected records from start/two samples/cloudspawn/health/mark/stop, original listener counts restored, second stop idempotent; separate limit3 retained3/dropped19. This is NOT actual gameplay or a tested hazard detector. Still awaiting short p4 room smoke-test token; P2 need not wait.

00:03 actual G27-1 p4 smoke133 PASSED00:02:59.141–59.659: five real rows,518ms, exact sameposition/HP20/food20/inventoryempty/allcontrolsfalse, original six listener counts restored. Rawrecorder_smoke.out. Narrow recorder plumbing acceptance ONLY.

Long P2 output132 was truncated, demonstrating new concrete bottleneck: preserve short traces rather than add unbounded logs. Updated recorder defaults48rows, only nearestTWO cloud/fireball entities plus loadedHazardCount, explicitdropped. Re-test synthetic/local smoke before adoption. This limits output; truncated records cannot establish absence of hazards. Public root/crystal tables belong in separate pre/post snapshots.
G27-2 actualv2smoke completed00:05: correctasyncbody syntaxcheckpassed afterplainnode--check rejectedtop-levelawait(expectedharnessmismatch, noarenaattempt). Actualrawrecorder_smoke_v2.out preservesunchangedstate/listeners. No encounter safetyclaim.
Receipt localtest output accidentally called untruncated smoke135; actualsmoke v2 header is134. Renamedgenericrecorder_v2_receipt.json; internalexactheader/recordId unchanged. No p2run claimed asown.

00:10 v3 adoptable: explicitrequested/effective limits, clampmax48, evictoldestsamplefirst ratherthandropterminalevents, retainstart+recentrows; explicitdropped. Synthetic128request/400ticks followedHP2+stop retainedbothin48rows; actualp4v3smokeunchanged20HP/listenersrestored. Newsourceatownhazard_recorder.js; re-copybeforeP2trialifalreadycopiedoldversion. Nohazardsobservedlocally, noEndproof.
