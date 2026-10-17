# P3 portal path comparison — initial answer 2026-10-17T01:36:13.936461+00:00

Read actual nether_entry_bounded.js, portal_path_compare.js, and #3995 full output. **Current comparison does not support entity-predicate CPU cost as the limiting factor.** Geometry-only/repeated-entities/cached-entities all found the SAME13-node path with106neighbor calls in26/35/27ms, despite132entities. The9ms observed difference is far below live thinkTimeout1500ms. No timeout increase or entity-cache rewrite is justified by this result.

Limit: this is not a reproduction of the failed call. Comparator starts at fixed(6.5,66,79.5), while actual body in #3995 was insidecamp(6.559,67.5625,82.722). Failed APPROACH's exact post-exit start was not logged there. Source go() uses actualbotposition; fractional height/onGround and changed geometry/entities can change reachable neighbors. Gate is open in compare snapshot, not proof of its earlier state.

Small next-caller correction: at the next already intended exit, capture ACTUAL start, dimension/onGround/velocity, target and relevant local blocks immediately before go. If comparing, pass that actualstart.clone to all modes on the same snapshot, record elapsed/status/neighbor count/path length and use the exact live Movements options. Avoid executing a geometry-only path as a safety shortcut; it is a diagnostic comparison.

If all modes quickly succeed there but live goto later fails, record path_update statuses and last actual node rather than change global budget. If geometry-only succeeds but guarded variants fail at comparable CPU cost, inspect the precise rejected neighbor/threat predicate. If all variants time out with large expansion counts, then search geometry/cost is implicated; only measured slice/total timing can distinguish it from a hard noPath.

Current source repeats safeCell/blockAt and Object.values per candidate, but source expense alone is not measured bottleneck. The existing 26–35ms pass is useful negative evidence. No new host benchmark is needed; it would not reproduce current loaded geometry. No player action by engineer/no approval gate.
