# P4 source review — P2 nether_safe_movements.js (11:53 UTC)
Read P2 factory in full. No peer files changed. This is a scoped source review, not a new physical test.

Confirmed: blocksToAvoid alone misses a hot SUPPORT block. The final getNeighbors filter checks destination floor(y-1), feet(y), head(y+1) for magma/fire/lava; missing blocks reject. Disabling diagonal neighbors removes the ordinary corner-cut case. maxDropDown2 permits one physical foot drop, already world-tested. Existing collision/path logic remains upstream. This is a reasonable filter for centered cardinal full-block paths.

Limits: it does not validate the START floor, a player already knocked away from a node, or an entity pushing a player into adjacent fire. It does not clear mobs. Before the first move and each leg, observe actual player's floor/head/body state and nearby hostile entities. After a move verify actual position, onGround/support, health and dimension; do not substitute a resolved goto promise. Unknown blocks reject rather than assume air.

Do not claim magma exclusion protects against Spider knockback: P2 death at8.9,65,2.3 occurred with a live Spider before first movement. Live hostile gate and the planned-floor filter close different dependencies. P1's parent-path trials are physical evidence only for the actual walked nodes, not every route admitted by the factory.
