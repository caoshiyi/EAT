"""Read-only monitor presentation. Raw evidence is always retained by monitor.py."""
import subprocess,sys,re,pathlib,json
BASE=pathlib.Path(__file__).parent

def render(s,prev):
 lines=s.splitlines(); out=[]; current={}; i=0
 while i<len(lines):
  line=lines[i]
  if re.match(r"p[1-4]:",line):
   player=line[:2]; block=[line]
   if i+1<len(lines) and lines[i+1].startswith("    held:"): i+=1;block.append(lines[i])
   value="\n".join(block);current[player]=value
   if prev.get(player)!=value:out.extend(block)
  elif line.startswith(("UTC","== #","CHAT","EVENT","QUERY_FAILED","milestones","deaths","programs","dragon","server/")):out.append(line)
  elif line.startswith("{") or any(x in line for x in ('"hp"','"issue"','"protectedEnd"','"protected"','"full"','"closed"',"FAIL","ISSUE","FULL","RECOVERY","DEAD","RECEIPT")):
   out.append(line if len(line)<=1150 else line[:850]+" [display shortened; full raw retained] "+line[-300:])
  i+=1
 return out,current

if __name__=="__main__":
 r=subprocess.run([sys.executable,str(BASE/"monitor.py"),*sys.argv[1:]],text=True,capture_output=True)
 f=BASE/"display_cursor.json"
 try:prev=json.loads(f.read_text())
 except (FileNotFoundError,ValueError):prev={}
 lines,current=render(r.stdout,prev)
 print("\n".join(lines))
 if current:f.write_text(json.dumps(current))
 if r.returncode or r.stderr:print("MONITOR_RESULT",r.returncode,r.stderr)
