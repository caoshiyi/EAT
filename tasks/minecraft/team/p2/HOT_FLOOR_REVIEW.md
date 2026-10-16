# Hot-floor planner review
Question: does Movements.blocksToAvoid(magma_block) actually prohibit STANDING on magma?
Budget2minutes readonly source+one tiny synthetic getMoveForward test. No gameplay/pathfinder mutation.
Source movements.js getBlock makes magma physical=true/safe=false. getMoveForward tests floorD.physical but calls safeOrBreak only HEAD/FEET (air), notfloorD. Thus avoid-floor assumption appears false. Need destination filter on every getNeighbors result (not only exclusion callbacks) to reject hot floors, with optional cardinal-only moves/firebuffer.
Not evidence that magma caused P2death: world death explicitly FIRE+SPIDER, knockback/routecorner stilluncertain. This review only tests plannerAPI assumption.

#1041 SYNTHETIC readonly result: avoidMagma=true, originalForwardNeighbors=[[7,67,82]] on fakeMagmafloor66; destinationfloorfilter=>[]. Factory nether_safe_movements.js guardsallgetNeighbors outputs + disablesdiagonals, NOTyetfieldvalidated. DoesnotreplacefirstMOVEhostilegate.
