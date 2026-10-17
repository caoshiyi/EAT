# Boat failure and failed repair — 2026-10-17T02:37:43.862462+00:00

RESOLVEDLOCALHEAD: actual4228 (02:37:37/1.9s) recoveredmisplacedBASALTfrom(-37,58,48), correctfloor-UP placement→headBASALT/sourceAIR/20HP; repairBEFOREengineerpublication/nocausalcredit. Next4233boatstillFailedplaceentity butcorrectfloor-UPcleanupclosedtrue/20HP7.111s. Don'treportcurrentopenheadafterthese receipts.

Raw4219 actualbody-35.585,57,47.499/20HP after openingownWhead(-37,58,47): Failed to place entity; finallycap placement refused (targetstillAIR), closedfalse/boat1. Raw4221 at02:36:53 immediatecaprepair then equip(undefined) throws; freshordinaryinventoryNO BASALT/headAIR/boatEntities[]/20HP. Prior4219reportedBASALT1 cannot be reused as a currentmaterialreceipt. Underlying lateinventory/blockpacket cause unisolated. No capture/placement/mounted-clockclaim. Owner mustresolvecurrentopenhead/protectedending beforeanothertrapreport; no engineerbodyaction.

Narrow correction: after eachfailedawait, re-read actualinventory/target/body beforechoosingrepair. Check selecteditem exists BEFOREequip; report MISSING_HELD_CAP as observedconstraint and enter ownerchosenboundedalternateending. An equipexception is not materialproof or a recoverystrategy. EndwithactualFULL/head/body/HP, notonlyoriginalissue. A latefailurecaninvalidate the remainingsequence evenwhen target/intendedmaterial were valid earlier.

Samewrongproperty STILLin4219: movements.LOSWhenPlacingBlocks=false. Correct bot.pathfinder.LOSWhenPlacingBlocks=false (CONTROL_LOOP_REPLY addendum02:33). No evidence thiscausedcurrentplacementfailure; do not attribute it automatically.

P2eventsconfirmthirdSkeletondeath02:36:48 at9.5,65,88.7 after temporary4216DIAMOND3receipt. New4222CAMP20HP/PRE isNEWLIFE, not retention. Actualloosecorpseassets/currentbankunknown.

## Placement error had a real side effect — 2026-10-17T02:39:34.707829+00:00

Actual4228verifiedBASALTatold4219REFERENCE(-37,58,48), despite4219error saying intendedHEAD(-37,58,47) stillAIR. It harvestedthatblock (woodpickwear20→21/heldBASALT1), thenplacedfromFULLfloorUPintohead, sourceAIR/headBASALT/BASALT0. Thus refused-intended-target was NOT no-world-effect; previousoneitem was consumedinwrongcell, not simply vanished. Underlyingplacementrule inferredfromthese observations; no serverinspection.

Installed place_block.js computes dest=reference.position+face then checksONLYthatdest. Caller suppliedAIRreference, noexistingFULLanchorcheck; _genericPlace doesn'tmakeitaFULLface. Smallcorrection: choose a currentrealFULLreference adjacenttodestination, verifyref+face matchesgoal, thenverifybothintendedtarget andpossiblechangedreference/inventory when anerroroccurs. Ownerfloor-UPcorrection alreadyphysicallypassed, source4233usesit. Botentityplacementstillfailed; thatisnotproofNetherboatsimpossible/mountedclockissue. No moretestrequiredforalreadyobservedcapcorrection.
