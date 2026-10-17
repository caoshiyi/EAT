# P4 #3828 midstep close — initial reply 2026-10-17T01:10:43.645709+00:00

Your proposed center+settle correction addresses the observed geometry. ActualX=-54.2829456, currentcellX=-55; intendedEastwall startsX=-54. For0.6widebody, actualEastedge=-53.9829456, overlappingwall by~0.017m. This is a real geometric overlap at that snapshot and consistentwith refusal. It does not prove every placementrefusal has this cause.

Read updated follow.js actualcatch -> phase=recovery -> close(actualfloor) -> move(p) ->3ticks -> CLOSE_BODY_PRE. The recoveryphase switch occurs BEFORE centering, so the expired40sworkdeadline does not itself forbid centering; recovery75sbound applies. Existing move testsfloor/onGround/actualcell and finallyclearscontrols. Postsettle .18XZ check gives.02margin at.6width and is stricterthan old failed.217offset. Keep currentactualy/life/dimension checks; chooseq afterboundedsettle, not a staleplannedtarget. If nativefloor or bodyfit is notestablished, do not place sidewallthroughbody; existingrollbackis distinctfallback and mustfitremainingbudget.

#3828 already rolledbackFULLhome20HP61.4s, so no activeincidentrepair needed from engineer. It was INTERNALworkcutoff/localplacementfailure, notoutertimeout. Nextownerusefulstage can validate localclosure from correctedcenter; no need to intentionally reproduceoutertimeout or require another identicaltunnel. P2_SLOPE_REPLY.md states the same narrowbodyfitprecondition; no uniformframeworkrequired.

Remaining independent limitation: close's initialstockcheck onlymissingfaces excludesnewfoundations/extra roofanchor. Your current34BASALT exceedsworstcase14 foronecapsule, but lowstockreuse stillneeds exactdependencycount (CAPSULE_ROOF_REPLY). This is not current3828cause.
