# P1 requested snowball trial support —22:13:27 UTC, five-minute gate

P1 independently proposed shovel snow harvest and projectile crystal attacks to avoid pillar melee/blast exposure. P3 accepted ~22:14 and delivered observer/source package11192 around22:16, within five minutes. This is a proposed change of combat method; no crystal property or effect has been demonstrated.

Public allowed Mineflayer docs api.md:2017–2026 document activateItem/deactivateItem; :1344–1358 document entitySpawn/entityGone/entityMoved. `observe_one_snowball.js` is a function only, not an automatic program. It uses actual inventory, ordinary equip/look/activateItem once, preserves clear camera rays, logs item delta/new snowball entities/positions and current crystals, and removes its listeners. No assumed speed, gravity, blast radius, private material, proxy target or raw packets. Node syntax check PASS. Small P3 sandbox G26-1#66 empty-inventory runtime test correctly refused before equip/throw; position/HP/bag unchanged. This tests admission only. Funded throw and trajectory remain UNTESTED. P3 released sandbox again11198; P4 owns an independent <=5min funded shovel/one-throw test from its own sandbox source, only if present materials suffice.

Suggested staged acceptance:

1. Owner actually crafts a shovel and harvests one current visible snow target; verify actual snowball inventory increase and retained stance/cover.
2. One local ordinary throw at an actually visible nearby wall/point; verify snowball count -1, actual new projectile observations, clean ending. Promise resolution alone is insufficient.
3. From current supported End stance, aim at an actual visible current crystal (observer expects position+.65, derived from old physical9665 visible-entity point). One ordinary activation; track path/closest approach, target presence and remaining crystals, HP/position and actual retained retreat. No assumed snowball damage, range or universal aiming solution. Crystal disappearance needs further same-dimension stationary samples and fresh eval after credible completion; absence on death/dimension change is not a kill.

Fresh LIVE11185 source map at22:15:16: portal back (6,68,92) has plank floor67, AIR body68+69 and dirt roof70; neighboring (6,68,93) has SNOW on cobble67. Other snow targets (7/8,67,93) on grass66. These are loaded geometry leads, not qualified approach or visible harvest. P3's four actual looks at nearby sources hit dirt/slab, so P3 does not harvest or move. Exact snow_source_query.js/.out.

LIVE11197 at22:16:55 establishes thin layer (6,68,84) is `snow`, layers1, shapes[]. Other queried targets reuse that shapes reference. A collision cursor can therefore hit the floor/beyond despite visible snow; earlier P2 snow cursor refusal does not prove all snow methods fail. Actual owner must distinguish an unobstructed thin visual mesh from an intervening block. Candidate public `dig(actualSnow,'ignore')` after normal pre-look at visible mesh + dual clear camera/reach checks preserves look without demanding collision-ray intersection with an empty shape. This is untested here; never use it when another block intervenes or alter shape/visibility. Actual P3 queries remain occluded. Full Nether `snow_block` roof is a different source and should be queried by its owner before action, with an actual recap in custody.

P3 normal registry query additionally substantiates stone pick/shovel maxDurability131 and wooden shovel59; earlier remaining-wear arithmetic was accurate. Harvest/launch/adoption/End effect pending.

## Physical adoption completed in sandbox —22:20 UTC

Independent FULL read P4 G26-1#72 and#73 outputs. #72 actually opened an ordinary south-head aperture, qualified unobstructed real/model-eye rays to layer1 SNOW(5,67,-20) at1.40/1.48m, used wooden shovel/public dig(ignore,TOP), received SNOWBALL1 at22:20:04.412, and restored THREE10FULL/HP19 by05.216. Its later aim failed because it targeted the wall it had removed: the complete caller failed, while actual harvest and cleanup are separate observed postconditions.

Separate #73 actually included P3 observer, aimed at an existing visible plank wall, and called activateItem once. Inventory1->0; actual projectile3001 spawned22:20:21.644, disappeared21.695; one tick0 position/velocity sample, failureNULL; final22:20:23.199 unchanged HP19/food17/position/grounded/all seven controls false/goalNULL. P4 offer22:16:14->ending20:23 <5minutes. P3 independently confirmed11216. Observer and shape/source proposal now have actual recipient use. P4 owns physical craft/aperture/harvest/launch qualification; P3 owns observer and diagnostic support.

This establishes stages1–2 in sandbox only. One position sample at a nearby wall does not establish free-flight gravity, range, collision with crystals or damage. P1 live harvest, projectile effect and retained End ending remain pending. No large ammunition quota or crystal success claim follows from local source/launch.

## Actual on-route extra supply —23:00 UTC

P3 optional one-existing-west-head-block proposal11322 (0,66,4) was reinforced by the actual SB106 shell, while reminding that the old roof had become DIRT. Owner SB107 DID execute a snow branch with pre2->post2, not a skipped/absent-source branch. Cause of zero yield was not isolated; P1 corrected that stale report. Owner independently added actual held-shovel wait/reaim and ground-drop audit.

LIVE11334 then actually harvested WEST snow_block(0,66,4), capped it with COBBLE, and logged SNOW2->6 at22:58:36.601. Full station closure and upper travel retained six snowballs/HP17.333/food16/THREE10FULL at(-18.5,65,48.5), terminal22:59:14.128. Independent FULL p1_snow_upper_adoption.txt. Owner23:02:40 says it had independently also selected west snow from the shell; P3 proposal reinforced the specific one-block option, while wait/ground fix was owner's. Do not claim exclusive origin or a successful SB yield. Current team supply A6+B4=10, but crystal-hit/range property remains untested. No more source/gear quota was added.

P3 contact/projectile support stays ready for the first actual End action and trajectory; P4 offline analyzer already refuses its one-position local launch as insufficient flight data. No fitted Minecraft gravity, range or guaranteed hit has been asserted.
