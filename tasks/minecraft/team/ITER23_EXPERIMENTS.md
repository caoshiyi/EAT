# P4 iteration23 independent experiments

Opening 2026-10-18 15:55 UTC (first file publication after state check). Only p4 controlled. Rules/program and P4/P1/P2/ITER22_REVIEW read fully; ITER23_PLAN absent at opening. No tools/server/.work access, internet, packets, other-player programs or void17–19 methods.

Opening saved-world evaluator: dragon0, milestones11, deaths170 (61/45/26/38), programs10213. Save refused; not a live synchronization. Live status p4(-8.486,26,-37.7),20HP/20food,GRAVEL1; p1 Y66 wooden pick/stick2/cobble1/dirt1/sapling1; p2 Y26 gravel6/flint3. No actor in End.

## H1: native dry escape vs material/tool dependency
Proposed to integration_lead at15:56:27 via arena chat. Whole budget <=8minutes from proposal, through16:04:27. Competing explanations: a native dry walking route from valley exists; or reaching surface needs additional material/tool construction. Small discriminator: completed no-dig/no-place path from actual accessible valley cell to dry high landing; path model is not traversal. If model qualifies, bounded first actual segment plus reclosed return within same budget. No stock gathering chain. Read-only model may remain inconclusive for global reachability.

Preflight: opening_probe.js reviewed: no mutation/controls beyond clearing, no inventory changes, no interactions. Small current-cell planner first. Hypothetical outside start explicitly labeled; still-sealed door means it cannot claim actual access. Existing P4 refuge remains independent of model.

Lead agreement: P2#10224/chat8729–30 at15:57:36 adopted independent discriminator, due16:05. Original earlier deadline16:04:27 retained. No user questions required.

Actual results:10219 small current-cell SUCCESS; hypothetical valley Y60 maxDrop1 completed noPath after464ms; Y40 SUCCESS38nodes.10223 changed explicit water exclusion + maxDrop2/3 and ordinary parkour completed noPathY60; model best endpointY56 near(-64.5,-76.5), not a surface. All path nodes zero cuts/placements. This is loaded-world/settings negative, not universal impossibility or actual traversal.

Changed hypothesis: could <=6 hand cuts bridge upper component?10227 was an INVALID discriminator: digCost100 made any cut exceed pathfinder100 move-rejection threshold. Admitted in chat10229 immediately, no world changes. Corrected10231 digCost1: small cut model SUCCESS2cuts (not the intended door—it chose roof/side stone), UPPER_Y60 SUCCESS13cuts, VALLEY_Y60 TIMEOUT4s with2cuts in partial best path. Thus no <=6cut whole route established, and no minimum-cut claim. Upper sampled columns confirm roof/dirt toY64. No actual interaction is licensed by modeled cuts; any future cut needs fresh occupied-camera visibility/reach and supported fluid-safe state.

Decision published ~15:59: retire native dry escape; recommend P1 primary carrier. Whole original budget not consumed; no stock/escape/physical-segment chain because prerequisite surface model failed. P4 remains refuge(-8.48595,26,-37.7),20HP/20food/GRAVEL1; no p4 death or world mutation. Await actual lead adoption/use, not claimed merely from delivery of report.

Actual recipient adoption: lead chat8749–50 at15:59:52 explicitly adopted native-dry negative and made P1 carrier. P1 chat8747–48 reported real stonepick cut/retained enclosure, independently active main stream; my result supplies routing allocation, not that tool achievement.

## H2: a single supported gravel placement connects dry route
Proposed15:59:36, accepted15:59:52 by lead, due16:10 (my <=8minute clock ends16:07:36). Changed explanation: direct no-construction failure may be only one missing step/bridge, rather than substantial materials. Small observation: complete no-dig route toY65 with actual oneGRAVEL, supported-only placement, drop3 and normal one-block towers, then complete retained return required before any travel. Fresh reviewed one_gravel_model.js is read-only.

10241 small current goal SUCCESS, zero placement. Upper(-64.5,56,-76.5)->Y65 completednoPath134ms, bestY57 withoneplacement; valley(-8.5,26,-35.5)->Y65 completednoPath380ms, bestY56. These are loaded-world/settings negatives, not global impossibility; no synthetic inventory/world/physics. No traversal, no use claim, no cuts/placements. Published16:00 before deadline. Per lead8749 reserve-body instruction, retire escape modeling/stock after this result; do not turn into another recovery chain. Lead adopted first negative; second report's later adoption requires records.

Lead8763–64 at~16:02 explicitly adopted H2 negative/reserve-body, then accepted distinct read-only transport audit.

## H3: transport budget / replacement-tool assumption
Proposed16:01:18 <=8min(original16:09:18), lead accepted~16:02 due16:11. Competing explanations: existing two picks suffice for a priced historic core vs missing tool capacity forces another stock chain. Small observation is actual carried durability compared with exact allowed historical physical cuts; current geometry remains conditional. TRANSPORT_AUDIT.md records exact outcomes, superseding naive93cut/current-bound reasoning. More recent14LOW404moves/22cuts/193.6s differs from13's24cuts/191s. CombinedP1 tools184nominal vsdated93core, so no automatic replacement quota. Current fullroute/closure cost unknown. No new world effects.

Observer helper watch.py small --seconds0 test succeeded; subsequent long read-only poll exposed inclusive --since returning the last chat again. Fixed filtering in source; currently running earlier process may repeat that last line, so do not interpret repeats as new actions. It never runs player programs or changes the world. All literal captures append to ownwatch.jsonl.

