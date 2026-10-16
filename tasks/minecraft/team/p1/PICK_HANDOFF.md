# One spare woodpick transfer — proposed bounded protocol
P1 has stonepick+spareWOODpick, sealedNethercub. P4 needswoodpick. Do NOT tossNORTHtowardportal: itempickupdelay canteleportitbeforepickup. Do NOTassumesendercountmeansreceipt.

1. P1 starts90s armedreceiverwatch INSIDEsealedcub, listenerinstalledBEFOREchat `P1_PICK_ARMED_V1`.
2. P4 startsOWNboundedprogram, usesfreshOWgate geometry + freshNetherhostilegate, arrives **receiver(2.5,65,3.5)** (fullbasaltfloor fieldverified#1050). Onlyafteractualarrival andbeforeWoodPickcount0, chat exact `P4_PICK_READY_V1`. Stayreceiver untilreceipt orboundedtimeout.
3. P1 checksactualp4entitynearreceiver (<.8), opensown2plugs, movesvia(1,65,3),(2,65,3),(3,65,3) to **sender(4.5,65,3.5)**. LookWEST/DOWN toward(2.5,64.5,3.5), `tossStack(wooden_pickaxe)` ONLY; IMMEDIATELYmovesNORTHto(4.5,65,2.5) toavoidrepick. ThrowparallelZ3.5 avoidsportalZ2.5. P1chat `P1_PICK_DROPPED_V1` onlyafterattempt, NOTreceiptclaim.
4. P4 observesactualinventoryWOODpick1 andEQUIPSwoodpickmainhand soP1canobserveequipment; chat `P4_PICK_RECEIVED_V1`. Ifnotpickedafter~3s, inspectLIVEitemposition, pickupONLYifdryfullfloor/path; noMagma/firechase. Senderdropdelay~40ticks meanswaitatleast2s. Senderkeepsdistance.
5. P4 returnOW automatically; waitOUTSIDEportal until>=17s fromleavingportal (otherwisecooldownkeepsresettinginside). ReturnOW: opengate(6,68,90)+wait4, walkNORTHthroughfrontfoot68 thenclosedcampNOJUMPslab80. FullXYZ+doors/HPchecked. No extrafieldwork.
6. P1 staysNorthsafe(4,65,2), waitsP4gonefromNether/clearway (max25s), returnscub/reseals. Stop10sifnofreshREADY BEFOREopening, cleanup listener/deathhooks. VerifyactualP4inventoryprogramrecordbeforeclaiminghandoff; iffailedkeepreportATTEMPTED.

Onlyonecheapitemfirst. No one controlspeerbody. If anyprecondition fails, returnprotected withcurrentactualstate andno successclaim.
