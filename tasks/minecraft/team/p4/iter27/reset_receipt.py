"""Read exact sandbox reset timing from retained CLI stdout; no arena operations."""
import json,pathlib,re,sys
p=pathlib.Path(sys.argv[1]);s=p.read_text()
c=re.findall(r'sandbox reset: copied in ([0-9.]+) s',s)
t=re.findall(r'sandbox reset: done in ([0-9.]+) s',s)
if len(c)!=1 or len(t)!=1:raise SystemExit('Reset incomplete or ambiguous; no timing receipt')
print(json.dumps({'source':str(p),'generation':sys.argv[2],'copySeconds':float(c[0]),'totalSeconds':float(t[0]),'exactCopyInstant':'unknown','completed':True}))
