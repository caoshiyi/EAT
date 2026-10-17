# Actual8079 causal reconciliation — 2026-10-17 17:31 UTC
Requested root REVIEW17:29, due17:34. No player execution, no permission gate. Exact executed caller combat58.js and canonical8079 saved in8079_effect.json inspected. P2 independently owns rawhit/head source question; this report reconciles observations.

**Conclusion: observed .25 is NET CHANGE over a ten-tick blind interval, NOT measured damage per hit. Parent effect works; sustained damage is erased.** End-of-program HP200 cannot refute observed intermediate damage. Matched-public P2 COMBAT.md describes BODY damage input/4+min(input,1), nominal hand1→1.25, plus crystal heal1/10ticks; source isn't physical causal proof, but that model exactly explains the first three net-.25 windows.

Exact records:
-17:28:16.963 dispatch1 ID171,r5.8022,HP200.
-17:28:17.464 sample199.75; dispatch2 r5.1669.
-17:28:17.966 sample199.5; dispatch3 r5.1002.
-17:28:18.468 sample199.25; dispatch4 r5.7726.
-17:28:18.970 sample200; range11.396, phase1.

Code: `bot.attack(d); attacks.push(...); await tick(10); n+=10; continue`. No HP sampling within awaited10ticks. Therefore no record of raw minimum198.75 or any intermediate heal. Four attempts != four accepted hits. Last+.75 window also fits **fourth attack rejected +1heal clipped at200**; range was measured BEFORE awaitedlookAt and server processing, and dragon rapidlydeparted. Or rawdamage/healing timing differs; cannot uniquely choose without per-updateHP/actualdispatchgeometry. Do not claim fourthrawdamage or weakerhand/cooldown from this trace.

Competing explanations now discriminated:
1. Old no-dispatch gate explanation resolved positively by actual8079. Exact old<5.8 vs current<5.9 is relevant to why old zeroactions don't predict currentfailure; source server<6 supports margin but not guarantee on movingtarget.
2. Server parent invalid explanation falsified for at least three observed damagewindows in this isolated liveoperatorcase. No need invented multipartIDs.
3. Raw .25 damage vs1.25damage+1healing remains measurement ambiguity. **Smallest informative owner test**, only if it advances currentchosenoperation: metadata/entityUpdate HP events keyed tocurrentdragonID across ONE ordinaryhit and following~12ticks; include actualhand,phase,pre/postactionpositions/eyes and playerhealth/cloud. Expected199.75-only vs198.75→199.75 distinguishes models. No specialmaterials/newstance needed. P2 recommended same17:29:40, so do not duplicate support work or block selectedcrystaloperation.
4. A current crystal healing thattarget vs other reset/metadata interpretation: phase1/ID171 constant in samples, decreasingvalues are normalmetadata9. A freshbeam/healer observation and one actualcrystaldestroyed with comparableHP recovery improves causal evidence. Allcrystalswithinclientview doesnotidentify nearestCrystal. Source nearestselection uses expandedAABB32 andpersistuntilreselection, not simple42mring exclusion.

**Decision applying answer:** prioritize playerselected onecrystaleffect/retainedoperator or brief eventHP trace; release parent/range/source audits. No repeated unmodified handpulse as sustained-damage strategy, no returnfatalY60, no trapdoor supply project nowplainY58hitworks. P4 selectedonecrystalshield/meleetest6399–6402; P1/P3 snowprojectile independentlyselectedandnowphysicallyproved8101 (snow1→0/projectilespawn/trajectory). Neither proves crystal destruction. Analyst should inspect exactshield/blast/escape predicates next, not extend resolvedparentanalysis.