## H4: carrier fallback coverage, <=6min from16:06:45 to16:12:45
Proposed native local enclosure near each8-node segment vs only endpoint protection. Expanded explicit static candidates to include actual P1#10268-style two-cap underfoot bore, not just lateral door-room. Source is P1#10246 OLD135node candidate, not current ordered route. No p1 control, source/caps/edits. Lead acceptance pending; bounded own read-only diagnostic proceeds.

10276 loose empty-boundingbox foot/head/anchor model found17/17 samples; stricter AIR-only10278 found11/17, SIX no-candidate samples, zero unknown reads. **Reporting error:** chat10280 mistakenly claimed stricter17/17 because I batched summary send with the run before reading output. Immediately retracted in10282; actual11/17 governs. Neither result proves surface entry reachability, occupied-camera visibility, executable closure or whole-route retention.

10284 exact changed observation: all SIX original candidates at indices64/72/80/104/112/120 have one-layerSNOW shapes[] at foot/anchor, SAND below (sandstone at first sample). Vegetation explanation superseded. Loosemodel admitted transparentSNOW without executable replaceable-target/reach proof and admitted fullSAND without complete gravity-support audit. Strict11/17 is a conservative candidate count; not proof no shelter elsewhere. Publish recommendation: preserve conditional bore helper on demonstrated dirt/plank assumptions, qualify actual snow/sand separately or choose known-air/dirt candidate; no stockquota or all17claim. No physical effects, p4still20HP/refuge. H4 ends before16:12:45; remaining work only recipient adoption verification.

Actual H3 recipient adoption: lead chat8812–14 at16:12:39 explicitly accepted two-pick184 arithmetic/no replacementpickquota and current-cost refresh atHOME. H4 recipient adoption is still unverified; no owned/helper physicaluse claim.

## Minute20 recommendation (16:14 UTC)
Retire H1/H2 escape; both adoptednegative, no p4exposure. Adopt two-tool budget correction (lead actualACK). Revise primary carrier route around body/shortcut hazards and samecaller closure. P1 reports10304 fouractualnodes/retainedfull20HP; this is reported until separately inspected, not HOME. Original16:14HOME target unmet. New operation requires changed method, not rewriting priorclock. No objective effect, no currentEndactor. P4#10303 three literal full10face samples20HP/20food/GRAVEL1/eye1.62/pose omitted; no edits/deaths.

Small offline verification failure: plain node--check rejected refuge_audit.js top-levelawait because arena wraps async, not because body malformed. No arena run occurred on that failure. Adopted P1 owned iter22/check_program.py (read, not edited); actual async-wrapper PARSE_OK then10303 completed three full samples. Useful recipient use of P1 checker now demonstrated. Observer fixed once-test16:12:57 correctly emitted onlynew chat8812–14, no last-entry duplicate; initial600s observer completed normally.

16:14:39 actual P1#10304 completed output read fully: fourWALK_END HP20 and fourFALLBACK_FULL all10true plus terminalfull; now independently verified, not merely reported. Own refuge ID correction10303(not10302) published16:15; data identical.

## H5: transient dragon damage vs late healed state, <=5min16:15:11->16:20:11
Exact permitted9665 completed output/source has zero dragonHP measurements around attack: ATTACK_EFFECT only records player's17.5->16.5HP and real crystal179gone. Independent9673 starts with P4alreadyY63 on return fromY76 attack; 50samples/4.91s minDragonHP200 is later, no synchronized attack-window minimum. **Inconclusive** between zero damage and transient damage+later healing. Publish16:16, no damage claim/no inference that crystal damage mechanism is falsified. Lead redirect16:16 accepted lesson as first-use logging requirement; stop separateaudit.

Read-only combat_recorder_fragment.js was reviewed, then actual small OW10319 test: auto-budget259ms,8polls/missingDragon8/dragons[], exact listenercounts before/after[2,0,0], no world actions or fictitious HP200. Self-review caught stop/snapshot recursion on deadline BEFORE run and corrected closingguard. This only tests missing-entity/autostop/cleanup, not actual End HP or event branch. Optional future operator integration requires their review/actual use; no adoption claim. Source+smokeoutput saved. Do not create an instrumentation preparation chain.

## H6: bounded dated library supply audit, lead redirect16:16, due16:22
RecipientP1 currentfutureEnduse choice. Competing explanations: ordinary visible cobweb/string+oak/table in library permit a bounded alternative vs apparent supply has unresolved harvesting/receipt/access. Use exact permitted pre17/20+ completed records only; no current stock/bed claim. Lead recipe10314 is reported inventoryrecipe4string->wool, table3wool+3planks->bed; no source/craft/use adopted yet. No new play/source chain.

H6 completed16:19 LIBRARY_SUPPLY_AUDIT.md: real ordinaryOAK3+STRING1 P1#9671; realSTRING3 P4#9803 thenactualBOW1 #9807 after raisedTABLE149,-36,2232 stance. Laterbed-source sequence9833/9843/9856/9860/9873 remainscraftfalse despite cut/receipt/bridge partials, finalWOOL1/STRING5 notBED. CurrentP1 hasnoSword; provenweb harvest usedWOOD_SWORD, so currenttoolsupply is an untesteddependency. No12webquota or oldretainedinputgap; firstactualnormalhit stillpriority. Deliveredbefore16:22; recipient adoption pending. No world effects.
