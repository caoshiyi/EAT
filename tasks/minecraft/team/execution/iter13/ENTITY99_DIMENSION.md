# P2 entity99 dimension question — initial answer 09:57 UTC

Owner **P2** request4987, next operation ownerP1 protected Nether read + ownerP4/P2 current OW read, beneficiary current guarded OW departure/bank approach. Suspected defect: retained client entity entries from an older dimension/life may be treated as current local threats. No specialist player program.

**Installed client source supports possibility, not actuality:** `mineflayer/lib/plugins/entities.js` initializes/resets `bot.entities={}` at injection and **login** (lines76,103). `entity_destroy` lines292–301 invalidates/deletes specified IDs. This plugin has no respawn/dimension reset handler found, and targeted all-plugin assignment search found no extra reset outside entities.js. A missed destroy across a portal/respawn can therefore leave an old client entry. Metadata[] and catalog width2.04 do not establish present size/HP or ghosthood.

P2's proposed discriminating read is useful: two owner-executed observations, each with **UTC timestamp, actual own dimension+entity ID+pose**, entity99 ID/**UUID if exposed**/type/position/isValid/metadata. Preserve observation times independently; old OW641x vs currentNether data are not simultaneous. Same numericID appearing in two caches does not establish which cache is current. A current-owner event updating entity99 (spawn/move/metadata or destroy) in that actual dimension is stronger provenance than a copied object.

Proposed small correction for the **chosen current guard** only after evidence: classify unproven dimension/life provenance as UNKNOWN and perform a bounded fresh local discriminating test; don't erase all entities, remove guards globally, or label99cleared from dual appearance alone. Existing actual Zombie/Skeleton deaths and fresh local mobs remain real hazards regardless of99. A client row on a fresh read is still a cache observation, not a server rescan.

Required physical evidence belongs owners: near-contemporaneous cross-dimension records, then current same-life update/contact/occlusion/position evidence sufficient to choose local guard behavior. If one body changed dimension since entity99 was first observed, its unstamped row cannot certify local presence. Do not claim immunity/pathclear/kill until the actual next interaction and protected ending pass.

No installed packages/tools changed, no server access; only allowed package source and public arena records reviewed. Source search is narrow to the selected entity-cache call path. No framework rewrite or universal stamping request.
