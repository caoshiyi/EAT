# P3 imminent HOME continuation — 07:09 UTC, iteration12

Actual caller #5617 `iter12_return_home` failed at TABLE_RECEIPT after reaching southbench body(1.494,65,5.639), before HOME arrival or east-head repair. Its 2.2s wait did not find a crafting_table in **P3 inventory**. That establishes missing P3 receipt only: P2 is nearby and may have collected it, or an item may remain. Actual P3 inventory also lacks BLACKSTONE/DIRT removed at bench. Do not infer their destruction or recraft before recipient/entity inspection.

Recovery then placed side caps and blocked original return head(1,66,6) with warped_planks. Final P3(1.499,65,5.7),20HP,PEARL5/BASALT9,controlsfalse,closed/full=false, shared SOUTH65/66/67 allAIR,16.039s elapsed. Local placement into HOME(1,65,4) refused; P2 occupies HOME and was actualx1.3 by #5623, so body overlap is a plausible reason, not isolated proof. Rollback MOVE_BOUND followed changed route geometry; don't rerun unchanged closing/return blindly.

Smallest relevant correction: reconcile both inventories and current item entities/cells; reclaim or transfer actual table/blackstone/dirt if retained by P2, then choose a physically clear sequential passage. Preserve SOUTH exact identity and HOMEfloor64. Exact restoration and east-head full receipt remain required separately; no generic `full` substitutes for shared original materials. No specialist repair/action/approval implied.

Budget: failed attempt consumed16.039s, including2.2s pickup wait and failed local/reverse handling. Historical successful52-step South leg30.791s is already complete. Remaining shared transfer, passage, portal and bank timing unmeasured. Reserve recovery+final verification inside outer timeout; old20s lease is not an actual completion.

Physical acceptance: current owner observes living same-body/dimension, actual carried/recipient items, exact SOUTH restored, east head full, followed by actual HOME/portal/camp/deposit receipts. File publication is not ACK; source diagnosis does not establish recovery.

07:10 owner adoption: #5626 independently identifies recipientP2 and requests transfer/exitsequencing; #5627 P3 tossBASALT3 executed and #5631 inventoryBASALT6 confirms senderdecrement. Recipientreceipt and exactrestoration remainunverified. Investigationanswered; observechosencontinuation.
