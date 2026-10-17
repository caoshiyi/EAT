"""Generate, syntax-check, and save one P2→co-present P4 bed gift; never dispatch.
Narrowly based on actual8131/8161. Recipient effect still requires independent status.
"""
import argparse,json,pathlib,re,subprocess
owned=pathlib.Path(__file__).resolve().parent
p=argparse.ArgumentParser(description=__doc__)
p.add_argument('name');p.add_argument('--item',required=True);p.add_argument('--amount',required=True,type=int);p.add_argument('--expect-count',required=True,type=int);p.add_argument('--wear',type=int);p.add_argument('--purpose',required=True);p.add_argument('--deadline-epoch',required=True,type=int)
a=p.parse_args()
if not re.fullmatch(r'[a-z][a-z0-9_]{0,48}',a.name) or not re.fullmatch(r'[a-z_]+',a.item):p.error('simple owned name/item identifier required')
if not 1<=a.amount<=a.expect_count<=64:p.error('require 1 <= amount <= exact donor count <=64')
if a.wear is not None and a.wear<0:p.error('nonnegative expected wear')
spec={'item':a.item,'amount':a.amount,'expectCount':a.expect_count,'wear':a.wear,'purpose':a.purpose,'deadline':a.deadline_epoch*1000}
# Fixed body/receiver/movement footprint, health/life/time guards and four aim ticks.
source=(owned/'return_wood7.js').read_text()
source='const giftSpec='+json.dumps(spec,separators=(',',':'))+';\n'+source
source=source.replace("Date.now()-begun>30000","Date.now()-begun>30000||Date.now()>giftSpec.deadline-5000")
source=source.replace("i.name==='wooden_pickaxe'","i.name===giftSpec.item")
source=source.replace("!it||it.durabilityUsed!==7","!it||it.count!==giftSpec.expectCount||(giftSpec.wear!==null&&it.durabilityUsed!==giftSpec.wear)")
source=source.replace("ACTUAL_WOOD7","EXACT_DONOR_ITEM_COUNT_WEAR")
source=source.replace("await bot.tossStack(it)","await bot.toss(it.type,null,giftSpec.amount)")
source=source.replace("return{at:new Date()","return{purpose:giftSpec.purpose,recipient:'p4',recipientReceipt:'UNVERIFIED_REQUIRES_INDEPENDENT_STATUS',at:new Date()")
source=source.replace("const peer=Object.values", "if(life.position.distanceTo(V(146.5,-36,2243.5))>.25)throw Error('P2_NOT_PROVEN_SOUTH_START');const peer=Object.values")
# Deliberately do not execute a generated gift or infer recipient receipt from donor loss.
assert 'await tick(4)' in source and "PEER_DEST_" in source and 'recipientReceipt' in source
check=owned/'.gift_syntax_check.js';check.write_text('async function arena(bot,Movements,goals){\n'+source+'\n}')
r=subprocess.run(['node','--check',str(check)],capture_output=True,text=True)
if r.returncode:raise SystemExit(r.stderr)
out=owned/('generated_'+a.name+'.js')
if out.exists():raise SystemExit('refuse overwrite: '+str(out))
out.write_text(source)
print(json.dumps({'source':str(out),'syntax':'PASS','dispatched':False,'purpose':a.purpose,'recipient_receipt':'UNVERIFIED','source_protocol_evidence':[8131,8161]}))
