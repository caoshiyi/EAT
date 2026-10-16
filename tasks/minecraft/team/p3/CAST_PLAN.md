# Portal casting handoff — 09:49

Verified six obsidian frame blocks, all at z91:
- Bottom: (6,67), (7,67).
- Left side: (5,68), (5,69).
- Right side: (8,68), (8,69).

Remaining: (5,70), (8,70), (6,71), (7,71).

Use `cast_lib_one.js` concatenated with `await castOne([x,y,91]);`. It requires one water bucket, a pick, building blocks (dirt/cobble/stone/planks), and a safe guard. Steel is already in p3 inventory for final ignition. Do not start without checking actual inventory and world positions.

Verified controller records:
- #534 full right68 cast, water recovered, health20.
- #541 left69 cast succeeded; right69 prepared water but could not reach lava from old stance.
- #547 moved one cobble from old front platform8 to capture extension10 using genuine sneak-edge bridging. Capture floor (10,67,89) is cobblestone.
- #554 captured fresh lava(13,66,90), resumed right69 successfully, recovered water, restored old front platform(8,67,89).

Current capture stance is (10,68,89), not9. `getLava()` checks visible level-zero lava within5m of eyes and verifies filled bucket. It tries alternatives; no capture claim without inventory result.

Central casting stance (7,69,89), automatically raised per target level. Front row z90,x4..8,y67 is cleared into a shallow moat so flow cannot wash across the raised front platform. Pool barrier: (9,68,90), plus columns x9,z91/92 from y68 to current target level. These prevent water from capping the pool and flooding the capture path; raise incrementally in controller.

The controller pours water directly behind target (`w=q+(0,0,1)`), then fills lava using the now-empty bucket, returns, checks/breaks ICE immediately, pours lava, verifies obsidian, then captures the water. Water stays in inventory between calls. Ice digging aims at the visible TOP over existing frame blocks. Never assume a water source stayed liquid in this biome.

Remaining block budget from after right69: level70 pair costs6, top6 costs9, top7 costs7 =22 total. P3 had planks2+cobble1; P4 deposited6planks+cobble1; P2 gathering12dirt; P1 harvesting2logs (8planks). Current `restock_midframe.js` is collecting depot blocks/eating carried pork and returning central69. Verify its result.

To execute next:
1. Check/restock actual blocks; concatenate library + calls left70/right70 (about6 blocks), equip axe at end. Keep active P4 guard.
2. Restock enough for top6 (9) and top7 (7); P2 dirt delivery is useful, roof is optional because controller handles ice.
3. Top6/7 support requires temporary interior dirt/plank columns x6/7,y68..70,z91. Controller builds them. After top obsidian exists, REMOVE these SIX temporary interior blocks, not the obsidian, to expose inner2x3 air.
4. Recover water; clear all flowing water/fire inside; inspect complete10-block frame coordinates and air interior. Use steel on bottom obsidian top into inner cell, then verify `nether_portal` blocks. Enter and verify dimension/evaluator; ignition alone is not the portal milestone.

P3 bed spawn activated; camp doors/entry still require care. P3 has one bucket, steel, axe, pick. P4 escorts west bank; do not assume escort east of x9.5. The capture platform briefly goes x10; maintain health checks. Equip axe at program end; attack guard does not block distant arrows.
