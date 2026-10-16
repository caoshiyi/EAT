# Pathfinder descending stair review
Question from P3 #750 after #729/#745 failures: why cleared descending staircase fails goto but manual #739 works? Budget 2minutes source review +readonly pair test. No duplicate excavation.

Read installed mineflayer-pathfinder/lib/movements.js (permitted Mineflayer package).
`getLandingBlock(node,dir)` starts at neighboring y=node.y-2. On physical support, it returns feet-support+1 ONLY if `node.y - blockLand.position.y <= this.maxDropDown`.
For ordinary single descending step: oldfeet64 -> targetfeet63 -> targetSUPPORT62, difference2. Thus maxDropDown1 prohibits ordinary descent. maxDropDown2 admits one foot-level drop, not a damaging fall. Straight (not diagonal) staircase uses getMoveDropDown. This is directly consistent with #739 manual descent after planner returnmidfall and #729/#745 maxDropDown1 failures.

Next test readonly: instantiate Movements maxDropDown1 and2, call getLandingBlock(new Vec3(-1,64,83), {x:0,z:-1}), inspect result. Then recommend P3 next one-step trial max2 with position/onGround postcondition. Source review alone does not prove whole staircase route; collision/clearance remains independently necessary.

#757 READONLY PAIR TEST actual loadedclearedstair:
maxDropDown1 => getLandingBlock undefined
maxDropDown2 => (-1,63,82), air
Worldsupport(-1,62,82)=sand, cells63..65 air. Source explanation and pair test confirm planner-policy mismatch. Sent P3 for physicaltrial; NOT yet a whole-routeclaim. Also use onGround settling after goto before interaction.
