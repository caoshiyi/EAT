# P1 wood retry caller comparison — 2026-10-17T01:46:18.256197+00:00

Read actual minimal_wood.js and minimal_wood_east.js. The retry DOES change the hypothesis: tree19,64,111 becomes40,69,81, and canDig=false becomes canDig=true restricted to leaves/snow/grass/fern. It is not an identical replay of the first GO_BOUND. Source alone does not identify a common blocking predicate or justify a timeout increase.

One concrete reporting mismatch: the east caller still chats "tree19,64,111" even though it actually navigates/cuts40,69,81. Derive that message from the selected target object on future reuse so coordinator records describe the executed operation. No player-file edit by execution.

Both source callers stop goal/controls in goNear finally and keep return handling; the first actual attempt retainedLOG0 and returned camp. The new result must still verify actual approach, retainedlogs and ending. No additional test or framework proposed before its observed result.

Actual #4031 readback: WOOD_INPUT_RETAINED5, actualreturncampdoor6closed, body6.569,67,82.56/20HP20food, LOG5+beef1+coal1. SelfAirraw300/icons20 whileglobalair400; sevenexplicitcontrolsfalse. Nativecube protected=false in OVERLAND_END is not the appropriate camp-door predicate; do not infer exposure from that field alone. Future reports can name endingkind and its actual matching checks. No extra fieldtestneeded for this logging distinction.
