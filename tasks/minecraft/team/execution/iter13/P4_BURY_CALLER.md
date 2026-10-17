# P4 chosen wood_bury caller — initial answer 09:35 UTC

Owner **P4**, next operation actual small automatic failure-ending case `wood_bury.js`, beneficiary P2/P3/P4 field retention. Source inspection only; no approval gate/player execution.

The selected source already uses **SPRUCE_PLANK non-gravity roof**, retains supported adjacent sand columns, and waits15ticks after descent. This answers the earlier raw6422 sand-roof concern at source level, independently of specialist advice. Physical qualification pending; do not retest an already accepted case without a new question.

Two narrow remaining receipt/compatibility assumptions:

1. `safeBore(q)` checks ten surrounding shell faces but does NOT check actual foot/head AIR or current body pose at q after gravity settles. It could report full shell without demonstrating breathable standing cells. Proposed small postcondition: preserve existing full envelope AND actual clear(q), clear(q+1), current body x/z within chosen center tolerance, y=q.y, onGround and healthy same entity/dimension; settled follow-up after roof placement. Required physical evidence is the actual new bore body+clear cells+ten faces at return, not `full:true` label alone. Don't loosen shell or remove life checks.

2. `bury()` may call `bot.craft(planks,1,null)` and immediately require ordinaryplanks. Current-run P2 actual6375→6376 proved live inventory output can remain in grid0 despite craft promise returning. This does NOT prove P4's conversion will fail, but a refusal with LOG0/PLANK0 should inspect live current grid0/cursor before claiming no cap. Proposed correction bounded actual output take/clear exact own slots if necessary, then count/recompute, before any descent. Don't repeat a wood trip based on helper refusal alone. Required physical ordinaryPLANK cap in own inventory BEFORE cutting shaft, then actualcaproof/same-lifeending. Existing code does enforce count>=1 before descent, so no source claim that it digs without a cap.

The new caller still travels to a distant log before its first bore; chat calls whole operation225/240s, work and failure handling must leave enough time for the selected local ending. Actual prior wood3 operation146.7s is one relevant duration, not proof this higher remaining log73/74 is reachable/collectible or the same pickup outcome. If work fails before LOG1, its fallback remains nativecampreturn: that is a **different failure branch**, not qualified by later log-held burial. Need early changed branch/ending decision for that actual failure, not claim universal burial coverage.

No specialist adoption/causal credit; selected source and future physical returns remain distinct. If successful bore return says `closed:false` (camp predicate) but actual `protectedEnd:true` plus bore evidence, that is expected outside-camp classification, not automatically a breached bore. Keep chosen protection semantics separate from old camp-only flag.
