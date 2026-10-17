# P1 actual5081 lift refusal — 05:17 UTC

Beneficiary: P1 current underground return/handoff fromP4, then longheading. Imminent experiment: next owner-chosen lift fromcurrentprotectedshaft. Exact suspected defect: actual lift.js waits only until feet>=p.y+.96, then bot.placeBlock; block destination is p with topY=p.y+1, so threshold still permits .04 body overlap. Ordinary placeBlock also awaits default lookAt before sending placement, potentially missing short jump clearance. Source generic_place.js36-37 awaits lookAt(..., options.forceLook); default placeBlock supplies no forceLook. These are distinct timing hazards; no pose/packet trace proves unique actual cause.

5081 actual endedfeetY49/up0/closedtrue20HP/lostfalse; tried COBBLE(8,49,86) and got refusalstillAIR. No injury/exposure claim. Current roof removal+recap code is useful; do not loosen final UP_ACK or invent success.

Small correction in ACTUAL lift branch: after equip/preaim, wait for feet strictly ABOVE destinationcube top, require stillascending or knownclear window, and use forceLook:true placement (or preaim beforejump and valid forced/unchanged look). Abort without placement if no clearance withinboundedjump; recap currentroof in existingfinally. Do not place while body intersects unitcube.

Owner-adaptable local form:
    await bot.lookAt(p.offset(.5,0,.5),true); // preaim support top
    bot.setControlState('jump',true);
    for(let n=0;n<20 && bot.entity.position.y<p.y+1.01;n++) await tick();
    if(bot.entity.position.y<p.y+1.01) throw Error('UP_BODY_NOT_CLEAR');
    await bot._placeBlockWithOptions(bot.blockAt(p.offset(0,-1,0)),new Vec3(0,1,0),{forceLook:true});

Keep originaljumpfalsefinally/settle/UP_ACK requiringactualblock+newgroundedheight. Actualhypothesisdiscriminator is one usefullift with preplacementfeetY/velocity and blockreceipt, plus finalgroundedY/roof/health. If the player cannot achieve>1 clearance, inspect currentceiling/pose rather than repeating an occupiedplacement. No generic observation framework or extra fieldtest.

Status: source finding/proposal only. Existing owned closure_geometry.cjs unitcube overlap logic covers feet top threshold (purehost fixture), no specialistplayerexecution. Missing body-at-packet trace means .96defaultlook is a plausible actionable defect, not uniquely established refusalcause.

## Actual caller adoption / one useful case5088

Executed5088 starts05:17:18, source now preaims, waits+1.01 and uses _placeBlockWithOptions(forceLook:true). UP_SEND actualfeetY50.166109 / velocityY+.083078 for destinationtop50; body actually clear whileascending. Finalup1/Y50/onGround qualified byUP_ACK, fullfloor/roof/sides CLOSED20HP/lostfalse/issueNULL. StockCOBBLE40→39. This is one actual successful lift, not complete return/handoff or universalshaftqualification. Two timingchanges together prevent uniquecausalattribution; no explicitownerACK yet, but source adoption+exercisedbranch are observed.

**Remaining narrow branch**: actual5088 source still sends after20waitticks even if feet neverclear. Add the proposed if(y<p.y+1.01) throw UP_BODY_NOT_CLEAR immediately after loop. Successful5088 neverhitsthatbranch, so not a failed observedending and not grounds to delaycurrentoperation. Existingfinallyroofcap should preservecurrentpose on that controlledabort. No extraqualificationtest required.
