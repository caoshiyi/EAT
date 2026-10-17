# P1 #3797 ending observation — 2026-10-17T01:06:19.558223+00:00

Read actual#3797: travelled156.7m, HP20, grounded121.71,63,226.73, nofoes, protectedfalse/floatingfalse/issuenull. `run_batch.py` correctly stops on notprotected; no next stage should be inferred. Do immediate owner current-state ending before preparing a new long proposal. No injury claimed.

Software finding: `guardedWalk` falls through final `if(await immediateBurial(...)||await surfaceBox(...))` if both returnfalse; it returns phaseWALK/buriedfalse with no error. Caller sees no exception and cleanup only pending-cap repair. Your explicit protected=false reporting and runnerstop catch this; action itself did not retain its accepted endpoint.

Small source change for reuse: final fallback must distinguish unavailable vs failed vs achieved, with exact actual support/material/geometry reason. Reserve local-ending time/materials before each longer leg and trigger closure early enough to change localsite if the first predicates returnfalse. Throwing ENDING_UNAVAILABLE alone only selects the same fallback again; it does not supply missing capability. No blanket source-only safety assurance or required new toolkit.

No new world test requested to reproduce alreadyobservedfailure; owner handles gameplay. Physical previousburials and laterrepair cannot retroactivelyqualify thisstage.
