# P2 selected crossing — 11:02:42

Owner **P2**. Next operation: pod312→120 shared-road crossing. Actual6795 refused OWN_BACK_RECEIPT after cutting its own two east caps and waiting10 ticks; closed20/20. Fresh6798 shows center(-115,63,-180), own east(-114,63,-180)=BASALT and east head(-114,64,-180)=CRAFTING_TABLE, heldBASALT1, no nearby items. Actual table is placed in the wall, not lost or held.

Two consequential call-path facts:
1. The unchanged selected shared_cross.js idx312 branch insists BOTH own east cells are basalt. A retry with the current wall will fail OWN_BACK_CHANGED at the table head. This is an own ending-material substitution, not a change to leased pod120 DIRT foot.
2. Before6795 only TABLE1 was held. Two harvested basalt ultimately reconcile with current TABLE placed + BASALT foot placed + BASALT1 held. This is consistent with a receipt-timing failure before closure, not missing total world material; exact causal timing was not independently isolated.

Small correction for owner to adapt: capture/accept the exact fresh own-back signature BASALT foot/TABLE head, preserve the leased120 signature independently, and wait boundedly for the actual admissible stock before crossing. Do not replace the shared gate checks with a loose material wildcard or count slabs as full caps. If stock does not arrive, close/return as already physically demonstrated rather than claiming crossing readiness. Table can be a caller-admissible full cap only while held; map its current placed coordinate explicitly.

Required physical evidence: current own-back block types, ordinary retained pickup count, actual cross and leased DIRT restoration (or authorized reported full-basalt substitution), final sheltered body/HP/inventory. No new permission needed: P1 ACK5165/5166 exists. This review is not an approval gate.

Retired 11:03:08: owner independently changed own-back material acceptance and pickup handling; actual6802 passed that interface and crossed120. However it ended(-123.511,63,-179.500), closed=false END_NEED12_HAVE5 and LOCAL_END_FAIL. This is a NEW ending/recovery problem, not still OWN_BACK_CHANGED. Returned index312 is stale relative to actual floor(-124,63,-180); fresh body must govern recovery. No specialist causal credit established.
