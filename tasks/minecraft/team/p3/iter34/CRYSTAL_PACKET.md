# Executable crystal packet for P1 — 13:49 target

P3 did not enter End or execute a projectile this iteration. Sources are specific historical actual records, read at P1's request. Current six crystal coordinates are saved evaluator information until P1's live loaded census. Safest tested candidate is **uncaged95 first**, then conditional remaining uncaged targets; tall melee tower is not preferred.

## Immediate one-shot candidate, tested in sandbox and not yet live

Actual P2 G8 program287 (`p2/iter30/G8_ground95.out`), ordinary snowball destroyed crystal **12.5/95/-39.5** from **6.503142/58/-25.499962**. R15.2303. Actual upward elevation78.76 degrees (bot.pitch +1.3744468), first jump tick feet58.41999999; spawned projectileY59.94, vy1.87825. Target gone3.445s after spawn; snow gone16ms later; four OTHER crystals remained; actual9HP unchanged, landed58 and roof restored. Sandbox snapshot already lacked east80, hence its FOUR remaining does not mean current live onlyfour. Exact executable core: `p2/iter30/ground95.body.js`, surrounding helpers `ground95.js`. Old rigid HP9/Snow1 guard is historical source matching, adapt to actual P1 kit rather than imitate it.

Physical setup: fresh reach58 feet pose near6.5/-25.5 through existing protected58 corridor; current terrain/caps/occupants unknown. Original test cut **6/60/-26** to clear outgoing launch, kept rest of local fixture, restored it from grounded58 after jump. Opening a roof and then waiting/aiming at leisure was not tested. First prepare full return/cover and aim, then one release, then restore shelter without waiting for impact exposed.

Minimal native sequence:
```
// after actual floor, jump headroom, future roof repair and local escape checks
const a=78.76*Math.PI/180;
const d=target.position.minus(bot.entity.position);
const R=Math.hypot(d.x,d.z);
const out=new Vec3(d.x/R*Math.cos(a),Math.sin(a),d.z/R*Math.cos(a));
await bot.equip(actualSnowball,'hand');
await bot.lookAt(bot.entity.position.offset(0,bot.entity.eyeHeight,0).plus(out.scaled(20)),true);
await bot.waitForTicks(1);
bot.setControlState('jump',true);
await bot.waitForTicks(1);
// actual feet MUST be base+.39..+.44, not second/fourth tick
// actual outgoing ray from current eye must be clear before activate
bot.activateItem();
bot.setControlState('jump',false);
```
At a different range/height the numeric elevation is NOT transferable. If a scheduling delay yields second tick .753, stop jump and land, do not spend a ball using first-tick aim. Raw287 allowed feet up to58.8 but actual successful pose was58.42; tighter first-tick test avoids mixing methods. `lookAt` uses positive elevation toward sky; do not accidentally negate it as some libraries use opposite pitch conventions. No raw packets/part IDs/reach bypass.

Initial outgoing sky clear is a physics condition, not a requirement to trace a straight ray to a high target while intentionally lobbing over blocks. Ordinary item use lets real projectile collisions decide the curved path. Stay within native visible/reachable block operations to open/repair the actual launch hatch. Log actual spawn, launch pose/velocity, inventory decrement and targetGone with same End/other crystals still present; a missing whole world after death/unload is not destruction.

## What actual live success says

- P2LIVE11494 destroyed already-removedwest86 (-33.5/86/-24.5): covered trench58 near-17.5/-15.5, apex59.252, elevation~71. It used a DIFFERENT apex-body velocity from the first-tick method.
- P2LIVE11521 destroyed already-removedwest89; not currentwest98.
- P2LIVE11630 destroyed already-removedsouth92 (-12.5/92/39.5): first tick from57 ->57.42, elevation63.01; target gone3.043s after spawn, immediate escape to50/full10. Exact successful final caller `p2/iter28/live_south92_headroom_shot.js`, not old `south92_headroom_shot.body.js` (that earlier one used58/65.125).
- Actual low60/R48 snow trial did NOT reach a25-high target: maximum conditional rise atthatR was5.66. Move closer to the pillar while covered, rather than spendingballs with unchanged far-range aim.

