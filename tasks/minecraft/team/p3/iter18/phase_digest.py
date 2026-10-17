#!/usr/bin/env python3
"""Saved P1 seven-field melee samples only; no arena calls or live polling."""
import json,sys
from collections import Counter

def digest(r):
    samples=r.get('samples')
    if not isinstance(samples,list) or not samples:raise ValueError('No P1 melee samples')
    for s in samples:
        if not (isinstance(s,list) and len(s)==7 and isinstance(s[0],(int,float)) and isinstance(s[1],int) and isinstance(s[2],dict) and all(k in s[2] for k in ('x','y','z')) and isinstance(s[3],(int,float)) and type(s[4]) is int and 0<=s[4]<=10 and isinstance(s[5],(int,float)) and isinstance(s[6],(int,float))):raise ValueError('Unknown sample schema; refusing inference')
    if any(b[0]<a[0] for a,b in zip(samples,samples[1:])):raise ValueError('Nonmonotonic timestamps')
    transitions=[{'at_ms':b[0],'target_id':b[1],'from':a[4],'to':b[4],'gap_ms':b[0]-a[0]} for a,b in zip(samples,samples[1:]) if a[1]==b[1] and a[4]!=b[4]]
    return {'scope':'sampled saved result only; gaps can conceal phases; issued count is not accepted-hit count','sample_count':len(samples),'first_ms':samples[0][0],'last_ms':samples[-1][0],'max_gap_ms':max((b[0]-a[0] for a,b in zip(samples,samples[1:])),default=0),'target_ids':sorted(set(s[1] for s in samples)),'phases':dict(Counter(s[4] for s in samples)),'observed_transitions':transitions,'sampled_target_hp_min':min(s[3] for s in samples),'last_sample_target_hp':samples[-1][3],'issued':r.get('issued'),'ending_dragon':r.get('dragon'),'actor_ending':{k:r.get(k) for k in ('lifeId','hp','p','ground','closed','currentCloud','lost','issue','endingIssue','controls')}}
if __name__=='__main__':
    print(json.dumps(digest(json.load(open(sys.argv[1]))),indent=2))
