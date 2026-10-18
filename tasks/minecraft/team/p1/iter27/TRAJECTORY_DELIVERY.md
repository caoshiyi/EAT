# To P2: accepted ten-minute contribution, delivered23:58 UTC

Recipient/decision: encounter_owner stance and aim for one actual Snow trial against uncaged western crystal. P2 accepted23:55:29. Complete P1 allocation ten minutes23:55–00:05 including empirical replay, planner, delivery and response; zero P1 movement/materials, no courier/End transit. P2's own whole-operation budget remains in ITER27_PLAN. Acceptance is a P2 actual sandbox shot with logged projectile/target outcome and retained ending; model delivery alone is not acceptance or objective effect.

`trajectory.py` reads ONLY public PROJECTILE_POST observations from P1's known iter26 captured arena125 record. It fits first interval, then predicts two withheld intervals; max error0.001714 blocks, four distinct observed positions. This is a small actual-data qualification. Current fitted speed1.521574, drag.98999984, downward increment.03000695, ten simulated steps per observed update. It does not establish universal Snow physics, dispersion, block collision, blast/safety or crystal effect.

Important changed decision: closing26 lead(-22.5,50,-20.5) is too LOW even at11.705 horizontal distance: requiredrise35.13 versus maxmodel28.366. Feet56 also too low. Feet58 barely qualifies model (rise27.13). Feet60 adds3.24m modelheadroom while remaining six below failedfountain66. The changed XZ does NOT imply hazard immunity.

Conditional candidate feet(-22.5,60,-20.5), projectile originY61.52 (observed oldspawn offset1.52), target(-33.5,86.65,-24.5): lowarc elevation71.85674deg, flight28.232modelticks. Higharc79.84119deg/57.008ticks unnecessary exposure. If actual eyeY61.62, lowarc `lookAt` point at targetXZ with Y97.33923 makes desired angle. Target-center lookY86.65 gives about65deg and is NOT the compensated aim. Eye/proj origin offsets must be reobserved in newshot. Use actual origin/currenttarget, not this table blindly. Formula yaw comes from actualtargetXZ; do not mutate direction vector with normalize then read its norm.

Aperture implication: high upward launch at71.86deg is nearly vertical; at +0.48m from launch to a feet+2roof underside, horizontal travel only0.157m. A cap directly overhead will intercept. The prior `observeOneSnowball` requires aim==target+.65, so do not reuse that unchanged if testing compensated arc. Independent actual current ray/aperture/target checks and observed projectile clearance before recap required. No through-block shot, no model-derived reach admission. A low adjacent window may not permit this arc.

`stance_table.json` contains20 hypothetical origins. To recompute with actual coordinates:
`python3 tasks/minecraft/team/p1/iter27/trajectory.py tasks/minecraft/team/p1/iter26/P2_G3_125_latest_record.raw --origin -22.5 61.52 -20.5 --target -33.5 86.65 -24.5`

No P1 run/say queued; token released after completed11467. P4 owns reset coordination. If terrain/ascent cannot deliver this small stance/roof opening/retreat in P2's budget, reject this candidate rather than extending a recovery chain. Two comparable failures require changed premise or method.
