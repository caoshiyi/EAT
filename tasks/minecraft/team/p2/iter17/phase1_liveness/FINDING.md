# Phase1 liveness — CLOSED public-source answer to P3/P1

Trigger: actual8478 all90samplesphase1/HP200/issued0, not an observedperch. P3 independentlyrequested exactStrafeexitpredicate whilethisauditstarted. Beneficiary P1 currentLOW56/57 closingdecision. Whole180sec includespublication; no worldprobe/exposure/build/sourcegate. PublicMojang1.20.4 client/common class/mappings SHA1+size matched, parserfixturepassed. Selectedcbc/EnderDragonPhase/LivingEntity here; no server access.

**Yes: a nonnull hidden target CAN leave Strafe phase1 running indefinitely in this code.** Phaseenum registersHoldingPatternfirst(id0),StrafePlayersecond(id1). DragonStrafePlayerPhase.doServerTick contains only TWO direct transitions toHoldingPattern0:

1. attackTarget==null atoffset0..30.
2. After actuallycreating/spawning a DragonFireball atoffset532..626; resetscharge, exhaustspath, thenHolding0.

There is NO elapsed-time/path-completion transition toHolding. PathDONE updatesnavigation/targetLocation; findNewTarget and navigateToNextPathNode alterpath only, notphase. The HoldingPattern landinglottery is therefore notexecuted merelybecausephase1haswaited90seconds orcompletedapath.

Fireball branch requires currentattackTarget distanceSquared<4096 AND dragon.hasLineOfSight(target). That incrementsfireballCharge. Firingthenrequires charge>=5 AND adjustedhorizontalangle in[0,10) degrees; adjustment isacos(dot)*57.295776+.5. Hidden/outof64range decrementschargeifpositive. Thus5isnotaguaranteed5ticktimer orstrictlyconsecutiveLOS requirement; range/LOS/facingallmatter. If permanentlyhidden/zerocharge, nofireball andneitherphase0exit occurs whiletargetnonnull. PublicLivingEntity.hasLineOfSight is same-world eye-to-eye blockray/MISS predicate, not the normalplayer-interaction six-metre AABBcriterion. Playercanthereforehaveallowedwallattackrange whiledragonhasnoLOS forfireball.

ActualprivateattackTarget/LOS/fireballCharge areNOTobservedbyclientphase16alone. Persistentphase1 isconsistentwiththismechanism, notuniquelyproved: targetrange/facing orotherconditions couldmatter, andexternalphasechanges areoutside thismethod. Do notclaim whichplayeris targeted, or that thisclassprovides a dead-target/timeout fallback; thismethod onlytestsnull beforethefireballlogic. Do notprescribeplayerdeath or an exposedpeek.

Implication: earlierperch_availability sourceanswer remainscorrectforHoldingPattern0, but doesNOTpredict landing whileobservedphase1persists. Raisingcloser or adjustingplayerattackrange canqualifycontact without establishingphase0/perchavailability orretaineddamage. CurrentactualHPphase/normalhit/ownescape stilldecisive. No newwatcher/controlstudy/unsafepeek gate assigned. Fullsource offsets retained forreview.

Attemptnote: initialrg inexistingselected mappings foundno hasLineOfSight mapping (exit1/noaction); addedexactLivingEntity tosamepublicSHAverifiedextractor, matchedhasLineOfSight->E. Firstanswer8491 publishedbeforefullFINDING; timingincludesfinalpublication.

Closeout timing refinement: budget.json now uses conservativeearliest2026-10-17T19:10:36+00:00 (previousactualstate-read timestamp before phase1 planning/announcement), includespreparation/wait, full151.709sec. Previousannounced-extraction-only timing preserved, not erased. No clockreset; still within180sec.
