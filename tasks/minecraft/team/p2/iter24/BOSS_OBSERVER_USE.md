# Limited boss observer — iteration24
Provenance: installed Mineflayer API BossBar.health (fraction0..1) and documented events. No client mappings, health metadata index, absolute HP or combat semantics.

`boss_observer_core.js` is the exact definition extracted from the OW-tested10537 function. Definition only; node syntax check passed. Include this definition in owner caller, then call BEFORE actual End entry; the full `boss_observer.js` includes a short OW smoke and should not be blindly concatenated as the combat instrument.

```
const observation = observeBoss(bot);
try {
  // owner's ordinary entry/interaction/retention operation
} finally {
  const records = observation.stop();
  const grouped = {};
  for (const r of records) {
    if (!Number.isFinite(r.fraction)) continue;
    const key = String(r.uuid ?? r.title);
    const g = grouped[key] ??= { title:r.title, first:r.fraction, minimum:r.fraction, last:r.fraction, samples:0 };
    g.minimum = Math.min(g.minimum,r.fraction); g.last=r.fraction; g.samples++;
  }
  console.log('BOSS_FINAL_SUMMARY',JSON.stringify({grouped,dragonHurtEvents:records.filter(r=>r.event==='entityHurt').length,records:records.length}));
}
```
Final summary preserves before/minimum/after if verbose intermediate logs are clipped. Catch exceptions separately and keep a real physical ending inside the outer timeout; this observer cannot guarantee finally after interruption. Empty records = no observation, not zero damage. A health decrease is an observed effect, not proof of which action caused it absent timing/comparison. Swing/hurt events alone do not prove net damage/victory. Official evaluator remains objective score.

Validation:10537 OW attach/cleanup returned listener counts to original/no boss events. End branch and the illustrative summary call are UNTESTED in world. Owner must inspect actual output before making combat claims. Do not synthesize entities, parts or packets.
