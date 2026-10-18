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
