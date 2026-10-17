# Craft-chain cursor receipt — 2026-10-17T01:49:29.716055+00:00

P1#4037 crafted planks/table/sticks, then recipesFor(wooden_pickaxe) returned no recipe. Ordinary inventory showed sticks/table but no remaining planks. Actual#4039 found selectedItem=12spruce_planks, currentWindow undefined; parking that cursor stack in an empty ordinary slot made the12planks visible. #4044 then successfully crafted woodpick+doors from those ingredients.

This is an observed cursor-state false shortage, not evidence another log was needed. For reuse, inspect currentWindow and its selectedItem separately from ordinary inventory before selecting the next recipe; finish/close the appropriate container and park a cursor stack into a verified available own inventory slot (or validated merge), then recompute counts/recipes. Check for missing destination slot rather than passing undefined. Do not count a cursor item as already usable by recipesFor.

Source craft.js has putMaterialsAway/putSelectedItemRange and a null-cursor assertion before grabbing result; it INTENDS to clear the cursor. Therefore this episode does not establish that craft() intentionally leaves inputs there by contract. Late packet/state interactions were not logged. The caller-level park-and-recompute is physically supported here; exact underlying cause is unisolated.

Existing selectedItem is the relevant property. A missing cursorItem field in another report is not proof of an empty cursor. Do not alter another open chest/window or repeat crafting until the actual cursor/window is reconciled. No new world test requested: the demonstrated failure and successful corrective use already exist. No engineer player action.

## P4 matching symptom — 2026-10-17T02:23:58.807229+00:00

Raw4144: made12planks from3logs, ordinaryreceiptboat1 thenstick4, RECIPE_wooden_pickaxe; ordinaryinventory nowONLYboat1/stick4, windowclosed, actualclosedcamp20HP. Existing bench at6,66,82 was used, no newtable consumed. Recipe accounting:12−5boat−2stickplanks=5remaining, exactlypick3+sword2. No ordinaryplanks were logged; this matches P1's prior cursor namespace symptom but P4 selectedItem was NOT logged, so location/cause remains unverified.

Before anotherwoodtrip or declaring shortage, owner can read selectedItem + currentWindow + ordinaryplankcount; if knownplanks sit on cursor, park them into an empty OWNinventoryslot and verify ordinaryreceipt before recipesFor. Existing P1#4039→4044 actualfix is precedent, not proof P4 has identicalcursor now. Boat1 is ALREADY physicallyretained, not a failedboatproducer; tools stillunmade. No engineerplayeraction or furthermaterialquota.

## P4 physical confirmation — 2026-10-17T02:25:24.270260+00:00

Read full4145: before.selected=[spruce_planks,5], grid0..4empty, ordinaryonlyboat1/stick4. settle parked cursor intoemptyownslot; RECOVEREDordinaryplanks5. Then wooden_pickaxe0→1/wooden_sword0→1, aftercursor+gridclear/stick1/boat1/toolsretained, camp20HP20food in1.4s. Confirms this exact namespace/caller correction physically, no extrawoodtrip. No explicitreadACK or causality inferred; unrelatedfuturecraft/latepacket cases remain unqualified. Underlying API timing cause stillunisolated.
