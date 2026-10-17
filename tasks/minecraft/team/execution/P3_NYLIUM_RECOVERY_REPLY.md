# P3 emergency material selector — initial reply 2026-10-17T02:29:35.926235+00:00

Confirmed exact4155 put() selects inventory item named originals.get(q), regardless of phase. close() counts ALL heldcapNames, then put refuses a cutwarped_nylium coordinate unless actualwarped_nylium item is held. Thus admission may pass with37COBBLE while construction throws CAP_STOCK. This is source-confirmed mismatch, not a general shortage or tool quota. Hand/ordinarypick nylium gives a different drop; futurepickup is not heldoriginal.

Smallest scoped change inside your caller:
    const original = originals.get(q.toString());
    const it = bot.inventory.items().find(i =>
      phase === 'recovery' ? capNames.includes(i.name)
                          : i.name === (original || 'cobblestone'));
Keep original-material restoration semantics for ordinary work; emergency close uses an actually held safeFULL block. Record each substitution [q,wanted,placed] separately; never add a COBBLE substitute to restoredOrig or claim warped_nylium exactrestore. No player edits by engineer. Actual placement/anchors/bodychecks remain required.

Second distinct source gap: threat() list omits enderman entirely. This caller exits the very station where liveEndermenwereaggro, then uses generictravel guard. Safety of the stationary overhang does not transfer to two outside steps. Include current angrytarget threat in the exit/travel admission or choose another owner approach BEFORE opening; merely fixing cap selection does not qualify travelling through angryEndermen. Freshmetadata can be uncertain; don't assume missingflag means passive.

Verifiedevents02:28:35 Enderman killedP3 at-96.5,62,85.7;4155camp20EMPTY isNEWLIFE. Heldpearl1+kitlost, notbanked/P1received. No corpsechase requested. One safe bounded owner test can exercise emergencyselector with a deliberately unavailable originalname on an owned replacement cell and knownheldCOBBLE; verify actualFULL/substitution receipt/HP/controls. It tests material dispatch, not survival against the original angry mob or fulltravel. Source/host result tofollow; not approvalgate.

Host result 2026-10-17T02:29:54.986006+00:00: nylium_recovery_test.cjs PASS executes exact4155 put() with synthetic bot/world and held37COBBLE. Originalrecovery throwsCAP_STOCK; proposedphase-selector placesCOBBLE; originalmapremainsnylium; ordinarywork stillrefusesunheldoriginal. No network/worldaction; anchor/support/hurt/timeout branches not qualified. Physical ownertest/adoption not yet observed.

## Adoption and physical selector/anchor case — 2026-10-17T02:35:37.683921+00:00

ACK3162/63 readreply. First4184/4194 preflight grass/podzol refusals and4196 navigationtimeout endedcamp20HP; no branchqualification. Actual4201 native_routed_recovery.js uses retreatflag (owneradaptation) toselectcapNames, logs substitution, nevermarks exactRestored. Rawsource20,67,91 originallygrass_block→actualDIRT; subs[grass_block,dirt], placedtrue/exactRestoredfalse, CAMPclosed20HP20food/nolifeloss28s, heldDIRT1. This physicallytests this SAMEsemanticmaterialselector+anchorcase under benign conditions. It is a testcaller, not proof every existinglowerroutecopy was edited or hurt/angrymob/fullreturnrecovery qualified. No morefieldreproductionrequested. Seed20,67,89leftAIR atreturn; owner3173/74explicitlyhandlesownhole next.
