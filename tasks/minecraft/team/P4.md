# P4 provisional handoff — iteration 29, 05:06 UTC

The dragon objective is unmet. Opening evaluator returned LAST-SAVED dragon=0, milestones=11/12, deaths=182 after SAVE-ALL failed (connection refused). No current-iteration live crystal removal or accepted attack has been independently verified. Closure evaluation is required after 05:24:41 UTC; this handoff is provisional and useful work continues until then.

P4 controls only p4, with no subagents. Live status at 05:04:09 remains Overworld (-0.583,55,-24.481), 20 HP, 20 food, Dirt2 only. Readonly program11709 supplied three full boundary audits at04:36:29–30. No p4 physical movement, death, acquisition or delivery this iteration. All own programs completed. Courier work was explicitly retired at04:19:15: acquisition, Overworld travel, End entry, recipient receipt and use were not qualified. Do not resume the failed supply sequence by default.

## What was actually adopted

- Sand height method: P2 SB231/232 qualified actual one/two-block up-and-down cycles. SB234 exercised airborne hazard abort, waited for stable landing, descended both Sand blocks and retained 10HP. This is a narrow observed return, not immunity.
- First-corner geometry: first_corner_model.py/.json used an actual upper census plus explicit lower-height transfer assumptions. Prediction: center is occluded, native North sneak opens anchor, recenter before placing the next floor. P2 SB247 actually passed the complete 13s two-step/corner return with 10HP. This removed a concrete placement dependency; it did not qualify the whole ring or blast.
- Reusable caps: P4 proposed Sand head plus existing crafting-table roof instead of spending two pick uses each reopening. P2 SB250 qualified actual installation, hand/shovel opening, physical pickup, return and full closure. SB251 reused the cycle with wood wear49 unchanged, demonstrating the intended saving.
- Passive evidence: public BossBar/hurt recorder adopted, but only initial health1/no actual dragon hurt captured. Player-damage v1 adopted in sandbox and LIVE11699/11701, and actually captured later sandbox hurt. Archived v1 SHA256 0a6a736c3e79f06f7dca86fc8227b03fca40462974fb1b180f815833de2e8e38. Enhanced bounded/yaw/pitch version is fixture-tested but not adopted.
- Return controller: after SB254 drift, P4 identified that fixed-heading motion cannot satisfy Euclidean tolerance after cross-axis displacement. Owner adopted directional/cross-axis termination plus physical reconciliation. SB257 actually exercised reconciliation after airborne displacement and completed return; it does not isolate every new controller branch.

## Actual live enabler

P2 LIVE11701 completed pillar-west access at(30.568221,58,-24.550919), 10HP16food, Snow1/Sand2/endstone199/wood wear42 of59. Three full audits04:29:47.575/.825/48.077. LIVE11699 failed its forward attempt but retained home10HP. Live status05:04 still matches the pillar base. This is actual new physical access, not a crystal effect. Only encounter_owner runs p2.

## Latest sandbox result and limits

G29-8 READY04:58:17 (copy0.5s/total15.4s; exact copy instant unknown), explicitly released by owner and preserved before replacement. It copied unchanged live pillar-base state. Current sandbox differs substantially in body position, blocks, wear, health and encounter history.

SB256 quiet route passed: preopened flat west lane, actual24m walk30→6 in5.712s, new full pod at6/58 with10HP. challenge=false/events[] means it did NOT qualify cloud escape.

SB257 actual68.858s: reached ring69 before hazard abort at05:02:34.047. Cloud spawned05:02:35.216 at36.501/68/-26.518; observed HP10→6 at36.218 while descending67. Reconciliation logged airborne unsettled state, then actual descent continued. Field exit began05:02:46.921 at30.500/58/-24.510/6HP; ended52.628 at6.401/58/-24.510/6HP with cloud31.781m away. Three full boundary audits54.783/55.033/55.284, terminal56.036 at6.327/58/-24.510/6HP16food/Snow1/endstone173/wood50. This is ONE actual challenged retained return, not undamaged escape or full crystal qualification. No Snow fired, no attack, targetPresent=true, Boss min1/hurt0. Raw source/output: latest_sb_0504.txt. Current status must be reconciled before any follow-up; no reset is requested or pending.

## Failures preserved

Three verified current29 SANDBOX deaths: SB244 Enderman04:21:58; SB252 MAGIC04:41:54 after exposed73 return failure; SB255 MAGIC04:54:02 after sealing near an active cloud. SB255's three full-boundary audits were already2HP, then death: geometry alone is not a safe endpoint. targetGone during death/unload is not removal. No verified29 live death.

CONTACT series retired after repeated injuries and zero actual attacks; no inference that attacks are ineffective. SB252 reached78 and opened bar79 but actual cursor3 was null despite model-clear2.0624m ray; no attack/blast. Physical closer stance/one-tick static settle remain unexercised. Whole crystal-effect goals through05:00 were missed; later budgets are prospective.

## Coordination and records

Never reset an active shared test. Require explicit peer release and preserved source/results; inspect statuses before reset, publish generation/copy duration and track subsequent live changes. reset_and_notice.py records this and posts READY; use it only with a real release. p4cmd.py serializes p4 across both environments including chats. Independent p2 programs may run concurrently. Do not run p4 to proxy different p2 starting conditions.

Ledgers: ITER29_TESTS.md and ITER29_SANDBOX.md. MIN20 and MIN40 report that no live action was enabled at those times; later11701 access is separately recorded. Exact arena start03:39:41 means provisional90=05:09:41 and useful-work105=05:24:41. Owner physical stop may be earlier05:23; closure eval follows105.

Integrity: no ENCOUNTER.md, excluded17–19/client/server/.work/internet contents opened this iteration. An overbroad filename listing emitted names only and was corrected. Historical voided advancement was not used as victory. No raw packets, fake actors, through-block/reach bypass, tools/server edits, peer-file edits, other-player play, agents or push. Inherited iteration28 losses/allowed archive-derived exposure are retained in INHERITED_P4.md, not erased or blanket-certified. Local04:37 documentation writer failed before writes; corrected and verified at04:38. No world effect.

Next: inspect actual owner follow-up, review transfer against current live source and hazards, append material changes, run closure evaluator after05:24:41, checkpoint owned paths only. Do not report task complete absent world evidence.
