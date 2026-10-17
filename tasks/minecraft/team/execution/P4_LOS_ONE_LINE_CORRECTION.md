# One-line source correction, not a travel gate — 2026-10-17T02:47:56.901593+00:00

If intending to suppress installed pathfinder's saved placement-return branch:
    bot.pathfinder.LOSWhenPlacingBlocks = false;

Actual4181/4219/4233 wrote movements.LOSWhenPlacingBlocks, which installed monitor does not read. Correcting that object's property requires no long world test or new kit. returning_pos_test.cjs already PASSes exactbranch: wrongobjectstillsteers, correctpropertysuppresses; oldsavedreturnexistence/historyunobserved. Do not attribute priorworldfailures or newroutepasses to this flag.

Explicit7getControlState reporting was adopted in someP4callers, but latest4288 reportscontrols{}again; it cannotproveallfalse. This is a copy-specific reportingregression, not proof activecontrols. No playerprogram orsourcefileedit by engineer.
