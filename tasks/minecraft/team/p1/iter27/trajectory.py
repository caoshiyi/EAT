"""Conditional planner from public recorded projectile positions/velocities only.

No game actions. Coordinates are a proposed origin and target, not visibility proof.
"""
import argparse
import json
import math
from pathlib import Path


def advance(pos, vel, steps, drag, gravity):
    pos, vel = list(pos), list(vel)
    for _ in range(steps):
        pos = [p + v for p, v in zip(pos, vel)]
        vel = [v * drag for v in vel]
        vel[1] -= gravity
    return pos, vel


def load_model(path):
    lines = Path(path).read_text().splitlines()
    post = json.loads(next(s.split(' ', 1)[1] for s in lines if s.startswith('PROJECTILE_POST ')))
    samples, seen = [], set()
    for sample in post['tracks'][0]['samples']:
        pos = tuple(sample['p'][c] for c in 'xyz')
        if pos not in seen:
            samples.append(sample)
            seen.add(pos)
    if len(samples) < 4:
        raise ValueError('Need four distinct actual positions with velocities')
    xyz = lambda sample, key: [sample[key][c] for c in 'xyz']
    a, b = samples[:2]
    p0, v0, p1, v1 = xyz(a, 'p'), xyz(a, 'velocity'), xyz(b, 'p'), xyz(b, 'velocity')
    axis = max((0, 2), key=lambda k: abs(v0[k]))
    ratio = v1[axis] / v0[axis]
    candidates = []
    for steps in range(1, 21):
        drag = ratio ** (1 / steps)
        gravity = (ratio * v0[1] - v1[1]) * (1 - drag) / (1 - ratio)
        pred, _ = advance(p0, v0, steps, drag, gravity)
        candidates.append((math.dist(pred, p1), steps, drag, gravity))
    error, steps, drag, gravity = min(candidates)
    held_out = []
    for i in range(1, len(samples) - 1):
        pred, _ = advance(xyz(samples[i], 'p'), xyz(samples[i], 'velocity'), steps, drag, gravity)
        held_out.append(math.dist(pred, xyz(samples[i + 1], 'p')))
    if max(held_out) > .05 or error > .05 or gravity <= 0 or not 0 < drag < 1:
        raise ValueError('Observed flight does not qualify this simple model')
    return {'drag': drag, 'gravity': gravity, 'speed': math.sqrt(sum(v*v for v in v0)),
            'steps_per_update': steps, 'fit_error': error,
            'held_out_errors': held_out, 'distinct_positions': len(samples)}


def crossing(radius, angle, model):
    angle = math.radians(angle)
    pos = [0, 0, 0]
    vel = [model['speed'] * math.cos(angle), model['speed'] * math.sin(angle), 0]
    for tick in range(200):
        new, vel = advance(pos, vel, 1, model['drag'], model['gravity'])
        if new[0] >= radius:
            f = (radius - pos[0]) / (new[0] - pos[0])
            return pos[1] + (new[1] - pos[1]) * f, tick + f
        pos = new
    return None


def plan(origin, target, model):
    radius = math.hypot(target[0] - origin[0], target[2] - origin[2])
    if radius < .01:
        raise ValueError('Need nonzero horizontal separation')
    dy = target[1] - origin[1]
    heights = [(angle / 10, crossing(radius, angle / 10, model)) for angle in range(1, 900)]
    heights = [(angle, result) for angle, result in heights if result]
    best = max(heights, key=lambda item: item[1][0])
    roots = []
    for (a, va), (b, vb) in zip(heights, heights[1:]):
        if (va[0] - dy) * (vb[0] - dy) <= 0:
            lo, hi = a, b
            for _ in range(24):
                mid = (lo + hi) / 2
                if (crossing(radius, lo, model)[0] - dy) * (crossing(radius, mid, model)[0] - dy) <= 0:
                    hi = mid
                else:
                    lo = mid
            angle = (lo + hi) / 2
            roots.append({'elevation_degrees': angle, 'flight_ticks': crossing(radius, angle, model)[1],
                          'look_point_from_eye_0_1_above_origin': [target[0], origin[1] + .1 + radius * math.tan(math.radians(angle)), target[2]]})
    return {'origin': origin, 'target': target, 'horizontal_distance': radius, 'required_rise': dy,
            'maximum_predicted_rise_at_radius': best[1][0], 'best_angle': best[0], 'solutions': roots,
            'warning': 'Conditional on same launch speed/physics; no dispersion, block collision, reach, visibility, damage or safety proof. Owner must independently qualify actual outgoing aperture and observe one sandbox shot/retained ending.'}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('record')
    parser.add_argument('--origin', nargs=3, type=float)
    parser.add_argument('--target', nargs=3, type=float)
    args = parser.parse_args()
    model = load_model(args.record)
    result = {'source': args.record, 'scope': 'Public arena flight observations only', 'model': model}
    if args.origin and args.target:
        result['plan'] = plan(args.origin, args.target, model)
    print(json.dumps(result, indent=2))
