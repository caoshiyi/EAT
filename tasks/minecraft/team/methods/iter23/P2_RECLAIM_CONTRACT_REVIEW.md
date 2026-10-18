# P2 reclaim #10397/#10400 —16:44 UTC

Actual owner files inspected. #10397 failed 'pick absent' before edits while cutting own gravel door: copied tool-dispatch contract required an unavailable pick for a material normally handled by your prior hand-cut helper. This was a helper material/tool admission defect, not failure to find a pick/source. Owner already changed it; do not add a tool prerequisite merely to satisfy that wrong guard.

Changed #10400 actually cut both door blocks, receivedGRAVEL30→32, took one direct step, then later refused target body not AIR. Its failure handler returned/reclosed; terminal full shell/GRAVEL30/HP20 corroborates retention. The short movement was real; intended oldroom/cap reclaim remained incomplete. Full specific failing target/block receipt still needed before causal diagnosis. This is NOT proof that the just-opened door refilled. Prior #10283 returned through a previously visited cell but found GRAVEL24; newdoor note8817–18 already identified possibleGRAVEL26 over its headcap. Thus delayed gravity refill is a relevant historical failure class to discriminate ONLY if fresh evidence identifies a related target, not proof of this current failure or its exact timing. Do not count this as a third instance of original targetless motion failure or simply relax AIR admission.

Materially changed small diagnostic before another opening/traversal: from owner-retained current state, print exact intended door/body/head AND above-column names/positions, then, if an owner-already-needed cut occurs, sample those same cells over subsequent ticks before entry. Compare immediate cut effect with settled/current geometry. This distinguishes an uncut target, delayed falling replacement, wrong coordinates and a stale handoff; no extra quarry/escape attempt requested. Preserve original failed whole16:44 surfacegate if missed; changed model/helper does not reset it.

Owner-run acceptance: explicit target/phase, before/after/material/tick samples, actual ordinary gravel receipt and current actor position/health; if unexpected material appears, branch into owner-selected qualified retained ending. A returned snapshot is not physical reclosure. Do not replay until exact current target evidence changes the test. Supplied terminal observation is validated only to report geometry, not execute this branch. Methods does not choose resource/route strategy or run a program.

## Confirmed logging-order correction —16:45 UTC

Actual direct() source prints DIRECT_PRE only AFTER support/body/head admission guards. Thus a target-body-not-AIR refusal necessarily omits its target, even though successful moves print it. Move the existing receipt BEFORE those guards, include current target cell names, and leave movement/guards unchanged. This is a materially different diagnostic from merely adding another success log:

```js
// immediately after const target/from/base, before admission checks
console.log('DIRECT_ADMISSION', JSON.stringify({from,target,cell:base,
  cells:[-1,0,1].map(dy=>{const p=base.offset(0,dy,0);return {p,name:bot.blockAt(p)?.name??null};})}));
```

Small owner-run acceptance: the next already-needed read-only or bounded caller can execute this receipt without movement; compare target/cell/material to actual known geometry, and confirm its receipt remains present on a guard refusal. No new failed-traversal replay needed. The earlier helper tests qualified successful-case receipts only, not admission failures. Actual #10400 fourRECLAIM_RETURN_FULL arrays/terminal10full confirm returned30GRAVEL/HP20. It is not the previous #10283 failed-return/newroom case. Initial wording of this review was refined after inspecting those full arrays; no current-door refill or loss of retention asserted. Both original16:44surface and16:50food-reliance gates now explicitly retired by lead, no clock reset.
