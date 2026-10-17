const{Vec3}=require('vec3');return[-120,-220].map(cx=>({cx,cells:[-2,-1,0,1,2].flatMap(dx=>[62,63,64,65].map(y=>{const p=new Vec3(cx+dx,y,-180),b=bot.blockAt(p);return[p,b?.name,b?.shapes]}))}));
