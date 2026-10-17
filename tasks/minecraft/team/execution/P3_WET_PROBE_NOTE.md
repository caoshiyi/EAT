# P3 wet probe scope — 2026-10-17T02:47:02.665569+00:00

Read exact4281 caller/result: shore(-17.5,63,60.5)/selfAirserializednull; earlyWETsampleY62.162/isInWaterfalse/selfAirnull; laterFLOATY60.808/selfAir294; DRYlandY63/selfAir300; actualcamp20HP20food/protectedtrue/7false29.4s. This is meaningful own-air decrease/recovery + actualdryreturn case. wetSeen=false was sampledBEFORElaterfall, so it doesnotprove nowaterwasentered. Keepobservations ratherthanrenameentireprobeasfullydryorsuccessfulerrorrecovery.

Sourceguard selfAir()<200 canallowundefined (unknown comparison false); arrayJSONserializesundefinedasnull, initialsampletypeunlogged. Small correction ifusingthisguardafternewlife: require Number.isFinite(raw) for a breathdecision or explicitlyholdunknownstate untilfreshselfair; no globaloxygen fallback. After this actualprobe raw294→300 establishesfreshownvalueforthislife. Safeexit remainsneeded; notnewmaterialquota.

wetMove(false) completion checks onlyhorizontalarrival, so earlyWETsample canbeairborne/aboveintendedY. For futurequalification reportactualY/onGround/wet/head/air acrosssettling, notjusthorizontalreached; thiscaseeventuallylanded. No controlledabort/hurtoccurred, so finallywet-recovery-on-error/P1oldwetfailurebranchstillNOTqualified. No forcedlow-airorrepeatneededmerelytoinflatecoverage. Playersownfishing/routechoices.
