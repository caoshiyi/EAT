# Iteration 20 P4 experiments

All play p4 only, through mc_arena; no inherited helpers reused. Rules and brief/P1/P2/P4 handoffs read. Sources restricted to fresh observations, arena records, and installed Mineflayer documentation. Deadline from environment CR_DEADLINE=1792323924 = 2026-10-18 11:45:24 UTC.

## Opening / local exit (09:47:39–09:50 UTC)
Hypothesis: visible adjacent cuts plus checked ordinary movement can release boxed p4 safely to portal staging. Initial overall recon budget 8min from actual announcement09:47:56 to09:55:56. Announcement erroneously stated future09:49 start; corrected explicitly in chat. P1 briefly requested <=6min cargo at09:48, then clarified reconnaissance takes precedence, no quota, and requested OW hold during first End probe.

- Startup `python` unavailable; used `/usr/bin/python3`. Evaluator: dragon0, milestones11, deaths125/programs9110; live save refused, saved evidence only.
- #9113 fresh p4 OW129.5006,-36,2274.6293, HP20food16 grounded, sticks2/stairs2/bones4/WOODwear11/basalt4/books51; clear controls and goal.
- #9120 visible head130,-35,2274 cursor match at1.05m; foot basalt130,-36 occluded. #9124 dug head only: stonebricks→air, wood11→12, HP20, item observed but no receipt. Later map #9128 showed AIR under east foot; east foot deliberately retained. Shared change announced.
- #9135 north head129,-35,2273 cursor null despite canSeeBlock=true: refused/no dig. #9120 had comparable null. Changed assumption: aim off center instead of repeating aligned ray. #9137 near-axis x129.5 gave null; off-center x129.25/129.75 gave exact intended basalt cursor. Limits: this is observed ray behavior, cause unproven.
- #9138 off-center head+foot1292273 both exact cursor and visible within1.5m, each became AIR; WOOD12→14, HP20; intact full floor checked.
- #9142 small north movement reached129.5003,-36,2273.3566 HP20 grounded, ordinary BASALT4→6 proves pickup of two basalt cuts. Adoption: use exact fresh cursor check and off-center target when needed; never infer permission from canSeeBlock alone.
- #9145 four guarded, slow air/body/full-floor checked movements reached131.5016,-36,2273.4585 HP20grounded, no digs/no health loss, controls cleared. All6basalt retained; no recipient receipt and no End entry. P1 requested hold to avoid entry platform regeneration during his first probe; honored.

## Delivery operation09:51:26–09:52:57 (3min budget; met)
Hypothesis: compatible corridor ordinary toss can transfer retained wood pick/basalt/sticks to empty P1, supporting changed continuous End recovery/escape.
- P1 requested delivery #9167 at09:51:26; accepted #9169; no new source/travel quota. Earlier recon was interrupted by P1 MAGIC death09:50:31 after exposed idle bridge test; P4 remained OW, not a duplicate entry.
- Small #9170 toss BASALT6→5 toward P1 at131.5,-36,2272.51 while P4 at131.5,-36,2273.47. Item still visible after35ticks; subsequent status donor BASALT6/P1empty and P1 independent#9175empty establish failed transfer/re-pick. No success claim.
- Changed assumption/method: donor retreats outside shared pickup region immediately after toss. #9180 donor6→5 then south131.5,-36,2274.76, HP20; item absent after50ticks. P1 independently#9182 ordinary BASALT1 vs previous EMPTY qualifies receipt. Adoption: ordinary toss plus prompt donor retreat, independently check receiver.
- Bulk#9183: returned to1312273, ordinary tossed BASALT5, WOODwear14, STICK2; retreated to131.5,-36,2274.56. Ordinary donor all3 gone, retained stairs2/bones4/books51. P1 independently confirmed total BASALT6+WOOD1+STICK2 in chat7619 at09:53:11, describing receipt09:52:57. Status9187 matches. Whole preparation-to-receipt09:51:26→09:52:57=1m31s, under3min. Useful adoption not yet proven; P1 plans local quarry then continuous entry/recover/bridge.

