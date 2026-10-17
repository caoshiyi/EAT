# P1 fresh wet ending — 2026-10-17T02:08:37.628895+00:00

VERIFIED FOLLOWUP 2026-10-17T02:09:18.609516+00:00: events reports P1 drowned at02:08:13UTC at201.7,60.2,360.5. #4105 camp20HP/EMPTY is a NEW LIFE, not recovery. Initial state publication02:08:37 came after actual death (event inspected02:09:06); it did not enable timely recovery. Do not describe an active oldbody incident now.

Raw#4103 ending: DROP_CENTER_POST, actual201.70,57.848,360.50; HP20, watertrue/groundedfalse/protectedfalse; selfAir raw168/icons11, global400; explicitjumptrue. This is NOT protected or full breath. Jump intent is not observed ascent/surfacing. Owner should check/resolve current wet ending before extended diagnosis or another long travel stage; engineer runs no player program.

No diagnosis of death or continuing damage from this single ending. SelfAir value is own metadata; global400 is known contaminated namespace. Pending owner followup determines whether this incident remains active. Source/caller audit follows only after immediate state publication.

## Actual caller finding — 2026-10-17T02:08:59.139560+00:00

#4103 immediateBurial checks water/onGround/cheapColumn BEFORE await centerDrop(q). centerDrop then spends ticks moving and tests only X/Z; it does not check fresh Y/onGround/water/support. After that immediateBurial rechecks cheapColumn geometry, but not body state. surfaceBox similarly checks dry/onGround before await centerDrop. Current DROP_CENTER_POST threw before cuts/pending burial; do not call this an underwater burial or infer a unique cause for the drift.

Small correction: after centering/waiting, re-read body and reject stale q unless floor position matches intended standing cell, Y is within the owner's settled tolerance, onGround is true, body/head are dry, and support still FULL. Clear controls in centering finally. An invalidated dry-centering sequence must enter bounded wet recovery rather than continue ground-only construction. Existing final jump=true is intent only; report own air trend/actual ascent and dry endpoint. Source proposal, not physical qualification. No lethal reproduction requested.

## Wet finally / execution contract — 2026-10-17T02:12:10.101467+00:00

Read exact4103 guardedWalk, its catch, cleanup, and final floating handling. airIcons() exists but is never called: self metadata is currently report-only, not an operational guard. Normal wet loop aims forward toward distant target; catch runs dry burial/box fallbacks, then cleanup leaves jumptrue and returns. No same-program check establishes rising self-air, actual head clearance, or a dry recoverable ending. At raw168 there was limited recovery time; actual death21s after ending confirms passive jump was insufficient IN THIS GEOMETRY. Unknown ceiling/flow/collision shape, not enough evidence to name why it stalled.

Narrow proposed contract (owner chooses motion/egress, engineer does not play):
1. Enter a named WET_RECOVERY branch immediately on wet state/error BEFORE ground-only fallback. Preserve life/dimension discontinuity guard and existing arena recovery reserve.
2. Read actual body/head blocks, ownair and velocity/Y every bounded interval; distant target is no longer the recovery goal. Select a currently observed usable egress; a vertical jump with no observed progress must change action before the same air reserve is spent. Do not wait for an outside observer.
3. Required observed completion: actual breathing (own air rising/recovered with head clear) plus chosen protected/dry endpoint. GeometryFULL and jumptrue are separate observations, neither completes wet recovery. If returning on an unresolved incident is unavoidable, say unresolved explicitly; don't label it safe.
4. On stale-centering guard failure, clear controls, re-read wet/body/support, and dispatch to that branch; do not continue a prior dry sequence.

One bounded owner qualification, only when useful and from a known shallow exit with ample own air: trigger controlled abort at a safe water edge, execute the revised SAME-program wet branch, record ownair trend/actual body+head/dry ending/HP and elapsed vs recovery reserve. This exercises error routing and completion reporting, NOT deep-water/overhang suffocation immunity. No forced low-air/redeath or second long 360m travel needed. If owner instead avoids water, qualify that actual changed route predicate rather than claiming the wet branch tested. Proposal unadopted/unverified.

## Respawn counterexample / freshness — 2026-10-17T02:13:05.699511+00:00

Raw4105 after death: NEWLIFE camp20HP/empty but ownmetadata air=-19. Raw4115 later actual dry/grounded/headAIR/FULL at35.51,65,115.49, HP4.264 (SALVAGE_HP), food20, onlyDIRT1; ownair still-19. Thus ownentity namespace avoids other-entity contamination but cached own value is not automatically fresh after a life discontinuity. No continued drowning claim from this value; actual4115 wetfalse/headAIR. Damagecauseunisolated, no salvage/kitreceipt.

Installed entities.js rebuilds entitylist on login, not respawn; game.js respawn updates game data, not entitymetadata. Metadata merge retains unmentioned fields. If owner needs freshness for a wet qualification, invalidate local freshness at life change and mark fresh only on an incoming entity_metadata packet for CURRENTselfID containing the air_supply key. A generic entityUpdate can be anotherfield, so does not prove air refreshed. Listener can be scoped/removed in finally; do not modify tools, fake metadata, or assume this lifetime's cached negativevalue is current breath. Current body/head/wet observations and an actual ownair trend remain distinct receipts. No world validation performed by engineer.
