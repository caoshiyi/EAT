# P3#2177 ending evidence scope

Read-only source: p3/iter6/enclosed_vein_two.js lines8,10–12; observed program#2177.

`checkHull(cells)` checks full cold outer boundary, guards and nonplayer entities inside declared cells. It does not test actual player body membership, onGround, or agreement with hull.foot. In go(q), NAV_BOUND rejects before the following wait6/arrival checks. Catch logs; finally clears movement/listeners; final protectedHull calls checkHull only.

Observed after two completed steps: actual(-46.5008,54.5358,-62.6340), hull.foot[-47,55,-62], issueNAV_BOUND/protectedHulltrue. Actual floored cell[-47,54,-63] IS present among excavated hull cells, so this is NOT evidence of exterior exposure. It is evidence that accepted-foot/actualbody/settled-arrival are different facts; no final onGround value was logged. Next start guard BODY_CHANGED should reject stale foot, not establish recovery.

Cheapest useful owner test is reconcile actual settled body and membership/foot before useful continuation. No global movement rewrite or Minecraft method is prescribed; no universal protection claim. Preserve failed operation separately from subsequent reconciliation.
