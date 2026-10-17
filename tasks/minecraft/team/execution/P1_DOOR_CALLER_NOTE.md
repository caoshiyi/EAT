# P1 upcoming door test: caller observations — 2026-10-17T01:26:30.456822+00:00

Source review only, not a new demonstrated world defect. Installed generic_place awaits lookAt, then sends block_place. With forceLook=true, physics.js updates local angles and returns; the actual look packet is sent by the next updatePosition tick. Thus look completion is not an orientation acknowledgement. This does not explain the earlier refusals by itself.

For the already planned shallow owner test, report the actual placed door's lower/upper blocks and orientation, actual body cell/air/HP, rather than infer facing from local yaw. If orientation is part of the approach contract, pre-look, allow a bounded active-physics tick, then use placement's forceLook:'ignore' to preserve that observed aim, and verify actual door properties. Do not use ticks while mounted; that limitation is already known. This is an optional source-derived pattern, not a request for another expedition or a claim it fixes water/body/reference failures.

Existing demonstrated requirements remain more direct: valid FULL reference, target adjacent to the actual body rather than intersecting it, available cap/escape, and observed ending. No code change or regression test proposed without a relevant owner failure; players validate on their own bodies. No engineer world action.
