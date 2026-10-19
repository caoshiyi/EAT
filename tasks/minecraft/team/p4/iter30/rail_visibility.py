"""Offline geometric proposal, never a Minecraft visibility/reach permission."""
import itertools,json,math,pathlib
def hit(eye,end,cube):
    lo,hi=0.,1.
    for e,d,c in zip(eye,[b-a for a,b in zip(eye,end)],cube):
        if abs(d)<1e-12:
            if not c<=e<=c+1:return None
        else:
            a,b=sorted(((c-e)/d,(c+1-e)/d));lo=max(lo,a);hi=min(hi,b)
            if lo>hi:return None
    return lo if hi>=0 and lo<=1 else None
def first(eye,end,blocks):
    found=[(t,b) for b in blocks if (t:=hit(eye,end,b)) is not None]
    return min(found) if found else None
assert hit((0,0,0),(2,0,0),(1,-.5,-.5))==.5
assert hit((0,0,0),(-2,0,0),(1,-.5,-.5)) is None
eye=(30.7,78.62,-24.5)
target=(31,74,-26)
# Only top wall77/78 and base58 directly sampled here; contiguous wall between is
# a MODEL assumption. Actual owner must inspect each desired anchor.
blocks=set(itertools.product(range(31,37),range(58,79),range(-26,-22)))
blocks|={(30,y,-24) for y in range(58,79)} # solid ascent A, south of B
blocks.add((30,76,-25)) # current B landing floor
offsets=[(.5,.5,.5),(.5,.99,.5),(.5,.01,.5),(.01,.5,.5),(.99,.5,.5),(.5,.5,.01),(.5,.5,.99)]
def row(off):
    end=tuple(a+b for a,b in zip(target,off));f=first(eye,end,blocks);distance=math.dist(eye,end)
    return dict(offset=off,aim=end,distance=distance,firstBlock=f[1] if f else None,firstT=f[0] if f else None,modelVisibleWithin4_5=bool(f and f[1]==target and distance<=4.5))
old=[row(o) for o in offsets]
corners=[row((.01,y,z)) for y,z in itertools.product([.05,.5,.95],[.05,.5,.95])]
report=dict(status="model only; not game proof",eye=eye,target=target,knownLimits=["contiguous wall assumed","unit collision cubes only","no entity obstruction","actual current cursor+face+reach mandatory"],oldSeven=old,westFaceGrid=corners)
pathlib.Path('tasks/minecraft/team/p4/iter30/rail_visibility.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(dict(oldWinners=[x for x in old if x['modelVisibleWithin4_5']],cornerWinners=[x for x in corners if x['modelVisibleWithin4_5']]),indent=2))

# Corrected hypothesis after actual279 old-floor collision. Three-level drops
# plus actual P4 probe281 crouch eye1.27; THREE steps mandatory in world test.
eye3=(30.65,78.27,-24.70);aim3=(31.001,73.97,-25.80);target3=(31,73,-26)
f3=first(eye3,aim3,blocks)
old_b_floor=(30,76,-25)
collision=dict(currentFeet=75,standingTop=76.8,crouchingTop=76.5,oldFloorY=[76,77],
    headCollisionCenterZ=-25.3,loseCurrentSupportCenterZ=-24.7,
    implication="2-drop backtracking is blocked before leaving current floor, even crouching",
    after3DropFeet=74,after3DropStandingTop=75.8)
three=dict(eye=eye3,aim=aim3,distance=math.dist(eye3,aim3),firstBlock=f3[1] if f3 else None,
    expected=target3,modelVisibleWithin4_5=bool(f3 and f3[1]==target3 and math.dist(eye3,aim3)<=4.5),
    limits="Actual crouch/visiblewestface4/native3dropHP/thirdstep not yet qualified")
assert three['modelVisibleWithin4_5']
report['oldFloorCollision']=collision;report['threeDropCrouchProposal']=three
pathlib.Path('tasks/minecraft/team/p4/iter30/rail_visibility.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(three,indent=2))
