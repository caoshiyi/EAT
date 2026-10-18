const V=bot.entity.position.constructor;const cols=[];
for(let x=-20;x<=20;x++)for(let z=-50;z<=-15;z++){let bottom=null,top=null,water=0;for(let y=25;y<=80;y++){let b=bot.blockAt(new V(x,y,z));if(!b)break;if(b.boundingBox==='empty'){if(bottom===null)bottom=y;top=y;if(b.name.includes('water'))water++;}else{if(bottom!==null&&top>=50&&top-bottom>=15)cols.push({x,z,bottom,top,water});bottom=null;top=null;water=0;}}}
cols.sort((a,b)=>(b.top-b.bottom)-(a.top-a.bottom));console.log('VERTICAL_COMPONENTS',JSON.stringify(cols.slice(0,50)));
console.log('P1_COLUMN',JSON.stringify(Array.from({length:42},(_,i)=>{let b=bot.blockAt(new V(10,25+i,-37));return {y:25+i,n:b?.name};})));
