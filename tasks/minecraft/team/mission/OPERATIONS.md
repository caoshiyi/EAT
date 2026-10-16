# Operation evidence for reuse — iteration5, 17:47 UTC
Players choose methods. This is a record of executed cases, not a controller library or universal safety claim. Full source/output in mission/checkpoints/*.json via program IDs; owner files contain implementations. Reuse requires actual matching start state and current geometry. Coordinator never executes a player program.

| Operation / actual evidence | What completed | First counterexample / limit |
|---|---|---|
| P4 craft/use #1979/#1983/#2018/#2023 | Actual output receipts; #2018 ironpick0+shieldOFFHAND, banksticks2 returned; #2023 carriedtable and2freshstonepicks, campclosed | #1978 parse duplicate declaration rejected before execution; compile first. #2018 changed equipment goal to ironpick/shield, no sword. |
| Receipt-aware descent #2000/#2001/#2002 | Per-cut FLOOR_RECEIPT before next cap, actual same-life full endpoints and retained ore4+coal1 | #1998 dug/descended before eligible item receipt; NO_CAP/recoveryNO_CAP, separate#1999 cap. dig completion is not inventory receipt. Root source note followed owner fix, no causalcredit. |
| Quarry #2001 | 20gross cobble,2closure cost,18net retained, actualshelltrue20/20 | Exact own geometry. Does not establish all terrain/material/hostile cases; don't mirror arbitrary coordinates. |
| Return #2004 | Actual24UP then closedcamp20/19/raw4coal1, no death | Consumed woodpick; three-stair smoke#1989 didnotvalidate main#1993errorbranch. Endpoint acceptance is specificcamp, shellfalse shaftpredicate not failure. |
| Furnace #2006 | Raw4+coal1→carriedingots4, finaldoorsclosed and freshstatus corroboration | ISSUE RECEIPT while furnaceopen was false negative; bot.inventory was wrong active-container namespace. Finallyclose updated inventory. Don't redo acquisition because one label failed. |
| Surface failure #1996 | Injectedabort→actualreturncamp+retainedkit | One surfacecase. Deep#1998failure different. |
| Real failed-work endings #2009/#2010/#2014 | Arrival/hostile/geometry failures, cleanup temporaryblocksAIR, sharedboundaryrestored, campdoorsclosed/ingots4retained | Not universal fallback proof. #1993 skiprecovery atY66 endedexposed, Zombie death25s later. Correct reporting didn't supply fallback. |
| Roof comparison #2016 | Changedactualmethod afterstairs: actuallognet+1(total2), temporarycolumnAIR/closedcamp | Prior#2009pathfinderarrival vs#2014manualgeometryprecheck are differentstages; manualmotion not tested by precheck rejection. Not everyfailedUP is timing. Thirdlog remainedunretained. |
| Field wood #2022 | Actual+2logs/retainedkit/closedcamp20/20, immediatelyused#2023 | Differentworlddependency from roof, not tree-regrowth repeatability. Roots nowdepleted; don't blindly replay oldsource. |
| Nether entry #2026 | Expectedtransition handled, actualprotectedP3sharedroom6,65,2/20/20/kit; wall5,65/66,2 restored | Shared5,66,1COBBLE and3/4,64,4PLANK new; P3passivelypickedcobble+1. No fortress/pearl or proofallroutes safe. Oldglobals not preserved acrosshostrestart (#1975 P1ForwardNULL). |

Recurring first-stage distinctions: source syntax; starting geometry; actual arrival; threat gating; tool/material admission; block production; item availability; carried receipt; accepted closure; same-life ending; actual use/recipient receipt. Record the first unclosed boundary for the current operation. A successful helper definition isn't an executed call; a failed label isn't automatically failed acquisition. Two equivalent failures require a changed test of the shared assumption; different first stages require different diagnoses.

References: P4_1993_FAILURE.md, DIG_AND_RECEIPT.md, FURNACE_RECEIPT_2006.md, ITER5_LEDGER.md and cycle reviews. No tactical recommendation or mandatory adoption gate. No measured time saving/effectiveness claim.

# Late bounded case: #2060
One48-step leg accepted an ordinary crossbow piglin through four remaining-collision rays for both current/next poses, with distances>=8 and full floors; the melee-only below exception was false.22 acceptance logs and a sealed20/20 endpoint with shieldwear0 demonstrate this one complete case. They do not establish projectile immunity, future clearance, or general safety. Brute and close-distance branches remain distinct. Source and full output: checkpoint20261016T183919Z.
