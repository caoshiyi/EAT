# Verified result
Official coordinator evaluation at22:12 UTC: **dragon=1; milestones=12/12; deaths=227**. Full output: `../coordinator/2212_eval.txt`. Forcedsave still fails(ConnectionRefused), but the last saved world now contains p1's kill advancement at22:09:01 and reports the dragon dead(killed). This supersedes the stale immediate postkill evaluator.

P1 dealt the remaining17.854599HP through six acceptedaxe attacks. One earlier two-hit batch endedfatally after knockback and failedretreat; p1 returned and received replacementtools through P3/P2. Four subsequent standing-only one-hit/immediatedrop cycles each ended sealed/fullHP20 with no cleanup errors; last dealt the remaining1.604599HP. Jumpattempt14495 was refused by nativevisibility, with no damage; enforcement respected.

Retained method: `live_one_standing.js`. Exact program/end/effect records: `actual_combat_results.jsonl`, derived from retained arena outputs by small-task-qualified `summarize_results.py`. Reuse only with freshworld/sourceconditions; four healthyreturns do not prove universal safety. Fatalroof60recoverybranch remains unqualified.

Final p1 native14517: lowerpod(-2.476,50,4.500), HP20/food17, tenfacesfull, groundtrue, controls{}, goalnull, dragonabsent, AxeWear9/PickWear14/E13/gravel2. Fieldsupport/slab/P3roof preserved. No unresolvedactivep1programIDs. No additionalagents, no otherbodiescontrolled, no tools/server/.work changes, no pushes.