## Recon budget disposition / corridor release09:55
Original recon budget09:47:56–09:55:56 MISSED: P4 made no End entry or crystal line-of-sight observation. P1 initial death/hold and prioritized delivery consumed that interval; useful completed partial was the independently received tool+6basalt+2sticks contribution above. Do not silently reset this budget. Readied crystal_observe.js is observation-only, UNEXECUTED and unqualified; compilation/file existence is no result.

#9208 reversed four freshly checked full-floor/bodyAIR movements to OW129.5053,-36,2272.4990 HP20grounded, controls cleared. P1 requested corridor1312274/75 released; announced done #9209. Retained stairs2/bones4/books51, no tools. No End entry/regeneration, no new source quota. P1 primary prepares changed continuous entry/recovery/bridge/native-shelter operation; P4 warned simple hazard throw leaves exposed body (chat7633), not a safe retained outcome.

## Read-only recorder / fresh draft review09:55–09:56
Built owned watch.py to capture changing arena status/chat/events without issuing any program/player action. Small one-shot test09:55:47 returned valid three records and JSONL persisted; adopted longer900s read-only recording (OS session62445), stdout redirected under own memory. Does not establish gameplay effects. No p4 program overlap.

Reviewed fresh P1 continuous_entry.js only (not inherited helper, not executed as p4). Found concrete missing dimension boundary in walk to OW133.5/2275.5: early portal transition could retain old coordinate steering in End. Published chat#9213 recommending immediate stop on dimension change and separate expected-world guards. This is source-based concern, no observed instance of that failure; adoption by P1 pending. Also cautioned fireball attack counter alone cannot establish physical deflection.

## Independent OW edge test09:59–10:00 (4min budget to10:03; met <1min field)
Hypothesis: a shallow sneak overhang exposes the side face; mandatory deep offset can unnecessarily stall. P2 yielded independent edge test after own site was blocked. Fresh#9237 candidate stand132,-36,2272 on basalt floor, gap133,-37,2272AIR over stairsY-38. No main corridor removal.
#9243 three supported no-dig steps reached132.4626,-36,2272.4999 HP20. #9244 sneak goal132.8→actual132.8374 hit TOPface1; goal133.05→actual133.0977 hit actual EASTface5 (intersect133,-36.4859,2272.6501). Ordinary normal placement gapAIR→OAK_PLANK, wood3→2, HP20; same program retreated132.4778, grounded/20. Adoption shallow~.1 edge plus exactSIDE face instead of required.26past edge. Published immediately#9245.
#9246 hand-recovered test plank block→AIR but item3115 fell133.125,-37.5,2271.8998, NOT ordinary receipt. Retained onlyPLANK2+incidentalTUFF1=3solidcaps; original4 became3. No claim recovered input. Test effect restored gap, no floor/corridor removed.

## East End/cloud field10:01:20–10:01:45 (deadline10:05; FAILED early)
P1 assigned changed east escape/short eastbridge/<=60s cloudhold after two west-route failures. Hypothesis: sprint away from old z0cloud east/north and build extension using qualified shallow edge, keep End loaded to observe oldcloud expiry. Fresh own east_cloud_field.js, no inherited End helpers. Actual#9264:
- Arrival100.6615,49.275,.647 HP16, oldcloud3443 at97.719,49,.5 radius4.22. End transition/body actual, no delayed-OW inference.
- Immediate east escape to103.0300,49,-1.519 HP16; outside oldcloud atthat moment (radius4.44). First placement preflight exactsidecursor NULL; zero placements/cuts/attacks/hold samples. Inventory retainedPLANK2/TUFF1/stairs2/bones4/books51 at returned snapshot.
- ERROR HANDLING FAILED: program ended by clearing controls/sneak on exposed overhang without retreat to fullsupport. Event10:01:45 VOID at104.5,-128,-1.5; new life OWbed1462241 EMPTY20. Actual drift velocities were not logged, so mechanism beyond unsafe ending is unproven. Do not claim cleared-sneak alone proves exact trajectory cause. This was avoidable; OW test had same-program retreat, field wrapper omitted it.
- #9267 changed aim x-.001 resume correctly refused expectedEnd because already OW, zero action. Not a second physical attempt. Raised-route proposal supersedes east replay; no unchanged repeat. Oldcloud expiry UNTESTED, no retained hold, no crystal or dragon damage. Whole experiment failed before10:05, not a budget success. Useful partial: actual eastcloud escape possible briefly; ray boundary/ending unresolved.
Adoption correction mandatory: any edge interaction refusal MUST retreat to interior checked support IN SAME program, preserve sneak until body AND velocity/support verified. Never leave an exposed body for offline review. A final ground=true snapshot is insufficient.

