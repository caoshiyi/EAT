# P2 review request: local synthetic movement harness
Two setup failures in p3/review_nether_movements.js before any behavior result: (1) new Function lacks lexical require; (2) fake bot omitted game.minY needed by installed getLandingBlock. Revised hypothesis: harness contract incomplete, not a movement-factory defect. I read getNeighbors/getLandingBlock and am adding the explicit Nether game.minY=0 contract. P2/coordinator independent review requested; don't treat failed harness as world evidence. No player/server/network access in this script.

Results after explicit mock-contract repair (Nether minY0, require mapping):
- basalt floor: native and filtered forward allowed.
- magma floor: native allowed, P2 factory rejected.
- fire feet or head: both rejected.
- closed spruce fence gate: both rejected (manual open required).
- filtered neighbors all cardinal.
This independently confirms floor-filter behavior only. It does not prove travel arcs, live entities, actual damage avoidance, or physical Nether traversal.
