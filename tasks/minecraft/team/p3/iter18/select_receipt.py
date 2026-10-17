#!/usr/bin/env python3
"""Explicit-field wrapper of P2's validated SAVED arena parser. No fetching/gameplay."""
import argparse,importlib.util,json,pathlib,re,sys
sys.dont_write_bytecode=True
TEAM=pathlib.Path(__file__).resolve().parents[2]
spec=importlib.util.spec_from_file_location('p2_saved_receipts',TEAM/'p2'/'receipt_fields.py')
core=importlib.util.module_from_spec(spec);spec.loader.exec_module(core)
BASE_FIELDS=core.FIELDS

def select(raw,program,fields=(),counts=(),all_fields=False,player=None):
    core.FIELDS=BASE_FIELDS
    initial=core.extract(raw)
    extra=list(fields)+list(counts)
    if all_fields:extra += [k for row in initial for k in row.get('omitted_fields',[])]
    core.FIELDS=tuple(dict.fromkeys(BASE_FIELDS+tuple(extra)))
    rows=core.extract(raw);row=next((r for r in rows if r['program']==program),None)
    if row is None:raise ValueError('REQUESTED_CANONICAL_ID_ABSENT')
    if player and not (re.search(r'\b'+re.escape(player)+r'\b',row['header'])):raise ValueError('ACTOR_MISMATCH')
    if not row.get('return_recorded') or not isinstance(row.get('returned'),dict):raise ValueError('NO_DICTIONARY_RETURN_RECORDED')
    value=row['returned']
    if all_fields:return value
    return {'program':program,'header':row['header'],'scope':'saved reported fields only; no independent effect/current-state inference','fields':{k:value[k] for k in fields if k in value},'array_lengths':{k:len(value[k]) if isinstance(value.get(k),list) else 'NOT_LIST' for k in counts if k in value},'missing_fields':[k for k in dict.fromkeys(tuple(fields)+tuple(counts)) if k not in value],'unavailable_reference_paths':row.get('unavailable_reference_paths',[]),'omitted_fields':row.get('omitted_fields',[])}

if __name__=='__main__':
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('saved_stdout',type=pathlib.Path);p.add_argument('--id',type=int,required=True);p.add_argument('--player',choices=['p1','p2','p3','p4']);p.add_argument('--fields',nargs='*',default=[]);p.add_argument('--counts',nargs='*',default=[]);p.add_argument('--result-only',action='store_true');a=p.parse_args()
    try:
        path=a.saved_stdout.resolve()
        if not path.is_relative_to(TEAM):raise ValueError('SAVED_INPUT_MUST_BE_INSIDE_TEAM')
        print(json.dumps(select(path.read_text(),a.id,a.fields,a.counts,a.result_only,a.player),indent=2))
    except (ValueError,OSError,TypeError) as e:p.exit(2,str(e)+'\n')
