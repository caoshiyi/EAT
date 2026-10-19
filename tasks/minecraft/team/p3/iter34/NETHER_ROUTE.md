# P3 route discovery, iteration34 13:42 UTC

HISTORICAL evidence only; P1 is current Nether operator. P3 stays HOME8.5/68/89.7 full20/20.

1. Actual11334 (`p1/iter26/live_upper_shared_1.out`) 1/65/4 ->1/65/5 ->1/66/6 ->0/67/6 ->0/67/57 ->-19/65/48. Exit table1/66/5 and blackstone1/65/5 were broken and restored. Source `upper_shared.js`; historical pathfinder waypoints are not literal straight walk segments.
2. Actual11338 literal from-19/65/48 west to-29/65/48; -29/64/47 ->-30/63/47 ->-31/62/47 ->-31/61/46. Attempted -32/62/46 FAILED unsettled airborne63.024. Cleanup dug through floor to actual -32/59/46. Do NOT interpret CARDINAL_ACTUAL print before guard as success. Protected final full10.
3. Actual11344 down six at-32/46 to53. Actual11349..52 level53 bypass, exact accepted nodes in HISTORICAL_ROUTE.json (grounded entries only). Compressed turns: start-32/53/46; -32/53/47; -36/53/47; -36/53/48; -37/53/48; -37/53/52; -40/53/52; -40/53/62; -54/53/62.
4. Actual11358: -54/53/61 ->-55/53/61 ->-56/53/61 ->-56/53/64. Actual11361 dug down45 in column-56/64 to8, then east to-54/8/64. **That original column is excavated now.** Old `fresh_down_to_low.js` requires solid column and cannot safely be replayed; an unobserved45m fall is lethal. Survey adjoining column (e.g.-57/64) to qualify a NEW solid descent, or current safe landing/caps. Old preflight's historical side blocks were full but require refresh.
5. LOW_WAYPOINTS.json is 405 static guide nodes extracted from historical `low_shared.js`; source only, not a safe controller. Stops18/8/276; historical portal stance274 before door275. Actual11364 first200 passed; second segment11365 died at25.5/8/240.1 after HP-loss catch retried. Never copy catch/retry. Fresh hazard/occupant/visible block and body checks required. Actual7768/7773 in P2iter16 establishes prior18/8/274 -> door275 two basalt cuts -> portal277 -> OW163/-26/2230, not current portal state.

Biggest changed-world condition: original solid descent is now air. Favor a refreshed adjacent solid shaft over trying to make an old all-full guard accept it.
