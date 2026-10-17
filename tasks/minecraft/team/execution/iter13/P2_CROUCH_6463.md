# P2 current crouch/physics mismatch — 09:41 UTC initial answer

Owner **P2**, next operation selected small indoor 1.5-gap crossing before distant blaze slot; beneficiary P2 usable contact+ordinaryRod pickup, eventually P1. Suspected defect: physics AABB remains standing height while actual observed player is crouching.

**Physical6463** same position/20HP: before pose0/height1.8/eye1.62/physicsHeight1.8; after10ticks SNEAK pose5/height1.5/eye1.27/**physicsHeight1.8**; clear+5ticks restored actual pose0/height1.8/eye1.62. No movement/contact/crossing tested.

**Installed source confirms call path:** `prismarine-physics/index.js` defaults playerHeight1.8 (line77), `getPlayerBB` line115 uses `physics.playerHeight` directly; sneak logic changes speed/edge handling, no crouch-height assignment found. Mineflayer physics plugin line84 simulates through that same object exposed as bot.physics at207. Therefore a local collision mismatch is source-supported. This is not proof of any old failure cause; no package edits needed.

Proposed small correction for the named gap test only: enter SNEAK and wait for actual observed pose5/height1.5, then make the local physics AABB match that actual observed height before the bounded manual step. Check pose, eye height, floor/ceiling/collision at actual destination and actual completed crossing+back, same life/HP. Avoid changing entity identity or pretending a smaller server body. No need alter pathfinder planner until this physical primitive works.

One consequential compatibility detail for finally: **controlState.sneak=false does not guarantee actual pose0 under a low ceiling**. Don't blindly restore local model1.8 while actual player remains pose5/height1.5 below the slab, then claim the later caller has a standing model. Exit to actually clear standing space, observe pose0/height1.8, and restore/check local1.8; or preserve/record actual low-ceiling crouched endpoint and its matching model for the next exact caller. This runtime property persists between programs; ordinary callback cleanup alone doesn't restore it. Source `check()` won't detect that mismatch without the actual observation.

Tiny owner-adaptable logic, not a complete caller:
```js
const h = bot.entity.height;
if (!((bot.entity.metadata?.[6] === 5 && h === 1.5) ||
      (bot.entity.metadata?.[6] === 0 && h === 1.8))) throw Error('POSE_UNQUALIFIED');
bot.physics.playerHeight = h; // actual observed pose only, not invented dimensions
```

Required physical evidence: qualified indoor gap geometry, actual server-observed pose/body-height and local physics-height before/during/after, actual movement both ways and same-life healthy protected ending; controls/listeners preserved. Source/coldpose test doesn't prove blaze-leg ray, melee projectile contact, hostile exclusion, or ordinaryRod pickup. A separate farm contact+pickup acceptance must follow from actual geometry once it is reached. No specialist player programs/adoption credit; owner selected diagnosis independently.
