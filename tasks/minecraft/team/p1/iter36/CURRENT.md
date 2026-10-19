# P1 current — iteration36, 18:40 UTC

Objective remains defeat Dragon. Official capture belongs P3/coordinator; no victory. Latest direct live HP174.729599; four accepted p1 hits this iteration, total10.25 damage. Only p1 controlled. Only this directory edited. Deadline19:44:24 UTC. Use python3; every shell command starts cd "$EAT_ROOT".

## Active action
`live_batch_west.js` running LIVE as p1, starts around18:39, timeout220. Current experiment E10: same successful role split but legally clear West upper blocks(-6,57,4) and(-6,58,4) before180s combat. First new refusal/ownHPdrop/P3contextchange ends loop; 70swithoutdamage ends censored. Finally returns p1 to0/50/4/full10 and restores P3 roof/gates. Read native result before next action; no overlapping LIVE p1 program.

P1 last completed live ending:0.551/50/4.5 HP11.5 food16, FULL10 Endstone. Swordwear5, borrowed freshStonewear106 (~26uses), ownStone126/129, Wood17, Shield111 offhand, N7/E~159/C50, nofood. P3 holds(-5,50,4), actual(-4.525,50,4.5) HP20 as low bait; all its upper work cancelled. P2 idle9/50/5 healthy20. P4 OW empty, NEVER played by us. P3 owns periodic independent HP watches; no need pause for them.

## Qualified execution
- LIVE13952 at18:27:14.925 jumpSword, 184.979599->182.104599 (-2.875), wear1->2, look1tick/currentbodypoint1.94375m/cursor65. Healthy11.5/20 and full50 ending.
- LIVE13964 at18:32:59.187 jumpSword,182.104599->179.854599 (-2.25), wear2->3, actualviewcore2.50695m. Same healthy ending.
- LIVE13969 batch at18:36:16/45: two more accepted hits179.854599->177.604599->174.729599, wear3->5, sameHP. Third jump refused West57; ended healthy50.

Whole package is reproducible damage, not unique proof of bait/altitude/AI mechanism. Iter35 standinghit13776 was only one2.25 hit; its later no-range windows did NOT test attack reliability. Current dynamic jump+lowP3/same upper field gave repeated damage. A descending jump matches2.875 critical damage; ascending hits observed2.25.

## Geometry, safeguards, ending
Source private p1 pod0/50/4, westgate-1/50+51 normally E. Walk west existing AIR corridor to adjacent -4/50/4 (P3eastgate). Raise3 in -4 column: N50/N51/E52 top, cut only own52/53/54 as needed. Move WEST onto P3 E52 ROOF at-5/53/4; P3 stands50 below. NEVER dig -5/52 while P3 underneath. Existing upper vent-5/55..58 AIR, E59 cap; South pocket(-5,55,5),(-5,56,5),(-5,56,6) AIR. E10 addsWest57/58 only.
Standing real inner-body candidate: rootX/Z±1.95, rootY+.05..+2.95. Eye=currentfeet+actualeyeHeight. Search grid when nearest blocked; one blockedpoint cannot rule out allbody. Native jump on nearapproach<=4.4/horizontal<=2.8; actualcandidate<=3 required at dispatch. Look->ONEtick->recheck SAMEpoint against CURRENTbody/ray/distance. Also actualview RaycastIterator at3 intersects innerbody, no interveningworld block/othernonobjectentity. Enderman gaze guard includes actualocclusion. Ordinary bot.attack remains arena-enforced. No packets/fakepartIDs/reachchange.
`entityAtCursor` now diagnostic ONLY: ray_trace.js first clips distance to blockAtCursor, then filters ENTITYORIGIN from FEET beforeAABB. Live13958 core2.863clear was withheld by bogus cursor guard (cap cutoff4.7508<root4.8654); not failed attack. Actual model point/actualview plus native enforcement are required.
Retreat: land53; EAST back -4/53; cut only ownE52/N51/N50, settle actual50. Close own-4/52 cap. Walk east to-3 and reseal P3eastgate -4/50+51 E, return0 and closewestgate-1/50+51 E. Confirm bothHP/P3E52roof/actualfull10 own ending. No55idle: prior practice G1 died4sec after full55 enclosure.

## Current bottleneck / next decision
LIVE13948 and13969 both had actual<=3 bodypoint/rayclear but native attack REFUSED blockedE(-6,57,4). E6 looktick had accepted hits between them, so tick alone isn't sufficient for all poses. Generic parentcenter-ray is a hypothesis, NOT established internals (P3 VISIBILITY_FINDING). E10 physically changes reported obstruction. If new block named, stop and choose smallest legal visible aperture change; never bypass refusal or call a refused attack damage. If batch clean and healthy with multiplehits, extend same bounded combat to300s to reduce tool/walking costs; keep firstHP/refusal/noeffect stop and deep ending. Goal is Dragonkill, not just two hits. A long warm loop uses Sword only between passes; cold roundtrip costs~8Pickuses.

## Practice contexts and failures
G3A with copiedP3alive50: SB65 stable53/Etopfloor52/65s healthy11.5, min3.134/root56.921 but blocked lateralpoint; noattack. Refutes universal root>=attackerY+5 IN THAT COPY only. G3B after own p1 legally PvP-killed COPIEDP3 for spent-tool recovery (SB67 18:14:06): copiedP3 OW, copiedP2 remains50. Tools obtained only in practice, NOT live. Its SB68 apertureprep failed visibleface(-2,56,5) beforejump; root86high/newlifecontext cannot validate low-live-P3 bait. LIVE P3 untouched. Do not merge G3A/G3B/LIVE.
Earlier SB62 intended53 invalid: Sand52/Gravel51 disappeared duringlongdig, actual51 then65swait; cause unobserved. This taught nonfallingEtopfloor + blockupdate/drop telemetry + actualY after everyasyncdig. No heightcoupling conclusion. G1 oneP1sandboxdeath; zeroP1LIVEdeaths through latestending.

Raw receipts/source hashes in timestamped *.json/*.out; chronological details EXPERIMENTS.md and CHECKPOINT_1821_HISTORY.md. Kept commits through2885ae6ac; subsequent batch receipts/changes need next commit. No pending permission or user question.
