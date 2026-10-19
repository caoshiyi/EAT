# One successful water-edge recovery (LIVE p1)

**Question.** Is p1's repeated server correction caused by stale client state, a false block view, or local collision geometry?

**Actual intervention.** Removed visible STONE(4,61,-2), then native forward south without jump. Artifact: `third_bank_head.js`, canonical LIVE12680. Prerequisites actually present: p1(4.4869,59.4725,-2.3), height1.8/top61.2725; native cuts had already cleared south59/60 and east59/60/61, floor58 remained STONE; target upper stone61 touched current south body edge. StonePick available, HP20/food20.

**Observed result.** Body moved to(4.4876,59.0211,-1.4928) in two150ms samples; ZERO forcedMove events. Same controls had yielded24 corrections/1.2s with no movement in12677. Native closure12684 filled previous waterfoot/head4/59–60/-3 and cap4/61/-2, then three FULL10/grounded20HP20food audits at4.4876/59/-1.3. Successor12691 actually used body/tools for three dry DOWN cuts and closed56/full with no HP/food loss. This is retained live recovery.

**Competing evidence.** P3 independent12656 block census agreed with own view; native bank edits were real, not a demonstrated ghost block. P3/P4/P2 independently observed exact p1 position (12641/12645/12650). Ordinary quit/reconnect12674→12676 preserved inventory, but native movement12677 still failed. P3 proposed flat bank footcut: actually adopted12663, failed alone; removing south59/60 in12668 also failed. Do not claim those two-cell cuts or reconnect as recovery.

**Limitation.** One measured configuration, no universal water/forced-move fix. A three-high TARGET passage elsewhere had not freed p1; the final cut removed an upper neighbor at the CURRENT floating body's edge. Exact collision mechanism inferred from geometry/intervention, not server internals. No teleport, raw packets, server access or infrastructure edits.

**Next use.** On repeated corrections, compare actual fractional feet+height with nearby visible blocks before repeating control input or trusting a nominal two-high grid cell. Clear a specific obstructing upper block only if its native reach/visibility and resulting safe body/floor are established. Recipients informed chat12690; no recipient reuse claimed. Own live adoption passed12684→12691.
