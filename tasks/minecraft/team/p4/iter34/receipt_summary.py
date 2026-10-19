"""Summarize ONLY owned arena receipts. Claims remain bounded to logged snapshots."""
import argparse,json,pathlib,re
p=argparse.ArgumentParser();p.add_argument('files',nargs='+',type=pathlib.Path);a=p.parse_args()
root=pathlib.Path('tasks/minecraft/team/p4/iter34').resolve()
for file in a.files:
    if file.resolve().parent!=root:p.error('own iteration receipts only')
    lines=file.read_text().splitlines(); first=None;last=None; failures=[]; ops={}
    for line in lines:
        label=line.split(' ',1)[0] if line else ''
        if 'FAILURE' in label:failures.append(line)
        if label in ('CUT','PLACE','CRAFT','PILLAR','NATIVE_MOVE'):ops[label]=ops.get(label,0)+1
        if label in ('SOURCE','ENDING','FINAL_WORLD'):
            try:
                obj=json.loads(line.split(' ',1)[1]); st=obj.get('state',obj)
                if first is None:first=st
                last=st
            except (ValueError,IndexError):pass
    def snap(s):
        if not s:return None
        return {k:s[k] for k in ('at','p','hp','food','ground','inv','offhand','controls','goalPresent') if k in s}
    print(json.dumps({'file':str(file),'programs':re.findall(r'program #(\d+) on p4',file.read_text()),'source':snap(first),'ending':snap(last),'failures':failures,'logged_ops':ops}))
