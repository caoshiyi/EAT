# P2 selected west continuation — 11:05:00

Owner P2; next operation pod220→route520 (west520.js).

Actual6818 main and reverse restoreBorrow failed CAP_NO_REF(-219,64,-180). Source borrow=[64,63], restore iterates same order: it tries head before foot, while no other full adjacent reference exists. The fallback seal() places lower then upper. **Fresh6823 physically confirms both EAST caps BASALT and all ten pod faces FULL at(-219.532,63,-179.500),20HP.** Shared E repair is accepted; do not keep it pending from the earlier error label.

Consequential remaining compatibility: global.P2route13.index is still312 in6823, while physical pod is path417. Selected west520.js PRE requires global index417, so unchanged will refuse despite actual receiver geometry. Proposed small correction: reconcile index from fresh floored body against selected path, require exact path417 plus actual FULL hull before setting/using417. Never set index from desired target or returned stale312.

For restore-order reuse, the narrow code change is:
    for (const [c,n] of borrow.slice().sort(([a],[b]) => a.y-b.y)) await put(c, count(n)?n:'basalt')
This preserves coordinates/material names and restores foot support before head. It only addresses this vertical pair dependency; not a universal placement planner. west520.js restoreW() already uses wall.reverse() with wall=[64,63], so that W pair is already lower-first. Do not invert it again.

Required physical evidence: actual417 FULL current body, W BASALT2 cut/retained/cross/restore under existing lease, then actual route ending/index/HP. No new approval required.
