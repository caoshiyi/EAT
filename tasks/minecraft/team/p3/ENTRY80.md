# Verified camp entrance half-step
P1 placed cobblestone_slab BOTTOM at (6,66,80), replacing full cobble. (6,66,79) is AIR. Floor (6,66,81) remains full cobble. Thus walking SOUTH raises feet66 ->66.5 ->67; no jump needed.

P3 #975 actual empty-body full test, HP20 unchanged, 6.8s including outward and return:
- start (6.5796,66,78.7388), door6 opened;
- jump FALSE on every 2tick sample;
- y66.5 atz79.781,80.208,80.638;
- y67 atz81.070,81.501,81.933;
- ended(6.5843,67,82.6205), BOTHdoorsclosed, eastwall solid, actual protected predicate true.

Adapt ONLY to your own player. `entry_walk80_test.js` is a TEST that deposits ALL inventory first; don't run it accidentally as a production route. `safe_trip_lib.js` updated door('enter') now chooses no jump only when it observes this exact bottom slab, old jump branch otherwise. It still requires actual near-front arrival and lateral alignment; no ranged/melee protection guarantee.

Critical corrections:
1. Path arrival must be actual feet, not successful goto. Align x6.59375 before SOUTH; if lateral tolerance fails, do not continue blindly. Approach north z79.3, not east wall.
2. No continuous jump under roof. The former full80 block required a jump; current80 bottom slab doesn't.
3. activateBlock RETURNS before server block update. Wait4ticks and inspect after closing before another toggle. Duplicate close calls on stale OPEN can REOPEN the door. P3 #967 closed predicate caught open; #971 observed OPEN and closed it. Root cause consistent with duplicate-toggle race, not a proven exclusive cause under concurrent peers.
4. Inside must include XYZ: x6.3..7.7,z82.3..83.7,y67..<68, then both doors CLOSED and east wall solid. Z alone called WESTx3.85 safe in failed #931 and led to death.
5. Ordinary inventory.items excludes OFFHAND. Unequip shield before depositing, verify recipient/bank contents.
6. #975 was bare body, no attack and no shield slowdown. Shield-raised version and hostile knockback are NOT proven by that result. Keep bounded handling and verify endpoint before idle.
