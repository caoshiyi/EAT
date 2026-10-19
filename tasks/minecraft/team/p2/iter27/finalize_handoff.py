"""Write a factual closing addendum from already-saved arena/eval artifacts only."""
from pathlib import Path
import datetime,json,re,sys
b=Path(__file__).resolve().parent
dry='--dry-run' in sys.argv;raw=(b/('LIVE_apex_crystal1.out' if dry else 'LIVE_western89.out')).read_text()
posts=[json.loads(l.split(' ',1)[1]) for l in raw.splitlines() if l.startswith('SURFACE_ACTUAL_POST ')]
if not posts:raise SystemExit('No actual LIVE post receipt; do not finalize from intention')
d=posts[-1];s=d['state'];same_end=s['dim']=='the_end';n=len(d['crystals']);second=bool(d['fired'] and d['targetPresent'] is False and same_end and n==7 and s['hp']>0)
inv={}
for name,count in s['inv']:inv[name]=inv.get(name,0)+count
fail=[l for l in raw.splitlines() if l.startswith(('FAILURE','RECOVERY_FAILURE'))]
receipt=json.loads((b/('LIVE_apex_crystal1.out.receipt.json' if dry else 'LIVE_western89.out.receipt.json')).read_text())
evaltext=(b/('EVAL_OPENING.md' if dry else 'EVAL_CLOSURE.txt')).read_text();official={k:re.findall(r'\b'+k+r'\s*=\s*(\d+)',evaltext,re.M)[-1] for k in ['dragon','milestones','deaths']}
savefailed='save-all failed' in evaltext
if dry:
 assert not second and n==8 and s['hp']==10 and official['dragon']=='0'
 print('Small actual LIVE11494 finalizer dry-run passed; no memory writes, one verified live crystal, not second.')
 raise SystemExit(0)
stamp=datetime.datetime.now(datetime.timezone.utc).isoformat()
effects=2 if second else 1
add=f'''\n## Closing material addendum — {stamp}\n\nDragon defeat remains unachieved. Closure evaluator: dragon={official['dragon']}, milestones={official['milestones']}, deaths={official['deaths']}. {'SAVE FAILED; these are last-saved readings and the informational combat state may be stale.' if savefailed else 'Evaluator completed without a save-failure message.'}\n\nFinal LIVE program {receipt['program_id']} returned {s['at']} in {s['dim']} at {s['p']}, health{s['hp']}/food{s['food']}, Snow{inv.get('snowball',0)}, Endstone{inv.get('end_stone',0)}, pick wear{s['wear']}. It recorded {receipt['ending_audits']} full ending audits. Controls{s['controls']}, goal{s['goal']}. Exact raw/analysis/status/evaluator artifacts are retained in this directory. No live P2 death occurred during this iteration.\n\nSecond-crystal LIVE effect qualified from actual records: {second}. Fired={d['fired']}, actual targetPresent={d['targetPresent']}, loaded crystals={n}, same End body={same_end}. Thus total verified live crystals destroyed this iteration={effects}. This is combat progress, not dragon victory. Failure markers for this last operation: {fail or 'none'}. Do not infer dragon HP damage from an absent boss-bar update or a modeled trajectory.\n\nG10 actual179 three straight stairs and whole three-DOWN physically recentered three times, returned50/10/full at34:02.475. Full180 destroyed western89 target262 at36:01.926 and returned50/10/full at36:32.553 despite an incoming fireball. Only then was the live method applied, after strong actual source checks. Sandbox started after the small test with99 Endstone/pick119+52; live had92/pick110+52 (more durability, seven fewer stone, both funded). Keep these source differences explicit.\n\nThe final whole budget01:30–38 was missed: actual live return was {s['at']}. The clock was not reset. The task's105-minute execution cutoff is01:39:26; no further gameplay is queued. Closure reads and this material addendum follow the last actual operation. The provisional was completed at01:19, before01:24:26.\n\nFive sandbox P2 magic deaths were observed this iteration: G1/132, G2/after136, G4/151, G8/after175, G9/178. The returned alive snapshots of136/175 did not certify later survival. G8's ten-meter loop never executed; its method is unqualified. No ordinary sword attack occurred; no melee immunity conclusion follows. G7 fountain failure reached60 but injured/displaced the body;174's separate rescue does not pass that operation. Detailed failures, local syntax/CLI failures and tool limits remain in WORK_LOG.md and raw receipts.\n\nAll current P2 calls are complete. No passive observer/global dependency remains, and no further reset is requested. Only p2 was controlled; p3 remained unplayed. No agents were spawned, no excluded ENCOUNTER/iteration17–19 mapping or bytecode was knowingly used, and no internet/raw packets/visibility bypass/server/.work/tools modifications/remote push occurred. Preserve the earlier corrected11482 chat overlap and iteration26 exposure disclosure; they are not erased by later successful play.\n'''
(b/'PROVISIONAL_HANDOFF.md').open('a').write(add)
root=b.parents[1]
p=root/'P2.md'
(b/'P2_before_final.md').write_text(p.read_text())
p.write_text('# P2 final — iteration27\n'+add+'\nSee [provisional handoff and full chronology](p2/iter27/PROVISIONAL_HANDOFF.md), [experiment log](p2/iter27/WORK_LOG.md), and exact receipts in p2/iter27/.\n')
(b/'WORK_LOG.md').open('a').write(add)
(b/'NEXT.md').write_text(f'''# Iteration27 closed\nObjective unachieved: official dragon={official['dragon']}/milestones={official['milestones']}/deaths={official['deaths']}, savefailed={savefailed}. Actual verified live crystals destroyed={effects}; final same-End loaded count={n}, body{s['p']}/HP{s['hp']}/Snow{inv.get('snowball',0)}. All P2 calls complete; no gameplay/reset/observer dependency queued. Read P2.md + final provisional addendum and exact LIVE_western89 receipts. Continue from actual retained End access, not old58source or fresh Overworld prep. No remote push.\n''')
print(json.dumps({'second_live_crystal':second,'verified_live_crystals_destroyed':effects,'final_state':s,'official':official,'save_failed':savefailed},indent=2))
