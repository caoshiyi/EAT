"""Read completed arena outputs without treating labels as proof. Raw file remains authority."""
import json,re,sys
from pathlib import Path

def brief(text):
 out=[]; in_output=False
 for line in text.splitlines():
  if line.startswith('== #'):out.append(line);in_output=False
  elif line=='-- output --':in_output=True
  elif line=='-- returned --':in_output=True
  elif in_output:
   label,_,raw=line.partition(' ')
   if any(w in label.upper() for w in ['FAIL','ERROR','TIMED']):out.append(line[:700])
   if label in ['TERMINAL','FULL_AUDIT','SEGMENT_REACHED']:
    try:d=json.loads(raw)
    except json.JSONDecodeError:out.append('UNPARSED '+line[:200]);continue
    cells=d.get('shell',d.get('cells',[]));s=d.get('state',d)
    out.append(json.dumps({'label':label,'sample':d.get('sample'),'at':s.get('at'),'p':s.get('p'),'hp':s.get('hp'),'inv':s.get('inv'),'cells':len(cells),'full':sum(c.get('full') is True for c in cells),'false':[c for c in cells if c.get('full') is not True]},separators=(',',':')))
 return '\n'.join(out)
if __name__=='__main__':
 if sys.argv[1:] == ['--selftest']:
  s=brief('== #1 test\n-- output --\nFULL_AUDIT {"cells":[{"full":true},{"full":false}],"state":{"hp":3}}\nPRIMARY_FAILURE sample\n')
  assert '"cells":2,"full":1' in s and 'PRIMARY_FAILURE sample' in s
  assert '"cells":0,"full":0' in brief('== #2 test\n-- output --\nTERMINAL {"state":{"hp":20}}')
  print('PASS: literal false and missing arrays remain visible; errors retained')
 else:print(brief(Path(sys.argv[1]).read_text()))
