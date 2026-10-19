# Changed earliest link: accepted visibility, after actual native jump
P1 LIVE13948 (`LIVE_live_role_attack_182332.out`) did actually jump and reached actual bodypoint distance2.7486314198 with its own rayclear=true, HP11.5 retained, P3low50. `bot.attack` was REFUSED:
`ender_dragon #65 not visible from p1's eye (blocked by end_stone at -6,57,4)`.
No attack accepted/noDragonhurt/noHPdecrease, Swordwear unchanged. This is not a failed-damage demonstration after an accepted attack.

Exact at18:24:15.327–329: P1feet(-4.55135786,54.00133598,4.5), standingeye~55.6213; Dragonroot(-6.53982822,58.31969817,5.55187061); selected INNERpoint(-4.58982822,58.36969817,4.5). That nearvertical selectedray can be clear while a DIFFERENT visibility ray crosses westE(-6,57,4). P1's prior aperture clearedSOUTH threecells, notWEST.

Hypothesis to test (not established tool internals): visibility may use parent's entity center/root+height/2 rather than the selected guaranteed-inner attackpoint. If actual entityheight8, root+4 givesupperray crossingwestboundary at~Y57.13, matchingrefusalcell. Genericcenter LOS mayalsohitE59cap whenroot isdirectlyoverhead. Need actualAPIentityheight and rayreconstruction/acceptedattack, not declaration of policycause.

Concrete changed terrain candidate: physically visible WEST upperaperture cells(-6,55,4),(-6,56,4),(-6,57,4), potentially(-6,58,4), with each legalvisibility/reach checked. TopE59cap mayneedopening too forparentsight; keep N55 lowerhatch closed betweenwindows so2highbodyretained. P1ownbody/fixturechanges, P3mustholdbait50 andpreserveE52floor. Do not cutunseenblocks or bypassarena refusal. Actualacceptedattack+DragonHPchange and healthyending remain successcondition.

## 18:32 correction after new actual evidence
LIVE13952 DID accept tick+cursor ordinaryjumpattack at18:27:14.925, actualpoint1.94375m, Dragonhurt event+Sword1->2+HP184.979599->182.104599(-2.875); healthyP1returned50/P3hold20. Genericcenter-ray explanation remains unproved and must NOT gate supportedrepetition. No newWestaperture required for this success.

Second13957 tick caller withheld attack becausecursorIdundefined despitephysical2.86298mclear. Actualread-only13961 printedCLIENT_ENTITY_AT_CURSOR_SOURCE (retainedreceipt): first blockAtCursor(maxDistance); resets maxDistance to block.intersect.distanceTo(bot.entity.position/FEET); THEN entityROOTpositiondistanceTo(FEET)<=maxDistance filter BEFOREAABB. This is a conservative clientpredicate, NOT authority on allowedphysicalbodycontact.

Recordedcomparison: secondcapE59 verticalcutoff59-54.2491870787=4.7508129213m; DragonrootdistanceFEET=4.8653974306m, filtered; innerbodypoint2.86298m is INFRONTofcap. FirstsuccessrootFEET3.8264746121<capcutoff59-54.1767592751=4.8232407249, passes. Thus exactsource+observations explain cursorfalse-negative. Earlier eye-distance math was suggestive; correctformula usesFEET.

Changedsmalltest recommended: currentactualinnerpoint<=3+actualrayclear, look1tick+freshguard, ordinarybot.attack evenifCLIENTcursorundefined; arenaenforcement remains decisive. No fabricatedentityID/packets/reach bypass. IfnativeattackREFUSED thenmeasureactualreason andlegallyadjustterrain, notdeclarehit. Nativehiteffect+healthyending decides sustainedexecution. Do not spend time excavatingtopcap solely to satisfy this extrafalse-negativeguard before testing normalallowedaction.
