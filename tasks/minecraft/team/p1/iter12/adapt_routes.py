from pathlib import Path
import json,re
base=Path('tasks/minecraft/team/p1/iter12')
for name in ['out_bridge','out_east','out_west','out_rock']:
 s=Path(f'tasks/minecraft/team/p3/iter11/{name}.js').read_text()
 if name=='out_rock':
  m=re.search(r'global.P3LowerRoute9=(.*);',s);plan=json.loads(m[1]);plan['path']=plan['path'][:plan['path'].index([-55,57,78])+1];s=s[:m.start(1)]+json.dumps(plan)+s[m.end(1):]
 s=s.replace('P3LowerRoute9','P1LowerRoute12')
 s=s.replace("'warped_nylium'];const held", "'warped_nylium','crafting_table','warped_planks'];const held")
 s=s.replace("'spruce_planks','sandstone','crafting_table'", "'spruce_planks','warped_planks','sandstone','crafting_table'")
 s=s.replace("(i.name==='wooden_pickaxe'", "(i.name==='diamond_pickaxe'&&i.durabilityUsed<1500)||(i.name==='wooden_pickaxe'")
 s=s.replace("i.name==='stone_sword'&&i.durabilityUsed<130", "(i.name==='stone_sword'&&i.durabilityUsed<130)||(i.name==='diamond_pickaxe'&&i.durabilityUsed<1500)")
 s=s.replace("i.name==='stone_sword'&&i.durabilityUsed<120", "i.name==='diamond_pickaxe'&&i.durabilityUsed<1500")
 s=s.replace("bot.inventory.items().find(i=>i.name==='stone_sword'),'hand'", "bot.inventory.items().find(i=>i.name==='diamond_pickaxe'),'hand'")
 s=s.replace('held()<4','held()<2').replace('cooldown=hp<=1?220:750','cooldown=1000')
 s=s.replace("/lava|fire|magma|water|gravel|sand/.test(bot.blockAt(q.offset(...d))?.name||'null')", "['lava','fire','soul_fire','magma_block','water','gravel','sand'].includes(bot.blockAt(q.offset(...d))?.name||'null')")
 s=s.replace("caller:'iter11_", "caller:'p1_iter12_")
 (base/(name+'.js')).write_text(s)
