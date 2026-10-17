"""Conservative evidence check for a camp ending, using returned world observations."""
def camp_errors(d):
    errors=[]
    if not isinstance(d,dict):return ['no structured world receipt']
    p=d.get('p',{})
    if not (6.29<=p.get('x',-999)<=7.71 and 82.15<=p.get('z',-999)<=83.71 and 67<=p.get('y',-999)<=67.65):
        errors.append('body is outside qualified camp bounds')
    required={(5,67,83),(5,68,83),(7,67,81),(7,68,81),(7,67,82),
              (6,67,84),(6,68,84),(7,67,84),(7,68,84),
              (8,67,83),(8,68,83),(8,69,83),(6,66,83),(7,66,83)}
    observed={tuple(row[0]):row[2] for row in d.get('walls',[]) if isinstance(row,list) and len(row)==3 and isinstance(row[0],list)}
    if any(observed.get(a) is not True for a in required):errors.append('missing or open wall/floor evidence')
    door=d.get('door',[])
    if not (len(door)==2 and door[0]=='spruce_door' and door[1].get('open') is False):
        errors.append('north door closure is unverified')
    roofs={row[0]:row[1:] for row in d.get('mainRoof',[]) if isinstance(row,list) and len(row)==3}
    if any(roofs.get(x)!=['spruce_slab','spruce_slab'] for x in (6,7)):
        errors.append('main roof evidence is missing')
    controls=d.get('controls'); keys={'forward','back','left','right','jump','sprint','sneak'}
    if not isinstance(controls,dict) or not keys.issubset(controls) or any(controls[k] is not False for k in keys):errors.append('controls are not verified released')
    if d.get('hp',0)<=0:errors.append('body is not alive')
    return errors

def action_exit(process_exit, receipt, require_success=False):
    """An API exit and the requested action's result are separate observations."""
    if process_exit:
        return process_exit if 1 <= process_exit <= 125 else 1
    if require_success and (not isinstance(receipt,dict) or receipt.get('issue') is not None or receipt.get('endingIssue') is not None):
        return 4
    return 0
