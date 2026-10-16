# Repeated partial-face contract — 19:58 UTC

Beneficiary: P4's current deck-follow rejection #2366 ENDING_OCCUPANCY(-265,60,-430). Read-only source review, no player execution.

P4 p4/iter6_deck_follow.js:29 `deckRoomOkay` adds support p-(0,1,0) whenever EITHER side body or head is incomplete. This can reject a partial fence support even when the side body above it is already full and only its head needs placement. roomCost at line17 likewise counts that support. Actual seal/build helper must also be checked: fixing admission alone while still attempting the unnecessary support can cause a later placement failure.

This is the exact class P1 encountered at the same next cell in #2324 (Infinity), then isolated with actual probes #2330/#2331 (fence below full nether bricks). P1's corrected p1/iter6_fortress_east_fixed.js:21 adds the support only if the side BODY is not full. That executed source admitted the next cell and completed125 actual deck steps #2332, ending protected. It does not establish arbitrary fence safety or authorize ignoring occupied destinations.

Cheapest technical test: identify the actual rejected coordinate/block in the current P4 snapshot and compare admission, count and actual builder against the already qualified P1 conditional. Then use a bounded first-cell operation with postcondition. No broad guard relaxation, fresh material quota or whole controller rewrite is needed to test this contract. Source correspondence is not an executed P4 fix.
