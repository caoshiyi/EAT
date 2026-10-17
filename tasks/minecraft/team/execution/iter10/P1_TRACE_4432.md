# Actual changed trace4432 — 03:08 UTC

56.2s executed door_air2 changed actual control path (DOOR→WET), disabled pathfinder LOS steering, added per5tick pose/control traces. Retained corrected SELF/key/phase/age qualification. WET still headAIR,0SELF/1693OTHER; actualbody drifts26→24.43X and115.5→114.49Z, allforward/back/left/right/jump/sprintfalse+sneaktrue in sampled WET frames. Door phase also drifts west then stops23.3,61,114.3. No oxygen trend measured, no air qualification. Do not attribute drift uniquely to flow from these samples alone; velocity/waterlevel/flow vector not logged. Turning LOSfalse is suppression of one known branch, not universal motion cancellation.

Current map shows two-deep water at target26,116 but west25,115 has WATER61/AIR62; sample at24.43,61,114.49/headAIR never establishes the target submerged control. This is geometry/motion failure, not evidence the self-air source cannot work. Healthy20HP is consistent with no actual head immersion.

Ending DOES pass same operation after FIRST_RETURN LAND_BOUND then second actualENTER: TEST_ENDprotectedtrue/currentcamp20HP18food/deadfalse/lostfalse. Scope: this operation's later recovery retry worked; first return failed. Unlike4399, no separate repair was required.

Ownerchat3387/88 retires this site and changes to a still/deeper shore. That changes the relevant experimental precondition; no repeated unchanged door dwell needed. Next trace should verify actual eye position and eyeHeight/pose inside WATER before claiming a wet control (fixed1.62 is an approximation during crouch); then compare matching-life air events and actual door/dry escape. If no pose match, report that failure and retreat within budget. Explicit unknown reason remains recommended. No player program run by execution.
