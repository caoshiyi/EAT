# Open-container receipt namespace — 2026-10-17T02:50:30.287816+00:00

Exact4310 depositpick: containercount0→1; oldbot.inventorycountremained1 whilechestopen, so DEPOSIT_ACK thrown. Finallyclosedwindow; returnedordinaryowninventoryhadNOPICK. Variableafter={} was neverfilled becausethrowSKIPPEDfreshreopen; chat'freshreopen{}' wasnotanobservedemptychest. Separate4314freshreopen actualpick1/sword1/boat1/stick10/dirt2/pearl1/potion1, ownEMPTY/chestclosed confirmsbank. Preserve4310falsealarm vs4314actualreceipt.

Installedprismarine-windows Window.items() reads thatwindow's inventoryrange; containerItems() reads itscontainer. There is NOinventoryItems() API ininstalledWindow. Smallactualcallerchange WHILECHESTOPEN:
    const held = count(c.items(), n);
    const bank = count(c.containerItems(), n);
Afterclose/reconcile use bot.inventory.items() for ordinaryinventory. Onlysay'freshreopen' afterthatbranchactuallyran; include receiptPhase or after=null untilpopulated. A depositcanhavecompleteddespiteanerrorinpostcheck. ThismatchesearlierP3furnacewindowreceiptclass, not proofeveryfaileddepositwasnamespace-only.

P4correctedfreshtransaction4314alreadyphysicallybankedallkit; no repeatdeposit/newmaterialneeded. Physicalunderlyingpacketordernotuniquelyisolated; sourcecountnamespaces decisivehere. No engineerplayeraction.
