# P3 mixed bridge return — 2026-10-17T01:42:01.811114+00:00

Read BRIDGE_FAILURE_REQUEST.md, exact bridge_small_return.js/v2.js, and executed4014/4015/4016/4019.

The copied condition changed behavior: old `!up && near` enables sneak for BOTH flat and downward motion. Revised `dy>=0 && near` enables it for flat/up but excludes downward motion, matching the cited P4 caller. A crouching edge hold is consistent with4014stopping atY67 then falling toY66 after controls cleared. Source alone did not isolate it; the controlled before/after test supplies narrow physical support.

#4014 integrated return FAILED/fullfalse; #4015 fresh repair rejected its overly specific BODY expectation after the actual fall; #4016 separate exact-home caps repairedFULL20HP0.4s. Preserve all three. #4019 v2 performed the same short forward/controlabort/return+caps in8.278s, restoredtrue/FULLsamehome/samelife20HP. That is a passed short recovery test, not proof for all descents or longer-route budgets.

No further identical test is needed just to certify the source. Continue owner-chosen useful stages with actual floor/settle/cap checks and existing recovery allowance. When a return fails, re-read actual feet after clearing controls before choosing repair preconditions;4015shows the old pose may already be stale. `dy` is computed once from the initial cell, so arbitrary midair/discontinuous starts remain outside this qualification.

No framework rewrite, no uniform helper requirement, no approval gate. No engineer player action. The correction was owner-implemented/tested before this reply; no causal credit claimed.
