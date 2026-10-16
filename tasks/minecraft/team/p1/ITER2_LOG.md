# P1 current state — iteration 2
Own p1 only; read full program.md. Every shell cd $EAT_ROOT; python3 only. Only edit P1.md and p1/. No server/.work access. No peer control. Victory only evaluator dragon=1.

## Current objective
Supply food while p3 owns iron/portal restoration, p2/p4 safety. `p1/food_supply.js` ACTIVE (140s tool cap, route/harvest individually bounded) after observation #682. Check program endpoint immediately. Accept ONLY actual berries in depot and p1 inside closed doors; navigation promises insufficient.

## Verified start #682
p1 (6.3,67.5625,83.643), health20 food17 inventory sticks4, day6 time421. Depot flint2/gravel1/coal1/dirt3/torches2 and miscellaneous; NO food, no wood. East hatch (8,67/68,83) AIR, roof69DIRT. Zombies at x8.3..9.5,z83: IDs changed on iteration restart to102/103/104/106 (old entity IDs invalid). Peers informed food role by chat. p3 current status woodaxe only; p4 woodaxe+woodpick+3planks+2sticks; no iron kit yet.

## Active food method
Copied verified door_lib.js; bounded8m GoalXZ legs, maxDrop1, utility/camp break protection, no scaffolding. Mature berries age>=2 within14 at east patch83,75: activateBlock then inspect age change and actual pickup. Full return/deposit in finally; death listener aborts obsolete route. First test of activate harvest (old method dug bush). Check effect before trusting. Limits field harvest65s from start, route35s out/40s return,140s external.

## Existing world/dependencies
Portal8/10, tops x6/7,y71,z91 missing at last verified scan. p3 owns. Kit lost lava iteration1; must rebuild bucket/steel via safe stone->iron. Avoid capture deck/lava unarmed. Camp chest7,67,82 table6,66,82 furnace5,66,80 bedfoot6,67,83/head7,67,83. All bedbound. North door6,67,81; require z>82.2 inside and closed door. East hole currently invalidates full enclosure until patched.

## Memory references
Prior state/details archived p1/HISTORY_START_ITER2.md, HISTORY_TO_0640.md, HISTORY.md. Treat journals as hypotheses; arena world authoritative. Normal returns preserve controls; explicit clear needed on dry land. setGoal(null), clear, wait4 before manual input. p1Door strict entry shape alignment tested previously but fresh endpoint still required. Never idle outside during reasoning. Mineflayer goto can resolve noPath: actual position is evidence.

## 10:36 update
FAILED #691: old door helper exit remained(6.726,67,82.3); no harvest attempted, FOOD_BANK empty. Finally entry restored(6.687,67.5625,82.725),health20food17. Changed test lateral alignment uses SNEAK and .025 tolerance up to40ticks, prints actual x. Retry #703 ACTIVE: status8.4s ACTUAL(29.4,69,78.5),health20food17, so exit/travel passed. Need actual return and food. Say command while program running refused (cannot chat concurrently); no coordination message sent by that attempt. P2 head patch8,68,83DIRT reported #689.

## Verified food / active farm
#703 VERIFIED fullroundtrip55.1s: preciseSNEAK alignment6.5688 exited; 4bushes81/91/92,z72/73/79 age3->1 afteractivation; bank9berries; inside6.619,67.5625,83.105 health20food12. No death. #721 consumed4berries with6tick equip/consume settle ->food20, remaining5depot; eastwall67/68/69 ALLDIRT independently observed. #730 movedbedhead7.27,83.7 tofreefront, westnearsoil allSAND. #731 founddirtx1,y65,z94..98 ~12m southwestquarry. #733 ACTIVE local_farm.js: take5seeds, boundedexit/travel/plantx1,y66,z94..98/return. Inspectblock+age evidence before announcing farm. Warned peers avoidbushcolumn (routex2.5clear).
P4 #723 cobble3+woodpick bankverified, P3 actuallyreceivedinventory perstatus #735; p3craftstonepick ownsiron. P2 woodtrip ownswood. Next P1 usefulwork food/surplus or farmexpansion; no portalgeometry changes.

## 10:40 verified / active
#733 VERIFIED5bushes x1,y66,z94..98 allage0, returned32.6s inside6.532,67.5625,82.798 HP20food20. Growth/harvest stillunproven. #744 manualcraft fromP4adaptedhelper:1log->4planks->woodaxe (actualinventory), sticks2/plank1left. Current #hunt_one ACTIVE120scap: livepig id100 at49.77,69,99.74, bounded25sapproach/15scombat/35sreturn, dynamicfollow actualHPchange+loot; take1coalforcook, leave1coalP3 anddepositplank1. Ifreturnworks then furnaceinput/out actualobservations stillneeded. Deathabortsactionsequence. Ownhunt_one.js storesfullscript. Farm andhunt alternative address8hunger-cost old80mberrytrip.

## 10:42 evidence / active HERD hunt
#749 VERIFIED33.4s roundtrip: actualpig100despawn+HP0+rawpork1 pickup, furnaceinputpork1coal1, inside6.618,67,82.60 health20food18. #756 fromINSIDE openFurnace worked, retrievedactualcookedpork1 andBANKED (coal1remains). ReservedporkforP3 bychat; receiptunverified.
#761 farmgrowthactualages0/2/0/1/0 at94..98; plantedcropcanGROW. Only harvestunproven. Tooklastlog1for4plankcookfuel #764 VERIFIED. Coal1leftforP3iron. #hunt_herd ACTIVE180sbound: dynamicpig138/139/140/141 near115..129,66,139..147; day7101 beforedeparture. 45sout,40shunt max5kills,50sreturn; eatrawiffood<12 andavailable, retreathealth14/hostiles7m. Finallycooklootwith4ownplanks andinsidecloseddoor. Inspectactualendpoint ASAP. Need harvestedloot/cookedbankevidence; noneassumed. Updated own door_lib.js v3 SNEAK method (threecompletedtrips) forpeerreuse.
