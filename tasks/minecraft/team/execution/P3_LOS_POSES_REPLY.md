# P3 future-pose LOS selector — initial reply 2026-10-17T02:42:06.916802+00:00

Read seed_repair_plan.js, native_routed_recovery.js actualdoor()+movement(), and raw4243. BOTHdoor exitprecheck(radius12) and neighborfilter(radius16skeleton) reject the undergroundskeleton withoutLOS. Changingonlyone leavesother veto. Sixactualrays hit slab/cobblestone/table atsampledposes, not proof of everydoor-open/bodypose; do notlabelthemobuniversallysafe or inferoldhurtcause.

Narrowcandidate for THISfinite seedtrip: retainnearbyhostilefilter, waiveonlythatRANGEDmob at a testedfootpose when everyray from currentmobeye to playerbodysample is blocked by a currentFULLnon-doorblock BEFOREthebodypoint. Include bodywidth±.3 and low/torso/head heights; testactualalign/step/slabposes+between-step samples, not onlythreecenters. Ignore door6cells inpreflight as ifOPEN (bothhalves; includeotherdoorifplanopensit). A closeddoor thatwillopen cannotbe the occlusionproof. Partialslabfirsthit alone is not FULLbarrier; unknown/unloaded/currententity-insidegeometry oranyclearpoint retainsveto. This is a scopedcandidate/no universalprojectile-arcorfuturemob guarantee.

Installed bot.world sync raycast matcher REPLACESdefaultshapeintersection: your custommatcher must call iter.intersect(block.shapes,block.position), not justreturntrueforname/FULL. Use the actualintersectiondistance strictlybeforebodypoint. Example CORE only:
    const d = target.minus(mobEye), len = d.norm();
    const hit = bot.world.raycast(mobEye, d.scaled(1/len), len,
      (b,it) => {
        if (openingCells.has(b.position.toString()) || !full(b)) return false;
        const x = it.intersect(b.shapes,b.position);
        return !!x && x.pos.distanceTo(mobEye) < len - .02;
      });
    // hit only says this ONE current ray has a FULL blocker.
RespectVec3/fullhelperargumenttype (yourfulltakesBLOCK, notposition). Keep immediatebody/contact exclusion separately; do notapplythiswaivertocreepermelee/blast orunknownangryEndermen. Use samepredicateatdooradmissionANDfuture-neighbor admission, re-readmobpositions/geometry afterawaits/duringactualcross; hurtstop plus SAME-programchosenrecovery/endingstillrequired.

Small discriminator: read-onlycompareoldradiusveto vs candidate for exactplannedopen-door poses and firstshortroute prefix; output boundedmobID/eye/pose/firstFULLblocker+anyclearbodypoint. This can falsify the proposed nuisanceblockage withoutopeningdoor orrunninganotherlongtrip. If ownerthenchooses one usefulshortactualmove+return, logHP/body/doors/protectedending; notforcedinjury/noapprovalgate. Engineer never runsplayerprogram. Sourcecandidate+physicalsixray evidence are not a qualified40sfulltrip. Existingfielddamagemakes currentoutsidegeometry relevant, no blanketguarddisable.

## Host core check / actual independenttrip — 2026-10-17T02:43:22.563579+00:00

los_matcher_test.cjs PASS exactinstalledWorldSync.raycast withsyntheticblocks: FULLbeforetarget blocks, ignoredopeningcell/partialslab/beyondtarget/endpointmargin don'tcertifyocclusion. No entitymotion/projectile/travel proof.

Actual4252 started02:41:40 BEFOREinitialreply, finished21.7s: seed20,67,89DIRTFULL/source20,67,91nowGRASS, camp20HP20food/protectedtrue/explicit7false/nohurt. Its exposedAt uses defaultshape-aware raycast on twoheight×twoenemyheight CENTERrays, appliedbothdoor3poses andneighbors. That physicalcasepassed; no causalcredit/readACKyet. It doesNOTignorefutureopeningdoors, samplebodywidth/intermediateposes, orrestrictwaivertorangedmobs (alllistedclassesuseit). Thus don'tclaim the entireproposedpredicateadopted/qualified. No needrepeatthissuccessfulbenigntrip; retainthese limits fornextdistinctgeometry/threatclass. Seedholecasecomplete; no openrepairdependencyremains.

Sourceadoption 2026-10-17T02:51:07.111077+00:00: ACK3249/50; readactualfull_occlusion_prefix.js door+neighborcallers. It nowusesFULLshapeintersection/range-.02/openingdoorcells, bodywidth×heights, neighborquarter-step samples, ranged-onlywaiver+nearcontactveto. Syntax-onlycompilePASS (notexecuted). Doorpreflightuses5poses; liveguardDoor loopstillchecksHP/body/time, notper-tickfreshLOS, so don'tclaimallproposedafter-awaitrechecksadopted. No physicaluseofTHISfullprefixyetobserved; prior4252center-onlytripdoesnotqualifyit. Optionalnextdistinctuseonly, no requalificationtriprequired.
