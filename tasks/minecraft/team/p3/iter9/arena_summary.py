"""Display-only bounded summary. Full raw logs remain the evidence."""
import json
LIMIT = 11000

def render(raw):
    lines=[]
    def emit(tag, value, budget):
        text=value if isinstance(value,str) else json.dumps(value,separators=(",", ":"))
        if len(text)>budget:
            text=text[:budget//2]+" ... [DISPLAY_TRUNCATED; read RAW] ... "+text[-budget//2:]
        lines.append(tag+" "+text)
    lines.append(raw.splitlines()[0] if raw else "EMPTY_ARENA_OUTPUT")
    output=raw.split("--- output ---\n",1)[-1].split("--- returned ---",1)[0]
    if output.strip()!="(nothing logged)":emit("OUTPUT",output,1600)
    try:
        result,_=json.JSONDecoder().raw_decode(raw.split("--- returned ---\n",1)[1].lstrip())
        if isinstance(result,dict):
            core_keys=["issue","phase","p","hp","food","full","closed","protectedEnd","boxed","dead","lost","hurt","elapsed","pearl","pearlDelta","delta","killed","swings","hits","aims","placed","sourceNow","exactRestored","before","after","heldSticks"]
            core={k:result[k] for k in core_keys if k in result}
            emit("RESULT",core,3200)
            emit("OTHER_FIELDS",{k:v for k,v in result.items() if k not in core_keys and k not in ("trace","inventory","inv","controls")},1400)
            for key,budget in [("controls",400),("inventory",900),("inv",900)]:
                if key in result:emit(key.upper(),result[key],budget)
            trace=result.get("trace")
            if isinstance(trace,list):emit("TRACE_SAMPLE_NOT_COMPLETE",{"total":len(trace),"first":trace[:2],"last":trace[-4:]},1200)
        else:emit("RETURN",result,1800)
    except (IndexError,ValueError):emit("UNPARSED_RETURN_NO_SUCCESS_INFERENCE",raw[-2200:],2200)
    if "--- chat since" in raw:emit("CHAT_AND_ACTUAL_END",raw.split("--- chat since",1)[1],1000)
    text="\n".join(lines)
    if len(text)>LIMIT:text=text[:LIMIT//2]+"\n[SUMMARY_LIMIT; read RAW]\n"+text[-LIMIT//2:]
    return text
