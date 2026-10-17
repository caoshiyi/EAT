# URGENT: oxygenLevel may describe another entity — 2026-10-17T01:30:01.527285+00:00

**Use the player's own entity air metadata for the imminent dive test, rather than treating global bot.oxygenLevel as self breath.** Read installed entities.js lines452–501 and breath.js in full. In the mcDataHasEntityMetadata branch, every entity_metadata packet is fetched/parsed, then ANY `metas.air_supply` assigns `bot.oxygenLevel = round(air_supply/15)` and emits breath. There is NO self-entity ID guard. The legacy breath.js path does guard bot.entity.id, but returns immediately when mcDataHasEntityMetadata is supported.

This is a concrete source defect. It can explain readings above documented0..20 or sudden20/400 transitions, but original packets were not captured: exact historical sender/cause remains UNISOLATED. The earlier team statement that399 is simply a separate raw namespace is insufficient when the executed program printed bot.oxygenLevel itself. Do not treat20 aslow or400 asyourplayer'sextrareserve.

Small local caller correction, no tools/server edits:
```js
const airKey = bot.registry.entitiesByName.player.metadataKeys.indexOf('air_supply');
function selfAir() {
  const raw = bot.entity.metadata?.[airKey];
  return typeof raw === 'number' ? {raw, icons:Math.round(raw/15)} : null;
}
```
For1.20.4, verify airKey from installed registry (expected1); don't silently accept missing metadata. Prefer raw self supply plus observed head cell/HP and actual air trend. A temporary listener may also filter `bot._client.on('entity_metadata', packet => packet.entityId===bot.entity.id...)`; remove it in finally. Do not substitute another entity's breath event for this.

Discriminating owner observation during the already planned safe shallow test: log globaloxygen, own raw+icons and any received air packet's entityId beside bot.entity.id. A mismatch would physically confirm contamination. No extra hazardous dive is needed; safe surface/passive packet observation can discriminate it. Source finding does NOT itself qualify a door-air pocket or explain every past death.

Until self breath is observed, a threshold against globaloxygen can produce false aborts or false air qualification. Preserve your current protected ending and owner-chosen recovery budget; no engineering approval gate. Host source reproduction follows. No player program run by execution.

Host reproduction PASS: oxygen_sender_test.cjs executes the exact installed entity_metadata callback with synthetic player/dolphin packets and stubbed entity lookup/metadata storage. Self300→global20; other6000→global400 and other15→global1, while ownentityair stays300/icons20. Registry1.20.4 confirms featuretrue and playerair_supply index1. This proves source contamination, not the historical packet sender or physical oxygen in any earlier dive.

## Respawn counterexample / freshness — 2026-10-17T02:13:05.699511+00:00

Raw4105 after death: NEWLIFE camp20HP/empty but ownmetadata air=-19. Raw4115 later actual dry/grounded/headAIR/FULL at35.51,65,115.49, HP4.264 (SALVAGE_HP), food20, onlyDIRT1; ownair still-19. Thus ownentity namespace avoids other-entity contamination but cached own value is not automatically fresh after a life discontinuity. No continued drowning claim from this value; actual4115 wetfalse/headAIR. Damagecauseunisolated, no salvage/kitreceipt.

Installed entities.js rebuilds entitylist on login, not respawn; game.js respawn updates game data, not entitymetadata. Metadata merge retains unmentioned fields. If owner needs freshness for a wet qualification, invalidate local freshness at life change and mark fresh only on an incoming entity_metadata packet for CURRENTselfID containing the air_supply key. A generic entityUpdate can be anotherfield, so does not prove air refreshed. Listener can be scoped/removed in finally; do not modify tools, fake metadata, or assume this lifetime's cached negativevalue is current breath. Current body/head/wet observations and an actual ownair trend remain distinct receipts. No world validation performed by engineer.
