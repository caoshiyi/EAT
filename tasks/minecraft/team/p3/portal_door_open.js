// Helper only; caller supplies bot and owns its player. No movement or dimension transition.
// Preconditions OW, within normal interaction reach of lower portal door, no other actor crossing.
async function openObservedPortalDoor() {
 const {Vec3}=require('vec3'),q=new Vec3(6,68,90);
 if(bot.game.dimension!=='overworld')throw Error('OW-only door coordinates');
 bot.pathfinder.setGoal(null);bot.clearControlStates();bot.deactivateItem();
 await bot.waitForTicks(4);
 let d=bot.blockAt(q);if(d?.name!=='spruce_door')throw Error('portal door changed: '+d?.name);
 if(!d.getProperties().open){await bot.activateBlock(d);await bot.waitForTicks(4);}
 d=bot.blockAt(q);if(!d.getProperties().open)throw Error('door not actually open');
 const shape=d.shapes[0];
 const passX=shape[3]<.5?6+(shape[3]+1)/2:shape[0]>.5?6+shape[0]/2:6.5;
 return{q,passX,shape,facing:d.getProperties().facing,hinge:d.getProperties().hinge};
}
