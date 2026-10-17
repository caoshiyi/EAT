# P1 #4009 upward failure / verified death — 2026-10-17T01:39:55.766831+00:00

Physical evidence: #4009 at01:38:08 ran11.1s, five accepted UP cells thenUP_POST, actualY58/HP7.362/protectedfalse. Event at01:38:23 says **suffocated in a wall**, samecoordinate133.5,58,1492.5—about4s after the program returned. Fresh#4012 at01:38:52 was already camp6.5,67,82.5/HP20/emptykit. That was a new life; no retained-life/kit recovery claim is valid.

Exact caller defect: catch only logs UP_FAIL; finally clearsjump/logs/cleanup. cleanup only repairs P1DownPending, while UP does not set such a pending record. Thus failedUP has no in-program local breathing/closure recovery, despite available outer time. Stopping controls cannot stop a falling block or continued suffocation after return. Required local ending repair must run before returning on this failure path.

Concrete gravity hypothesis in source: the preflight rejects sand/gravel/red_sand only at `p+2` (the block being cut), but accepts any FULLshape at `p+3`. If that upperblock is fallingmaterial, removing p+2 can drop it into the new head cell. FULL is not stability. Suffocation event is consistent with this; exact failed head/above block types were NOT logged, so the physical falling-material cause remains unisolated.

Small correction before reuse: verify the immediate block above the cut is a known stable material; otherwise veto before cutting or choose a different owner operation. After failure, clearjump/movement, read actual feet/body/head/roof/support and repair local breathing/closure under the remaining recovery budget. Do not call the old cell protected while body is one cell higher. A diagnostic-only script is too late if suffocation continues; keep ending repair in the actual UP catch.

Fresh emergency scripts also need expectedlife+coordinate guards BEFORE mutating anything. #4012 correctly printed actualcamp but lacked a check rejecting old-incident coordinates; its branch happened not to dig. HP20 alone cannot identify the old life. Use the owner's existing life token/death guard and actual expected position. This echoes historical3719 magma rescue afterrespawn, without asserting the same deathcause.

No new world reproduction requested. Preserve the original death and kitloss. No engineer playeraction or tools/serverpatch. Old oxygen contamination is a separate confirmed source issue; do not reclassify this suffocation death as drowning.
