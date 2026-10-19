# P3 iteration33 work log

Owner: p3 only; no agents. Started live 11:42 UTC. Read full program.md and required iteration32 opening/P2/P4 handoffs. Mission iter33 PLAN absent at opening. Python absent; use python3. Shared opening evaluator via P4: LAST-SAVED dragon0/11 milestones/199 deaths, forced save failed.

- 12275 actual HOME6.5/67/82.5 HP2.166664 food17 empty grounded. Table floor, slab roof, bed south, chest east; hostiles y60 below.
- 12279 normal chest read: leather1 emerald4 map1 sapling1 spider_eye1; no food/tools.
- 12283 no berry within96 (separate12289), logs~29m away, night.
- 12285 sleep failed; 12289 native bed interaction explicitly reported bed obstructed.
- Changed physical obstruction: 12291 mined only dirt6/68/83 above foot, actual dirt1 pickup; retained slab roof. Native activation then Sweet Dreams and sleeping.
- 12294 next-source retained dirt1/body; wake returned same safe grounded cell, no HP loss. Native sleep checkpoint works; respawn viability not established.
- P2 assignment12289 public chat: independent recovery/resources, no transfer promise. P1 protected berry propagation research; P4 local protected logs.
- Proposed distinct body-recovery test: chest dirt, ordinary fatal fall, native respawn at restored HOME bed. Coordinate sandbox reset with P4 before test; no live sacrifice yet. Acceptance actual full-health respawn at usable HOME source, retained bed/chest, next operation usable.

- 11:45 P1/P2/P4 all sandbox idle/preserved acknowledgments received via chat; initiated P3 own sandbox reset. New script respawn_test.js syntax-tested; intended source/home/HPlimit strict guards; deposit all carried resources, remove only west doorway, ordinary jump/fall, observe death and native respawn. Sandbox success would not itself restore live body.
- Mission PLAN read once available. Public docs confirm bot auto-respawn defaults true. No server access. CLI sandbox flag must precede subcommand; status --sandbox failed parser with no gameplay.

## Body recovery discriminating experiment
- P3 sandbox reset completed18.0s, actual copy0.7s; only P3 slot.
- SB1 11:45:44: stored Dirt2/Sand1 in chest after west doorway cuts. Roof shortened jump; fall ended63/HP1.166; NO death. Failed to exercise respawn, no live replay unchanged.
- SB2 bounded ordinary path to7/60/82: Creeper death11:46:17.669; final HOME6.5/67/82.5 HP20 food20. Respawn event fires before final body update (event observed old location andHP0); do not treat event alone as endpoint.
- SB3 next source HOME20HP20food grounded; bed/table/chest/slab intact; chest Dirt2/Sand1 and original items retained. This qualifies current sandbox consequence only.
- Started live_body_reset.js: fresh fixture/body/visible-creeper admission; bank all inventory; ordinary west descent then hostile approach; stop on native death, wait for actual home/HP update. Bounded30s.

- LIVE12345 actual stored Dirt2/Sand1, ordinary Creeper death11:47:03.309 at6.4/60/82.5. END HOME20HP20food grounded empty.
- LIVE12350 NEXT_SOURCE retained20HP20food; bank all intact. WithdrawDirt2/Sand1 and reclose original west dirt/sand via normal face placement. END retainedDirt1, bed/table/chest/roof intact. One intentional new live death; no carried resource loss. Body recovery acceptance PASSED live, not dragon effect. Sandbox trial released; no further reset needed.
- Next independent productive branch: current body can now fund own short log/tool acquisition and travel. P4 chooses iron, P1 boat-control research, P2 protected berries+travel.
