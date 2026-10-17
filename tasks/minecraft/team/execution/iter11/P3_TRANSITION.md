# P3 final transition: initial finding — iteration 11, 05:05 UTC

Beneficiary: P3 current-body closure and actual PEARL2/spare-sword return; P2 intended sword recipient. Imminent experiment: owner chooses current-body repair/transition; no waiting for this audit.

## Executed fact, caller and assumptions

Arena program **4946**, start 2026-10-17T05:00:54, caller `iter10_return_portal_bank`, ran 3.3s. Source is `p3/iter10/return_portal_bank.js` and arena full record, not an unused helper. It cut E dirt at (2,66,4) then (2,65,4), called `manual(2.5,65,4.5)`, and failed `MANUAL_NOT_ACTUAL`. Logged position (2.647189,64.5,4.525404), returned (2.661612,64.5,4.525404), Nether, HP20/food19, PEARL2, protectedEnd=false, bank=[]. This did NOT reach portal phase or Overworld or camp.

`manual` steers only X/Z but verifies 3D distance<=.25 plus onGround. A half-block Y difference alone fails, regardless of horizontal success. Caller assumed Y65 support across the opening; actual support shape is not in this receipt. Do not simply remove Y check globally or assert exact terrain from Y alone.

Catch branch retries E placements [65,66] at its current position without relocating or checking own-body overlap. Recorded body x≈2.66,z≈4.53,y64.5 overlaps unit block (2,65,4), for ordinary width .6 and standing height1.8. That makes own occupancy a concrete placement-refusal hypothesis. Error: `Server refused to place dirt at (2,65,4): the block is still air`. Refusal cause itself is not uniquely proved; current support/anchors/entities remain owner observations. Retrying the same placement is not independent recovery. Upper cap success is unreported; exact E state remains unknown.

## Small correction proposed for actual caller

Separate horizontal alignment from support-height acceptance **only at this known transition**: choose measured supporting collision-surface Y and onGround, then use that Y in the waypoint. Keep exact Y checks elsewhere. Before recap, move body fully clear of both closure cubes to an owner-verified supported destination on one side; use a shared unit-cube/body overlap precheck so failed recovery does not replay known occupancy. Do not fill a cube the body occupies, and do not substitute a relaxed assertion for physical clearance. Return actual closure states separately from retained inventory.

Required physical evidence: current same-life/dimension body plus onGround and support name/shapes; actual move clear of E cubes; both original DIRT cubes confirmed after placement; body ending/enclosure; ordinary pearl inventory preserved. Complete return additionally needs real dimension transition, closed gate/camp, actual chest deltas. A standalone successful cap is only a primitive.

Discriminating test: owner reads support shapes under the current x/z and own bounding box vs (2,65,4), then performs chosen supported clearance + recap in the useful repair operation. If support top is64.5 and occupancy holds, that separates caller-height error/body-intersection from hypothetical missing cap stock. No universal observation gate or long test series.

Source vs synthetic vs world: source path confirmed in4946; cube math fixture forthcoming. No specialist player execution. Proposed change NOT adopted until owner actual caller source and resulting arena receipt show it.

## Resolved independently,05:07 actual evidence

Owner current4950/4952/4954 exposes support bottomCOBBLEslab(2,64,4), fullPLANK(3/4,64,4), upperDIRT blocks ascent. Changed4954 removes upperDIRT then moves3.98,65,4.525, lowerDIRT restored; upper dirt item390 remains insideoldhome/unretained. Separate4958 usesBASALT upper; lowerDIRT/upperBASALT actual, originalDIRT materialdebt.4965 actual Overworldtransition20HP/PEARL2.4974 attempted old returncaller failed pathsearch at8.462,66,87.457/protectedEndfalse, no bank. Changed4980 `iter11_ow_bank_simple_nav` physically enterscamp and protectedEndtrue/20HP;4987 freshcamp closeddoors/ordinarybankPEARL3/WOODsword1 vsoldPEARL1/sword0, ownpearls/swordgone. Source+receipt closes usefulreturn, not retroactive4974success. No evidence our proposed helper caused/adopted in those independent corrections. Their receipts supersede old exposed ending; no more transitionaudit needed.
