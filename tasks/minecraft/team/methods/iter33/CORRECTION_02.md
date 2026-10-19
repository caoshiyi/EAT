# Correction02 — expose the failed block postcondition

Published 2026-10-19T11:07:02.666044+00:00. Current owned issue; correction01 historical proposal retired without live negative-case validation.

Observed: completed SB348 entered at155.038/63/1009.026, below=ice, then generic cut failed digpost at11:06:09.129, before any FISH_ATTACK/receipt. Generic cut allows only air/cave_air at q after dig. The actual replacement name/q is absent from output. Smallest supported cause: its postcondition rejected a nonair result. Water replacement is a hypothesis, not verified. P4 independently reported same mismatch11597–99.

Small reviewable proposal: replace bare throw Error('digpost') with a poststate diagnostic including original name, q, current block name/properties and body; preserve current refusal until actual result is known. See digpost_diagnostic.js.txt. This changes observability only, does not relax reach/visibility or command success criteria. No peer file edited.

Acceptance exercises failure: operator-selected short reproduction of the already-failed branch must show exact q and observed replacement block at the rejected postcondition; operator checks that observation against current normal client blockAt(q). If water is actually observed after original ice, owner can narrowly accept water for that declared operation and then check intended physical access, actual receipt and retained return separately. If ice persists, inspect event/update timing instead. No whole food chain repeated just to print success. A diagnostic test passes only when operator observes useful actual poststate; source presence or CLI success alone does not validate it.

No promise of food/acquisition/return from this diagnostic. Completed348 return was genuinely sealed14HP6food, not a food success; practice remains separate from live.
