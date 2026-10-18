const V=require('vec3').Vec3,stance=new V(4.35,59,2.35),aim=new V(3.5,60.5,1.5),real=stance.offset(0,1.62,0),d=aim.minus(real),len=d.norm(),dir=d.scaled(1/len);
function check(o,max){for(let t=0;t<=max;t+=.0002){const q=o.plus(dir.scaled(t)),p=q.floored(),b=bot.blockAt(p);if(!b)return{unknown:p};let shapes=b.shapes,label=b.name;
if((p.x===3&&p.y===60&&p.z===2)||(p.x===4&&p.y===60&&p.z===1)){shapes=[[0,0,0,1,.5,1]];label='PLANNED_LOWER_SLAB';}
if(p.equals(new V(4,59,1))){shapes=[[0,0,0,1,1,1]];label='PLANNED_FULL_CAP';}
if(p.equals(new V(3,60,1))){shapes=[[0,.1875,0,1,.5625,1]];label='HYPOTHETICAL_BED_BOX_NOT_REAL';}
const l=q.minus(p);if(shapes.some(s=>l.x>=s[0]&&l.x<=s[3]&&l.y>=s[1]&&l.y<=s[4]&&l.z>=s[2]&&l.z<=s[5]))return{hit:p,label,q,t};}return{clear:true,max};}
return{warning:'READONLY MATH ONLY. Assumed BED BOX not actual block shape. No bed placed, no API target supplied, no actual look/activation/reach/safety proof. Centre aim hypothesis inferred from P1#9863 actual automatic look.',stance,aim,realToCenter:check(real,len),modelSameDirectionShort:check(stance.offset(0,1.8,0),len),len,p2:bot.entity.position,hp:bot.health};
