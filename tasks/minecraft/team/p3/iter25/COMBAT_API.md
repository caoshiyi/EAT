# Ordinary combat API constraints — iteration25

P1 requested <=3min docs-only query20:13:36 (chat9543/9544), deadline20:16:36. Recipient P1, P4 secondary blast-method recipient. Exact docs inspected installed Mineflayer docs/api.md735–763,1310–1350,1550–1590,1590–1645,1817–1870,2020–2055. No internet/client mappings/excluded material. P2 existing boss observer read, not duplicated. Donor delivery10885 at20:14:13 (~37s). Actual End use pending; no three-minute physical-combat claim.

## Adoptable interface and boundaries

- `await bot.lookAt(actualPoint,true)` resolves when facing that point (docs1855). Looking does not prove reach/contact.
- `bot.entityAtCursor(maxDistance=3.5)` docs1617 returns looked-at entity or null. Default3.5 is larger than conservative survival melee reach; explicitly use3.0 and independently verify the actual targeted surface is unobstructed and in reach. Docs do not promise terrain occlusion filtering. Do not rely on nearestEntity position alone.
- `bot.attack(actualEntity,swing=true)` docs2033 attacks an actual runtime entity. `bot.swingArm` only animates an arm. Neither returning normally nor a swing establishes contact/damage. Use only actual runtime entities, actual reachable visible target; no guessed/synthetic multipart dragon IDs/proxies or raw packets if a desired part is not exposed by public API.
- `entityHurt`, `entityDead`, `entitySwingArm` are separate documented events. Hurt event can corroborate hurt, not damage amount/source. Entity absence can mean unloaded/out-of-view; it alone is not crystal destruction.
- BossBar has `health` FRACTION0..1 and `isDragonBar`, title, entityUUID (docs735–763). `bossBarCreated/Updated/Deleted` are documented events. Use existing P2 `observeBoss(bot)` fromp2/iter24/boss_observer_core.js; attach BEFORE End entry, stop in finally. Empty record means no recorded event, not zero damage. Observed health drop is actual bossbar evidence; evaluator/world still governs objective.
- Existing P2 observer is OW attach/cleanup smoke-tested, End field use pending. Do not count P3 docs audit as End qualification.

## Small negative-case runtime smoke

LIVE10884 at20:14:12.984 only ordinary look north atHOME: `blockAtCursor(3)` DIRT wall6,68,81; `entityAtCursor(3)` null; `typeof bot.attack` function. No attacks/swings/interactions/movement. P3 unchanged2.166664HP17food/EMPTY/all7false. This validates method availability and the no-target negative case, not target selection/damage/dragon/crystal behavior. Exact combat_cursor_smoke.js/.out.

## Blast-model candidate, secondary handoff

Docs1845 `bot.getExplosionDamages(entity, position, radius, [rawDamages])`: predicts damage, may returnnull for unarmored entity unless rawDamages=true. P1 currently unarmored. Radius is an input that must be independently established; query gives no crystal explosion constant. P3 sent P4/P1 API availability/limitations10887 at20:14. This is a model candidate, not actual blast/safety proof and not a production task. Need small runtime smoke before using predictions; actual sandbox blast must establish recipient-geometry applicability. P4 owns blast candidate decision.

## Adoption and timing

Docs/API donor handoff meets three-minute query deadline. P1 recipient code use/contact/actual boss evidence remains pending; record request->use whole duration when observed, including any later deadline miss. Original guard audit independently complete in2m52.606 to retained actual live lower3; it is a separate bounded knowledge contribution.

20:16 P1 actual journal read: core_roof final exemption follows P3 fullY+2 roof plus mobfeet>=Y+3 recommendation; no exemption trigger credited. Earlier +2-only draft was independently P1-owned; subsequent narrower change now attributed by owner and sourcechecked. This is adopted code/decision, not field proof exemption fired safely. Same journal explicitly read COMBAT_API.md and accepted actualentity/cursor3.0/no fabricatedmultipart constraints; actual End use still pending. Docs query donor handoff37s satisfies <=3min query; no damage/End-result claim. P1 actual portal path has now reached140,-39,2271 with unchanged17.2667HP17food per20:16:43 owner report, terminal not yet independently reread. G25-2 requested after finalnearportalanchor, P3 release already10892.

20:20 actual recipient field-API observation: FULL SANDBOX G25-2#15 enteredEnd100.432633,49,.5/HP17.266668food17/all7false terminal20:19:52.264; publicP2bosslistener attached before transition recorded bossCreated20:19:50.855 fraction1/titleEnderDragon/**isDragonBar NUMERIC2**, not booleantrue. Sent owner warning avoid===true. This exercises P2 observer End branch and validates docs interpretation in recipient sandbox, not live damage or P3exclusive implementation attribution. Runtime actualparentdragon809 width16/height8 and actualcrystals804/818 logged; no multipart entities/proxies/guessedIDs established. P3 own HOME negativecursor cannot establish End collision geometry. ExactSBrecord preserved.

20:22 material actual LIVE End adoption: FULL10910 entry100.432633,49,.5 HP17.266668food17/all7false terminal20:20:40.910; bossCreated fraction1/isDragonBar2 at20:20:39.558, recorded byP2observer attached preentry. Openplatform only1full/10, NOT retainedshelter. FULL10912 actual ordinaryescape existingqualifiedbridge to75.5,50,.5 HPunchanged, actualfullshell10/10 terminal20:21:28.287/all7false. Thus protectedlower-route contribution has actual downstream portal/End/retainedisland use; no attack/crystal/dragon damage yet. P3combatdoc advice acknowledged; actualP2BossBarEndfield verified LIVE, shared API validation notexclusiveP3listenercredit. Request20:13:36->liveentryending7m4.910; donorquery37s, never3minphysicalclaim. SANDBOX G25-2 death20:20:22 void104.2,-69.5,2.9; #16 at20:21:03 freshEMPTY OW20HP failed dimension check before actions. No SBescape/combatcredit; gainsnottransferred. P3 no live/SBphysicalaction. Rawcaptures separate.
