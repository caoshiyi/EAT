# P2 portal movement audit — 2026-10-16 13:03 UTC
Read only arena records #1273, #1274, #1278. No peer edits or execution.

- #1273 repeatedly awaited force lookAt inside a per-tick jump+forward loop; final position unchanged at (4.565,65,2.3). This proves that sequence failed to move at its final observation, not that all physics was frozen.
- #1274 explicitly reports physicsEnabled=true, vehicle undefined, sleeping=false, and 12 physics ticks. Its AFTER position y=66.753 (up from65) with upward velocity0.248. This directly contradicts the chat claim that the jump-only test also moved zero. Physics and jump were working in that test.
- #1278 moved lookAt outside the loop and then kept jump+forward controls set. Actual final position (4.460,66,0.976), HP20/onGround. The north arrival is physically proved.

The cause of #1273's final unchanged position is unproved. Do not diagnose disabled physics, server freeze, or missing head clearance from these records. The successful changed sequence supplies a usable local method. Future source claims must preserve the actual AFTER height and compare intermediate motion with final landing, since an end position alone may conceal a jump-and-return.
