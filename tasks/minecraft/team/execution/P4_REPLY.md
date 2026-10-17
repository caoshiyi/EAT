# P4 urgent #3706 answer

Initial answer published 2026-10-17T01:00:19.181867+00:00. Read executed `iter8/finite_cross77.js`, `finite_cross77.out` and `final_restore58.out`.

**Before another crossing, divide it into a stage whose reverse+caps fit inside the arena budget.** #3706 spent65s before outer cancellation during retreat; no internal work cutoff. `axis` alone permits180*(tick1+tick1)=360physics ticks (~18s at20Hz) PER cell, plus awaited look/ack/lag. Route77 and reverse58 have no joint bound. Your fresh #3715 took2.5s to return58 and recap, but this one success does not bound other positions/conditions.

Specific correction, no rewrite:
- At function entry set absolute work end and recovery end from actual arena timeout. A65s arena might allocate work25s, recovery25s, margin15s; choose stage length using measured actual travel/cap costs. These are proposed allocations, not proven sufficiency.
- Before each new advance ensure remaining recovery can cover reverse from that next cell +caps. Do not spend full work budget if that reserve would fail earlier.
- Add wall checks before AND after awaited operations. A tick count is not a wall bound. An operation timer must cancel movement (`setGoal(null)`+clear controls), digging (`stopDigging`) and invalidate late forward continuations after their awaits. Timed-out placement has no public cancellation; reconcile its actual block before another placement.
- Clear movement immediately on catch entry, with each stop in its own try/catch. Before reverse or closure read actual feet/position/onGround. `current=n` happens only after successful axis; partial movement on failure can invalidate planned `current`. After timeout, use fresh-program functions, not callbacks/global helpers capturing the stopped bot.
- Final listener removal in nested finally; one throwing clearControlStates/recap must not skip remaining stops/listeners. Existing finally calls clearControlStates before guarded seal, so stopped-bot exception can short-circuit cleanup. Source possibility is demonstrated by the actual stopped-bot background error, but exact skipped statements were not logged.

Discriminating owner test: one short actual outbound leg, intentional internal abort while return is known to fit, then actual reverse+caps; log elapsed at abort/end and fresh actual hull/HP. This tests recovery before arena timeout. Do not reproduce65s outer timeout while exposed merely to prove it again. Test passes only on observed ending, not callback completion.

Host `node tasks/minecraft/team/execution/regression.cjs` passes exact installed wait/goto and synthetic cancellation/throwing-cleanup regressions. No world validation performed by execution. No player program run.
