# P1 iteration 9 tool status — 02:54 UTC
Current world assets: #4296 banked water-breathing potion1; #4332 banked doors3 + surplus berries4 + plank1. P4 may consume food/repair with plank: use fresh bank/state, not this historical snapshot.

## Retired executable entry points
- travel.js: unconditional throw BEFORE bot/world actions. #4103 allowed centering to invalidate standing state, ended underwater with air168, returned jump intent; owner delayed and drowned. No same-program rescue proof.
- run_batch.py: unconditional exit BEFORE launching any arena program. A host-side stop did not protect the body after job return. Its old implementation is retained below the guard for audit.
- swim.js: unconditional throw before actions. Historical deep-water approach includes inappropriate land fallbacks/unqualified recovery. Water_lib.js is only a draft, not physically qualified deep-water execution.

Guard tests: local run_batch.py returned retirement message; node --check travel.js parsed. Arena guard test recorded separately in LOG.md. Disabling these does not qualify any replacement.

## Scoped evidence, not reusable universal guarantees
- treasure_route.js #4248/#4253/#4257: daylight leaves-only land/ice traversal, actual dry endpoints; #4237 original hurt ending FAILED, separate immediate return #4240 required. Later nearbyHURT automatic return branch SOURCE ONLY, not damaged-world qualified. Do not treat pathfinder avoiding water as surfacing proof.
- remote_receipt.js #4262: clear sneak/controls before opening chest; actual withdrawal1 water_breathing. Sneak+heldtorch caused preceding 20s window timeout.
- berry_one.js #4272: CONTACT DAMAGE. Do not reuse movement into standing berry.
- berry_recover.js #4282 + berry_lane.js #4284: clear harvested bush before entering its cell; successful food recovery. Earlier consume loop read stale inventory/food; added tick allowance. Each future call must check actual HP/food/inventory and current terrain/mobs.
- return_potion.js #4289 stopped short while dry/fullHP; #4296 remaining16.2s returned camp and banked. Work timeout did not itself imply CAMP. Earlier route endpoint coasting was visible; actual final position matters.
- door_log.js #4312: issue NO_LOG_RECEIPT mid-trip, but actual FINAL gain1/closed camp20HP. Delayed pickup during return, not all-stage immediate receipt.
- door_craft.js #4319: ordinary inventory DOOR3, leftoverPLANK1; bank3PLANK+own1LOG. No cursor item pending.
- door_air_test.js #4326: PRECHECK ONLY, 0 exits/cuts/placements/wet; hostile-veto, CAMP20HP. Entire water branch and recovery UNQUALIFIED. It intentionally rejects late-night arrival. Do not remove that condition merely to retry unchanged.

## Entry lead / next useful discriminator
Physically observed209 stone-brick variants x146..150,z2210..2214,Y-59..-27 (#3628,2900loaded/0unknown). Not entry/portal. Roof147,-27,2212 normal,148 infested avoid; seafloor147,36,2212 granite/gravel37. Any old client chunks may be cached; reobserve upon arrival.
Bank potion NBT minecraft:water_breathing supplies normal survival breathing effect after drinking; not yet consumed/tested here. Do NOT consume before actual descent. One wooden pick has only29 remaining uses (#4319 damage30), insufficient for ~63 rock cuts from seafloor36 to roof-27. Upgrade with3COBBLE+2STICKS, actual recipe/input/wear receipts; stone pick131 uses. No planks in stone-pick recipe.
Before remote commitment need: actual adequate tool/food, reachable air-ending or controlled potion egress, daylight/route budget, state/life/own-air freshness and response margin. Door air still unqualified. Shallow candidates near26,61,115 have floorDIRT60 and two WATER61/62; land28,63,115. Proposed test includes temporaryDIRT61 cut26,116: NO CUT OCCURRED. Peer footprints P2 x8..12/z98..113 must be preserved.
