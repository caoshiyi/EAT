// Inject before an OWNED arena program. Caller supplies current life/health checks,
// tick(), exact agreed peer+token, remaining whole budget, and same-call retreat.
// Attach BEFORE announcing actual stage; no replay of historical chat.
async function awaitPeerReady(bot,{peer,token,budgetMs,check,tick,publish}) {
  if(!['p1','p2','p3'].includes(peer)||!token||!(budgetMs>0&&budgetMs<=60000))throw Error('READY_PROTOCOL_INPUT');
  let received=null;const start=Date.now();
  const handler=(username,message)=>{if(username===peer&&message.startsWith(token))received={at:Date.now(),username,message};};
  bot.on('chat',handler);
  try {
    check();publish();
    while(!received){check();if(Date.now()-start>=budgetMs)throw Error('PEER_READY_BUDGET');await tick(1);}
    check();return received;
  } finally {bot.removeListener('chat',handler);}
}
