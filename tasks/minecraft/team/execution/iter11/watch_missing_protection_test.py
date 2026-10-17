"""Host presenter regression; reads retained records, never player execution."""
import importlib.util
from pathlib import Path
p=Path('tasks/minecraft/team/execution/watch.py')
spec=importlib.util.spec_from_file_location('execution_watch',p)
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
root=p.parent/'records'
actual=(root/'5280.txt').read_text()
a=m.ending_alert(actual)
assert a and a['reported_failed_return_without_protection_receipt'] is True
assert a['hp']==20 and 'closed' not in a # preserve raw absence, do not invent false
for key in [4980,5202,5212,5235,5278]:
 assert m.ending_alert((root/f'{key}.txt').read_text()) is None,key
assert m.ending_alert(actual.replace('RETURN_FAILED LAND_NOT_ACTUAL','CAMP_RETURN true')) is None
assert m.ending_alert(actual.replace('"hp":20','"hp":0')) is None
print('PASS actual5280 missing protection surfaces reported return failure; raw absence retained; five repaired/closed cases and later camp receipt suppressed')
