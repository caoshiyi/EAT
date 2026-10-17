# First Eye destination uncertainty — 2026-10-16 22:59 UTC
Question: Should P1 spend its recon trip at144,2208,176,2704, or obtain another Eye first?

Measured: P1program2800 `p1/iter7/eye_first.log`, initialEye6.448666502213281,67.89999997615814,81.5125; 19 position samples, one flight. Endpoint raylength12.0001117085, unit(.06453390446,.99791551505). No physicalstronghold/portal observation. P2state3124 retained20HP17food/full22faceprivatehull/no callbacks.

Competing explanations: (a)zero locatoroffset,144,2208; (b)zerooffset176,2704 indistinguishable from naive endpoint residual; (c)center8-offset means originalcandidateinvalid. Cheapest test public vanilla source plus replay exact observed packets, no world/seed input.

Public source references (downloaded only from public GitHub; never server files):
- https://github.com/MCFireworkDev/MinecraftDeobfuscated-Mojang/tree/1.20.4/minecraft/src/net/minecraft
- `StructurePlacement.getLocatePos` returns chunkMIN+locateOffset; `ConcentricRingsStructurePlacement` defaults Vec3i.ZERO. Actual pinned vanilla data `https://raw.githubusercontent.com/misode/mcmeta/1.20.4-data/data/minecraft/worldgen/structure_set/strongholds.json` has no offset, distance32/spread3/count128.
- `ChunkGenerator.getStructureGeneratingAt` returns placement.getLocatePos, not piece.getLocatorPosition. Its intermediatechunkCENTER is used for nearest-distance selection only.
- `EyeOfEnder.signalTo` normalizes target to12blocks; tick uses floatMth.atan2 + doubletrig/velocity recurrence.
- `VecDeltaCodec.encode` uses Math.round(position*4096), NOTfloor. Misusingfloor fails even actualcandidate. Smallsynthetic smoke covers Java rounding, codecidentity, axisatan, twohypothesisdiscrimination.

Calculation: `python3 tasks/minecraft/team/p2/iter8/eye_packet_audit.py`. Its18postspawn XYZpacket coordinates match model144,2208 EXACTLY18/18 aftercorrect Java round codec. 176,2704 matches4/18. Search1371chunkcorner candidates inside generous0.001rad envelope z16..26000 finds144,2208 AND distant1536,23728 exact18/18; latter is a bearingalias. Within conservativefirst-ringrange,144,2208 is unique exactmatch. Source ringdistance initial88..168chunks(1408..2688blocks), plus chunkrounding+112biomeadjustment. No worldseed reconstructed/read; only public mechanics plus own team's actualthrow.

Recommendation: prioritize144,2208 as strongly corroborated NAV candidate rather than requiring secondEye for this decision. Keep physicalstronghold=false until generatedblocks/advancement observed. Claim is conditional on vanilla1.20.4 mechanics/first-ringnearest selection. Fullsearch/residuals `eye_packet_results.json`; reproduciblemodel `eye_model.py`. Model exactXYZmatch is strong corroboration, not serverstructurequery.

Useful dig target calculation: StrongholdStructure creates StartPiece at chunkMIN+2,+2. StairsDown.makeBoundingBox is5x11x5, sameXZbox allfourorientations; thus candidate rootbox146..150,2210..2214 and center148,2212. Eye destination144,2208 is OUTSIDE that guaranteedrootbox. Verticalshift uses moveBelowSeaLevel(63,-64,random,10): wholeboundingboxtop<=52, bottom>=-63, rootstaircase inside. Recommend guardedstaircase/two-column descent near148,2212 rather than blindshaft144,2208. ExactY and portalroom remain unknown; generation can omit shell where preexistingAIR. Source StartPiece.portalRoom locator override is NOT the placementreturned by Eye.

Failures/limits: firstdownload mahtomedi/main version.json was1.20.3-pre1, so superseded by explicit1.20.4branch; not treated as pinnedproof. InitialcontinuousRMSE favored144 but bothfit~1packetunit, insufficientalone. Initialfloorcodec producedwrongmatches; changedafterreadingVecDeltaCodec. Distantalias preserved in report. No new milestone/Eye/rod/item claim.
