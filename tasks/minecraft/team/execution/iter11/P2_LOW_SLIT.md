# P2 low foot-slit question3846/47 — 05:08 UTC

Beneficiary: P2 changed rod approach. Imminent experiment: owner actual farm survey before any cut (later than current FOOD operation). Suspected defect: assuming foot slit creates melee access to floating Blaze atY62..64 while own feetY61/head wallY62 is solid. Proposed correction: test target AABB visibility against ACTUAL wall from ACTUAL eye, not distance-to-entity-origin or generic “feet window is safe.” No additional gate on current food.

Installed client minecraft-data 1.20 entities.json: Blaze width0.6/height1.8 (not a sphere or two-block voxel). Own standing eye is ordinarily feet+1.62, crouching ordinarily lower; use actual eye/pose if testing. Program target origin is feet, not center/eye.

Geometry for proposed LOW: own feetY61, headfront cube(-131,62,-430) occupiesY[62,63]; foot opening(-131,61,-430) spans[61,62]. **If target Blaze feetY>=62 and target is beyond that full head cube, a direct segment from own eyeY>62 to ANY point of its hitbox cannot pass through the Y<62 foot opening.** Standing vs crouching alone does not put eye below62 atfeet61. Distance<3 alone cannot certify valid exposed aim. Target moving lower/around cube edges could change this; exact X/Z and current wall shapes matter. No global “cannot melee fromLOW” claim.

Fireball/contact: a cube protecting own eye does not prove all own body is shielded; open foot slot exposes lower body. Blaze motion can change fireball trajectory/reach and own health. No unconditional foot-window immunity promise. Likewise actual snowball damage last iteration did not qualify melee or retained rod.

Small caller correction: derive closest candidate points from current target AABB, clip proposed eye→point ray against current full blocking cubes, reject aim if no point is exposed and in actual reach. In the current special geometry, one inexpensive necessary check is target lowerY<62 for through-foot-slit aim; it is insufficient for safety or even visibility. Do not bypass the wall on client or blindly attack entity origin. Keep immediate physical closure/fallback in same caller; body-clear closure precheck applies only if cube overlaps own body.

Required physical evidence: fresh targetID/feet+width+height, actual own eye/pose and wall aperture; one actual exposed/in-range aim plus observed selfHP, damage event subject/kill, ordinary rod receipt and complete closure. Targethurt != ownhit if otherdamage possible; killed target != retainedrod. Owner chooses bounded useful contact test or changed geometry. No need to resupply or travel merely to prove a negative.

Status: source-level geometric necessary condition, no current farm target/caller yet, no player validation by specialist. Retire/refresh if owner selects a different immediate operation.
