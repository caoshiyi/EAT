# P3 boat request3953/54 — 05:23 UTC initial finding

Beneficiary: P3 changed Enderman capture/pearl receipt. Imminentexperiment: owner paused boatavenue aftertwofailures; choose one changed usefulplacement only if this finding warrants it. No open-endedframework.

Actual5104/5108 executed _placeEntityWithOptions(reference(-101,62,86),UP,{forceLook:true[,delta(.5,1,.2)]}); both five-second generic Failed to place entity, ordinaryboatstillheld, noownhurt/full20HP ending, currentfoot/headrecapped. Both sources and actualfailures read. No boat/capture/pearl success. Changingcursorchangeslooktarget but doesnotdirectlyset Boat's eventualserverraycastposition.

Installed place_entity.js callpath:
1. _genericPlace awaits lookAt(reference+delta,true), sends normal block_place.
2. Forboat additionally writes use_item; spawn is decided from actuallook/body/world.
3. Registers entitySpawn listener AFTER send.
4. **Real matcher defect**: listener removes itself on EVERY entitySpawn, even nonboat/wrongdistance. Any unrelatedfirstspawn can make it miss laterrealboat. Registration-order race also exists in source. Error text only means matcherfailed, not server refusal classification.
5. Searchdest is reference+UP, maxdistance3, not requested fractionalplacement center.

These defects are actionable but DO NOT explain actualtwofailures bythemselves: both retainedordinaryBOAT1, so pure missedspawn is unproved and likely insufficient. Need distinguish no placement from observermiss and actualgeometry rejection. No client/tool/package modification allowed; use localclienthelper only.

Small proposed changedcaller: register a filtered listener BEFORE action, ignore unrelatedspawns untilmatch/timeout, and use alreadylooked normal bot.activateItem() for ONE boat-use attempt instead of _placeEntityWithOptions' unfiltered waiter/block_place+use_item pair. SnapshotpreexistingboatIDs, inspect new currentboats and ordinaryinventory afterboundedwait; do not infercapture fromspawn. Owner must retain normalactualray fromeye tointendedfloor/shape (integeroffset), aperture/bodyframe, iteminhand, alive/fullending. Do not bypassservercollision or manufactureplacementpacket.

Discriminatingphysicaltest ifchosen: actualeye+looktarget and firsthit block/shape, nearbyentityAABBs inthat ray corridor, ordinaryboatcountbefore/after, newboat entityID/position, currentrecap/HP. Ifboatstillheld/newboatsNONE, changinglistener alone didnotfix placement and avenue shouldremainpaused; selectchangedgeometry/usefulcombat. A syntheticwaiterfix certifiesreporterbehavior only. No needto reopenwindow just to collectperfecttelemetry.

Host-only focused fixture/proposed waithelper follows; owner may adapt withinactualexistingcaller. No adoption/physicalchangedtrial yet. Exact actualcollision/firsthit source remainsUNKNOWN.

05:24 hostfixture PASS: extracted exact installed waitForEntitySpawn; directboatfirst succeeds, unrelatedEndermanfirst thenrealboat fails. Local filtered_spawn.cjs helper passes same-stack synchronousmatchedspawn (listenerbeforeaction), unrelated/wrongID, timeout, actionerror, matchererror, cleanup. No playerworldexecution. Owner can paste helper or equivalent around normal activateItem; existing check/time/recap remain. Match actualnewboatIDs/currentregion, not firstanyentity or staleexistingboat. This verifies one observer defect only; both worldBOATstillheld cases remain unexplained/no changedworldplacement yet.
