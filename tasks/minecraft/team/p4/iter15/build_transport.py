from pathlib import Path
import json,re
base=Path('tasks/minecraft/team/p4/iter14');out=Path('tasks/minecraft/team/p4/iter15/transport')
names=['home_to_south','out_south_whole','out_bridge_whole','out_east_whole','buried_down3','buried_west_unit','buried_west8','buried_south10','shaft_down','low_dest','destination_portal']
capadd="'nether_bricks','cobbled_deepslate','stone_bricks','mossy_stone_bricks','cracked_stone_bricks','tuff',"
header=r'''// Current iteration15; stage controller adapted from P4 actual prior traversal. Owner executes only own player.
const p4Started=Date.now(),p4Body=bot.entity,p4HP=bot.health,p4Dim=bot.game.dimension,p4CountRod=()=>bot.inventory.items().filter(i=>i.name==='blaze_rod').reduce((n,i)=>n+i.count,0),p4RodBefore=p4CountRod();let p4Hands=[],p4Recovery=false;
const P4Vec=require('vec3').Vec3,p4Full=q=>{const b=bot.blockAt(q);return b&&!/lava|water|fire|magma|gravel|^sand$/.test(b.name)&&b.shapes?.some(s=>s.join(',')==='0,0,0,1,1,1')},p4Caps=()=>bot.inventory.items().filter(i=>['nether_bricks','netherrack','basalt','blackstone','cobblestone','cobbled_deepslate','stone_bricks','mossy_stone_bricks','cracked_stone_bricks','tuff','sandstone','dirt','granite','andesite','diorite'].includes(i.name)).reduce((n,i)=>n+i.count,0),p4Face=q=>[[0,-1,0],[0,2,0],[1,0,0],[1,1,0],[-1,0,0],[-1,1,0],[0,0,1],[0,1,1],[0,0,-1],[0,1,-1]].map(a=>q.offset(...a));
const p4Native=q=>{const b=bot.blockAt(q);return p4Full(q)&&['nether_bricks','netherrack','basalt','blackstone','cobblestone','cobbled_deepslate','stone','deepslate','tuff','sandstone','granite','diorite','andesite','stone_bricks','mossy_stone_bricks','cracked_stone_bricks'].includes(b.name)};
const p4ColumnStart=bot.entity.position.floored().clone();
function p4Outer(cells){const body=new Set(cells.flatMap(q=>[q.toArray().join(','),q.offset(0,1,0).toArray().join(',')]));return cells.every(q=>p4Face(q).filter(f=>!body.has(f.toArray().join(','))).every(p4Native))}
async function p4HandGuard(q,b){if(bot.entity!==p4Body||bot.game.dimension!==p4Dim||bot.health<=0||(!p4Recovery&&bot.health<p4HP))throw Error('HAND_BODY_DAMAGE');const here=bot.entity.position.floored(),next=q.y<here.y?q.clone():new P4Vec(q.x,here.y,q.z);let cells=[here,next];if(P4_IS_SHAFT&&next.x===p4ColumnStart.x&&next.z===p4ColumnStart.z&&next.y<=here.y)cells=Array.from({length:p4ColumnStart.y-next.y+1},(_,i)=>new P4Vec(next.x,next.y+i,next.z));if(!p4Outer(cells))throw Error('HAND_REQUIRES_CLOSED_NATIVE_UNION');const reserve=next.y<here.y?1:2;if(p4Caps()<reserve)throw Error('HAND_ENDING_RESERVE_'+reserve);if(!b||!p4Native(q))throw Error('HAND_NATIVE_FLOOR_OR_CAP_ONLY');await bot.unequip('hand');await bot.waitForTicks(4);if(bot.heldItem)throw Error('HAND_ACK');const price=bot.digTime(b);if(!Number.isFinite(price)||Date.now()+price>p4Started+P4_HAND_END_MS)throw Error('HAND_WHOLE_TIME_PRICE');p4Hands.push({q:q.toArray(),name:b.name,priceMs:price,harvest:false,lossExpected:true});}
'''
manifest=[]
for i,name in enumerate(names,1):
 s=(base/(name+'.js')).read_text().replace('1792242848000','1792250260000').replace('bot.health<18','bot.health<7||(!recovering&&bot.health<p4HP)' if name=='low_dest' else 'bot.health<7||(!p4Recovery&&bot.health<p4HP)')
 # The low corridor's original caller has no recovering local; wrapper supplies it.
 if name=='low_dest':s=s.replace('(!recovering&&bot.health<p4HP)','bot.health<p4HP')
 s=s.replace("||health<18||!bot.inventory.items().some(i=>i.name==='wooden_sword'&&i.durabilityUsed<55)","||health<7")
 s=s.replace("await bot.equip(bot.inventory.items().find(i=>i.name==='wooden_sword'),'hand');await tick(14);","")
 s='\n'.join(line for line in s.splitlines() if not line.startswith('async function oldEngageNearby()'))+'\n'
 s=s.replace("const capNames=[","const capNames=["+capadd).replace("['basalt','blackstone','granite'","["+capadd+"'basalt','blackstone','granite'")
 s=s.replace("const solidNames=[","const solidNames=["+capadd)
 s=s.replace("const stock=()=>bot.inventory.items().find(i=>[","const stock=()=>bot.inventory.items().find(i=>["+capadd)
 # Existing road hand branch now requires actual closed native union and stock for ending.
 s=s.replace("if(!pick){await bot.unequip('hand');await bot.dig(b,true);", "if(!pick){await p4HandGuard(q,b);await bot.dig(b,true);")
 # Scoped buried descent/heading fallback; destructive hand loss never counted as harvest.
 s=s.replace("if(!pick)throw Error('PICK_RESERVE');", "if(!pick){await p4HandGuard(q,b);if(Date.now()+bot.digTime(b)>hardEnd-8000)throw Error('HAND_CUT_BOUND');await bot.dig(b,true);await tick(2);if(!air(q))throw Error('HAND_CUT_ACK');cuts++;return;}")
 s=s.replace("async function cut(q){check();const b=bot.blockAt(q);", "async function cut(q){check();if(air(q))return;const b=bot.blockAt(q);")
 s=s.replace("||bot.inventory.items().find(i=>i.name==='netherrack')","||bot.inventory.items().find(i=>i.name==='netherrack')||bot.inventory.items().find(i=>i.name==='nether_bricks')||bot.inventory.items().find(i=>['stone_bricks','mossy_stone_bricks','cracked_stone_bricks','tuff','blackstone'].includes(i.name))")
 s=s.replace("finally{stop();let closed=false;","finally{p4Recovery=true;stop();let closed=false;")
 s=s.replace("finally{bot.clearControlStates();try{","finally{p4Recovery=true;bot.clearControlStates();try{")
 s=s.replace("await bot.equip(P4pick(),'hand')", "{const p4Tool=P4pick();if(p4Tool)await bot.equip(p4Tool,'hand');else await p4HandGuard(q,b)}")
 if name=='out_east_whole':
  m=re.search(r'global\.P4LowerRoute9=',s);d,e=json.JSONDecoder().raw_decode(s[m.end():]);d['path']=d['path'][:38];s=s[:m.end()]+json.dumps(d)+s[m.end()+e:]
 if name in ['buried_west_unit','buried_west8','buried_south10']:
  # Reuse mined native tube: air body cells are valid, while complete outer tube is mandatory.
  start={'buried_west_unit':[-45,53,54],'buried_west8':[-46,53,54],'buried_south10':[-54,53,54]}[name];dr=[0,0,1] if name=='buried_south10' else [-1,0,0];total={'buried_west_unit':1,'buried_west8':8,'buried_south10':10}[name]
  setup=f"const p4Base={json.dumps(start)},p4Dir={json.dumps(dr)},p4Total={total},p4Done=Math.max(0,Math.min(p4Total,(bot.entity.position.floored().x-p4Base[0])*p4Dir[0]+(bot.entity.position.floored().z-p4Base[2])*p4Dir[2])),p4Remain=p4Total-p4Done,p4Tube=Array.from({{length:p4Remain+1}},(_,j)=>new P4Vec(...p4Base.map((v,k)=>v+p4Dir[k]*(p4Done+j))));\n"
  s=re.sub(r'global.P4USteps=\d+;', 'global.P4USteps=p4Remain;',s, count=1)
  s=re.sub(r"if\(p.x!==[^;]+?\)throw Error\('WRONG_COLUMN'\);", "if(!p.equals(p4Tube[0]))throw Error('CURRENT_TUBE_BODY');",s,count=1)
  begin=s.index('if((!envelope.every');end=s.index(";\n   await cut",begin)
  s=s[:begin]+"if(!p4Outer(p4Tube))throw Error('CURRENT_NATIVE_TUBE_NOT_CLOSED')"+s[end:]
  setup+="if(p4Remain===0)return{issue:p4Face(bot.entity.position.floored()).every(p4Full)?null:'END_BODY_NOT_FULL',completed:p4Face(bot.entity.position.floored()).every(p4Full),p:bot.entity.position.clone(),stageComplete:true};\n"
 else:setup=''
 if name=='shaft_down':
  # Preserve the closed column's original top+side enclosure; close only once per bounded call.
  s=s.replace("await center(p);", "if(!shell(p))throw Error('SHAFT_START_FULL');await center(p);")
  s=s.replace("down++;await tick(10);await put(bot.entity.position.floored().offset(0,2,0));", "down++;await tick(10);")
 handEnd=105000 if name in names[:4] else 45000 if name in ['low_dest','destination_portal'] else 55000
 pre=header.replace('P4_IS_SHAFT','true' if name=='shaft_down' else 'false').replace('P4_HAND_END_MS',str(handEnd))
 wrapper="bot.clearControlStates();bot.pathfinder.setGoal(null);if(bot.game.dimension!=='the_nether')return{issue:'NETHER_STAGE_REQUIRED_NO_ACTION',world:bot.game.dimension};\n"+pre+setup+"\nlet p4Result;try{p4Result=await(async()=>{\n"+s+"\n})();}finally{bot.clearControlStates();bot.pathfinder.setGoal(null);}\nreturn{...p4Result,rodBefore:p4RodBefore,rodAfter:p4CountRod(),rodPreserved:p4CountRod()===p4RodBefore,handCuts:p4Hands,hpActual:bot.health,bodyActual:bot.entity.position.clone(),stage:'"+name+"',qualification:'Current caller source adapted from prior physical path; actual current-stage receipt required.'};\n"
 path=out/f'{i:02}_{name}.js';path.write_text(wrapper);manifest.append({'stage':i,'name':name,'file':str(path),'arenaTimeout':130 if name in names[:4] else 75,'limits':'HAND only closed native union + ending reserve; no harvest expected. Shaft leaves sealed upper column and only caps final roof.'})
(out/'manifest.json').write_text(json.dumps(manifest,indent=2))
print('generated',len(manifest),'current-deadline stages; EAST limited to actual38-node bypass branch')
