"""Generate bounded return callers from the qualified forward route declarations."""
from pathlib import Path
import json, re
root = Path(__file__).parent
base = (root / 'out_bridge.js').read_text()
for source, name in [('out_rock','return_rock'),('out_west','return_west'),('out_east','return_east'),('out_bridge','return_bridge'),('out_south','return_south'),('home_to_south','return_home')]:
    text = (root / (source+'.js')).read_text()
    plan = json.loads(re.search(r'global.P3LowerRoute9=(\{.*?\});',text)[1])
    whole = [plan['origin']] + plan['path']
    plan = {'origin':whole[-1], 'path':list(reversed(whole[:-1]))}
    s = re.sub(r'global.P3LowerRoute9=\{.*?\};','global.P3LowerRoute9='+json.dumps(plan)+';',base,count=1)
    s = re.sub(r'const endpoint=V\(\[.*?\]\);','const endpoint=V('+json.dumps(plan['path'][-1])+');',s,count=1)
    s = s.replace("caller:'iter12_out_bridge'", "caller:'iter12_"+name+"'")
    if name=='return_south':
        s=s.replace('!f(bot.blockAt(endpoint.offset(0,2,0)))||held()<6',"(!f(bot.blockAt(endpoint.offset(0,2,0)))&&!(bot.blockAt(endpoint.offset(0,2,0))?.name==='air'&&f(bot.blockAt(endpoint.offset(1,2,0)))))||held()<6")
    if name=='return_east':
        s=s.replace('walked.push(a);', "walked.push(a);if(a[0]===-19&&a[1]===65&&a[2]===48){await tick(8);await put(new Vec3(-20,65,48));await put(new Vec3(-20,66,48));if(![65,66].every(y=>bot.blockAt(new Vec3(-20,y,48))?.name==='basalt'))throw Error('WEST_EXACT_RECAP');console.log('WEST_EXACT_BASALT2_RELEASED');}")
    if name=='return_home':
        s=s.replace("phase='recovery';closed=await close(bot.entity.position.floored());}","phase='recovery';closed=await close(bot.entity.position.floored());await put(new Vec3(1,67,5));if([65,66,67].map(y=>bot.blockAt(new Vec3(1,y,5))?.name).join(',')!=='blackstone,crafting_table,basalt')throw Error('SOUTH_EXACT_TYPES');}",1)
    (root/(name+'.js')).write_text(s)
    print(name,plan['origin'],'->',plan['path'][-1],len(plan['path']))
