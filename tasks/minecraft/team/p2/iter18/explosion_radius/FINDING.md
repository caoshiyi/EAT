# P1 near-cage blast-buffer question — exact existing source

P1 request7011–12 at20:04:09; <=90sec, no newdownload/model/worldgate. First answer8672 by20:05:32,83sec. Beneficiary: whether a horizontal<12 blanket model rejection wrongly excludes an otherwise far-above crystal shot from demonstrated feet55. Acceptance exact distance metric/power/range and scope.

**YES: explosion entity range uses full 3D root-position distance to actual explosion centre.** Explosion.explode obtains `radius = power*2` (bytecodes454–460), calls entity.distanceToSqr(Vec3 centre), takes sqrt/divides radius, and skips this entity if the result exceeds1 (647–666). Exact Entity.distanceToSqr(Vec3) includes deltaX²+deltaY²+deltaZ²; Y is root/feet, not eye and not horizontal-only. EndCrystal hurt creates explosion at its actual rootX,Y,Z with power6 (bytecodes87–105), hence radius12.

Therefore actual player root distance>=16 to that crystal's actual explosion centre lies outside this explosion's entity damage/knockback gate even with horizontal separation11.5. Inside12, block exposure affects damage/knockback; outside12 the entity is skipped before that calculation. Equality12 is not the same guaranteed skip because guard is >1; the proposed16 buffer exceeds it. Use actual ROOT distance and actual crystalcentre, not assumed aimpoint/eye distance.

This closes only the single explosion's range metric. It does not validate any shot, terrain/retreat, dragon contact/knockback or cloud safety. No physical shot/recovery/route/source acquisition by P2. P1 chooses prospective changed model/operation; source finding is not a worldgate.

Exact existing public1.20.4 artifacts in `p2/iter16/public_damage/`; hashes/extractedfragments alongside. Small extraction assertions passed. Detailed publication of this file occurred after first83secchatanswer; provenance records actualfilecreation time, do not call fullartifactpublication83sec. Prior negative cage shot/upperfailedending/death remain unchanged evidence.
