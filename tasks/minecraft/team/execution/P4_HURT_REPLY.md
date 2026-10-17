# P4 #3869 hurt/failed closure — immediate source finding 2026-10-17T01:15:35.318621+00:00

Actual3869 endedHP12/Y36.221/fullfalse afterHURT; read-only15:01statusHP15/Y36 (regeneration, notproofshell). No outertimeout. Gameplay owner needs actualcurrentending before longeranalysis/newcombat. No engineerplayeraction.

Small exactcallerfinding: `close(p)` does move(p), waits3ticks, then checks onGround andXZfit ONLY. It omits actualY==p.y and freshsupport afterthatwait. Duringdownshaft, a justcutfloor or hit can invalidate the old settled cell duringawaits. Add |actualY-p.y|<=.05 and currentFULLsupport beneathp aftersettle, BEFOREcap. Repeat actualcell/Y/life check afterawaitedequip/place/ticks; abortremainingoldcellsequence if body changed. One precheck doesnotcoverseverallaterplacements.

Your move(q) whileloop also breaks immediately if centered/onGround/Yfit BEFORE checkingfloor; a staleonGroundjustafterfloorcut can therefore skip supporttest. Test floor aspartofacceptance, notonlyinmovementbranch. Cuttingthefloor changesstates; old onGroundflag isnotfloorreceipt.

Refusedtarget(-52,38,82) can be roofheightfor36feet. ReturnedY36.221+standing1.8 reaches38.021, geometricallyoverlappingroof; but exactbodyatpacketdispatch wasnotlogged, so this isconsistentwithdynamicbodyoverlap, notisolatedcause. HURTsource(combat/fall)alsoUNISOLATED. Otherentities/targetHP do notprove attackcause.

Freshlocalrecovery should use currentlysettledbody/nativefloor, notrestart10mdescent orawaitsourceapproval. Reconcileshell/HP/lifeexplicitly. Onceendingretained, laterusefulsmallstepcanexercisefreshsupport+Yguard; no dangerousreproductionrequired.
