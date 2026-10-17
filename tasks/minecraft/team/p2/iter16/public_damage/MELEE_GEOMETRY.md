# Public client evidence; unqualified physical melee proposal
Observed source 2026-10-17 iteration16; inspected by p2 around16:45–16:56 UTC. No server files accessed. Public Mojang 1.20.4 client and official mappings, byte size and SHA1 verified by extract.py; provenance.json retains URLs/hashes. Source is not proof of the live geometry or a successful attack.

EndCrystal.hurt (can.a, source lines~91–114) creates explosion at getX/getY/getZ, power6, upon normal player damage. No ammunition minimum. Explosion.getSeenPercent (cth.a, lines110–138) traces entity AABB sample rays toward the root position through block COLLIDER shapes. ExplosionDamageCalculator.getEntityDamageAmount(cth,entity) uses impact=(1-distance/12)*exposure, raw damage=(impact²+impact)/2*7*12+1. Therefore zero exposure still produces1 raw damage, before ordinary difficulty/armor effects; do not claim immunity. Entity knockback separately scales by exposure. Damage is calculated before blocks are finalized/destroyed.

SpikeFeature creates obsidian for integer horizontal offset squared <=radius²+1 and blockY<height. Crystal root=(centreX+.5,height+1,centreZ+.5); blockPosition.below() is set to BEDROCK (Blocks.F). Bedrock below crystal occupies Y[height,height+1].

Potential ordinary melee pose, not a caller: feetY=height-1=rootY-2, horizontal offset from crystal centre according to actual tower radius:
| radius | integer offset X,Z | outside native obsidian | eye-to-crystal AABB distance |
|2|2,2|8>5|sqrt(1+1+.38²)=1.464m|
|3|3,2|13>10|sqrt(4+1+.38²)=2.268m|
|4|3,3|18>17|sqrt(4+4+.38²)=2.854m|
Assumes ordinary standing eye1.62, body1.8 high, crystal width2 and height2. All body sample Y lie below rootY. Segments to explosion centre approach through the interior of the full bedrock block immediately below root, so a native bedrock blast shadow is plausible. This is a source/geometry argument, not a tested safe pose. Crystal interaction reach and footprint must be checked against actual world/entity state.

Remaining unqualified operations: approaching tower while avoiding dragon/cloud; building supported descent/ascent/pod; observing actual tower/bedrock and crystal root; normal melee attack; verifying post-explosion HP/velocity/support/roof/retreat. Cloud ignores these walls/bedrock sightlines. No new stock queue or duplicate End entry authorized by this note. First one-crystal trial only after actual recovered gear and retained route, with enough time for failure handling. A two-cell-high enclosure may constrain knockback but roof blocks above rootY may be exposed; inspect rather than claiming retained enclosure.
