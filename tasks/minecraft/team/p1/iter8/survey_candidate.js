bot.pathfinder.setGoal(null);bot.clearControlStates();if(!bot.entity.onGround)bot.setControlState('jump',true);const{Vec3}=require('vec3');const origin=bot.entity.position.clone();if(bot.game.dimension!=='overworld'||Math.hypot(origin.x-148.5,origin.z-2212.5)>192)throw Error('SURVEY_NAV_NOT_ARRIVED');
let loaded=0,unknown=0;const hits=[];const kinds=['stone_bricks','mossy_stone_bricks','cracked_stone_bricks','infested_stone_bricks','stone_brick_stairs','end_portal_frame','iron_bars'];
for(let x=146;x<=150;x++)for(let z=2210;z<=2214;z++)for(let y=52;y>=-63;y--){const b=bot.blockAt(new Vec3(x,y,z));if(!b){unknown++;continue;}loaded++;if(kinds.includes(b.name))hits.push([x,y,z,b.name]);}
console.log('ROOT_NATIVE',JSON.stringify({loaded,unknown,hits}));
console.log('LOADED_PORTAL_FRAMES',JSON.stringify(bot.findBlocks({matching:bot.registry.blocksByName.end_portal_frame.id,maxDistance:160,count:32}).map(p=>[p.x,p.y,p.z,bot.blockAt(p).getProperties()])));
const floors=[];for(let x=147;x<=149;x++)for(let z=2211;z<=2213;z++){for(let y=62;y>=-63;y--){const b=bot.blockAt(new Vec3(x,y,z));if(b?.shapes?.some(s=>s.join(',')==='0,0,0,1,1,1')){floors.push([x,y,z,b.name]);break;}}}
console.log('TARGET_FLOORS',JSON.stringify(floors));console.log('SURFACE_TARGET',bot.blockAt(new Vec3(148,62,2212))?.name);
console.log('NEAR_KELP',JSON.stringify(bot.findBlocks({matching:b=>['kelp','kelp_plant'].includes(b.name)&&b.position.y>=59,maxDistance:16,count:24})));
console.log('SURVEY_ACTUAL',JSON.stringify({p:origin,hp:bot.health,food:bot.food,dimension:bot.game.dimension}));return {loaded,unknown,hits};
