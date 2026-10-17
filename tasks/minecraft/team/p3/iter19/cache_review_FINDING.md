# Exact cache/respawn review — iteration19

Owner publication7425 22:21:17; exact source sha2ed732843e9a7c905ae703c1471be8026b1da199c9cee7fec8540b25f28b832d, `cache_caller_inspected.js`. First release9033 at22:22:45.121 =88.121/90sec (initial findings within budget). Additional relevant departure gap released9035 at22:23:24.791 =127.791/90sec; **overall extended review MISS37.791sec**. Do not present all findings as within90 or reset clock. Closed now; no further generic audit/gate.

Beneficiary P1 imminent cache→empty void→ordinary respawn. Source prepares bridge/void below before any drop; keeps6END until primary ground proof after vacating84.4; reserve6END separately ground-proved after vacating97.4; empty inventory+both proofs gate void. Death/respawn handlers stop controls; after death oldP1globals cleared. No obvious source bypass allowing carried stock at EMPTY gate. Exact actual9030 ONE-END toss trial supports its own ground0.5s/repickup2s only, NOT full multistack cache or void/recovery ending.

Finding1: abort cover lacks final full-shell/floor/ground/currentCloud verification; returned object omits closed/currentCloud. endingIssue=NULL alone is insufficient FULL postcondition. Respawn loop accepts health>0, so caller return must be observed at actual20HP before claiming health reset.

Supplemental finding2: preflight void scan x96..97,z2..5,Y0..48 omits player body/head Y49/50 at z1 crossed from bridge97.4,z.5. Existing `cache_prepare.js/json`9029 has SAME scan/departure-row0 qualification, does not independently resolve this gap. A sidewall in z1 could stop empty player after voidCommitted, which skips abort recovery. No obstruction claimed; smallest decisive actual read qualifies/clears departure body/head before dropping tools. No universal instrumentation/newproduction/permission gate. Source-only hazard; no P3field action or actualcache/death proof.

Actual cache success needs ordinary dropped inventory/location, empty carried inventory at commitment, actual death+new body/world/20health, and later actual cache receipt/current ending; none inferred from this review.
