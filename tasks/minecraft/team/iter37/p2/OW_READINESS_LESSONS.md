# Iter37 observed readiness constraints

These are native observations, not a current work order. Do not launch resource work without a present accepted need. P2 returned to End with wood7; no Iron, Shield, Bed or spare tool was produced. All coordinates refer to the observed world, which can change.

## Movement and interaction

- A pathfinder result node contains centered x/z (e.g. .5). The native follower adds .5 to integer cells, so call node.floored() first. The first route failed because centers were offset twice. Native 12-node/7.5s chunks subsequently reached End9low with HP20/food20/wood7.
- Air-above-full-block integer stance filters miss valid interaction positions on slabs and chests. interaction_stance.js accounts for actual collision shapes and body clearance. Qualified by actually opening EMPTY chest154/-35/2227 from152.5/-36/2231.5 at21:08.
- Reaching a chest is insufficient:149/-29/2241 windowOpen timed out20s. Above-lid blockage was not checked. Do not repeat unchanged or claim empty.
- First library ladder137,z2239 runsY-34..-30 facingEast, with a gap from lower floor-36. Under-target stance filters miss adjacent legal interaction positions.
- Two-plank own pillar at141/-33/2240 was actually funded and used after cutting overhead Basalt-31, allowing upperwood141/-30..-28/2241 harvest. Planks7 remaining. Don't infer platform immunity.
- Cobweb has empty boundingBox/shapes despite being breakable. Old generic cut helper skips it. Native web census9, no harvest/sword crafted; dedicated cut needed if ever funded.

## Observed OW locations

Shared checkpoint respawn143.5/-36/2231.5. Existing crafting table140/-36/2232 is part of P1's route; do not remove it. Another166/-34/2234.

P1 native return waypoints:
140/-35/2232;140/-36/2239;139/-36/2239;139/-36/2255;131/-36/2255;130/-36/2256;130/-36/2265;128/-36/2266;128/-36/2272;131/-36/2272;131/-36/2275.
Portal approach look134.5/-34.38/2275.5 then short forward, capped2300ms. Verify actual dimension transition; own actual return21:21:34. End100/49 then81/50/0 ->75/50/0. This is observed route evidence, not proof unchanged safe forever.

Fresh unmined Iron ore:
132/-41, -42/2233;131/-41/2234;129/-39/2227;128/-39/2228;135/-34, -33/2218;134/-34/2217;155/-40, -41/2237.
No iron was mined. Tool funding and access were unresolved.

Unchecked chests168/-43/2230,124/-30/2211,126/-30/2208,136/-41/2248. Last is near THREE skeletons around138..146/Y-42/Z2247; P2 unarmed did not approach.

Native nine webs, radius48:
168/-35/2222;172/-38/2224;175/-37/2229;171/-36/2222;172/-35/2223;175/-35/2227;175/-37/2227;174/-37/2225;174/-35/2223.
Three wool require12 string, so these did not fund a Bed. This census says nothing about existing placed beds.

## Critical unanswered question

Read-only existing OW Bed census was requested21:20:26 and MISSED when P2 had already launched return in a compound command. No bed count, color, coordinates, or spare bed qualification exists from P2. Never interpret this as a negative census. P3 subsequently forbade another optional exit. Shared checkpoint Bed must never be broken before affected P1 ACK. P4 was not played or queried.

## Transfer conditions

P1 accepted wood->StonePick21:22, P3 accepted only if it does not delay active DPS. At21:31 native14388 -4/50+51 are BOTH Endstone,52 is attack slab; NEVER cut this support. P1 escape -3 must stay clear. East gate-2/50+51 also Endstone; donor-1/50/4 is two-high with roof52. A temporary gate there requires actual P1 contract AFTER ending. No gate was cut, no plank thrown, no receiving inventory/craft/use yet. P3's split inventory can be full even though stack totals look mergeable: demand actual free-slot receipt before delivery. A stockpile is not recipient adoption.

Read arena chat responses before launching dependent action. Long LIVE watches lock p2 say; short bounded programs keep support responsive. Every world action here used p2 only.
