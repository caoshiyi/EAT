# P1 bank smoke false donor-count check — initial answer 10:12 UTC

Owner **P1 donor**, next operation one-block smoke→bulk protected packet deposit; recipients P2/P3/P4. Suspected defect now source-supported: selected bank_smoke reads donor counts from **bot.inventory** while a chest window is open, although transfers update the open window's inventory region.

**Actual6587** 10:10:49/2.8s: correctphysicalCHEST ray/reach2.293m, BANKbasalt0→1/cursornull, own0=54/own1=54 from bot.inventory whileopen →TRANSFER_RECEIPT error; finallyclosed/FULL20HP. No proof item was duplicated, lost, or not transferred. Need currentfreshreopen before resending. Source count's namespace is wrong during that check.

**Installed call path:** `mineflayer/lib/plugins/inventory.js` set_slot handler784 chooses window0→bot.inventory, otherwise→bot.currentWindow. Transfers operate on the chosen open window. `closeWindow`433 calls `copyInventory(window)`446 to copy that window's inventory region back into bot.inventory. Therefore bot.inventory can legitimately remain54 inside the chest transaction while c.items() shows53. This explains the selected smoke's contradictory read **without claiming every previous transfer error has this exact cause**. It is more specific than a generic packet-delay guess.

Small correction, owner adapts chosen caller:
```js
const sum = (xs,name) => xs.filter(i=>i?.name===name).reduce((s,i)=>s+i.count,0);
const ownBefore = sum(c.items(),'basalt');
const bankBefore = sum(c.containerItems(),'basalt');
await c.deposit(bot.registry.itemsByName.basalt.id,null,1);
// bounded sync/settle using the owner's already qualified window strategy
const ownAfter = sum(c.items(),'basalt');
const bankAfter = sum(c.containerItems(),'basalt');
// Verify exact delta1 on BOTH regions, cursorNULL; then close/reopen fresh.
```

Alternative: close first, inspect actual bot.inventory, then reopen bank and compare before/after, preserving same life/body and excluding concurrent withdrawals. Don't merge separate windows' counts without timestamps. Same-window model receipt plus fresh reopen/recipient independent read is strongest. Tool wear for the two swords/pick requires exact identity, not only aggregate same-name counts.

Required physical adoption evidence: freshbankbasalt1 after6587 if actuallyretained +donorcurrentcount, corrected donor-regiondelta on one small transfer (or current fresh reconciliation settles the smoke), then totalBASALTpacket accounting including the smoke1. Do not repeat a block merely because the wrapper returned TRANSFER_RECEIPT. Bulk packet accepted only after current depositedcounts/wear/recipientusableadoption/eachbodyending. No specialist player program, package edit, or approval gate.

API correction10:12: initialdraft briefly used nonexistent inventoryItems(); installedWindow414–415 API is **c.items()** (inventoryregion). Correctedbeforeanyknownadoption; no physicaltest/adoptionclaimed. Exactsourceverified, notguessingAPI.

10:16 actualfixcomparison:6588changed15tickpre-openSETTLE anddonorcountREGIONtogether. PhysicalPASSdoesnotisolatenamespacevs latewallpickups; bothcanmatter. Sourcefactsupportsusingcurrentwindowregion, butnoexclusivecauseclaimfor6587. Receipt/adoptionaccepted, noredundanttestneeded.
