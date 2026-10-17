"""Read-only monitor presentation; full raw snapshots retained by monitor.py."""
import subprocess,sys,re,pathlib,datetime
r=subprocess.run([sys.executable,str(pathlib.Path(__file__).with_name('monitor.py')),*sys.argv[1:]],text=True,capture_output=True)
s=r.stdout
for line in s.splitlines():
 if line.startswith(('UTC','p1:','p2:','p3:','p4:','    held:','== #','CHAT','EVENT','QUERY_FAILED','milestones','deaths','programs','dragon','server/')): print(line)
 elif line.startswith('{') or any(x in line for x in ('"hp"','"issue"','"protectedEnd"','"protected"','"full"','"closed"','FAIL','ISSUE','FULL','RECOVERY','DEAD','RECEIPT')): print(line[:850])
if r.returncode or r.stderr: print('MONITOR_RESULT',r.returncode,r.stderr)