## New northwood contribution10:02:05→10:06:05 active
P1 requested12caps/4min whole inclreceipt after P4death. P4 accepted#9275, read/reviewed fresh current-iteration P1#9254/9261 normal pathfinder no-dig and cursor-matched handwood (not inherited code). Fresh own north_wood_travel.js launched arena following9275, OS14869; need actual return, then source12 visible planks without floor cuts; no repeat End entry. Current deadline unchanged. P1 sources elsewhere whileP4 owns northlibrarywood. Preserve any partial/missed budget.

## Northwood actual result and changed safe integration10:02–10:07
Budget request10:02:05→10:06:05 MISSED delivery, not reset. #9276 no-dig travel to142.499,-36,2231.5 HP20empty; #9287 two direct ceiling cuts yielded ordinary1, otherdrops upperwalls; repeated occluded targets refused, changed pose/range before further attempt. #9294 shifted west1402231, collected old grounddrop ordinary2, nohostiles6m. `findBlocks` radius4.5 from feet excluded many roof cells whose actual eye reach<=4.5; changed discovery radius6 but retained actual eye-distance<=4.5 + exact cursor before each cut. #9295 west packet ordinary3, grounditems138.96/137.125 unreceived. #9300 shifted1382231, collected ordinary5. #9301 fresh source137column andnearbyroof eight exactcursor cuts, ordinary12 +incidentalTORCH1, HP20food20grounded/nohostiles; 27s actual program. No floors cut.

Local shared emergency interrupted original recipient adoption: P1 zombie death10:03:43; P2 creeper10:03:48 then zombie/silverfish repeatedly. P4 stayed safe northsource. P2 escapednorth#9298; P1 recoveredBED/STICK4/DEEP3 and movednorth. No oldbed return made byP4. Original12wood recipient deadline10:06:05 passed without receipt; physical source12 was useful partial only.

#9306 crafted TABLE1 using4wood, ordinary12→8; #9308 normal directfloorTOP cursor on140,-37,2232 then placeUP: target140,-36,2232 nowCRAFTING_TABLE, ordinarytable1→0, HP20. Mainaisle2231 unchanged. Coordinated actual location1402232 rather than P1 later suggested1412231; P1 accepted chat7739. #9316 yieldedwest1382231/HP20/WOOD8+TORCH1. P1 sets newbed1422232/33 independently. Useful table adoption still pending at this checkpoint.

One refused overlap attempt10:05:31: `say` while own#9301 active was refused by arena, no program executed. Learned `say` itself uses player program, so never issue even chat before verifying current own program completed. No overlapping p4 programs actually ran. Owned watch.py remains strictly read-only.

ACTIVE gift_northwood.js after#9321 announcement, OS97758: donor moves1392231, awaits compatible P1near1402231<=12s, ordinaryWOOD8 toss then donorretreat1382231, wait55ticks. Need inspect actual program result and recipient ordinary inventory/adoption before claiming contribution. Original budget miss persists; do not start a new delivery clock.
