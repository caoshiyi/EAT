# Gate click -> swing -> attack cooldown reset, matched1.20.4
P2 requested13:35:57 <=2min, P3 inspected request13:36:49, delivered7477 at13:37:50 (request->result1m53, read->result1m01). Beneficiary imminent P2 source_kill_one.js, actuallivepost-open6tick test already completed7473 independently; no claim P3 caused it.

Evidence from official public1.20.4 client archive and mappings SHA1verified, selected classes saved here; these are public distribution classes, no access to the arena server or its files/console. Earlierprovenance now records all13 selected classes. Installed Mineflayer inventory.js195-254 activateBlock sends block_place then **bot.swingArm()**. Matched public ServerGamePacketListenerImpl.handleAnimate aoc.a(afc) calls player.swing(hand), the one-argument overload. ServerPlayer.swing(hand) ane.a(bka), bytecode lines4008-4015:
```
invokespecial cfi.a:(Lbka;)V
aload_0
invokevirtual gm:()V
return
```
Player.gm maps **resetAttackStrengthTicker()** and sets attackStrengthTicker aP=0. This applies to the explicit mainhand swing animation emitted by activateBlock. The gate block use implementation itself need not reset cooldown.

Player damage formula includes0.2+0.8*f*f, f=clamp((attackStrengthTicker+partial)/getCurrentItemAttackStrengthDelay,0,1); delay20/attackSpeed. With hand speed4 delay5ticks, f=.3 yields .272 exactly. The observed .272 alone did not identify cause, but this code chain plus matched actualtests discriminates it.

Actual livecases:7467 pre-open8tick handwait -> .272 damage;7470 changed pre-open24ticks still four.272 hits;7473 changed **post-open6ticks** -> full1damage (3932HP19.728->18.728), own20/BACKfull/noFire/no projectiles. P2 selected this change before P3 sourceconfirmation. Do not extrapolate gate projectile exclusion or retainedloot from these contact tests.

Action released: wait sufficient cooldown **after open ACK/animation**, then revalidate reach/LOS/target before attack. Hand6ticks observedqualified; stonepick >=20ticks afteropen remains proposed/notphysicallyqualified. Closing also emits swing and resets, so each next gate opening needs post-open wait. Use ordinary Mineflayer actions; no packet workaround is needed. Sourceowner proceeds boundedkill+ordinaryrod+protectedending; no new hardware/material queue.

14:03 finite critical addendum released7518. Matched Entity mappings (same officialmappingSHA1, selected relevant lines saved entity_crit_mapping.txt) resolve Player.attack conditions: strength>.9, fallDistance ab>0, !onGround aC, !onClimbable e_, !inWater aZ, !blindness, !passenger bO, targetLivingEntity, !sprinting bY, then base damage*1.5. This is code-level prerequisite, not a serverfallDistance observation. Installed Mineflayer entities.js animationEvents maps normal animation4 -> entityCriticalEffect(entity); sourceowner can capture event for actuallyattackedIDs and pair with actualHPdelta in the next necessary attack. No observer-only repeat or extra exposure needed. P4actual7516 independent TWO-high jump showed firstwaitairborne/negativevy but secondwaitlanded; do not promote fixedtwo-wait labels to critical proof. P3 did not execute P4 test.
