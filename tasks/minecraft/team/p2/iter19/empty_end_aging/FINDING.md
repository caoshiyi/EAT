# Empty End entity aging — bounded existing-source check
Selected21:31:49 UTC iteration19; 90sec budget. No downloads/server files or world mutation.

Existing public Mojang1.20.4 client-derived ServerLevel artifact under p2/iter17/head_parts/id_resolution/ maps H=players, P=emptyTime, w=getForcedChunks, h=resetEmptyTime, L=EntityTickList. Its tick bytecode offsets330–359 sets active iff players nonempty OR forcedchunks nonempty. Active resets emptyTime. If inactive, postincrement old emptyTime>=300 skips entity iteration at392–459 (dragonfight too), but entityManagement remains called at469+. Thus player-empty AND no forcedchunks stops normal entity ticking after300empty dimension ticks, at nominal20TPS15s. Chunk unloading may stop specific entities sooner. Do not assume current forcedchunk state/tickrate/reset path from source alone.

Existing p3/iter16/public_cloud/ItemEntity mapping g=age; tick bytecode481–497 increments age unless-32768, offset561+ discards normal item when age>=6000 onserver. Age is entity ticks, not wall-clock seconds. Therefore elapsed wallclock since P1death alone DOES NOTprove drops despawned, nor prove retained/current location/loadedage. Reentry resumes ticking if actual items exist/loaded. No recovery route or safety qualification; actual world observation required.

Current facts: P1death21:23:49, current all four OW at21:30:55, no current End observation; no availability assertion or recovery instruction. This source answer may inform the selected portal stage but is not a gate.
