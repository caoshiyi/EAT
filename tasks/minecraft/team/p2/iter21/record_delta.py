#!/usr/bin/env python3
"""Read saved canonical arena records, retaining exact output and showing only proven source-prefix differences."""
import argparse, hashlib, re
from pathlib import Path
p=argparse.ArgumentParser(description=__doc__)
p.add_argument('new', type=Path)
p.add_argument('previous', type=Path)
a=p.parse_args()
def split(path):
 text=path.read_text()
 lines=text.splitlines(keepends=True)
 boundary=next((i for i,l in enumerate(lines) if l.rstrip() in ('-- output --','-- returned --','-- error --')),len(lines))
 return lines[0],lines[1:boundary],lines[boundary:]
head,new,result=split(a.new)
oldhead,old,_=split(a.previous)
n=0
while n<min(len(new),len(old)) and new[n]==old[n]: n+=1
print(head,end='')
if n:
 prefix=''.join(new[:n])
 print(f'[Exact identical source prefix: {n} lines, sha256={hashlib.sha256(prefix.encode()).hexdigest()}, reference {a.previous}; only omit from review if that exact prefix was already inspected.]')
print(''.join(new[n:]),end='')
print(''.join(result),end='')
