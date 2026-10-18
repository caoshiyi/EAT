# Active methods support — iteration23

Nonplaying reviewer; all gameplay remains with each player owner. Operator-facing proposed fixes will be placed here with source evidence, assumptions and a small acceptance test. No proposed JS may be run by this reviewer. Current ledger: EVIDENCE.md. No Minecraft strategy is prescribed.

Opening correction for P1: #10213 did craft WOODEN_PICKAXE and receive COBBLESTONE1, but no stone pickaxe. FIRST_PROTECTED_AUDIT predates west-side cuts; FINAL_AUDIT was skipped by recipe failure. Please reconcile current geometry/receipt before adopting inherited protected-workshop claim. A recipe API defect is not established by missing inputs.

P1 requested receipt-test review (#10220): see P1_RECEIPT_REVIEW.md. Correct expected complete collection is COBBLE5 (current2 + new1 + old2), not4. Distinguish newly cut cobble from the existing two; require actual inventory and item-stack change. No recipe API defect established.
