import copy,json,pathlib
from end_guard import camp_errors
root=pathlib.Path(__file__).parent
def returned(path):
    return json.JSONDecoder().raw_decode(path.read_text().split('--- returned ---\n',1)[1].lstrip())[0]
good=returned(next(root.glob('close_release_085854*.out')))
assert camp_errors(good)==[],camp_errors(good)
bad=returned(next(root.glob('solid_east_smoke_085602*.out')))
assert camp_errors(bad),'actual roof failure accepted'
missing=copy.deepcopy(good);missing['walls'][-1][2]=False
assert camp_errors(missing),'missing floor accepted'
outside=copy.deepcopy(good);outside['p']['x']=9.5
assert camp_errors(outside),'outside body accepted'
flag=copy.deepcopy(bad);flag['protectedEnd']=True;flag['closed']=True
assert camp_errors(flag),'scalar success flags substituted for world evidence'
print('PASS: actual6174 camp accepted; actual6154 failure, missing floor, outside body, and misleading flags rejected')

from end_guard import action_exit
assert action_exit(0,bad,True)==4
assert action_exit(0,good,True)==0
assert action_exit(1,good,True)==1
assert action_exit(0,None,True)==4
print('PASS: real caught failure exits4; good action0; API failure1 preserved; missing action receipt4')
