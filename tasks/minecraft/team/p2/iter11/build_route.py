from pathlib import Path
p=Path('tasks/minecraft/team/p2/iter11');s=Path('tasks/minecraft/team/p2/iter10/forward_safe_historical_source.js').read_text()
s=s.replace("['blaze','skeleton'].includes(e.name)", "['blaze','skeleton'].includes(e.name)")
s=s.replace("const r=e.name==='ghast'?64:", "const r=['ghast','blaze'].includes(e.name)?64:")
s=s.replace('Math.min(path.length-1,startIndex+200)', 'Math.min(905,startIndex+200)')
s=s.replace("for(let j=Math.min(905,startIndex+200);j>startIndex;j--)if", "for(let j=Math.min(905,startIndex+200);j>startIndex;j--)if")
# Special buried destination chosen only when actual loaded native enclosure qualifies.
s=s.replace("if(endIndex<0)throw Error('NO_LOADED_CLOSED_END');bot.chat", "if(startIndex>=870&&canBury(path[905])&&stock()>=1)endIndex=905;if(endIndex<0)throw Error('NO_LOADED_CLOSED_END');bot.chat")
s=s.replace("await pod(path[currentIndex],currentIndex);closed=true;", "if(currentIndex===905&&canBury(path[905]))await bury(path[905],905);else await pod(path[currentIndex],currentIndex);closed=true;")
s=s.replace("const it=bot.inventory.items().find(i=>i.name==='stone_pickaxe'&&i.durabilityUsed<128)||bot.inventory.items().find(i=>i.name==='wooden_pickaxe'&&i.durabilityUsed<55);", "const it=bot.inventory.items().find(i=>i.name==='stone_pickaxe'&&i.durabilityUsed<128)||bot.inventory.items().find(i=>i.name==='wooden_pickaxe'&&i.durabilityUsed<55);")
s=s.replace("else await bot.equip(bot.inventory.items().find(i=>i.name==='wooden_pickaxe'),'hand');", "else await bot.equip(bot.inventory.items().find(i=>i.name==='stone_pickaxe'&&i.durabilityUsed<125)||bot.inventory.items().find(i=>i.name==='wooden_pickaxe'),'hand');")
# Keep the same physical source safeguards; retire open eastern bridge by limiting all route plans.
s='// iteration11 MAX905; Blaze64m; actual905 buried ending when qualified.\n'+s
p.joinpath('route.js').write_text(s)
print('BUILT',len(s))
