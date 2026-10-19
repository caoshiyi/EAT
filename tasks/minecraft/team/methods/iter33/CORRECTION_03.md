# Correction03 — reaching source did not restore its roof

Published 2026-10-19T11:16:52.053421+00:00. One current owned defect: return-to-source ending incomplete.

Completed LIVE12212 actual cobble8, tunnel admission refused, then firstUP server-refused dirt; operation correctly threw quarry ending changed at60.420, not intended64. Separate12214 recovered actual64 but printed RECOVERED_SOURCE and threeENDING samples with roof98/66/1033=AIR. Source includes no roof restoration/assert after successful ascent; final up cut the old roof at66 (DIG_POST originalgrass_block→AIR), then the program only logged boundaries. This is the smallest directly supported cause of nine-face recovered-source ending. It does not explain original placement refusal.

Small correction proposal in source_roof_postcondition.js.txt: after successful ascent to the declared original source, restore missing declared roof using existing normal visible placeAt, then assert position/grounded/all10FULL on actual observations before successor readiness. Preserve partial receipt separately if restoration fails. Owner alone integrates/executes. No peer edit or novel movement method.

Acceptance exercises actual failure: current9-face source is sufficient; do not repeat quarry. Owner repairs actual roof, observes correct block at98/66/1033 and full boundary plus current body; next call must observe same actual roof/source and retain stone/tool inventory, then actual intended use. A logged RECOVERED_SOURCE/ENDING without those observations is a failed ending. One case does not qualify arbitrary quarry/ascent/roofs.
