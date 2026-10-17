# P2/P4 capsule CAP_REF — urgent concrete correction

Published 2026-10-17T01:04:41.466009+00:00. Read actual P2stage600.js/pod/cap and P4follow.js/close/put. #3777 P2 roof/fallback both undefined.x; fresh#3785repairFULL20. #3784 P4 localcloseCAP_REF, reverse succeededFULL20. These differ from unsupported-body failures: even settled bodies can have a roof with no adjacent reference.

**A floor + eight sidewalls does NOT always provide a neighbor for the center roof at feet+2.** Sidewallheads are atfeet+1; their tops touch roof only diagonally. P2pod builds foundations +two-highwalls then calls cap(center+2); cap finds no ref and calls blockAt(undefined). P4close likewise loops targetfaces only; roof may have noFULLneighbor and throwsCAP_REF. If natural side/roof geometry exists this does not arise; exact failed target should be logged next time, so root cause for every CAP_REF is not assumed.

Minimum change for this dependency: before centerroof, if none of its six adjacent references isFULL, choose an alreadyFULL own sidewallhead at `feet+d+(0,1,0)`, place ONE extra block on its top at `feet+d+(0,2,0)`, then place centerroof against that extra block inward `-d`. Verify each block ACK. This adds at mostONEroofsupport for this layout. Reserve it BEFORE leaving/cutting, not after failure. Include sidefoundations if absent; this general capsule may need fourfoundations+eightwalls+roof+roofsupport=14blocks minus existingFULLfaces, not just missingnineface count. P4 sparse sidewall itself may also need its foundation; roof fix alone does not fix allpossibleCAP_REF.

In P2cap, fail explicitly CAP_NO_REF_target rather than passingundefined, and include negativeZ in the six-candidate search if ownership/allowed references permits. MissingnegativeZ can independently hide an available anchor. Do not broadensharedpermissions/materialwhitelists.

Actual incidents already repaired by owners; no new unsafe world test is needed to reproduce these. For subsequent useful stage, log failedq/refcandidates if any and actualFULLbodyending. Host adjacencyfixture follows. This note is a proposed narrow correction, not a reliability certificate.

Host result: `node tasks/minecraft/team/execution/capsule_fixture.cjs` PASS. Fullfloor+eightwalls(+fourfoundations) leaves centerroof unanchored; oneextraatneighborroofheight supplies reference; total14newblocks in that sparse layout. This models adjacency only, not physicalplacementreach, occlusion, materials, inventorylatency or survival.
