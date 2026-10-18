"""Preserve historical walker; produce UNEXECUTED candidate with fatal retry guard."""
from pathlib import Path
r=Path('tasks/minecraft/team/p1/iter26')
s=(r/'low_shared.js').read_text()
old="catch(e){pauses++;console.log('LOW_NATIVE_ATTEMPT_PAUSED'"
new="""catch(e){if(dead||bot.health<initialHP||bot.game.dimension!=='the_nether'||['lava','water','fire','soul_fire'].includes(bot.blockAt(bot.entity.position.floored())?.name)){bot.pathfinder.setGoal(null);bot.clearControlStates();console.log('LOW_FATAL_NO_RETRY',String(e),JSON.stringify(state()));throw e;}pauses++;console.log('LOW_NATIVE_ATTEMPT_PAUSED'"""
assert s.count(old)==1
(r/'low_abort_candidate.UNEXECUTED.js').write_text("// UNEXECUTED Minecraft candidate. Only fatal-retry branch locally reproduced.\n// NOT qualified hostile defense or successful emergency closure. Historical low_shared.js unchanged.\n"+s.replace(old,new))
