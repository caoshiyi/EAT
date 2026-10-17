"""Read new watcher lines in arrival order, including late lower-ID completions."""
import json
from pathlib import Path
HERE=Path(__file__).resolve().parent

def changes(lines,start):
    for raw in lines[start:]:
        row=json.loads(raw)
        for c in row.get('changes',[]):
            yield row.get('time'),c

if __name__=='__main__':
    lines=(HERE/'watch.jsonl').read_text().splitlines()
    state=HERE/'brief_line.json'
    start=json.loads(state.read_text()) if state.exists() else next((i for i,l in enumerate(lines) if json.loads(l).get('time','')>='2026-10-17T09:41:00'),len(lines))
    if start>len(lines):start=0
    for at,c in changes(lines,start):
        print(at,c['id'],c['header'],str(c['observations'])[:850])
    state.write_text(json.dumps(len(lines)))
