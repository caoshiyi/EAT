# P4 #4062 navigation/ending — immediate findings 2026-10-17T01:57:17.512430+00:00

Read exact executed caller and raw result. This was NOT an outer timeout: NAV_BOUND fired, then ending failed CAP_STOCK. Raw prefix shows2.484,75,59.507/HP20, arrivedfalse/closedfalse/fullfalse. Fresh readonlystatus2.5,75,59.5/20HP and no cold caps corroborates the incomplete ending; current roof is not established by that report. Owner handles actual local ending before another extended preparation.

**Exact caller cost defect:** branch selection uses `cost=faces(q).filter(!full).length`. close(q) may also place side foundations and an extra roof support that are NOT in faces(q). Thus cost<=held does not establish enough stock for that branch; it can spend the remaining blocks and then fail. Prior CAPSULE_ROOF_REPLY/hostfixture already demonstrates this dependency. Count the actual required placement sequence, including supports and existing full blocks, before selecting capsule versus the owner's alternate ending. This is not a rule that every route must carry14 blocks;14 was the sparse-layout upper case. Do not use future pickup as already held restoration stock.

**Report defect:** return object places huge `updates` before `roof`, `ground`, and inventory. Actual result became `{truncated:true,json_prefix:...}`; those later fields were lost. Bound the log and put endpoint evidence first:
```js
updateCount++;
updates.push(compactUpdate);
if (updates.length > 8) updates.shift();
// Return actual p/hp/issue/roof/ground/stock before bounded diagnostics.
```
Keep a total count plus last few status changes; repeated partial paths need not be copied in full. This affects observation quality, not pathfinding behavior. No new test is needed to reproduce an already truncated result.

Source of block consumption during navigation was not separately logged; do not infer it solely from end inventory. The undercount in branch admission is independently real. Current healthy field state is not a verified capsule, and roof-only acceptance is a separate owner contract—not automatically a software failure just because full=false. Here ENDING_FAIL itself establishes that chosen repair did not finish.

No engineer player action, no broad rewrite, no source-patch to tools, no approval gate.
