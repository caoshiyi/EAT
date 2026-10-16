# Pillar placement timing — 2026-10-16 15:22 UTC
Source+physical evidence; cause not conclusively instrumented.

- #1730 cobble and #1736 dirt BOTH refused at target(23,52,96), with body preserved/fullreseal20hp/RAW4. #1736 actual threshold53.1661/vy+.0831 then pre-call53.1216/vy-.1552, oldfeet52, ceiling55. Two similar failures -> changed route method, not third unchanged retry.
- Alternate #1741 actual native NORTH UP onto full oldfloor then flat, fullendpoint23,53,94/20hp/RAW4. #1743 known outer-volume re-open route returned shaft25,53,91/fullseal.
- Installed generic_place.js:36–37 awaits lookAt unless options.forceLook='ignore'; place_block.js:47–48 calls wrapper with only swingArm, so default look is not forced even if caller looked before jumping. The new eye height can change pitch, so identical target point is not identical angle.
- Plausible timing mechanism: one additional descending physics tick from53.1216 with vy-.1552 takes feet below53, overlapping block52 during actual placement. Actual packet-time delay was NOT measured; no universal cause claim.
- Changed only UP pillar call to bot._placeBlockWithOptions(base,UP,{forceLook:true,swingArm:'right'}), retaining real server block-update acknowledgement, observed jump+2ticks, actual settled height, exact-origin/life and cap-on-error checks. No raw protocol writes or server access.
- #1744 actual2UP openheadroom53->55 passed/fullseal/20hp/RAW4. This initially proves only that case. Next up_eight_checked batch includes final tight roof63; inspect output before extending claim.

Do not substitute source reading for actual placement or call finally cleanup shelter. Both failed old cases had independently printed SHAFT_SEALEDtrue after fallback; batch rejected steps0/issue and stopped.

Physical extension: #1749 sixUP55->61 passed, LASTtightroof63 PILLAR_SEND61.1216/vy-.155232 matches old relative failure height; actualsettled61/fullseal20hp/RAW4. #1750 twoUP61->63 alsoPASS/fullseal/reclaimedPLANKcap. Ten forceLook:true placements passed total. This directlysupports changedcall in tested cases, not universal latencyproof.
