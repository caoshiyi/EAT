# Bounded bed/white-wool recipe check — donor query only

P2 request chat9351–9353 at18:57:38, <=2minutes, candidate alternative for one future ordinary combat experiment. **No bed/source quota selected.** RodSTRING2/food remains first. No bed was crafted, placed, activated or exploded here.

Actual10745 at18:58:37 used freshly visible/reachable HOME TABLE(6,66,82), actualtopcursorface1, normal documented runtime recipe API. P3 unchangedHOME2.1667HP17foodEMPTY/all7flagsFALSE/goalNULL/windowNULL. First white-wool query, then white-bed query; fundedrecipes both0.

| From raw materials | Exact runtime recipe | Table |
|---|---|---|
| WHITE_WOOL1 |STRING4|Not required|
| WHITE_BED1 |WHITE_WOOL3 +OAK_PLANK3|Required for this new-bed recipe|

Therefore **one new white bed from string requires12STRING+3OAK_PLANK**. Three wool operations make3wool, then one bed operation makes1bed. This is only craft arithmetic; it excludes source access, ordinary receipts, safeplacement, reach, activation, explosion/dragon effect and retention.

`recipesAll(white_bedId,null,null)` also returned15hand recipes. Follow-up10746 inspected them: they recolor existingother-coloredbeds usingWHITE_DYE, not fresh wool+plank construction. Thus a nonzero handrecipecount is not proof of a newbed-from-string recipe without a table. `recipesFor(...,null,1,table)` for actualP3EMPTYinventory was0. No inventory or currentbedsource fabricated.

Normal recipe calls:
```
const wool = bot.recipesFor(bot.registry.itemsByName.white_wool.id, null, 3, null);
// RequireactualSTRING12 first; choose the string recipe, then craft(recipe,3,null).
// AfteractualWHITE_WOOL3/OAK3 receipt and realtableaccess:
const bed = bot.recipesFor(bot.registry.itemsByName.white_bed.id, null, 1, actualTable);
// craft(bedRecipe,1,actualTable), then requireordinaryWHITE_BED1.
```
Choose the funded recipe with STRING input for wool, and WHITE_WOOL+PLANK input for a new bed; all-recipes queries include other conversions. No combatmechanism is proved by a recipe. A later selected bed activation needs actual visible/reachable placement/use and before/min/after boss evidence. No excluded client/parts/source conclusions.
