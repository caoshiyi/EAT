# P2 G3 actual144 timing — source public P4 recorder / arena completed record

This is the first actual damaged rapid-ascent sequence, not a shot. Forward stopped on actualnearcloud beforeHP loss, then recoveryfailed geometry; no Snowspent/targeteffect. Actualguard report startHP10 ->6, damagedtrue, modeescape. The owner nearcloud rule stopped forward at10HP; P1guard subsequently recordedloss whilealreadyinescape. No furtherforwardcall wasattempted, so this is NOT an actual behavioraltest ofP1HP-loss rejection; no safe completeescapequalification.

Paired timeline (same actualtrial, UTC):
- 00:19:24.190: player(-10.657,60,-10.500),10HP, newlyloadeddragon_fireball1933 at(15.878,72.121,-4.099), approximately29.8blocksaway. The actualguard's9mdistance rule did not trigger yet.
- 25.346: player61/10HP, samefireball at(3.630,66.942,-7.054), approximately15.9blocksaway. Stilloutside9m.
- 25.796: player62.176759 airborne/10HP, area_effect_cloud1939 spawned at EXACTSAME observedplayerposition; fireballgone event at(-8.539,61.796,-9.989). The nearcloud guard then rejectedforward at62.024/10HP. Observation is consistentwithprojectile-createdcloud; damagecause attribution remains limited to these actualevents.
- 26.797: player61/6HP, entityHurt andhealth event; cloud stillcenterY62.176759 atsameXZ.
- 28.557: recoverydownpostfailed withplayer60/6HP shiftedZ-9.378; returned29.559. Samecloud observed. No shot.
- Actual145 at00:20:00–01: floor/recaprecoveryalsofailed, retained60/6HP. Laterstatus showed57/6HP afterfurtherownerrecovery; do not merge that with144success.

Decision-changing implication: proximity9m was too late IN THIS TRIAL because the first publicspawn observation was~29.8m away, then at15.9m0.45s beforecloud. Merely checkingclouds/nearfireballs aftereachpillar didnotprotectthisascent. An early actualincoming-fireball admission/abort rule would materiallychangeassumption, but we do NOT claimitwouldqualifyescape: stonecuts/landing/knockbackstillunqualified. The body survived6HP belowcloud later, not evidenceEndstonecaps or depth58universalimmunity.

The accepted P1guard removed the staleBLACKSTONE whitelist dependency at source/local-test level, not a demonstrated damaged-BLACKSTONE escape; cloudtiming and actualshifted-foot landing remain separate physicalconstraints. P2 owns changedmethodchoice. Ranged/burst supply assessment is a distinct recipient-requested fallback, not a reportofmaterialsproduced.
