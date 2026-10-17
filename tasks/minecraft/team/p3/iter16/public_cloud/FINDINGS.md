# Exact finite End recovery caller answer — 16:05 UTC iteration16
Owner P3; beneficiary P4question6133 / P1nextactual recovery. Requested16:02:01; first answer7845 at16:04:00 (1m59, inside2min). First noticed16:03:36 while resolving own unexpectedhurt; answered exact vertical decision promptly, no controller. Further bounded public-source confirmation7848 at~16:05, original answer not retroactively called complete cloud proof.

## Provenance and small-tool validation
extract.py mapping parser smoke on tiny fixture before download PASS. Public Mojang 1.20.4 client fd19469fed4a4b4c15b2d5133985f0e3e7816a8a and clientmappings be76ecc174ea25580bdc9bf335481a5192d9f3b7 exactSHA1/size matched. Selected AreaEffectCloud(bls), EntityType(blz), ItemEntity(cbu), javap publicclasses only; full archive memory-only/not retained. No server files/access/.work. Existing Player(cfi) and AABB mappings from owned iter15 publiccache, independently matched provenance there.

## Exact source evidence
- Cached Player cfi.aiStep bytecode257..276: normal player getBoundingBox().inflate(1,.5,1), selects touched entities. Dispatch c(blv)1222..1227 invokes entity.playerTouch.
- ItemEntity_bytecode playerTouch949..1020: server-side, pickupdelay0, optionalowner UUID andinventoryadd checks. No block/roof LOS check.
- AreaEffectCloud_bytecode tick574..585: selects LivingEntity using cloud.getBoundingBox(), with no inflate. 656..700 then compares horizontal center distance² to radius². Effect applied at758..810; no block/roof LOS test. Roof54 alone cannot stop a cloud overlapping playerbody52..53.8.
- AreaEffectCloud getDimensions1070..1078: width radius*2, height .5. EntityType static area_effect_cloud61..67 likewise6×.5 default. Standard entity-position base Y anchors box bottom.

## Conditional actual-coordinate decision
Dated P1old7814 observed cloud baseY53 and itemY52; P4body52 overlaps cloud53..53.5 because standing height1.8→max53.8. This is consistent with magicdeath, not a unique-cause proof. Current livecloud/item existence NOT observed after both deaths; entityid is not a future lookup contract.

| standingfootY | bodymaxY | ordinarypickupmaxY | relation to old cloudmin53 / item52 |
|---|---|---|---|
|49|50.8|51.3|belowcloud, doesnotreach52|
|50|51.8|52.3|belowcloud, reaches52 ifXZoverlap|
|51|52.8|53.3|belowcloud by.2, reaches52 ifXZoverlap|
|52|53.8|54.3|overlapsoldcloud|

No jumping atY50/51: normal1.25rise can crossmin53. Require fresh currentcloudbase/bounds, actualgroundedheight/verticalvelocity and ordinarydelta. This does not certify dragon/projectile/void or anothercloud safety.

Earlier7830 alternative: from coveredmiddle81,49,-1 withownroof51 intact, cut ONLY actualadjacent gear-support81,51,-2, letting item52 fall onto pillar50 atY51, now within pickupmax51.3 and~1m horizontal. No need to rise intoY52. Supportingfloor/itemlocation/currentcloud/ordinaryreceipt all remain unqualified. Sourceanswer released; no new controller, no physical adoption or recovery claim.
