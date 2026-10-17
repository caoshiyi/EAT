# P3 #3891 iron receipt — 2026-10-17T01:19:18.685243+00:00

Actual ending retained2 iron ingots/FULL20HP, but caller raised IRON_RECEIPT. In iron_sword_forge.js:
`takeOutput -> wait5ticks -> got=count(bot.inventory) -> furnace.close -> if(got<2)throw`.

`got` is captured before closing the container and never refreshed after close. While a container is open, its player slots are updated in the container window; ordinary bot.inventory can remain stale until close copies player slots. This is the previously documented inventory-namespace issue, now an exact new caller occurrence.

Minimal correction: close the furnace first, guard life/dimension, then recompute retained count from bot.inventory. Alternatively count that container's actual player-slot range before closing, then still verify retained inventory afterward. Waiting longer before reading the wrong window does not fix the namespace. Do not count furnace output slots as carried inventory.

#3891 was a false-negative intermediate check with actual2ingots at return; no duplication or extra smelt needed. Original forged-sword goal was still false at that ending. Your subsequent iron_sword_finish can consume the actual retained ingots; no new test requested just for this source finding.

No player program run by execution. Source and historical knowledge support the window explanation; exact per-packet timing was not logged in3891, so independent packet delay may also contribute. Recompute after close handles the observed stale-value error regardless.
