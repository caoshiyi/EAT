# Iteration19 — verified victory, 2026-10-17 23:07:45 UTC

Official evaluator: dragon=1, milestones=12/12, deaths125 (P1=35). P1 Free the End advancement23:07:34, 22m45 before CURRENT runner23:30:19 deadline. All play only p1; all edits only P1.md/p1/. One planned void death22:27:48, no accidental death this iteration. Final P1 fully enclosed End30.500,49,24.300, HP14.333333969116211/food13/ground/noCloud/controls{}/cursorNULL. No active program after9110 victory announcement.

## Actual working encounter methods

- Last cage: native underground route49 to30,49,+24 avoids the prior unexecuted surface approach. Retained immune End-stone/obsidian shaft, stage at69, require actual moving-away horizontal distance>=24 before final seven levels to standing76. Normal melee uses eye-to-crystal AABB<5.95, not root distance; standing matters. Actual9089 removed12087, empty crystal list and retained lower ending. This case used forced-look jump-floor placement plus staged timing, healthy body and prepared descent; individual causal contributions are not isolated.
- Jump-floor placement: pre-equip/force-prelook before jump was usually successful but9086 still refused floor54. generic_place awaits lookAt unless forceLook is set. Changed _placeBlockWithOptions(...,{forceLook:true}) passed one-level trial9087, then full staged9089. Log actual floor-request pose/velocity and acknowledgement, do not infer placement from call success.
- Three-level escape: atfeet72 mine70 while71 remains support; at73 mine71 while72 remains support. Cutting72 permits3-drop tofloor69/feet70. Ordinary low3UP/drop9079 retained20HP with no damage; new gapDown scans actual landing floor and accepts only1..3 levels, then verifies ground and restores roof. Original one-level descent assertion would reject this ending. First9077 trial had duplicate-variable SyntaxError/no actions; corrected before test.
- Immune blocks do not prevent contact-query damage. 9004 actual damage atfeet73: -6, -3.5, -3.5 over999ms, only dragon in captured hazard list. Cause fits contact but no damage-source packet established it. P3 corrected our initial slow-WOOD explanation: FIRST retreat floor was STONE; only last3 floor cuts used WOOD. StopDigging/abort does not instantly move the body. Do not price one allowed health decrease as one physical hit.
- No repeat of broad ROOT18/ROOT14 abort routes: both stopped without melee, at~58/~68 despite vertical separation. Far55 launch condition then produced55sec NOwindow/no ascent. Actual stage69 + moving-away24 allowed short critical exposure. No source/clock/model alone proves safety.

## Boss fight that completed the objective

Standing LOW49 issued0 in65.7s, best parent AABB distance6.548: range failure, no rejected attack claim. Previous60sec announced first-decision boundary was exceeded by5.7sec. The old crystal explosion left initialboss190; do not credit those10HP to Sword.

Verify floor48, roof52 and full head-height sidewalls51. Temporarily cut roof51 to make a three-high jump room, preopen NORTH23 body/head and verify12-cell native escape. Jump only when tracked parent AABB distance<9.5; normal bot.attack(actualDragon) only when distance<5.95, at13tick cadence. No guessed multipart IDs. Any player damage/cloud triggers same-call settle and north retreat, followed by verified full cover; normal ending clears jump and restores roof51.

Five actual chunks: 190→170.125→124.625→87.125→44.5→0, total839.1sec program time,81 attack dispatches/Sword0→76. All five retained playerHP14.333, no clouds or retreat, each fully enclosed ending; food17→13. Healback never occurred after crystal0. See fights.tsv/rawJSON. Actual final9108 HP0/phase9 and server Free the End, then official evaluator1/12. No prediction was treated as victory.

## Health reset and handoff failures

- Planned normal survival cache/void/respawn/recovery restored20HP20food without a food expedition. One-End small trial9030 observed ground at~.5sec and self-repickup at~2sec. First two full-cache attempts failed fixed-region ground proof and did NOT commit void. First fallback overlapped west placement cell; immediate9038 recentered and restored full cover. No critical gear lost. Original worn stone pick was later consumed by its final two normal mining uses.
- Changed v3 waits server-look ticks, records all drop poses, recomputes expected inventory AFTER mining/tool break, keeps west wall closed, vacates farther before pickup delay expires and verifies actual ground counts. Primary actual81.125,Y49: END28/COFF2/Sword0/WOOD58/TUF1; reserve actual91.109,Y49: END6 plus Basalt1. Both proofs + empty inventory gated voluntary void; controls cleared on death/respawn and old P1 globals cleared. Initial new-body groundFALSE was handled immediately by9048 native one-step movement, verifying groundTRUE. 9073 ordinary cached items recovered and retained FULL81/20HP20food/noCloud, so availability was proved after return rather than assumed from source-level empty-dimension tick behavior.
- Both fixed-region cache attempts returned empty proof while inventory had only reserve6; exact causal split between direction/timing/footprint is not isolated. Do not claim west-wall removal alone explained both failures. v3 actual world proof succeeded.
- P4 fresh pick was accidentally collected by P2 while P1 changed receiving position. P1 acknowledges moving raced the prior handoff. Corrected receiver HOLD145; P2 direct normal relay after actual server-look wait completed actual receipt22:32:31.138. Donor loss, preexisting item, proposed readiness and ordinary beneficiary possession are different facts. No repeated production was needed.

## Clocks remain truthful

- Initial tools/Sword/caps request21:31:50: prefix21:40MISS; FULL beneficiary8943~21:43:56.6 before21:44 wholeMET. Source and actual receipt/ending all recorded.
- Goal whole21:31:50→22:06:50 MISS; lower-one-contact completion22:16 MISS, no crystal attack in either.
- Fresh single stone request22:17:41→P1 receipt22:32:31.138=14m50.138. Original22:30MISS, relay22:31:30MISS. First source22:24MET. Source output was held since22:26:02; waiting/miscollection/relay were not a production shortage.
- Health+cache target22:29MISS. Extended22:35MET: canonical9073 start22:33:29 +32.3s≈22:34:01.3.
- Last-cage staged targets22:45 and22:46 MISS for whole ending: canonical9089 start22:44:24 +109.4s≈22:46:13.4. Later mechanical-fix completion22:49MET. Attack-time effect alone would not meet the retained-ending boundary.
- Final official advancement23:07:34 / evaluator23:07:45, before runner23:30:19. Stage budgets never became mission stop or erased older failures.

## Tools and result discipline

run_once.py hardcodes p1, retains full output plus parsed canonical JSON, immediately prints critical ending fields, and records active.json requested/CLI-returned state. Check body first on exposed/deteriorating ending. Completed programs can leave harmful ongoing states. Never treat last completed record as the active program. Serialization repeat markers are aliases; use the first actual nested occurrence rather than invent missing data. canonical_headers.txt gives arena start timestamps; durations are rounded, so subsecond derived endings are approximate.
