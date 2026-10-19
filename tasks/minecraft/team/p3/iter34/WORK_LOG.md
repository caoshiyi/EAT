# P3 iteration34 work log

Opening: required program, own33 and P1-33 handoffs read in full. Mission34 BOARD initially absent; read once available. `python` missing; use python3 (arena+eval smoke succeeded). Opening eval0dragon/11/206, forced-save refused => LAST-SAVED evidence. P3 native12823 healthy20/20 at8.5/55/89.7 F3G11D1, enclosed.

## Experiment 1 — gravity pillar
Question: does native jump-place work with gravity gravel from a narrow, fractional-offset shaft? Competing failure causes timing/falling block/roof collision vs unsupported placement. Sent mission_owner question/test/outcomes12142..44; accepted parallel native climb.
- Intervention live12830: hand-dig dirt57, jump heights .420/.753/1.001/1.166 then place gravel on actual floor at >=1.12. Observation grounded56, gravel55, G11->10, HP20food20; dirt picked up. Implication gravity support works on full solid base, fractional z89.7 tolerated.
- 12834: first step to57 passed, then false hidden-target guard on dirt60. Failure API assumption in own helper: Vec3.normalize mutated vector before distance measurement, making ray length1. Corrected to scaled(1/dist). No unsupported dig/HP loss.
- 12838 changed helper; five more steps to62, removed dirt60, retained20/20/G4D3. 12844 five steps to67, hand-cut plank67 yieldedPlank1, switched from last gravel to dirt. 12849 hand-cut basalt70, one dirt pillar to68, replaced roof70 using7/70/89 sideanchor with finalDirt1. Retained20/20 F3Plank1; all actions stopped.
- Practical recipient adoption verified: P4 canonical12856 used pillar at95/106 from62->63->64->65, grounded each, unchanged5.911HP17food; actual logs3 retained/full10 ending. Actual12876 used wood in native crafting, furnace1 retained; P4 later12881 reports shield equipped/fresh pick (canonical confirmation can be read if needed). Raw P4_ADOPTION_RECORD.txt captures123? No: canonical12820..12881 range, only P4 plays; P3 only reads.
- P1 reached own68 separately before redirect; do NOT attribute P1 ascent or portal relight to p3 physical operation.

## Discovery 2 — actionable Nether route
Question from P1: precise historical HOME station->18/8/274 link. No duplicate live Nether exploration. Read only specific P1iter26 route/source/raw files and own33 descent record that answered this question.
- Built NETHER_ROUTE.md, HISTORICAL_ROUTE.json, LOW_WAYPOINTS.json; sent12167..72. Actual bypass53 and actualdescent-56/z64 are distinct from failed upper literal.
- Corrected extraction: CARDINAL_ACTUAL was logged BEFORE settled guard; last -32/63/46 entry airborne did NOT pass. Removed from route JSON and documented attempted goal-32/62/46 + cleanup-32/59/46.
- Changed-world inference: old45m shaft was dug to8; blind falling deadly and old fullcolumn preflight inapplicable. Fresh adjacent-column survey needed. Current state unknown until P1 observes. Adoption request pending.

Current: P3 HOME8.5/68/89.7,20HP20food,F3Plank1, controls cleared. Portal active independently observed local12878, actual six nether_portal blocks. P1 actual12854 dimension transition is peer-owned; not P3 effect. No p3 deaths/sandbox runs/reset this iteration. No active p3 program. Next independent uncertainty/contribution should address current route/kit, not duplicate P1 travel or P2berries.
