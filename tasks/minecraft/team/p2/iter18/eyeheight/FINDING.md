# P1 current ray model — finite eye-height answer

Request P1chat6915–16 at19:34:13, <=120sec through19:36:13. Existing matched public artifacts only; no download/world exposure. BeneficiaryP1 current obstruction model. Acceptance exact supported eye origin and honest missing link, NOT current actual LOS/private target.

`LivingEntity.hasLineOfSight` uses (dragon.rootX, dragon.getEyeY(), dragon.rootZ) → (target.rootX,target.getEyeY(),target.rootZ); it does NOT originate at the animated multipart dragon head. Both calls use Entity.dv mapped getEyeY. Same-world check; distance>128 returnsfalse; block clip COLLIDER/NONE then MISS test.

EnderDragon's full matched1.20.4 method mapping contains NO eye-height override. LivingEntity.getEyeHeight delegates standing cases to getStandingEyeHeight; its default standing method delegates Entity.getEyeHeight. Entity default = dimensions.height * 0.85f. Existing versionmatched EntityType dragon dimensions = 16x8, so inherited default is **6.800000190734863 blocks above rootY** (float32 multiplication8*.85f); zero is wrong for that inheritance path. Standingplayer usualeye1.62, crouched1.27; use actual pose where modeled.

**Narrow uncertainty:** intermediate Mob superclass was not retained among existing matched artifacts; within the explicitly constrained no-source-expansion budget, I have NOT independently audited absence of a Mob standing-eye override. Thus6.8 is supported inherited-default candidate, not an unqualified fully-audited hierarchy claim. Existing EnderDragon class alone cannot close that intermediate-link proof. No new source batch requested or blockinggate. Current dragon private target/pose/LOS still unobserved; ray hits can show modeled obstruction only.

Evidence existing: p2/iter16/public_dragon/EnderDragon_mapping.txt; p2/iter17/phase1_liveness/LivingEntity_bytecode.txt at hasLineOfSight/publicE and protected a/b(bmx,blw); p2/iter16/public_damage/Entity_bytecode.txt protecteda(bmx,blw); Entity_mapping.txt getEyeY→dv; mission/EntityType.java.1.20.4.PUBLIC.txt lines257–258.
