# Requested melee evidence — P4,01:01 UTC
Recipient: encounter_owner requested public ordinary attack/cursor evidence in10512. Read ONLY installed Mineflayer API documentation and actual current owner census163. No client implementation, mappings, packet access, excluded material or fabricated entities.

Documented public contracts (tools/mc_arena/node_modules/mineflayer/docs/api.md):
-1617 entityAtCursor(maxDistance=3.5) returns current looked-at entity or null; distance is measured from eye.
-2033 attack(entity,swing=true): attack actual player/mob entity from bot.entities/nearestEntity. No documented damage result or successful-hit acknowledgement. Swing/return alone cannot establish damage.
-1855 lookAt(point,force) resolves when looking at point. Actual cursor must be re-queried after awaited look/settle; aim/model point is not cursor evidence.
-1565/1573 bossBarCreated/Updated deliver public BossBar; health is fraction0..1 (§741). Attach before contact; absence of a newly received bar does not prove health unchanged.
-1329 entityHurt/entityDead are public events. Record actual entityid/name/currentposition/time. Hurt is consequence signal, not health amount or proof dragon remains damaged while crystals heal it.

Current completed census163 is read-only public End50/10HP with actual dragon221 at(25.6524,77.6398,-28.9007), width16,height8. It does NOT establish current legal melee range/cursor from deep50. Raw metadata array was present in owner output; P4 does NOT assign meaning to any numeric index or use an excluded mapping. No actual dragon attack has been evidenced yet this iteration.

Small distinguishing test:
1. Owner selects actual supported stance/temporary peek with qualified walk escape; public root/width/height may suggest a direction only. Do NOT fabricate parts or derive attack IDs.
2. After actual aim, query real bot.entityAtCursor(3.5), retain actual cursor ID/name/position and current block ray/view/reach check. The arena still must accept normal attack. If cursor null/blocked, no attack and no damage/immunity conclusion; change measured stance/view instead of another long watch.
3. ONE bot.attack(the_same_current_real_entity) only after owner ordinary visibility/reach qualification. Capture explicit thrown/refusal versus ordinary return, real entityHurt/Dead/bossBar fraction and subsequent current same-life ending. Re-query after any awaited change; don't use stale ID.
4. Actual ordinary accepted attack plus repeatable health/bar effect supports protected repeat melee. Accepted attack without effect leaves effectiveness unresolved and may require another actual target/view or another weapon method; no excluded parts mapping workaround.
5. Crystal explosions already produced sandbox161 dragonHurt, so consequence capture can be smoke-tested from actual records. They do NOT prove ordinary sword contact works.

Adoption test is actual P2 legal cursor-qualified one attack + consequence/ending; P4's empty Overworld room cannot qualify it. No P4 run or proxy encounter proposed. Keep trace short and bound the attempt; construction/hazard failure before cursor is NOT melee failure.

01:03 concrete candidate-selection algebra (MODELonly, notpartmapping): iffreshobserverfindslowestactualpublicrootY=ymin andownerchoosesreachR, eyeheightE, measuredjumpgainJ, a prospectivebaseY mustsatisfybaseY+E+J >= ymin-R evenbeforehorizontalrange. Comparestandingandtemporaryjumpinstead ofmerelyextendingstationarywatch. Actualwidth/heightmayguideaimpointONLY; realcursor/obstruction/enforcerstillmustqualifycontact. Iffreshpositionsneverallowthatinequalityatfundedstance, retirethatstancewithoutclaimingattackineffectiveness.
Rawmetadata9=200incensusisjustobservednumber; withoutpermittedpubliccalibrationdonotnameithealth. PreferdocumentedBossBar.healthforhealthfraction. A changedrawfieldmaybereportedaschangedrawfieldalongsidehurt, notsilentlymappedtohealth. No lookupofexcludedmappingneeded.
