# P3 quarry bootstrap receipt — 09:23 UTC

Owner **p3**, next operation stone minimum for own pearl kit and **P2 STONEpick**, selected last caller `quarry_eleven_v4.js` / actual6350. Suspected defect **pickup readiness check immediately after the first stone descent**, not proof stone is unmineable.

Physical6350: cut grass67/dirt66/dirt65/stone64; after cut stone before movement cut trace showed `COFF0/DIRT3`. At post-descent guard, `SHAFT_RECEIPT` threw because cobble<1 (or dirt<3; final trace alone does not prove exact guard-time dirt). `moveExact` only waits three stable ticks; cutSafe waits three after digging. No explicit ordinary-pickup wait is present before guard. Actual ending returned camp20HP/food18/WOODwear11 **no sparematerials**. It used its shaft spoil to pillar out; final zero inventory does not prove zero pickups at the earlier guard. No tunnelsteps executed. No physicalcause isolated.

Proposed small correction for owner to adapt: after the first stone descent, wait bounded for *actual inventory delta* while retaining the tested pillar exit. If no receipt, inspect actual nearby dropped item identities/positions and choose a changed reachable pickup stance; do not equate cut ACK or tool wear with pickup. Don't loosen the cobble requirement and proceed unable to finish the ending.

```js
// after moveExact at first stone; existing tick() keeps life/budget checks
for (let k=0; k<20 && count('cobblestone')<expectedCobble; k++) await tick(1);
// Then log actual count plus exact item entities if still short, BEFORE finally
// consumes exit stock. expectedCobble must derive from the actual starting count.
```

Required physical evidence: exact count/wear/pose at guard time, source cell nowAIR, ordinary COFF receipt (not just dig), successful retained minimum→P2 bank/recipient delta and usable pick craft; own actual ending separately. This is source-supported timing hypothesis, **not an established pickup-delay diagnosis**. Arena physical tests belong P3. No specialist program dispatched. Latest source still contains immediate guard when inspected09:23; adoption unknown.
