import json,pathlib
root=pathlib.Path('tasks/minecraft/team/p4/iter14')
names=['low_dest_115054_568206.out','low_dest_115143_096090.out','low_dest_115221_366784.out','low_dest_115300_073819.out','low_dest_115337_456143.out','low_dest_115414_077657.out','portal_to_intake_115744_869874.out','portal_corridor_reverse_120638_213628.out','destination_down10_120906_284632.out']
rows=[]
for name in names:
 text=(root/name).read_text(); body=text.split('--- returned ---\n',1)[1]; obj=json.JSONDecoder().raw_decode(body.lstrip())[0]
 rows.append(dict(file=name,program=text.splitlines()[0],**{k:obj.get(k) for k in ['issue','p','hp','world','index','total','closed','full','cuts','moves']}))
assert rows[0]['program'].startswith('program #7158') and rows[0]['moves']==79 and rows[0]['cuts']==4
print(json.dumps(rows,indent=2))
