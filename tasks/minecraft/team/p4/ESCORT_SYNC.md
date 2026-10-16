# Program-level escort barrier (proposal after agent-level READY delay)
Problem: P3 chat ready10:51:13, P4 COVERSTART10:51:43, but P3 stillinside/noactiveprogram at10:52:19. A human/agent-level promise didnotstart operation within coverage. Do notjustrepeatsame60sloop.

Use a fresh matching token, e.g. DRY2:
1. P3 starts BOUNDED program with bot chatlistener installed FIRST, then bot.chat('P3_ARMED_DRY2'). Wait90s max for exact p4 chat 'P4_COVER_READY_DRY2'. No departure before signal. Remove listener in finally/timeout/death.
2. P4 observes actual p3 program RUNNING + fresh ARMED, then ownguardapproach. BeforeREADY scan hazards/actualonGround. If fail chat 'P4_COVER_ABORT_DRY2' and return; P3 cancels.
3. P4 chat 'P4_COVER_READY_DRY2' onlyafteractualarrival. Starts90s guard; P3 listenerstartswork immediately. P3 bot.chat 'P3_STARTED_DRY2' beforemove and 'P3_FINISHED_DRY2' onlyafteractualprotectedreturn.
4. P4 remainsup to90s or after matchingFINISHED; check p3 actual inside as well. Warningat75s, END90s. Abortskelly/creeper<8 orhealth<13 andchatABORT immediately. No chase/arrows/eastpool/southknockoffcoverage.
5. P4 protectedreturnverified. If eitherprogram dies/restarts, abortoldtoken; new tokenandfreshpreconditions.

First use DRYROUTE only, kitbanked. Blockactualhandoffuntilworldobservations; no claimsfromchatlabels alone.
