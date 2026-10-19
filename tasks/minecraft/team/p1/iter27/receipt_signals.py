"""Extract actual output signals only; never turn CLI success or markers into task success."""
import re


def inspect_output(text):
    # Records include source; run responses do not. Exclude both source and returned metadata.
    marker = re.search(r'(?m)^---? output ---?\s*$', text)
    if not marker:
        return {'output_found': False, 'incomplete_output': True, 'failure_signals': []}
    body = re.split(r'(?m)^---? returned ---?\s*$', text[marker.end():], maxsplit=1)[0]
    prefixes = ('PRIMARY_FAILURE ', 'RETENTION_FAILURE ', 'FAILURE ', 'RECOVERY_FAILURE ', 'RETURN_FAILURE ')
    signals = [line[:1200] for line in body.splitlines() if line.startswith(prefixes)]
    return {'output_found': True, 'incomplete_output': '[output truncated]' in body,
            'failure_signals': signals,
            'scope': 'Actual logged signals; absence of these signals does not establish success or safety.'}
