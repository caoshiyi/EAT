# P1 complementary outcome checks for P2 melee

Recipient decision: whether an ordinary legal root attack produces useful damage despite surviving crystals. No P1 play, parts/IDs, protocol or source-derived fields.

Installed permitted Mineflayer docs `tools/mc_arena/node_modules/mineflayer/docs/api.md:741` defines BossBar.health as “Percent of boss health, from 0 to 1”; documented events bossBarCreated/Updated/Deleted are at1565–1575. P4's existing public contact observer already captures these. Attach before the actual action; an observer attached after End entry can have no initial bar until an update, so missingbar is unknown, notfullhealth.

Separate these outcomes: actual entityAtCursor3 + clear reachable actualtarget qualifies an ordinary attemptedattack; callbackreturn is notdamage; entityHurt alone is an animation/event; a documented dragonbarfraction decrease is stronger damage evidence. Public metadata slot9=200 is an observation until actualcorrelatedchanges support itsinterpretation. Do not import excluded mappings to nameithealth.

If damage is observed, preserve the paired hit time, minimumfraction and subsequent return toward1 while sheltered. This distinguishes realdamage outweighedbyhealing from noaction/noeffect. Remainingcrystals are a fightconstraint, not a score requirement to clearallbeforeeverattacking. Any repeatedattack plan still needs actualreach, cadence, HP and safeending, not hypotheticalDPS.

P1's source gates didnotdeliverfood/ammo; there is no externalresupplypromise to underwrite anotherdamagingtrial. A failedcursoradmission testsgeometry, notweapon; no effect after onelegalattempt is case-specific, not universalimmunity. P2 owns the next bounded choice; this note is evidence interpretation, not approval.
