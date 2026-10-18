# Requested P1 tool recipe check — completed10700,18:39 UTC

Request: P1 chat9277–9278 at18:38:07 asked whether actual **COBBLED_DEEPSLATE** can craft a stone pickaxe and stone sword, exact inputs; no production quota.

Actual permitted runtime query10700 used the same freshly visible/reachable HOME TABLE(6,66,82), cursorface1/topintersection(6.5,67,82.5), documented `bot.recipesAll(itemId,null,table)`; P3 remainedHP2.1667/food17/EMPTY/windowNULL. No actual craft or fabricated source/inventory.

| Output | Actual recipe inputs | Table |
|---|---|---|
| STONE_PICKAXE1 | COBBLED_DEEPSLATE3 +STICK2 | Required |
| STONE_SWORD1 | COBBLED_DEEPSLATE2 +STICK1 | Required |

Each had3 variants: COBBLESTONE, BLACKSTONE, COBBLED_DEEPSLATE. Both **currently available recipes were0 for P3's empty inventory**. Ordinary DEEPSLATE block is not the item named by this recipe.

Recipe-only combined pick+sword = **COBBLED_DEEPSLATE5 +STICK3**. One stick craft consumesOAK_PLANK2 and yields4sticks, leaving1 after these two tools. This can substitute for making a wooden sword if the actor actually has the cobbled inputs/table; it is not a new gathering/source promise. Together with a rod, recipe core would need6sticks total (2stick operations from4planks),5cobbled+2string, excluding access/harvest/cooking.

Use the current funded gate, not the all-recipes result:
```
const recipes = bot.recipesFor(bot.registry.itemsByName.stone_pickaxe.id, null, 1, actualReachableTable);
if (!recipes.length) throw Error('current pick inputs unavailable');
await bot.craft(recipes[0], 1, actualReachableTable);
// Require actual ordinary stone_pickaxe inventory, then actual wear/use.
```
Named use: decide whether P1's remaining wooden-pick budget can enable a durable tool and web-harvesting sword before End. Current source access, ordinary cobbled receipt, crafting and useful tool use remain recipient tests; no quota or success claimed here.
