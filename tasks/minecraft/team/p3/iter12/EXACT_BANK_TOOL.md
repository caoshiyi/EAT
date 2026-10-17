# Exact bank stack transfer

Problem observed5946: `container.deposit(type,null,1)` chose a different pickaxe of the same type (wear100 instead of intended71). `c.window` is undefined; the Container itself is the Window.

`exact_bank_stack.js` transfers one exact whole stack using stable ordinary inventory clicks and verifies source emptied, destination name/count/wear, empty cursor, life/dimension and health. Default action only inspects upper bank. It never moves pearls; use a separately budgeted cargo operation for those. A configured request is consumed immediately, so accidental reruns default to inspect.

To use, prepend one configuration line to a COPY of the program:

    global.P3ExactBank={mode:"withdraw",name:"wooden_pickaxe",wear:10};

Modes: inspect, withdraw, deposit, roundtrip. Tool wear must match observed current wear. It requires the protected camp bank pose and an empty destination slot. Whole stacks only. Output `issue:null` and verified trace are necessary; callers must inspect output before announcing receipt. Always run ONLY as p3.

Trust established small first: read-only6178, then actual6180 `roundtrip` WOODpick10 single item, bank slot12→inventory slot27→bank slot12. Both steps matched count1/wear10/cursorNULL. P3 ended empty HP20, pearls8 unchanged, tool available again in chest. Full receipts exact_bank_probe.txt and exact_bank_smoke.txt. No progression or improved score claimed from this test.

Negative precondition test6197 requested WOODwear9 while actual10: EXACT_SOURCE_OR_EMPTY_DEST_MISSING, trace[], own[], cursorNULL, HP20. No wrong tool was moved.
