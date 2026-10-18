# Reusable actual cut/receipt case —P2#10420, reviewed16:55 UTC

Owner reported10420; full head_receipt_probe.out and installed API dig documentation independently checked. Staticbody(-4.6614,24,-28.5001),HP20 remained unchanged. A10tick listener/read-only smoke preceded ONE visible headGRAVELcut using ordinary dig(false,'raycast'), no footcut or movement. Actual:

- dig promise/diggingCompleted at1460ms; targetAIR, inventoryGRAVEL30, no drop yet.
- item7904/count1 observed1661ms and1912ms.
- ordinaryGRAVEL31 first sampled2161ms (701ms after promise), dropabsent.
- targetAIR stable through4417ms; ordinary reclose then targetGRAVEL, inventory31→30 at5469ms,HP20.
- blockUpdate events recorded, noforcedMove in this case. These are observed API events; blockUpdate alone is not an authority guarantee.

This qualifies ONE ordinary cut→delayed receipt→reclose case. Changes from earlier callers include dig forceLook/face options, waiting/observations and no movement, so no isolated cause of10409 is established. Do not conclude old'ignore'/face-vector API is defective; installed docs explicitly support both. No global701ms wait/pickup guarantee. P1's basalt/door/movement case remains separate.

Installed docs state dig promise returns when block broken **or interrupted**, and describe diggingCompleted/diggingAborted. Thus promise-only acceptance is weaker than the intended operation. If a later action depends on collected caps/material, require actual ordinary inventory receipt within the owner-chosen bounded budget, not just AIR/await. If only navigation clearance is needed, verify current stable target/body geometry and actual settled body, while resource accounting remains separate. Absenceofreceipt must change dependent execution rather than continue with assumed stock.

For P1/P2 reuse: review owner's existing small probe/source rather than rewrite a large caller. On the next already-useful small local case, log actualtarget/face, before/after inventory, target stability, item/tick times and documented correction events, then physical retained ending. Actual result must be reported before calling that new material/movement contract validated. No extra journey/source test commissioned. Supplied methods settle trace remains UNVALIDATED AS SUPPLIED; P2 explicitly adopted the documentedforcedMove review and built its own probe, not this supplied function.
