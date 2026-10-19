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

01:06 response freshowner166report: actualrootminY56.605 over479samples contradicts high-perch-only assumption; lowtrenchcandidatecanbeinformative. P4hasnotindependentlyparsed166yet, so thisisattributedownerobservation. Realcurrentcentroidwithin3 +actualentityAtCursor3 +clearview is conservativeordinaryadmission; rootmodelalone stillnotproof. A boundedactualattackcanfinallydistinguish contactadmission from consequence. No metadatahealthindexorpartsIDmapping supplied.

01:10 independentlyparsedactual166lowestExact rows (166_low_windows.json): at01:01:32.594 realroot(-18.7807,56.9050,-13.7067), publicheight8. Hypotheticalcentroid(-18.7807,60.9050,-13.7067) is2.204m fromoldtrench58apexeye(-17.5,60.8722,-15.5), and2.222m fromhypotheticalSTANDING59eye(-17.5,60.62,-15.5). At32.093 previousrootwas(-12.4384,56.623,-12.5292),5.869m fromstandingeye. ThesearepastpublicpositionsjoinedtoUNTESTEDstances, NOTactualcursor orfuturephaseguarantee. They show a brief potentialwindowratherthanregionalimpossibility.
Exact168laterwaitfailedonhazardbeforepeek/attack, minforecast9.176 overthatinterval; itdoesnotcontradict166'sdifferent-time lowwindow. Noordinaryattackyet.

Materiallydifferent optionaltest ifforecast+roofcut/jumpnevercatcheswindow: owner-qualifiedstanding59/roof61 withoneCURRENTvisiblehorizontalheadport towardlowpath couldobserveactualcursorwithout1.5sroofcut/jumpdelay. ModelcentroidY60.905isbelowroof61andnearstandingeye60.62; geometrycouldallowhorizontalport. Needactualsupportedconstruction/port/ordinaryvisibility andpreparedescape qualification; roof isNOTmagicimmunity andcontinuousviewmayattractfireball. Observationchangingdecision: realcursorwithin3 atport permitsONEordinaryownerattack; modelnearbutactualcursornevereligible rejectsview/modelassumption; hazardbeforewindowrejectswait/coverpremise. This is proposalonly, noP4proxy orapprovalrequirement. Keepbounded, don'textendstaticwatch.

01:16 completedcurrentmeleeoutcomes independentlyreviewed:
-167 no visible roof anchor at(-18,60,-16), no peek/attack; retained50/10HP.
-168 changedroofCloser succeeded, thenhazardretiredroofedwaitbeforepeek/attack; minforecast9.176 duringthatdifferentinterval, retained50/10HP.
-172 newcentreapproach stoppedmissingstairactualsupport(-1,51,-11), noattack, returned50/10HP.
-173 actualcentreporch(-0.492,60,-0.430) failedno visible cap anchor(-2,60,-1) at13:42.608/HP10; recoveryfastwalkpostended54/HP5.5at13:47.871. ZEROordinaryattacks.174separateactualrecoveryretained50/HP5.5. Thisdoesnotestablishordinaryattackeffectiveness.
Genericsealassumesvisiblewallanchors exist; newporchcannotreuseenclosed-natural-roomassumption. Distinguishmissingwallfoundationvsoccludedreferenceusingactualsix-neighborfull/cursor table fromfutureownerstancebeforeanotherrepair. Ifsidefloorbelowwall isair, ordinaryvisiblefundedfoundationfirst thenwall/head canbeasmalltest; preserveknownescapepathorqualifyitsactualcuts, nevercloseexitthenassumefastWalkworks. Nohelperoverride/bypass proposed. One-columnfunding/visibilitytest andsafeendingisadoption, notanotherwholeporchbuild. NoP4geometricproxy.
Wholemelee01:03–01:15gateFAILED(contactnotachieved), no rollingclock. Needownernewallocation/materiallychangedmeasurement, notanotherlongwaitorclaimrootimmunity.
