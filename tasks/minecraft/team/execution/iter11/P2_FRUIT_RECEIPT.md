# P2 actual5000 receipt timing — 05:09 UTC

Beneficiary: P2 current food harvest→actual bank/P3use. Imminent experiment: finish useful food ending/deposit; future remaining-bush activation only if needed. Do not repeat departure merely to test timing.

Executed5000 p2/iter11/food.js: first20,68,89 harvest logged gain3/age1; second22,68,89 gain0/age1 after fixed12ticks, throwsFRUIT_RECEIPT. SAMEprogram final inventory sweet_berries5/gain5/protectedEndtrue/20HP/food20. Fixed600ms check prematurely classified second activation as no inventory gain. Extra2 arrived later within same complete return; exact drop attribution not logged, no unique per-bush attribution claim. Source immediatecheck+ending separately preserved. This is not a0food operation.

Small correction in ACTUAL fruit caller: after activate+normalticks, if age1 but immediate gain0, await bounded ordinary-inventory delta up to~2s under existing check/health/time/recovery conditions; stop on damage. Log activation/age change separately from receipt. Do not activate again merely because inventory is delayed; already age1. If final inventory arrives after workabort, keep issue and credit actual retained food separately. Does not guarantee later receipts or require risky drop chasing.

Proposed local replacement for await ticks(12);const gain=... (owner adapts; no module required):

    await ticks(12);
    const pickupEnd = Math.min(Date.now()+2000, workEnd);
    while (count('sweet_berries')===n && Date.now()<pickupEnd && bot.health>=19.9) await ticks(2);
    const gain=count('sweet_berries')-n;

Existing age1/gain checks remain; existing catch/finally returnscamp on failure. Health threshold is caller-specific. ticks preserves life/deadline check. Required physical evidence: activation/age change, ordinary retained delta/final stock, same-life protected ending, bank/recipient receipt. No extra field test required: current5berries can fulfil beneficiary now. Status correction proposed, not yet adopted, no specialist playerprograms. STOP exposure audit: unchanged helper plus owner reducedradius/mobmotion already permitted actual field access.

05:09 RESOLVED useful operation: actual5007 chest BERRY0→5, immediate bot.inventory still5 whileGUI caused DEPOSIT_RECEIPT falseveto; actual5009 independentchest and recipientwithdraw4, freshP2berries0/P3berries4 supports deposit/handoff. Do not infer simultaneous duplicatefood/faileddeposit from stale ordinaryinventoryduringGUI. Use c.items()/windowinventory if needed, or close+boundedfreshordinaryreceipt for future caller; no reason to repeat actualhandoff. No adoption of our waitproposal seen, no causal credit.

P4 actual5197 repeatsfixed12ticksecondbush instant0/age1 failure, finalBERRY2/currentfrontretained;5205 actuallyconsumes2/food17→20/healing11.367HP. Notzerofood/notsparegift. Priorproposal NOTadopted inP4caller. For P4 nextchosenfoodoperation adapt whileguard to its actual injuredhealth policy: capture hpBefore immediatelybeforeactivate and continueboundedwait onlywhile bot.health>=hpBefore-.1 (oractualownerhurtpolicy). Do NOTcopy P2's health>=19.9 threshold into9.8HP body: that skipswaiting. Keep2s/workdeadline bound and existinglifecheck/return; no reactivationafterage1. Currentretainedfoodusefulfilled, no extra fieldtest required.
