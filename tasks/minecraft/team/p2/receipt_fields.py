"""One-shot summaries of saved arena stdout. No gameplay, fetching or state cursors."""
import argparse
import json
import pathlib
import re

HEADER = re.compile(r'^(?:== #\d+ .*|program #\d+ on p[1-4]:.*)$', re.M)
FIELDS = ('at', 'world', 'dimension', 'lifeId', 'currentId', 'p', 'pos', 'hp',
          'health', 'food', 'ground', 'issue', 'endingIssue', 'lost', 'closed',
          'currentCloud', 'controls', 'cursor', 'inv', 'inventory', 'before',
          'after', 'receipt', 'issued', 'destroyed', 'remaining', 'target',
          'beforeCrystals', 'afterCrystals', 'beforeArrow', 'afterArrow',
          'arrowSpent', 'targetGone', 'dragon', 'dragons', 'phase')


def unavailable_paths(value, prefix='returned'):
    if value == '[repeated reference]':
        return [prefix]
    if isinstance(value, dict):
        return [p for key, child in value.items()
                for p in unavailable_paths(child, prefix + '.' + str(key))]
    if isinstance(value, list):
        return [p for index, child in enumerate(value)
                for p in unavailable_paths(child, prefix + '[' + str(index) + ']')]
    return []


def extract(text):
    """Fail closed for missing/truncated return records; never infer success."""
    headers = list(HEADER.finditer(text))
    if not headers:
        raise ValueError('NO_CANONICAL_HEADER')
    results = []
    for n, header in enumerate(headers):
        block = text[header.end():headers[n + 1].start() if n + 1 < len(headers) else len(text)]
        markers = list(re.finditer(r'^---? returned ---?\s*$', block, re.M))
        if not markers and header.group().startswith('== #'):
            results.append({'program':int(re.search(r'#(\d+)',header.group())[1]),
                            'header':header.group(), 'returned':None,
                            'return_recorded':False, 'status':'NO_RETURN_RECORDED',
                            'scope':'return absent; no completion or success inferred'})
            continue
        if len(markers) != 1:
            raise ValueError(f'EXPECTED_ONE_RETURN_MARKER: {header.group()}')
        tail = block[markers[0].end():].lstrip()
        if tail.startswith('(nothing)'):
            value = None
        else:
            try:
                value, _ = json.JSONDecoder().raw_decode(tail)
            except json.JSONDecodeError as e:
                raise ValueError(f'INCOMPLETE_OR_NON_JSON_RETURN: {header.group()}') from e
        match = re.search(r'#(\d+)', header.group())
        selected = {k: value[k] for k in FIELDS if k in value} if isinstance(value, dict) else value
        omitted = sorted(set(value) - set(FIELDS)) if isinstance(value, dict) else []
        results.append({'program': int(match[1]), 'header': header.group(),
                        'returned': selected, 'return_recorded':True, 'omitted_fields': omitted,
                        'unavailable_reference_paths': unavailable_paths(value),
                        'scope': 'reported return fields only; not world score or independent success proof'})
    return results


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('saved_stdout', type=pathlib.Path)
    a = p.parse_args()
    # Saved team artifacts only: reject server paths and path aliases outside team.
    team = pathlib.Path(__file__).resolve().parents[1]
    source = a.saved_stdout.resolve()
    if not source.is_relative_to(team):
        p.error('saved input must resolve inside tasks/minecraft/team')
    try:
        records = extract(source.read_text())
    except (ValueError, OSError) as e:
        p.exit(2, str(e) + '\n')
    for record in records:
        print(json.dumps(record, separators=(',', ':')))


if __name__ == '__main__':
    main()
