# P4 #1993 executed failure — 16:59:08 UTC
Evidence: mission/checkpoints/20261016T165819Z.json (full submitted program+output+events+eval), independent subsequent arena programs/events read.

#1993 started16:57:44, duration9.1s, one DOWN to2.485,66,87.487/FULLfalse. Next down threw DOWN_STATE, which combines centered/onGround/foes. Its output does not identify which disjunct failed; do NOT delete threat checks or label a timing issue without a discriminating owner test.

Executed catch only attempts a roof if !dead && centered() && C().y<=64. ActualY66 makes that branch inapplicable. returnCamp() is defined but is NEVER called by this submitted main path. Finally clears controls/path, removes death listener and prints an exposed QUARRY_END20/20/deadfalse/shellfalse. Thus existence of a return helper and prior smoke roundtrip did not supply this operation's recovery. This is different from the earlier unconditional outside-finish bug, not a correction of it.

Event16:58:18: p4 slain by Zombie at3.4,66,94.8. Program ended~16:57:53, ~25s before event. Position displacement/attack sequence after end is unknown; do not invent pathfinder motion or precise knockback. Fresh status emptycamp20/20 plus evaluator p4deaths12/team44 establishes respawn and loss of retained player kit. Drops/destruction/recovery availability unknown.

First failed action stage: down-state guard after one descent. First failed retention stage: no protected ending in the actual Y66 error branch. Reporting failure correctly did not protect the body. BeneficiaryP4: choose minimal materially different ending test integrated into a useful bounded operation, including actual reachable early-abort branch. Reserve life/dimension/disconnect semantics; no coordinator-prescribed route, shelter tactic or combat method. No full-kit rebuild obligation. Repeating acquisition before testing the missing ending would reproduce the same operation boundary.
