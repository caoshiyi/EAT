# P4 returningPos / control-loop reply — 2026-10-17T02:02:39.233244+00:00

Initial answer to chat3110: #4062 actual caller parkour_to_ground.js clears goal/controls in timeout and finally. BUT returningPos is only seeded by pathfinder's own successful block-placement callback, and this caller sets scafoldingBlocks=[] with canOpenDoors defaultfalse. This run cannot ordinarily create a fresh placement return. A saved value from an earlier pathfinder-placement phase remains possible; its existence/history was not recorded. Do not attribute the stall to returningPos from controls{} or repeated partial paths alone.

Source-confirmed conditional: installed index.js resetPath/setGoal(null) does not clear private returningPos; monitorMovement processes LOSWhenPlacingBlocks&&returningPos before empty-path handling, and can aim/forward while goalnull. Direct manual put calls do not seed it. Existing host returning_pos_test.cjs passed with deliberately seeded return; synthetic evidence, not #4062 cause. LOSWhenPlacingBlocks=false suppresses this branch for manual/no-placement work; restoringtrue can re-arm an old return. No need to repeat the retired route.

Discriminating observation during a useful bounded owner operation: record explicit seven getControlState values, yaw, position/onGround, goal/moving/mining/building before and after a physics boundary while goalnull and no helper writing controls. Compare LOSfalse only if it fits the existing safe ending. controls{} serializes nonenumerable accessors and proves nothing. If LOSfalse stops overriding, that supports this branch; otherwise inspect other callbacks/collision. Preserve endpoint and ring8 before diagnostics; unbounded updates hid roof/ground/inventory by truncation.

Second concrete source caveat: asynchronous equip/dig/place continuations already scheduled can run after reset. In #4062 canDig=true, so equip.then(digBlock) is reachable despite disabled placement; no generation/goal guard precedes digBlock. Its execution after timeout is unobserved. stopDigging is useful but cannot prevent a later equip callback starting another dig. Check actual mining/control state before overlapping new world work. This is a narrower alternative risk, not a claim it happened.

Physical ending: #4062 NAV_BOUND then CAP_STOCK failed; #4071 separate DOWN+roof repair FULL/20HP in2s. No active-exposure claim after4071. Mounted-player physicsTick findings do not establish whether an unmounted boat captures a mob; that experiment is separate. No engineer player action or approval gate.

## Adoption caller correction — 2026-10-17T02:33:03.928352+00:00

Read ACK3160/61 then ACTUAL4181 line1:
    if(bot.pathfinder.movements)bot.pathfinder.movements.LOSWhenPlacingBlocks=false;
This writes the WRONG OBJECT. Installed monitor checks bot.pathfinder.LOSWhenPlacingBlocks, never movements.LOSWhenPlacingBlocks. Correct only that assignment:
    bot.pathfinder.LOSWhenPlacingBlocks = false;
Keep the explicit7controlgetter report (4181 allfalse observed). Actual53steps/FULL20HP31.834s succeeded, but the intended returningPos suppression was NOT adopted by that line; don't attribute success to it. No need to repeat longroute/seed a dangerousreturn just to fix assignment. Sourceobjectpathcheck is decisive; existing hosttest covers correctproperty. Originalsavedreturnexistence/cause stillunobserved.

2026-10-17T02:33:30.015622+00:00 Extended existing returning_pos_test.cjs with the demonstrated wrong-object case: movements.LOSfalse STILLsteers; correctpathfinder.LOSfalse suppresses, restoringtrue re-arms. Exact monitor/reset branches, syntheticseededreturn only. PASS; no playerworldaction.
