# P4 OW return ending — 2026-10-17T02:13:51.423842+00:00

VERIFIED FOLLOWUP 2026-10-17T02:15:54.518817+00:00: eventdeath02:13:55UTC, P4 slain by Zombie at9.7,65,85.3. Status02:15:25 camp20/20EMPTY is NEWLIFE, not recovery. Automaticalert02:13:30 and source note02:13:51 preceded death; neither established delivery/adoption or repaired body. No later oldbodyprogram exists in visible records.

Raw4120 at02:13:25: NAV_NOT_ACTUAL; actual6.632,68.466,88.880/17.5HP; protectedEndfalse, gateClosedtrue. Alert recorded automatically02:13:30 in ENDING_ALERTS.jsonl. This is a failed player ending despite gate closure; owner handles current world immediately. No engineer play.

Exact actual caller: gate exit/close succeeds, then await go(6,65,86) throws before await returnCamp(). Catch only logs; finally clears controls/goal/removes life listeners. Its available recovery budget is unused; it never tries the actual returnCamp recovery path on go failure. Small correction: catch entry stop and re-read body/life; within recovery budget execute chosen current-state recovery before final cleanup, rather than return unprotected because staging goto failed. Do not loosen arrival predicate to hide a real discontinuity. No unique damage/pathcause established; new body check/owner endpoint determines active incident status.

## New-life replay and goto semantics — 2026-10-17T02:16:48.845640+00:00

#4125 repair source starts alreadyNEWLIFE camp6.5,67,82.5/20HP, EMPTY, bothdoorsclosed. It unconditionally tries staginggo(6,65,86) BEFORE returnCamp, then NAV_NOT_ACTUAL. This did not repair oldbody. ReportprotectedEndfalse is initialization left unchanged by failure, not a fresh safeCamp() result. Actual closedcamp/groundedposition differs from prior exposed4120; don't call it continued same exposure. First test alreadyinside/currentlife, bypass obsolete staging route when appropriate, and report observed safeCamp() separately from operation success.

Installed lib/goto.js has a concrete surprising branch: path_update path.length===0 resolves BEFORE checking statusnoPath/timeout. Exact host goto_empty_path_test.cjs PASS reproduces noPath+empty resolving while goal false (nonempty noPath rejects). Thus a quick resolved goto does not prove arrival; existing go postcondition correctly caught this class and must stay. Historical4120/4125 path_update status wasn't logged, so not unique proof of their early return cause. Bound trace to lastfew status/pathlength/goal plus actual body; no long report. Caller postcondition can distinguish damaged, airborne, wrongcell instead of combining all as NAV_NOT_ACTUAL. Source correction is catch recovery/currentbody dispatch, not accepting false arrival.

## Actual error-branch correction exercised4304 — 2026-10-17T02:53:02.354643+00:00

Owner4328correctionread; independentlyread4304actualcaller/output. MissinggateAIR handledfromcurrentbody; firstreturnCamp throwsDOOR_NOT_ARRIVED; catchsetsretreat andcallsreturnCampBEFOREcleanup; secondDOOR_ACTUALenter logged. SAMEprogramendedprotectedEndtrue/CAMP15.166HP17food/kitretained18.7s. This is a real exercised error-recoverybranch matchingtheproposedcontract, strongerthan anormalroutepass. No causalcreditinferred.

Importantlimits: initialmanualescapeY68→63 lost2HP; original4297GATE_CHANGED+failedrecovery and4302syntaxfailure remainfailures. ThiscaseisNOTsafeapproach/nominalHPpreservation/allthreat/lowair/othercallerqualification. Actualgateabsentverified; uniquelycreeper-caused isownerreport, notindependentlyprovedbyourrecordread. Source4297ALREADYattemptedCURRENTrecovery butitfailedLAND_NOT_ACTUAL; doNOTlabelitoldlog-onlycatch.
