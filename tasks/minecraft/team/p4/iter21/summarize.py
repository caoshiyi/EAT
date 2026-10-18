"""Read completed arena output. Labels in logs are never accepted as postconditions."""
import json,re,sys
from pathlib import Path
for arg in sys.argv[1:]:
    text=Path(arg).read_text()
    program=re.search(r'program #(\d+) on (p\d)',text)
    footer=re.search(r'--- (p\d) now: (.*?)\n?$',text)
    result={'file':arg,'program':program.group(1) if program else None,'arena_postcondition':footer.group(2) if footer else None}
    try:
        raw=text.split('--- returned ---\n',1)[1].split('\n--- chat',1)[0]
        ret=json.loads(raw)
        result.update({k:ret[k] for k in ['issue','attack','reached','p','hp','ground','elapsed'] if k in ret})
    except (IndexError,ValueError) as error:
        result['parse_error']=str(error)
    result['observed_attack_effects']=[json.loads(line.split(' ',1)[1]) for line in text.splitlines() if line.startswith('ATTACK_EFFECT ')]
    print(json.dumps(result))
