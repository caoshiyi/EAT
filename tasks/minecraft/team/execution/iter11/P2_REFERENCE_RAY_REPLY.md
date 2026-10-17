# P2 actual5191 reference ray — 05:37 UTC

Beneficiary: P2 current S6 base placement/camprepair forinjuredP4. Imminentexperiment: nextownerchosenS6 usefulplacement, preserveinlineinnerbarrierrecap. Exactdefect: actual5191 put() calls raycast matcher !!it.intersect(c.shapes,c.position) without forward/range clipping. Integeroffset isalreadycorrect; intersect itself canreturn BEHIND eye. This causes real false NO_VISIBLE_REFERENCE whileunder TOP roof.

Host-only p2_reference_ray_test.cjs usesEXACTinstalledWorldSync.raycast+RaycastIterator, actualrearpose(6.5000001,67.5625,83.6163336), callerstandingeye+1.62=69.1825, knownSPRUCETOP roof69+shape[0,.5,0,1,1,1], proposedSAND65 topface(6.5,66,84.5). Existing matcherselectsSPRUCEROOF atalong=-.8484285 BEHINDEYE. Forward/range matcherrejectsthat andselectsSAND. Syntheticfixture omitsotherterrain/entities; actualfullLOS remainsownerphysicalcase. This doesnotproveworldplacement norwaiveactualoccluders.

**Smallestactualcallerfix** replace its put() raymatcher with:
    (c,it)=>{
      const h=it.intersect(c.shapes,c.position);
      if(!h)return false;
      const a=h.pos.minus(eye).dot(v.unit());
      return a>=0 && a<=v.norm()+.02;
    }
Keep fractionalactualeye, integerc.position shapeoffset, currenttargetreference equality, 4.4mreach/occupancy/health/bodyreturn+innerrecap. Sameunclippedmatcherexistsinits visible(e) contacthelper, but usefulrepair put() ispriority. No installedpackageedit/physicsbypass/ignoringroof.

Requiredphysicalevidence: actualchosenreference/targethitpoint, usefuloneplacementACK/fullblockreceipt, thencompleteScolumnandcurrentending (orfailedcase+inlineinnerrecap). No needextraexposure solelytotest. Previous5191 FAIL/no placements/front20HP+inner6COBBLErecap remainsfailure; correctiononlysource+synthetic untilactualcallerexecutes.

Status proposal05:37/hostfixturePASS, no actualadoption yet. Existingknownraycontract warnedintersectdoesnotclipnegative/range; this appliesexactlyhere, notuniversallyrequiringallcallersrefactor. Do notdelayphysicalrepairawaitingaudit.

05:38 fixture strengthened with exactwhitebedcollision shapes fromactual5167 at6,67,83. PASSunchanged: rawroofnegative, correctedSAND; thebedisretainedasrealoccluder, notskipped. Othercurrentworldchangesremainownerobservations.

Actual5202 starts05:37:04: both put/visible nowclipalong>=0/range; actualS6COBBLE placementsY66,67,68 allACK, no swings/nohurt/20HP/lostfalse/issueNULL. Inner6AIR now, S7innerCOBBLE retained. This qualifies S6columnONLY, notallS/upperrepair. Owner independentlymeasured5195 negativeTOPslabhit and5199 forwardtest, explicitly4017/18; writtenfinding/helperfixturealsoavailablebefore5202. Executedcorrection/adoptionproved, uniqueengineeringcausalcreditNOTestablished.

Timestampdiscipline: noteheadings are rounded minute labels; arenaheaders/clock/filemtime are exactprovenance. Ourreplylastmodified05:36:56.55 before5202; do not use “05:38” fixtureappendlabel as orderingproof. Exactrecordtimestamps govern.
