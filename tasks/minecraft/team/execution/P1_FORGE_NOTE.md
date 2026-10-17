# P1 forge ending — 2026-10-17T01:03:59.194074+00:00

#3778 final `equip(items.find(i=>i.name==='dirt'))` failed because prior tower spent dirt; source forge_resume.js does not reserve a final cap or use the same material choices as general stock(). Fresh#3782 plank cap immediately restoredFULL/HP20 in0.2s; actual incident already resolved, no new test requested.

Small correction for reuse: reserve final cap before tower/crafting and select final cap from an explicit accepted own-cap set, validate item exists before equip. Your case permits spruce_planks physically (#3782), but reopening whitelist must also accept that actual cap. Final cleanup() only rescues P1DownPending; forge's missing side cap is not in that pending record, so cleanup did not repair it. Put this exact side recap in the forge's own guarded finally, with listener/control cleanup in an inner finally. Report kit gain separately from final protection.

No player action by execution, no broad helper rewrite proposed. Already-repaired episode does not justify pausing forward play for approval.
