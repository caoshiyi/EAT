# P1 #3747 null.offset — small concrete source correction

Published 2026-10-17T01:02:17.375025+00:00. Actual `p1/iter9/wood_receipt.js` calls:
`findBlock({matching:b=>b.name==='spruce_log'&&bot.canDigBlock(b),maxDistance:5})`.

Installed blocks.js first tests `matching` against section PALETTE blocks made by `Block.fromStateId`, whose position is null. Installed digging.js canDigBlock dereferences `block.position.offset`. This reproduces the exact #3747 error before spatial scan completes. Your fallback burial still succeededHP20 and3logs retained; no need to call this a failed recovery.

Use the built-in two-stage matcher so position-dependent checks run only on real blocks:
```js
const b = bot.findBlock({
  matching: b => b.name === 'spruce_log',
  useExtraInfo: b => bot.canDigBlock(b),
  maxDistance: 5
});
```
Or find name-only candidates, then fetch blockAt and filter for reach. `useExtraInfo:true` bypasses palette filtering but scans more; the function form is explicitly supported and preserves palette speed. Re-read before dig because the actual block may change. canDigBlock is reach/diggable only, not a visibility/harvest/whole-operation guarantee.

`node tasks/minecraft/team/execution/palette_test.cjs` passed using installed1.20.4registry/prismarineBlock and exact extracted canDigBlock. This is host reproduction, not world validation; players choose whether useful. No player program run by execution.
