"""Compact read-only summaries of preserved team arena records; never runs players.
Empty failureLabels is not a pass. Inspect actual terminal state and raw record.
"""
import argparse, json
from pathlib import Path
p=argparse.ArgumentParser()
p.add_argument("files", nargs="+")
a=p.parse_args()
root=Path("tasks/minecraft/team").resolve()
for name in a.files:
    f=Path(name).resolve()
    if not f.is_relative_to(root):
        raise SystemExit("team record paths only")
    raw=f.read_text()
    headers=[]; failures=[]; terminals=[]; audits=[]
    for line in raw.splitlines():
        if line.startswith(("== #","program #","[sandbox] program #")):
            headers.append(line)
        if line.startswith(("FAIL ", "CLOSE_FAIL ", "SNOW_TRIAL_FAILURE ", "CAP_FAILURE ", "BED_FAILURE ")):
            failures.append(line)
        if line.startswith(("TERMINAL ", "FULL_AUDIT ", "ENDING ")):
            tag,payload=line.split(" ",1)
            try:
                j=json.loads(payload)
            except json.JSONDecodeError:
                continue
            s=j.get("state",j.get("s"))
            faces=j.get("shell",j.get("cells",j.get("faces",[])))
            row={"tag":tag,"at":s.get("at") if s else None,"state":s,
                 "full":sum(bool(c.get("full")) for c in faces),
                 "faces":len(faces)}
            (terminals if tag=="TERMINAL" else audits).append(row)
    print(json.dumps({"file":str(f.relative_to(root)),"headers":headers,
                      "failureLabels":failures,"auditCount":len(audits),
                      "lastAudit":audits[-1] if audits else None,
                      "lastTerminal":terminals[-1] if terminals else None}))
