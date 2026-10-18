# Active methods support — iteration23

Nonplaying reviewer; all gameplay remains with each player owner. Operator-facing proposed fixes will be placed here with source evidence, assumptions and a small acceptance test. No proposed JS may be run by this reviewer. Current ledger: EVIDENCE.md. No Minecraft strategy is prescribed.

Opening correction for P1: #10213 did craft WOODEN_PICKAXE and receive COBBLESTONE1, but no stone pickaxe. FIRST_PROTECTED_AUDIT predates west-side cuts; FINAL_AUDIT was skipped by recipe failure. Please reconcile current geometry/receipt before adopting inherited protected-workshop claim. A recipe API defect is not established by missing inputs.

P1 requested receipt-test review (#10220): see P1_RECEIPT_REVIEW.md. Correct expected complete collection is COBBLE5 (current2 + new1 + old2), not4. Distinguish newly cut cobble from the existing two; require actual inventory and item-stack change. No recipe API defect established.

P1 candidate source now reviewed (P1_RECEIPT_REVIEW.md appendix); no further reviewer round needed for owner-selected single diagnostic. P4 requested planner review is in P4_PLANNER_REVIEW.md: callback cost100 is a penalty, not alone proof of hard fluid exclusion; no actual fluid-node defect established. Both fixes remain owner-test dependent.

Validated owner case: #10230 old cobble receipt; #10233 stonepick craft/use; #10236 retained full enclosure. See P1_RECEIPT_REVIEW.md. P2 request for permitted target API reviewed in DRAGON_API_REVIEW.md; distinguishes zero-attacks from an actual attack with no observed effect, preserves unresolved dragon semantics.

Reusable small proposal: fresh_terminal_observation.js + TERMINAL_OBSERVATION_REVIEW.md. Current-cell snapshot only; owner-run validation required. No physical correction or broad automation. Complete early independent assessment: ../../ITER23_REVIEW.md.

16:02 important lead-facing API result: DRAGON_API_REVIEW.md appendix independently checks allowed iter16 retained public-client mapping/bytecode: parent hurt routes to BODY, contradicting unconditional parent-immunity theory. This is source-only, not lawful pickability/current arena resolution/damage proof; no synthetic-part workaround justified. Actual qualified interaction remains untested.

16:04 new P1 #10253 route-guard failure reviewed in P1_ROUTE_GUARD_REVIEW.md: model reference from hypothetical start is not necessarily setGoal executor route. Guard stopped work, but ending is now open. Proposed short actual-start/path_update diagnostic; do not infer planner defect or simply remove guard. Not yet validated.

16:05 P2_SMALL_EXIT_REVIEW.md confirms #10261 specific success and flags start-tolerance mismatch (returned .17974m vs admission .15m), post-dig predicate and HP-gated fallback limits. P1_ROUTE_GUARD_REVIEW.md updated with actual #10262 differing paths, HP guard, and #10263 berry-containing cell; models accepting that cell is confirmed, exact HP cause unlogged. Read-only node annotation proposed before physical repetition.

16:06 urgent requested P1 support-cut review: P1_RETENTION_TARGET_REVIEW.md. Own-bush refusal did no edits. Different visible ordinary support target is a distinct test; don't reuse old fixed-y67 centering after landing66. Exact target/cursor/bush effect/landing and final geometry required; no hidden-target override.
