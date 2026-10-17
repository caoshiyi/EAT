"""Check the route's placement whitelist against its removable block whitelist."""
import ast, pathlib, re, sys
failed = False
for arg in sys.argv[1:]:
    p = pathlib.Path(arg)
    s = p.read_text()
    caps = re.search(r'const capNames=(\[[^\]]+\])', s)
    cuts = re.search(r"if\(!(?P<kinds>\[[^\]]+\])\.includes\(b\?\.name\)\)throw Error\('CUT_'", s)
    if not caps or not cuts:
        print(p.name, 'NO_ROUTE_WHITELISTS')
        failed = True
        continue
    missing = sorted(set(ast.literal_eval(caps[1])) - set(ast.literal_eval(cuts['kinds'])))
    print(p.name, 'MISSING ' + ','.join(missing) if missing else 'PASS')
    failed |= bool(missing)
sys.exit(int(failed))
