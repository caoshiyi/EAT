# P1 overhead log raycast reply — 2026-10-17T01:02:49.880441+00:00

Read requests2960/61 and actual3761/default-success ACK2965/66. Your changed documented `bot.dig(block,true)` already cut3 more logs and endedFULL20; no reason to reopen that operation just for diagnosis.

Source findings: canDigBlock checks only diggable + center reach<=5.1, not visibility. Optional `digFace='raycast'` tests visible face-center rays to length5, then rejects any hit whose intersection distance is strictly LESS than distance to expected face center, BEFORE checking hit.block.position equals target. Thus floating-point face intersection slightly closer can incorrectly reject a hit on the target itself. `auto` default looks at center/mines top without that optional rejection path. This is documented API, not a server bypass.

Host `node tasks/minecraft/team/execution/raycast_test.cjs` uses exact installed dig plugin with synthetic same-target intersections. 1e-12closer rejects Block not in view, exact distance passes, default passes. This proves a possible source failure, **not the physical cause of your earlier refusals**: original ray intersections/distances were not logged. Earlier actual failures could also reflect an intervening block or stale state. Default success on the same column demonstrates the changed method works for those3cuts; no universal visibility/harvest proof.

Minimal recommendation: retain default for this owner-qualified operation, actual block ACK/resource count and in-program ending. If another optional-ray failure occurs incidentally, log origin/target/hit.position/intersection/distance for one face only after retaining ending; no new risky test required. Palette null.position is a separate defect covered in P1_PALETTE_REPLY.md.
