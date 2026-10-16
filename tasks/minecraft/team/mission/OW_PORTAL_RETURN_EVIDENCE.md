# Historical portal return: qualified movement, incomplete ending contract

Near-term beneficiary: P1 carrying the first rod. Read-only review; no coordinator player execution.

P3 #2326 actually reached Overworld camp with gold retained, continuous life and19.54HP. Evidence p3/iter6/portal_approach_and_camp.log. Its reported protectedEnd=true is broader than its world observations: returned doors were6 spruce_door CLOSED and7 AIR. Later P2#2399 separately repaired7 and verified both closed.

Source p3/iter6/portal_to_camp.js explains the false positive. insideCamp() uses `!block.getProperties().open`; AIR has undefined.open, so !undefined accepts it as closed. A non-door therefore qualifies. Historical movement success does not prove a complete shelter contract.

campHome() still contains the SAME exact goal4,67,88 later rejected twice by P2#2409. Its catch retries campHome rather than demonstrating a different protected fallback. Fresh geometry/actual arrival/door-name+state evidence is needed before relying on it for the rod carrier. Do not blindly replay this historical script as a proven current safe-return controller.

The helper defendNear is defined but not called by this portal-return operation. Its presence does not establish actual defense. Gate alignment, portal transition and normal dimension-respawn handling have physical precedent; actual current postconditions and a failed-return ending remain owner responsibilities. No Minecraft route or combat method is prescribed here.
