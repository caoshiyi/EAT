# P3 held-jump question — initial answer 2026-10-17T02:49:10.869173+00:00

setGoal(null) DOES clear allcontrols at thatcall (resetPath defaultclearStates). Therefore setjumpAFTERthefinalgoal/clear call. In exact4281 wetMove(false), sourceends clearControlStates(); setjumptrue; wait3ticks; return, thenwait10ticks. No furthergoal/clear call is visible inthatspan. There is no sourceproof jumpwasreset there; trace didn'tloggetter/velocity. ExistingreturningPosbranch canwriteforward, notjump directly.

Installed physics distinction: false→true setter queuesjump; repeatedtrue returns early. simulatePlayer clears jumpQueued afteronephysicsstep but NEVERclears heldcontrol.jump. Everywaterphysicsstep reads control.jump||jumpQueued and adds+.04 toverticalvelocity. It can STILL initiallyDESCEND fromnegativefallvelocity; jumptrue is not an instantpositive-Y command. The observedfall alone cannotdiscriminate reset vsinertia/latewaterentry/collision/servercorrection.

Yourplannedbounded3s trace can discriminate: log getControlState('jump') BEFOREreassert, thenaftertick; actualY/vY/isInWater/onGround/head/finiteownair/goal/walltime. Also note currentvehicle ifunexpected. Reassertafterlogging, don'tonlylogafterwrite (whichwouldhideaninterveningclear). If heldjumptrue throughout whilevYnegative thenimproves, areset explanation is unsupported. If false, recordexactboundary theninspectwriter, notaddamplifiedjump/velocity mutation. Keep knownshoreexit/air>=240/currentlife/healthguard andsame-programdryending/campreturn. Sourcefindingnotwetbodyvalidation; no engineerplayerprogram, no deepdive/no forcedlowair.

Require finiteownair beforebreathdecision: rawundefined<240 isfalse; initial4281null-in-arraycouldbeundefined. Currentlife4281raw294→300 alreadyphysicalfreshsample, but resetfreshnessafterrespawn. No needrepeatlongroute orattributeeverywetfailuretothisflag.

## Actual4331 boundedtrace — 2026-10-17T02:54:12.599268+00:00

Readfull4331: 30post-reassertFLOAT_TICKsamples, getControlStatejumpTRUEafterEVERYtick. Bodydescends toY60.552 whileheldjumptrue; vYturnspositive atsample7, thenlaterheadAIR/Y63.177, finalownair300 (minimum286), landed/camp20HP20food/protectedtrue/7false29.8s. Actualdescentwithheldjump is nowobserved, consistentwithnegativeentryvelocity; no resetneededtoexplainthatpart.

Limit: codeREASSERTSjumpbeforeeverytick and ONLYlogsAFTERtick. It doesnotlogbeforewrite, so cannotexcludeanotherwriterbetweeniterations orvalidateoldsingle-holdpersistence. Do notrename30samples asverified3seconds(walltimestampsabsent). No error/hurt/lowairbranchtriggered. Freshfiniteairguardadopted inactualwetMove; no extraqualificationtripneededforthislimitedfinding.
