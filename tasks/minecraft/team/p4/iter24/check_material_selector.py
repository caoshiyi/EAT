"""Read-only narrow selector diagnostic, not a recipe-reserve or safety verifier."""
import argparse,pathlib,re,sys
def classify(line):
 if re.search(r"inventory\.items\(\)\.find\(i=>\[.*\.includes\(i\.name\)\)",line):
  return 'INVENTORY_ORDER: list membership does not establish priority'
 if "for(const n of[" in line and "find(i=>i.name===n)" in line:
  names=re.findall(r"'([^']+)'",line.split('for(const n of[',1)[1].split(']',1)[0])
  return 'EXPLICIT_PRIORITY: '+','.join(names)+'; recipe input can still be spent if alternatives exhaust'
 return 'UNKNOWN: inspect exact source manually'
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('files',nargs='+');a=p.parse_args()
 for fn in a.files:
  text=pathlib.Path(fn).read_text()
  found=[line for line in text.splitlines() if line.startswith('function material(){')]
  if not found:print(fn,'UNKNOWN: no matching one-line material() helper')
  for line in found:print(fn,classify(line))
