"""Display compact excerpts of already captured arena records; never invokes arena."""
import argparse, pathlib, re, json
p=argparse.ArgumentParser(description=__doc__)
p.add_argument('capture');p.add_argument('--after',type=int,default=0);a=p.parse_args()
base=pathlib.Path(__file__).resolve().parent/'captures'/a.capture
if base.parent != pathlib.Path(__file__).resolve().parent/'captures':p.error('simple capture name required')
for name in ['status','chat','events']:
 print('['+name+']')
 print((base/(name+'.txt')).read_text())
print('[program output excerpts; source omitted; lines over500 chars clipped]')
s=(base/'programs.txt').read_text()
for record in re.split(r'(?=^== #)',s,flags=re.M):
 m=re.match(r'== #(\d+)',record)
 if not m or int(m[1])<=a.after:continue
 print(record.splitlines()[0])
 sections=re.split(r'(^-- (?:output|returned|error) --$)',record,flags=re.M)
 for section in sections[1:]:
  for line in section.splitlines():
   match=re.match(r'^([A-Z_]+) (\{.*\})$',line)
   if match:
    try:
     data=json.loads(match[2]); cells=data.get('cells',data.get('shell'))
     if isinstance(cells,list):
      state=data.get('state',data)
      print('LITERAL_CELLS '+json.dumps({'tag':match[1],'sample':data.get('sample'),'n':len(cells),'full_true':sum(c.get('full') is True for c in cells),'full_false':sum(c.get('full') is False for c in cells),'hp':state.get('hp'),'position':state.get('p')}))
    except (json.JSONDecodeError,AttributeError,TypeError):
     print('[cell summary unavailable; inspect raw]')
   if len(line)>500:print(line[:500]+' [clipped; full raw retained]')
   else:print(line)
