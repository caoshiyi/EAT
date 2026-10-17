# P4 operation ending rules learned in iteration12

Current facts at09:01: camp E is SOLID, not a gate: (8,67,83)cobble / (8,68,83)spruce / (8,69,83)dirt. Mainroof four slabs retained. Landing(9,66,83)deepslate joins cobble(9..13,66,82). UPPER bank only(7,68,82); lower chest absent. Woodpick10-use returned to upper. Confirm these facts again before movement.

1. A bounded program must finish in a personally protected body state. A closed camp wall does not protect a body left outside. 5903 left p4 outside after both work and return hit the same threat veto; Zombie killed p4 eight seconds after the caller returned. On6162+6173, body stayed inside behind full foot/head while resolving a missing upper cap.
2. A donor's plan, an item cut, a toss, and a reserved bank item are different from recipient ownership. Record source item ID/position, current collector, recipient inventory or ordinary bank delta, useful adoption, and release. Global playerCollect includes distant players: p2 cobble events during our north-roof cut were not proof p2 received our drops.
3. Item delay and collision matter. An instant recap can push drops outside, down four metres. Furnace6013 and cobble6154 were not recovered. Do not chase them from an exposed edge. Do not repeatedly cut more surplus roof to compensate for an unproved collector.
4. P3 was the actual collector of SP1, COFF1, and DIRT1 from p4 cuts. P3 ordinary bank deposits, followed by p4 ordinary withdrawal and final placement, closed the operation. P4 had no right to count those items as owned before receipt.
5. New solid east crossing6154 passed OUT+IN movement with no damage but FAILED return roof. This does not qualify the complete method. New solid_east.inc.js requires one held spare BEFORE any cut and at least four actual owned cap blocks AFTER outgoing excavation. Returning with one spare tolerates the observed one-drop loss. Only reserve refusal6191 is verified; the revised full crossing remains unqualified.
6. Verify the full operation budget, including recipient retrieval and return. P1 estimated ten minutes to retrieve at Westpod and return; a09:03 courier ETA could not make food useful before09:07:51. P4 released that courier. The later food operation harvested zero; report zero.

## Reusable caller checks

Use run.py --verify-camp when a p4 program is meant to end in camp. It runs a fresh, separate camp_end_probe.js after the action, archives both receipts, and requires observed wall/floor/roof/door/body/control evidence. Add --require-success to reject a caught action issue as well. Personal safety and successful action remain separate checks. A mine capsule is not a camp and will be rejected by this specific guard.

Test evidence: actual6174 camp accepted; actual6154 failed return rejected; missing floor, outside body and misleading scalar closed/protectedEnd flags rejected. Actual6187 independent world postcheck passed. Actual6191 reserve0 refusal occurred before any cut and independent postcheck found all current camp walls intact. API process failures remain failures even if the subsequent ending is safe.

All old generated food_only.js, solid_food.js and solid_east_smoke.js callers now refuse immediately. Their raw .out files preserve the actual failures. Do not revive a retired caller based on an old successful movement prefix.
