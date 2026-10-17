# P1 ocean-shaft review — initial 04:13:30 UTC, request3669/70

Read ocean_shaft.js in full. This is scoped source guidance for the actual next operation, not an approval gate or physical qualification.

**Observation adoption is in this caller:** listener is attached before consume; current self entity ID + registry WaterBreathing ID + positive duration are required, application age≤7s and predicted remaining reserve are checked before DIVE. Own-air guard has ID/receipt-age scope. Inventory disappearance is reported separately. Main DRAIN requires actual feet/head air, !isInWater, onGround and hull(actualfeet); it does not pretend roof placement itself proves drainage. These are useful source improvements. World application/drain remains untested until execution.

**Small consequential corrections:**

1. **Remember roof intent BEFORE awaiting placement.** sealRoof assigns capPos only after placement/ACK. A roof can become real even if the awaited placement fails or a later check throws; escape then sees capPos=null and may jump under the actual cap without opening it. Record intended roof early, then escape must re-read that target/current overhead and act on actual geometry, not the prior success flag. Keep real target/type checks; no metadata edits.
2. **Use one dry-shaft predicate in normal and fallback paths.** Finally's success shortcut drops the normal branch's feet-AIR and onGround requirements. Re-read actual body, feet/head cells, water flags, support and hull after awaits; do not certify PROTECTED_DRY_SHAFT from the weaker shortcut.
3. **Invalidate observed effect on matching self remove_entity_effect.** Current buff persists to predicted expiresAt even if a removal packet arrives. Capture the removal; clear validity on life/world discontinuity. expiresAt=receipt+ticks×50ms is a prediction, not a current effect event. The existing lost/world checks prevent many discontinuity actions but do not change this measurement class.
4. **Dispatch failed preflight by current body.** All failures, including NOT_AT_SITE/NO_FRESH_WATER_BUFF, enter the same escape that steers toward site. If already in an actual dry full shelter, keep/report that verified body; if actually wet/exposed, use the chosen bounded escape. A failed precondition is not proof the body needs travel toward an unqualified dive site.

**Budget / physical limits:** work75s/hard115s reserves≈40s only if awaited dig/place/consume return in time; need() is not cancellation. Confirm outer arena timeout exceeds the hard deadline plus final cleanup. wetCut predicts cost but bot.dig itself has no local wall cancellation. Escape's cap dig also has no bound; reserve its cost before ascent. Do not enlarge the expedition or rewrite the framework: stop forward work early enough for the actual chosen reverse/open-cap/ascent.

DRAIN_NOT_ACTUAL should preserve exact feet/head block properties/levels and actual pose; a solid roof may sever flowing water but does not itself remove a source. The finite physical drain predicate is the decisive test. Fixed1.62 eye sampling is an approximation during crouch; log actual eyeHeight/pose if the water/body results disagree. No additional ritual dive or claim that shallow-door success covers this deep shaft.

No player program by execution. Published source review is not evidence of later adoption or causal success; verify exact executed body and actual ending.

04:16 source follow-through: saved ocean_shaft.js (mtime04:15:11) still assigns capPos after the awaited roof placement, has no remove_entity_effect listener, and retains the weaker fallback dry-success shortcut. This is a saved-source check, not the future executed operation. The review's publication is not adoption; owner may make a different bounded choice. Verify the actual submitted body before any claim those branches were corrected. No approval or waiting requirement is imposed by this note.
