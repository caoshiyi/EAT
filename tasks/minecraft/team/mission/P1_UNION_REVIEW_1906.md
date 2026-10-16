# P1 requested union/partial-cut source review —19:06 UTC

Source p1/iter6_east3.js, exact file named in chat1486; static review only, no execution.

Union predicate checks each recorded cell's cold floor/body, full roof and four cardinal sides except recorded horizontal neighbors. Straight/turn adjacency is represented by cellSet. acceptTunnel centers, checks union and onGround before publishing cells/end. This is a connected horizontal corridor predicate; no arbitrary3D guarantee. Physical#2173 retrace33+newE3 passed normal ending; does not exercise partial-cut failure.

Partial-cut bookkeeping: next cell enters cells/cellSet only AFTER successful go. If digging opens a cell and go fails, tunnelSafe(oldcurrent) normally sees that unregistered open neighbor and fails. Executed finally tries oldcurrent, then sealCurrent fullroom; failing that it reverses trace and tries origin seal. It does not silently add failed nextcell to the accepted union. These are source fallback paths, not physically demonstrated for this new shape. Material/place/body/life rejection can still prevent fallback, so no universal recoverability claim.

Prospective coverage gap: loop sets envelopeFoot=n BUT nextFoot=current before dryScan/guard/dig. guard uses actualbody/current and nextFoot for radius admission. Therefore before cuts the candidate-radius test can evaluate current/current, missing an entity just outside currentradius but inside proposed n radius. go(n) updates nextFoot later, after cuts. remainingCover does exclude envelopeFoot cuts, which is useful but does not fix the early candidate filter. No observed damage or failed current operation is attributed to this source gap. Cheapest useful technical check is current-outside/proposed-inside predicate fixture plus inspection of the actually executed route variant; no broad rewrite or play approval gate.

Current file has six material units, but fallback placement budget is conditional on actual closure references/occupancy and needs observed postcondition. Preserve normal accepted path separately from failed operation and later repair.
