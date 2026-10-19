"""Summarize existing arena CLI raw only; labels do not certify game success."""
import pathlib,sys,json,re,hashlib
p=pathlib.Path(sys.argv[1]);raw=p.read_text();parts=re.split(r'(?m)^--+ output --+\s*$',raw)
if len(parts)!=2:raise SystemExit('Expected exactly one complete arena program output section')
head,tail=parts;out_parts=re.split(r'(?m)^--+ (returned|error) --+\s*$',tail)
if len(out_parts)!=3:raise SystemExit('Missing complete return/error section; do not treat in-flight state as endpoint')
output,terminal_kind,ret=out_parts
ret= re.split(r'(?m)^--- (?:chat|p4 now:)',ret)[0].strip()
decoder=json.JSONDecoder()
program_error=ret if terminal_kind=='error' else None
endpoint=None
if terminal_kind=='returned':
 try:endpoint,offset=decoder.raw_decode(ret)
 except json.JSONDecodeError:endpoint={'unparsed_return':ret}
parsed=[]
for line in output.splitlines():
 hit=line.find('{')
 if hit<0:continue
 try:data,offset=decoder.raw_decode(line[hit:])
 except json.JSONDecodeError:continue
 parsed.append({'label':line[:hit].strip(),'value':data})
source=[x for x in parsed if x['label'] in ['SOURCE','STATE']]
endings=[x for x in parsed if x['label'] in ['ENDING','BOX_AUDIT','FINAL_WORLD','CURRENT_AUDIT','END_OPERATION']]
failures=[l for l in output.splitlines() if re.search(r'FAILURE|Error:|RECOVERY_FAILURE|UNC[A-Z]*',l)]
print(json.dumps({'raw':str(p),'raw_sha256':hashlib.sha256(raw.encode()).hexdigest(),'header':head.splitlines()[0] if head.splitlines() else '', 'record_labels':[x['label'] for x in parsed],'source':source,'observed_endings':endings,'failures':failures,'terminal_kind':terminal_kind,'program_error':program_error,'returned':endpoint,'limit':'Actual recorded observations only. Printed labels, CLI success and full faces alone do not prove intended target, health preservation, receipt or use.'},indent=2))
