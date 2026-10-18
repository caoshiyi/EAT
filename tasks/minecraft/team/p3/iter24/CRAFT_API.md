# P3 bounded craft-API delivery for P1 rod/cod operation

P2 requested<=3min at18:25:08, for actualP1 localfishing preparation. Completed probes **10660** (rod first) and **10662** (physicaltable open/close + bundle). Source: installed Mineflayer docs `api.md` lines1654/1668/2068/2215 and runtime registry/recipe API. No external recipes/client source or fabricated inventory. No material-gathering queue.

## Actual tested table access
P3 HOME(6.5,67,82.5), HP2.1667/food17/EMPTY. ExistingTABLE(6,66,82) actualcursorface1 intersection(6.5,67,82.50000000) within1.62m. Normal `await bot.openBlock(table)` returned window1 **minecraft:crafting**; `await bot.closeWindow(w)` returned, `bot.currentWindow===null` TRUE. No crafting/input changes, health/inventory unchanged. A table Block in `recipesAll` is not proof that a remote actor can use it; P1 must establish its own actual visible/reachable table.

## Correct documented signatures / tested distinction
```
// Enumerate recipes even without materials. THREE arguments, no minResultCount.
const all = bot.recipesAll(bot.registry.itemsByName.fishing_rod.id, null, tableBlock);
// Filter recipes available from ACTUAL current inventory. FOUR arguments.
const available = bot.recipesFor(bot.registry.itemsByName.fishing_rod.id, null, 1, tableBlock);
if (!available.length) throw Error('rod materials unavailable');
const before = bot.inventory.items().map(i => [i.name, i.count]);
await bot.craft(available[0], 1, tableBlock); // 1 = recipe operations
// Require actual rod in ordinary inventory, then close any open crafting window.
```
P3 rod `recipesAll(...,null)` with no table =>0; with realTABLE =>1 recipe/requiresTableTRUE; `recipesFor` actualEMPTYinventory =>0. This is a successful API/access test, **not an actual crafted rod**. `bot.craft(recipe,count,table)` count is operations: stick recipe count2 makes8sticks, not2sticks.

## Runtime-enumerated ingredient counts (10662)
| Output | Inputs for ONE operation | Output count | Table |
|---|---|---:|---|
| Fishing rod | STICK3 +STRING2 |1| Required |
| Wooden sword (oak variant) |OAK_PLANK2 +STICK1|1| Required |
| Stick (oak variant) |OAK_PLANK2|4| Not required |
| Furnace |COBBLESTONE8 **or** BLACKSTONE8 **or** COBBLED_DEEPSLATE8|1| Required |
| Bow |STICK3 +STRING3|1| Required |

**BASALT, NETHERRACK, MOSSY_STONE_BRICKS and BOOKS were not furnace inputs in the runtime recipes.** Do not count P1's BASALT stock as BLACKSTONE. No current available recipe/material/supply claimed for P1.

Small recipe-only bundle, if P1 harvests actual materials: **OAK_PLANK4** ->1 stick operation (4sticks), then sword consumes2planks+1stick, rod consumes remaining3sticks+2STRING. Total sword+rod =4planks+2string with visible table. This excludes source access/string harvesting/furnace/fuel/cooking/health retention. Existing furnace access from P4 may avoid new8stone quota; choose actual world before crafting one.

Optional sword+rod+bow recipe-only bundle =6OAK_PLANK +5STRING:2stick operations->8sticks, sword1/rod3/bow3 use7;1stick remains. No arrows available or promised. This is not a new bow/stock quota.

Adoption criterion: P1 actual available recipe ->ordinary craftedrod ->realcatch/fooduse. P3 query/open/close alone is donor evidence, not completed useful adoption. Await recipient craft/use record; original foodcourier failure remains unchanged.

### Fresh recipient-world supersession,18:32
P1 current10667 scan, independently read by P2 at18:32:00, has TABLE(140,-36,2232) and(166,-34,2234); old TABLE(149,-36,2232) is absent in the loaded scan. Present FURNACE(165,-39,2258), unlit, and WATER(166/167,-41,2257). Presence is not reach/fuel/access. Thus **do not turn the furnace recipe variants above into an8-input gathering quota** while the existing furnace may be usable. P4 owns fishing access leads. Current wood source observation:148/149,-32,z2235..37; surviving webs166,-38,2224 etc. Historical consumed-source coordinates are not replenished stock. Recipient inventory18:32 contains OAK_PLANK1 only; actualrod craft/use remains pending.
