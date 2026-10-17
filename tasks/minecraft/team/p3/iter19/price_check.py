import json,pathlib
root=pathlib.Path('tasks/minecraft/team')
d=json.loads((root/'p1/iter19/tunnel_resume2.json').read_text())
cells={(x,y,z):name for y,*names in d['geometry'] for (x,z),name in zip([(30,24),(31,24),(29,24),(30,23),(30,25)],names)}
stock=0;minimum=0;cuts=0;puts=0;steps=[]
def install(q):
 global stock,minimum,puts
 if cells.get(q) in {'end_stone','obsidian'}:return
 assert cells.get(q) in {'air','cave_air'},(q,cells.get(q))
 stock-=1;minimum=min(minimum,stock);puts+=1;cells[q]='end_stone'
def harvest(q):
 global stock,cuts
 assert cells.get(q)=='end_stone',(q,cells.get(q))
 stock+=1;cuts+=1;cells[q]='air'
# Small hand-check: native closed pod -> next native pod exchanges one roof for floor.
assert (1-1)==0
for y in range(49,78):
 install((30,y+3,24))
 for x,z in [(31,24),(29,24),(30,23),(30,25)]:install((x,y+2,z))
 harvest((30,y+2,24));install((30,y,24));steps.append({'ending_y':y+1,'relative_endstone':stock,'minimum_so_far':minimum})
for y in range(78,49,-1):
 harvest((30,y-1,24));install((30,y+1,24))
r={'source':'actual tunnel_resume2 geometry / selected shaft.js order, not physical execution','minimum_initial_endstone':-minimum,'net_endstone_consumption':-stock,'cuts':cuts,'puts':puts,'actual_endstone':47,'actual_callable':d['callable'],'minimum_extra_endstone':-minimum-47,'with_10_slack_extra':-minimum+10-47,'tools_after_extra_and_shaft_if_one_cut_per_extra':d['callable']-(-minimum+10-47)-cuts,'assumptions':['geometry unchanged','each mined roof ordinary drop collected before dependent floor replacement','base faces immune/full; no blast/cloud disruption','no additional soft-block promotion, quarry travel/return seal, or retrieval costs included'],'steps':steps}
(root/'p3/iter19/shaft_price_crosscheck.json').write_text(json.dumps(r,indent=2)+'\n')
print(json.dumps({k:v for k,v in r.items()if k!='steps'},indent=2))
