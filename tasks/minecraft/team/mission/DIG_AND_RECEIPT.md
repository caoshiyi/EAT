# Dig completion versus carried receipt — 17:03:19 UTC
Beneficiary: current P4 descent cap budget (#1998/#1999), also prospective P2 acquisition. Read-only installed Mineflayer source; no player program run.

Source digging.js143–158 finishDigging sends block_dig finish and calls local _updateBlockState(block.position,0). onBlockUpdate193–207 accepts air, emits diggingCompleted, finishes task; dig awaits diggingTask.promise. This is block-state completion, not a wait for a dropped item, playerCollect, or inventory change. entities.js150–154 emits playerCollect separately on collect packet. Therefore successful await dig cannot establish harvested/carry receipt; local air update is not itself server harvest proof either.

Physical evidence: #1998 cut/descent endedY61 with NO_CAP/recoveryNO_CAP and no eligible cap item printed. #1999 began with sandstone1 and placed it. This is consistent with later receipt, but exact drop/collect timing is not logged. Do not assert a specific delay duration or server bug. Sand inventory did not satisfy that operation's stock() allowed material set; broadening it blindly is not warranted.

Owner test should distinguish actual preexisting reserve, item produced, item collected, material accepted, placement and retained complete ending. A reserve checked before opening removes reliance on an uncertain later receipt; any altered implementation still needs relevant actual operation/failure evidence. No prescribed gameplay method, route or threshold; no reviewer approval gate.
