#!/usr/bin/env python3
"""Offline route progress diagnostic; not a claim a live controller used this guard."""
import math
def toward_target(start,end,target=(148.2,1463.0)):
    d=lambda p:math.hypot(p[0]-target[0],p[1]-target[1])
    return {'distance_before':d(start),'distance_after':d(end),'net_forward':d(start)-d(end),'motion':math.dist(start,end)}
