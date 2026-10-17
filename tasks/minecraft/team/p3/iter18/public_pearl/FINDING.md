# Matched public 1.20.4 pearl/crystal chain and dragon tag
Source-only; no pearl held or thrown by P3, no live crystal effect or retained-ending proof.

Exact official client and mappings downloaded in memory, SHA1+size verified against inherited public version provenance. Existing tested extractor reused with tiny section-parser and tag JSON/CRC smoke before new classes. Full archive not retained. No game/server/.work access. Files here include mappings, selected classes, javap bytecode, tag JSON and provenance. Initial parent gap was corrected by also retaining ThrowableItemProjectile.

- ThrownEnderpearl (`cgj`) onHitEntity bytecodes 5–25 invokes target.hurt(thrown(pearl,owner),0).
- Its onHit(HitResult) invokes super.onHit first (0–4). Projectile.onHit dispatches the ENTITY hit to virtual onHitEntity at12–19; neither intermediate ThrowableItemProjectile nor ThrowableProjectile overrides that chain. Thus accepted EndCrystal zero-damage hurt happens synchronously BEFORE pearl's teleport branch.
- EndCrystal.hurt ignores the float amount. For server/not-removed/not-invulnerable/non-dragon-source cases, it removes the crystal and synchronously explodes power6 unless incoming source is already an explosion.
- Pearl's later onHit branch requires server side and pearl !isRemoved (74–88). Projectile/ThrowableProjectile/ThrowableItemProjectile/Pearl have no hurt override; inherited Entity.hurt only marks hurt and returns false, without removing it. Crystal's explosion therefore does not remove the pearl through that hurt call. This is a source-chain conclusion, not a live outcome.
- Connected same-level, non-sleeping ServerPlayer owner is teleported to pearl's current XYZ (not asserted to be exact HitResult point), fall distance reset, then hurt for5, and pearl discarded. LivingEntity mapping confirms fD=isSleeping; Entity dH=isRemoved, n=resetFallDistance. Guards still matter. Hitting cage terrain instead of crystal can teleport without crystal destruction.
- Exact data/minecraft/tags/blocks/dragon_immune.json directly includes minecraft:end_stone and minecraft:iron_bars. This settles membership for dragon block-destruction checks only; it does not establish protection against dragon collision, cloud damage or crystal explosions.

No actual pearl acquisition, aiming, cage traversal, teleport arrival, expected self-damage handling, second throw, escape or survival was validated. Those remain an owner's bounded survival operation if selected.