## Next four/six targets and caged limits

Current saved uncaged: east80 (33.5/80/-24.5), east83 (33.5/83/24.5), north95 (12.5/95/-39.5), west98 (-41.5/98/-.5). Caged high pair likely north104 (-12.5/104/-39.5) andsouth101(12.5/101/39.5); P1 must observe actual bars/roofs before assigning cage status.

`arc_model.py RANGE FEET_Y TARGET_Y` is a nominal **hypothesis generator**, not a gameplay controller. Its small smoke reproduced old ground95 nominal output95.074 at78.76. It uses measured historical .99 drag/.03gravity with assumed nominal1.5 speed +.42 first-tick boost, ignores random spread/blocks. Actual287 peak102.63 vs nominal103.15 demonstrates~.52m vertical error even on a successful shot. Candidate marked nominally_reaches_target=false must not be called a solution. Choose a descending arc so the spike's obsidian shoulder is already below the projectile; ascending intersection at crystalheight may strike the pillar first.

For uncaged west98, nominal R15/base58/target99 =>78.08deg, apex103.01, descending65.86ticks. This is UNEXECUTED; inspect current terrain and keep actualtarget+.5..1 aim inside crystal. For high104, R15/base60/target105 has NO good nominal descending solution (besterror.65); base62 or closer/elevated funded stance may be needed. Cage roof can be higher still. A curve through the roof bars needs actual collision-shape clearance; a mere center-coordinate solution does not show this. No caged-removal method is qualified here. Prefer next uncaged shots while a distinct cage test is planned;15balls is a finite supply.

## Safer perch/dragon boundary

P2iter30 actual slab melee sandbox286 destroyed east80 while retaining9 of10HP; matched live11803 died to Dragon BEFORE attack at29.9/79/-22.8, HP10->4->0 in.504sec. Thus blast cover did not qualify survival of high ascent. Prefer ground lob to recreating melee80 tower.

Dragon melee near fountain remains unqualified: many prior windows produced ZERO actual attacks. Actual low-pass root(-8.283,60.058,-13.111) is a historical observation only, not a reliable perch. A covered low stance near that pass with native current entity cursor/reach could test one sword hit, but cloud/dragon proximity can injure through apparently full cover. No claim of immunity or no-damage follows from zero attacks. Bed explosion is a different candidate needing a real spare bed and physical blast cover; not tested by p3.

## Optional cheap cage uncertainty test

`arc_clearance.js` is a read-only function component `inspectArc(origin,velocity,actualLoadedTarget)`. It traces each nominal .99/.03 flight segment against real current client collision shapes and the target's public width/height. It reports the FIRST block or nominal entity intersection, refuses unloaded endpoints, and makes no player action. Native HOME smoke12939 correctly found basalt before a synthetic farther target; synthetic closer target initially lay beyond the wall too (a test setup mistake, not false collision). Changed near target12940 correctly reported its box BEFORE the wall. This tests ray/segment ordering only, not End trajectory reliability.

For hypothetical firsttick launch from groundedbaseY:
`origin=Vec3(playerX,baseY+1.94,playerZ); velocity=out.scaled(1.5); velocity.y+=.42`.
Use observed projectile spawn/velocity for retrospective replay when available. Predicting clear center arc through iron bars is conditional; actual random spread can move it into a bar. Report actual iron_bar block coordinates from the function rather than blanket cage impossibility, then vary pitch/aim point within actual crystal box or change feasible stance. A gap requiring sub-block precision should be tested with ONE ball and actual flight/target/retention; repeated identical misses are not evidence to spend all ammunition. No cage trial was executed by P3.
