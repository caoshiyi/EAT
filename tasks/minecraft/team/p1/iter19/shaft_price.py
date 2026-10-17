"""Price ordered immune shaft ascent/descent from the actual base geometry; no arena actions."""
import json,sys
state=json.load(open(sys.argv[1])); cells={}
for row in state['geometry']:
    for (x,z),name in zip([(30,24),(31,24),(29,24),(30,23),(30,25)],row[1:]):cells[x,row[0],z]=name
top=int(sys.argv[2]) if len(sys.argv)>2 else 78
balance=0;lowest=0;cuts=0;softcuts=0;puts=0
immune={'end_stone','obsidian'}
def put(q):
    global balance,lowest,cuts,softcuts,puts
    name=cells.get(q)
    if name in immune:return
    if name not in {'air','cave_air'}:
        if name not in {'tuff','stone_bricks','mossy_stone_bricks','cracked_stone_bricks','basalt','cobbled_deepslate','blackstone'}:raise ValueError(('unpriced block',q,name))
        cuts+=1;softcuts+=1
    balance-=1;puts+=1;lowest=min(lowest,balance);cells[q]='end_stone'
def cut(q):
    global balance,cuts
    name=cells.get(q)
    if name!='end_stone':raise ValueError(('unmineable roof/floor',q,name))
    cuts+=1;balance+=1;cells[q]='air'
for y in range(49,top):
    put((30,y+3,24))
    for x,z in [(31,24),(29,24),(30,23),(30,25)]:put((x,y+2,z))
    cut((30,y+2,24));put((30,y,24))
for y in range(top,49,-1):
    cut((30,y-1,24));put((30,y+1,24))
print(json.dumps({'exact_order_min_start_endstone':-lowest,'net_endstone_cost':-balance,'cuts':cuts,'softcuts':softcuts,'puts':puts,'reserve_recommendation':10,'assumptions':'actual block names at fixed column; ordinary End drops collected before next dependent placement; body base immune/full and geometry unchanged'},indent=2))
