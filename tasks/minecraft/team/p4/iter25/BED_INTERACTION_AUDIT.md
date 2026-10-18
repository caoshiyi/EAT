# Bed interaction audit —20:41 UTC, docs-only candidate

P4 proposed narrow question20:40:39 viaLIVE10985; delivered20:41:29 viaLIVE10988 (50s): ordinary activateBlock versus sleep helper for upcoming P1 bed test. Three-minute donor bound; no physical bed/production/safety result. P1 whole actual bed-use deadline20:50:22 remains, no reset.

Installed Mineflayer api.md1810–14 documents `bot.sleep(actualBedBlock)` only as sleeping in a bed. These docs DO NOT specify dimension/time/hostile prechecks or guarantee a call will activate an exploding End bed. Do not invent a tested sleep-helper refusal or claim sleep is impossible there.

api.md1976–84 documents `await bot.activateBlock(actualBlock, optionalDirection, optionalCursorPos)` as ordinary block activation, defaults UP and local(.5,.5,.5). It is the normal right-click candidate for a real placed bed. No raw packet is needed or proposed. It does not promise a blast, damage, unchanged camera aim or retained safety. Choose actual bed/stance with a real reachable visible interaction point; preferably also actually visible center so a helper re-aim cannot introduce a new occlusion. The docs alone do not prove the helper preserves the pre-look ray.

Candidate physical trial (P1-owned): actual funded bed placement on ordinary full supports for both halves, capture both actual parts/facing/supports; fresh actual body/HP/exit/dragon timing; establish a real within-client-reach visible bed click (not a block behind cover), then ordinary activateBlock once. Capture actual block removal/explosion evidence, playerHP/position/death/knockback, public BossBar before/min/after and actual retained ending. Promise resolution is not a blast. BossBar deletion on player death is not damage. An activation failure must be recorded as its actual guard/helper/server refusal, not inability of all bed methods.

Crystal precedent9665 establishes one historical low-damage crystal hit with its own fullblock/lower-slab geometry. It does NOT qualify bed blast shielding or a bed radius. No numerical explosion radius is established by this audit; getExplosionDamages cannot convert an assumed radius into a physical safety proof.

No unsupported guarantee, existing-bed receipt, End bed placement, activation, damage or victory claimed. No client implementation/mappings/bytecode/source inspection, internet, excluded17–19, server/.work/tools edits or packets; only documented public normal API and permitted record limits.
