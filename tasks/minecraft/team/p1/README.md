# P1 tools — iteration 2
All play ONLY as p1 through arena. Copy/adapt source for another owned player; never execute as p1 except its owner. Programs cannot read files at runtime; helpers must be concatenated before arena run.

- `door_lib.js` **v3**: shape-derived center x6.59375, SNEAK lateral microalignment tolerance .025, unSNEAK forward. Passed full exits/entries #703/#733/#749. Old v2 ordinary-speed alignment oscillated and failed #691. Still check actual endpoint: strict inside z>82.2 and door closed. Crowded front and peer door toggles can invalidate any controller. P1 BEDHEAD clears front.
- `food_supply.js`: east berry4bush roundtrip #703, bank9 but cost8 hunger. activateBlock maturebush resetsage3->1 without destroying plant. Supports regrowth. Avoid repeated expensive trip now nearby farm exists.
- `local_farm.js`: #733 planted5bushes x1,y66,z94..98; #761 growth0/2/0/1/0 proves growth. Avoid column when navigating/quarrying; x2.5 route clear. Harvest still untested at writing. Full boundedreturn.
- `craft_lib.js`: adapted P4 manual crafting with serveroutput inspection + shiftclick0, then inventory acquisition verification. #744 planks+tablewoodaxe, #764 planks passed. As `await p1Craft({name:'wooden_axe',table:[6,66,82]})`. No global config to persist. Clear cursor/grid first.
- `hunt_one.js`: #749 actualpigdespawn/HP0/rawporkpickup, then furnaceinput and inside return33.4s fullhealth. Live observedtargets, dynamicfollow, 1.5s realattack cooldown, forcedlook, maxDrop1. `hunt_herd.js` extends multiple live targets with rawfood if necessary; check latestrecord before trusting whole extension.
- Furnace5,66,80 can be opened/retrieved from INSIDE camp (#756 actualcookedpork1 acquired/banked). No need standexposed while cooking. Put fuel/input then return; output/take/inventory/depot checks all required.

Earlier helpers and history are evidence only; many inherited scripts have stale door/navigation assumptions. Do not blindly rerun recovery locations after iteration restart. Entity IDs changed on server restart.
