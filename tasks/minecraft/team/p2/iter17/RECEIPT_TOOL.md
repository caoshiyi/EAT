# Canonical returned-field helper — CLOSED improvement

Problem: repeated off-by-one program attribution and terminal truncation of long arena source/returns. Existing p2/run_record.py preserved full raw output but long runs only showed selected lines and a tail, which can hide the actual return. Improved that existing helper to use p2/receipt_fields.py and print the exact canonical header plus selected returned fields. Full raw still retained; parse failure explicitly says UNPROVED and retains old tail fallback. No tool/server modifications.

One-shot saved-response use:
`python3 tasks/minecraft/team/p2/receipt_fields.py tasks/minecraft/team/p2/iter17/p1_relay_receipt.txt`

No fetching, gameplay, background watcher, cursors or claims of world success. Input must resolve inside team, never server/.work. Output labels selected data as REPORTED return fields, explicitly not world score or independent proof. Missing fields are absent, rather than silently fabricated as null/true. False receipt, issue strings and explicit null are preserved. Large traces are omitted with their field names listed. Caller must read full raw for detailed action/telemetry evidence.

Small fixtures passed BEFORE actual records: multiline run format; compact programs format; multiple program headers; false receipt and empty return; missing header/marker and truncated JSON reject. Then actual saved8393/8405 parsed with exact IDs/header,8393receiptTRUE/HP20 and8405HP11.499998/controls{}. Actual result files parsed_8393.jsonl/parsed_8405.jsonl, RECEIPT_TOOL_TESTS.json. Existing wrapper compiled after integration; no new game program merely to test printing. No global success inference or claim this fixes every output format.

Whole budget180sec from18:50:15 includes publication; actual timing recorded in receipt_tool_budget.json. Original wrapper saved in run_record_before_receipt.py.txt. Future memory: use exact canonical header, actual returned fields and current world observations; neither program exit nor tool summary is the score.

18:54 actual8418 exposed missing selected before/after crystal and arrow counts. Added those exact effect fields plus dragon/phase; omission list previously disclosed them, so no fabricated count. Actual full raw independently decoded8→7/targetGone/HP20. Tool remains selected REPORTED fields only.

19:03 observed actual8412 has scores/choice.aim/model replaced by literal [repeated reference]. The helper now lists unavailable_reference_paths across FULLparsedreturn, including omittedfields. Small nestedfixture preservesfalse/null and flags exactknown token; then actual8412 confirmedpaths. It doesnotreconstruct lostdata or treat tokens as coordinates. Do not infer sourcecode/host implementation fromthissymptom. No gameprobe or return-serializer change.

19:07 actualmixed8463/8468/8469 batch initially failed EXPECTED_ONE_RETURN_MARKER on emptySAY8469. Fullraw retained. Compatibilityfix: programs-format headerwithoutreturn now flagged NO_RETURN_RECORDED/return_recordedfalse, no completioninference, while RUNformatmissingmarker andtruncatedJSONstillreject. Smallfixture beforeactualbatchPASS; exactfourth8468 correctedownerchat8467. parsed_third_fourth.json.
