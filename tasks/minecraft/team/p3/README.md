# P3 reusable capabilities

All scripts control only their supplied bot; run as your own assigned player after adapting coordinates. Arena records provide the actual evidence. Never infer inventory gain from a dig/craft return alone.

| Program | Required state / input | Verified result | Limits |
|---|---|---|---|
| `mine_local.js` | Appropriate pick, nearby vein; `global.p3mine={names:['iron_ore'],limit:12}` | #62: raw iron 1 -> 7, health 20 | Can descend several blocks during pickup. Re-equips pick before digging. Stop rather than chase drops into a ravine. |
| `pillar_one.js` | Centered on solid floor, cobblestone, empty two-block headroom | #92: block placed, feet 62 -> 63; #99: five consecutive steps | Pre-look down, jump four ticks, place, release jump. Seven ticks was too late. Never use under falling sand/gravel. |
| `pillar_escape.js` | Pick + nonfalling building blocks, safe ceiling | #149: feet 60 -> 70 | P4 adaptation digs ceiling first. Sand ceiling killed p4 later: inspect gravity blocks, do not blindly pillar. |
| `flint_fixed.js` | Gravel + adjacent supported block, item pickup distance, stable floor | #143: flint after 13 recycled breaks | Drops can drift away or be collected by teammates. Check all players' inventories. |
| `bucket_capture.js` | Set `global.p3fluid={x,y,z,name:'water'|'lava'}`, empty bucket, stand within reach | #226 water bucket; #272 lava bucket + source became air | Aim near source top, wait four ticks after equip/look, activate, wait twelve. Requires level-zero source. |
| `cast_first.js` | Original pool bank, water and lava buckets | #281 obsidian `(7,67,91)` | Coordinate-specific first-block example; not a general frame builder. |
| `return_east.js` | Loaded surface terrain, target camp `(8,90)` | #410/#411: about 90m across two calls, health 19 | Six short surface-height legs, bounded cancellation. Avoids fluid. Guard is only close melee, not arrow protection. |
| `install_guard.js` | Equip intended weapon first | P3 Monster Hunter observed; P4 has stronger controlled combat evidence | Bounded 120 seconds; attacks named hostiles within 3m with clear world ray. Does not equip, navigate, aim, block arrows, or handle creepers. Attack counters do not prove damage. |

`cast_lib_one.js` has verified individual casts (#534 right68, #541 left69, #554 resumed right69), but the full frame is still incomplete. Concatenate it with `await castOne([x,y,91]);`. It prepares a water cell directly behind each target, pours water, fills the now-empty bucket with lava, breaks any ice, then pours lava and retrieves water. Current state and next coordinates are in `CAST_PLAN.md`. Each block must be checked as obsidian before the next.

Snowy-biome water froze between programs. Breaking ice over solid support restored water and converted adjacent lava into obsidian (#339). Never assume a previously placed water source remains water. Do not pour water directly into the lava source cell: it can replace the lava instead of making obsidian. Verify the aimed support and the actual source coordinate.

Camp doorway: door 6 at `(6,67,81)` faces north. Open it, align player center x about 6.55, then move straight north to exit; #532 succeeded. Diagonal motion from crowded bed/head cells repeatedly failed. Door 7 faces east and is not a normal north entrance. Bed at `(6,67,83)` can set spawn during the day; `bot.spawnPoint` remains the world spawn and is not evidence of the personal bed spawn. P1 confirmed an actual bed respawn.

Water elevator experiments reached y20 -> y57 but never completed a safe surface exit. **Normal program return preserves controls.** My explicit `clearControlStates()` caused the subsequent falls; timeout also stops controls. Old `water_elevator.js` retains this failure for reproduction and must not be treated as a safe escape program. P2 independently verified control persistence.

P4 #603 directly observed FIRE in the wooden pool barrier and missing lower cells. Use dirt/stone for all barriers near lava. #609 reclaimed 12 dirt from lower nonfalling scaffold columns while preserving four floating top-support blocks at y70; this is ordinary survival scaffold reuse. Rebuild barriers from low bank, near-old-cell cleared first, far column placed first to maintain sight lines.
