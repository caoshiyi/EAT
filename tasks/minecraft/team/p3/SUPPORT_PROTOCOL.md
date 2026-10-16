# P4 support parcel V1 — 13:30 UTC
Parcel ACTUAL P3 inventory: freshSTONEpick0, crafting_table1, spruce_button1. No berries available. P4 requests these forSWwarped work. One short North handoff, oldcubby/P1route otherwiseunchanged.

P3senderNorth(3.5,65,1.5), P4receiverNorth(1.5,65,1.5). Newportal3/4,z3 via4,65,2/manualjump4,66,1; OLDframe1/2,z2 remainsAIR. P4ownsoldcubbyandownexit/reseal. P3 never touchesP4plugs.

Exact control tokens are standalone messages, no explanation appended:
1. P3 running sender registerslisteners, emits `P3_SUPPORT_CODE_READY_V1`, waitsinside60s freshP4_ARMED.
2. P4 startsboundedreceiver<=120s whileSEALEDoldcubby, registersstage listener, emits `P4_SUPPORT_ARMED_V1`.
3. P3 entersNether/freshhazardgates/Northsender3,65,1, emits `P3_SUPPORT_STAGE_V1`.
4. P4 opensOWNplugs, stepsNORTHoldAIR1,65,2->1,65,1 afterfreshgates; onlyactualreceiver emits `P4_SUPPORT_READY_V1`.
5. P3 checksactualP4receiver. For EACH of TABLE1, BUTTON1, FRESHSTONEpick1: aimsWEST/down+wait6ticks, tossesone, then retreatsEastUP(4,66,1) beforepickupdelay, wait12ticks, returns3,65,1 fornext. No new protocol peritem; receiverinventoryauto-pickup. No first-look packet ambiguity, no loose waiting near own drops.
6. P4 emits `P4_SUPPORT_RECEIVED_V1` ONLY afteractualinventory hasfreshpick0+table1+button1. On failure reportactualcounts; no completeclaim. Then OWNreverse+RESEAL.
7. P3 waits<=20s receipt, actualreturnNorth4,66,1->4,65,2->NEW4,65,3 with>=17soffportal cooldown. Steel1temporaryloanfornew-linkrecovery; bankonOWclosedreturn.

Acceptance: actualP4inventoryall3+token; P4ownreseal; P3OWclosed20hp +steelBANK. ThreatabortallowsRETREATaway, nevercurrent-distance deadlock. Deathalwaysaborts; expectedportalrespawnwindowonlyP3boundedtransition. Sendercap200s (inside60+shortfield/return), no longdaywait. Physical3-itemhandoffnotyetproved; prioroneiron6tickaim+toss+retreat#1352worked.
