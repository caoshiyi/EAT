"""Compact read-only summaries of preserved team arena records; never runs players.
Empty failureLabels is not a pass. Inspect actual terminal state and raw record.
"""
import argparse, json, re
from pathlib import Path
p=argparse.ArgumentParser()
p.add_argument("files", nargs="+")
p.add_argument("--per-program", action="store_true", help="Keep action and later chat/query records separate")
a=p.parse_args()
root=Path("tasks/minecraft/team").resolve()
for name in a.files:
    f=Path(name).resolve()
    if not f.is_relative_to(root):
        raise SystemExit("team record paths only")
    raw=f.read_text()
    groups=re.split(r"(?=^== #|^program #|^\[sandbox\] program #)", raw, flags=re.M) if a.per_program else [raw]
    for group in groups:
        if not group.strip():
            continue
        headers=[]; failures=[]; terminals=[]; audits=[]; failure_lines=[]; audit_lines=[]
        for line_number,line in enumerate(group.splitlines()):
            if line.startswith(("== #","program #","[sandbox] program #")):
                headers.append(line)
            if re.match(r"^(?:[A-Z][A-Z0-9_]*(?:FAILURE|FAIL)\b|FAIL\b|(?:Error|TypeError|ReferenceError|SyntaxError):)", line):
                failures.append(line); failure_lines.append(line_number)
            if line.startswith(("TERMINAL ", "FULL_AUDIT ", "ENDING ")):
                tag,payload=line.split(" ",1)
                try:
                    j=json.loads(payload)
                except json.JSONDecodeError:
                    continue
                s=j.get("state",j.get("s"))
                faces=j.get("shell",j.get("cells",j.get("faces",[])))
                row={"tag":tag,"at":s.get("at") if s else None,"state":s,
                     "full":sum(bool(c.get("full")) for c in faces),"faces":len(faces)}
                (terminals if tag=="TERMINAL" else audits).append(row)
                if tag!="TERMINAL":
                    audit_lines.append(line_number)
        returned=None
        marker=re.search(r"^---? returned ---?\s*$",group,re.M)
        if marker:
            try:
                returned,_=json.JSONDecoder().raw_decode(group[marker.end():].lstrip())
            except json.JSONDecodeError:
                pass
        print(json.dumps({"file":str(f.relative_to(root)),"headers":headers,
                          "failureLabels":failures,"auditCount":len(audits),
                          "failureAfterLastAudit":bool(audit_lines and any(n>audit_lines[-1] for n in failure_lines)),
                          "lastAudit":audits[-1] if audits else None,
                          "lastTerminal":terminals[-1] if terminals else None,"returned":returned}))
