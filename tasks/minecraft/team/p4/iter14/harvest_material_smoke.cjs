const assert=require('assert/strict'),Block=require('prismarine-block')('1.20.4'),data=require('minecraft-data')('1.20.4');
const rows=[];for(const name of['sandstone','netherrack','cobblestone_slab','crafting_table','spruce_door']){
 const b=Block.fromStateId(data.blocksByName[name].defaultState,0),sword=!!b.canHarvest(data.itemsByName.iron_sword.id),stone=!!b.canHarvest(data.itemsByName.stone_pickaxe.id),hand=!!b.canHarvest(null);rows.push({name,sword,stone,hand});if(['sandstone','netherrack','cobblestone_slab'].includes(name)){assert(!sword);assert(stone);assert(!hand)}else assert(sword&&hand)
}console.log(JSON.stringify(rows));
