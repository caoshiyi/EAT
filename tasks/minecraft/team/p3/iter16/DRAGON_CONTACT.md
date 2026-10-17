# Exact finite under-fountain question — iteration16 17:07..12 UTC
OwnerP3; beneficiary P1 actual underfountain parentattack trial. Asked17:07:13, read17:08:39, answer7985at17:09:16 =2m03 fromrequest (MISS2min by3s, read→answer37s). Budget not renamed. Further source refinements7995/8003; no newcontroller/stock/physicaldamage claim.

Read exact public1.20.4 classes already SHA1verified byP2, under p2/iter16/public_dragon; mappingswing1cl/wing2cm/head e/neck cg. EnderDragon tick1306..1466:
- Wings select LivingEntity from eachwing AABB.inflate(4,2,4).move(0,-2,0), then knockBack(list). No block/terrain LOS test.
- Wingparts height2 andpositionrootY+2, so selectedcontact band=rootY-2..rootY+4. StandingY61 body61..62.8 is verticallyoutside WINGS if actualrootY>=64.8. Atroot65 band63..69. This is not head/neck/landing/cloud immunity.
- knockBack helper1570..1669 pushes before phaseisSitting check. Sitting skips subsequent5damage but DOESNOTskip push.
- Head/neck use ownAABB.inflate(1), helper1670..1709 applies10damage withoutterrainLOS. Headpitch/phase changes separately; roof63 alone is not a shield againstcontactselection.

Parentreach: matched normalinteractionhandler aoc targetAABB.distanceToSqr(player.getEyePosition())<36, no additionalblockLOS; root-centred2.9guard not equivalent. Atfeet58 normaleye59.62, ifactualrootAABBminY65 andXZinsidebox, distance5.38<6. Actualphase/box/reach mustbeobserved beforeattack. No inventedmultipart IDs/packetworkaround.

No primarywait for optional swords: P2verifiednonheaddamage=d/4+min(d,1). Normalunbuffedfullhand1→1.25BODY, six-tick cadence nominal4.17/s; stoneSword5→2.25, thirteen-tick cadence nominal3.46/s. This assumes fullcooldown/phase/ordinaryplayerdamage andexcludescrystalhealing/takeoff. Sourcecalculation is not observed netdamage orkillproof. Actualparenthealth/bossbar/phase/support/cloud/ending delta governs firsttrial. P1alreadyselectedY58 inspect/trial, P4followsactualroute; no newstance/materialqueue here.

ActualP1fountaininspection6326 at17:13:23 supersedes assumedfloor63: centerBEDROCK58/column60/rimY59. Newactualstance54 approach, not oldplanned61/58. Root65 in sourceexample was conditional, NOTactualworlddata. Apply contact/reach formulas toactualroot/parts/phase. P4actualEnd81/HP20 at17:14, P1nativecentre1.5,Y54 whileactive8006; no physicalattackdamageproof inthissnapshot.
