# P3 current5274 PILLAR_BODY / repeated recovery — 05:58 UTC

Beneficiary: P3 current shaft ending/PEARL1+BLACKSTONE3 retention and chosen return. Imminentexperiment: owner current-body repair/return, no auditwait.

Actual5274 feet(-102.6437228,54,97.5001674) is .14372285m from shaftcenter(-102.5,54,97.5), exceeding caller's .13m body tolerance. Source movement had accepted <.13 then waited2ticks; laterfloorfalls carry slightoffcenter position. Finalground/health checkedpreviously/20HP, but exactcurrentonGroundnotreturned. This is NOT a jumpheight/serverplacementfailure: no pillarplacement attempted before guard.

**Exact recovery branch defect:** pillarFailed is only set inside placement try/catch AFTER PILLAR_BODY and PILLAR_STOCK checks. Bodycheckthrow leaves pillarFailed=false, so outercatch calls back(), which calls SAMEpillar guard AGAIN, producing RECOVERY_FAIL PILLAR_BODY instead of availableclose(currentcell). Helper exists but errorbranch bypasses it.

Smallest current-caller correction: make any pillar preflight failure select current-shaft close, e.g. set pillarFailed=true before throwing PILLAR_BODY / PILLAR_STOCK, or wrap the entire pillar operation so all its errors mark failure. Current stockedbody can choose localclose ratherthanunchangedliftretry. Do not simply widenbodytolerance or returnfull=true.

Ifownerchoosesactualreturnlift instead: centeroncurrentSUPPORTEDshaftcell with existingmove helper BEFOREpillarcheck, then requireground+floor+center, keepfeet>blocktop/forcedlook andactualinstalledblock/groundednewY. Avoid replayingworkthreatguard duringcurrentrecovery and recenterunderactualfloor/ceiling. No dangerousnewqualificationtrip.

Requiredphysicalevidence: currentbody/center/ground/floor, currentclosureACK or actualliftplacements followedbyrealreturn+nativepodclosure, ordinaryPEARL1/BK3 continuity. Syntheticmath/sourcebranch is not worldrepair. HeldNETH3+SS2+BASALT1 are actualcapstock (BK3 retainedforpick); choosecurrentclosure cost fromactualgeometry.

No specialistplayerprograms. Status sourcefinding/proposedlocalbranch correction, no actualadoptionyet. Previous5274 retainsassetsbutfailedending; old5235FULLisSTALEuntilnewcurrentreceipt.

Completeusefulendingnow5299: actualblackstonequarry+STONEaxe/PICK craft+returnnativepod, 19BK+4BASALT andPEARL1 retained, FULL20HP/noissue. Earlier5278onlyfirstpillarprimitive; nowwholequarry/return stagecomplete. Sourceusesactualrecenter/clearance lift, ownerworldvalidation. No newpearl/deliveryclaimed. Retirecurrentpillarendingaudit.
