# P2 optimistic dig — initial reply 2026-10-17T01:12:04.933519+00:00

**Yes. Installed bot.dig finishes by calling `bot._updateBlockState(block.position,0)` locally before a server block ACK is required.** In digging.js finishDigging sends finishpacket, clears target, then locally updates AIR. The ordinary blockUpdate listener sees AIR and finishes diggingTask, so dig resolves. blocks.js exposes updateBlockState as bot._updateBlockState. Therefore bot.dig resolution + ordinary blockUpdate(AIR) + immediate blockAt(AIR) are NOT three independent serverreceipts.

Read exact cap_dig_discriminator.js and observed#3838/#3842. New checks add an independent signal (sameheldSTONEpickwear rises) and delayed stableAIR. #3842 actuallycrossedonecell, so obstruction question was physically discriminated; its closurefailedAABB and separate3845repairFULL20HP are distinct. Do not count postrecoveryNETH as evidence originalcutfailed.

Minimal correction in ensure: keep ownervalidated same-tool wear increment + actualtargetAIR after bounded eventsettle before moving; do not treat any bot.blockUpdate as intrinsicallyserverorigin. For this ordinary unenchantedSTONEpick/rock case wear is useful corroboration. It is not a universal necessarycondition (Unbreaking, creative, instantlybrokenitems/toolchanges alter it), nor targetidentityproof when several digs/concurrentcallbacks occur. Preserve single-flightdig and exact beforetoolslot/type/durability.

If another ambiguouscut occurs naturally, the discriminating observation is a target-matched incoming `bot._client` **block_change** packet (location/type), installed BEFORE dig, separate from bot.blockUpdate. Installedblocks.js listens to block_change and multi_block_change; record both relevant eventnames/timestamps if needed, but do not invent a simplistic multi_block_change decoder. Missingblock_change alone is not failure because updatesmayarriveinotherpackets. Directpacketlistener is clientobservation, no serveraccess/commands. Removeownedlistenersinalways-runfinally. No new broadpathfinderexperiment or mandatorypacketframeworkneeded.

Sourceprovesoptimism; it doesNOTisolatewhichoriginalcutfailed in#3832. Longwaitalone is not serverACK. Hostexactpluginreproduction follows; no playeraction byengineer.

Host result: `node tasks/minecraft/team/execution/dig_optimism_test.cjs` PASS. Exact installed diggingplugin resolves with localAIR+ordinaryblockUpdate despiteZEROincomingserverpackets. Syntheticclient/world, not a claimabouttheworld'soriginalcut.

## Actual matched incoming packet proof — 2026-10-17T02:19:00.592849+00:00

Read raw4111/4112 actual caller, not compact summary. 4111 START refused because expectedblackstone was actuallybasalt; no dig/packet occurred, not a failed API. 4112 relaxed only observedmaterial toblackstone/basalt, handdig pre6250ms; received matching block_change q(-136,64,-180) type0/AIR at7333ms. Then placed spareowncraftingtable cap, received matching4277state updates, ordinarytable3→2, HP20/food19 samebody. This is physical client-incoming-packet corroboration for ONE handcut BASALT and newFULLcap, with nearfoes veto; sourcewarning about optimistic localAIR did not mean handdig impossible or mandatory toolwear.

No harvest/drop ormaterialreceipt claimed (hand BASALT does not produce held BASALT here); originalBASALT was intentionally replaced by a table, not exactmaterialrestore. Doesnotqualify othertargets/ranges/latency/threats. Ownercode/test predates this review; no causalcredit/adoptionACK invented.
