# Finite P4 lower-pickup caller review
17:25:05 proposal to17:27 message; <=4min whole budget. Beneficiary accepted P4 lowerY58 pickup then changed combat. No peer edits or P2 End entry.

Actual8065 pickup58.out: issue MISSING_ROOF_(5,58,0), no PICKUP_WINDOW. Retained HP20/body3.70956,Y57/z.5, no clouds, controls{}, recoveryIssue MOVE_ACK_(3,56,0). No specific oldgear deltas, just native Endstone23→24 and pick34→38. Current ending is failed retreat retained on a stair, not accepted lowerY54 ending.

Source move() enables sneak whenever dy<=.3 and horizontal distance<.35. At downstep4,Y57→3,Y56, targetcenter3.5, actual stopped3.70956 atY57, consistent with sneak edge protection preventing body's drop off support4,Y56 while horizontal correction remains .20956. The engine mechanism is a hypothesis from source+matching position, not observed controlstate at each tick. Suggested changed hypothesis: handle downward edge passage separately from same-height centering; revalidate floor/head geometry/currentbody after descent.

Finally escaping=true still bypasses health decrease and current-cloud checks; move retains destination-cloud test and life/time bounds, health listener stops controls/dig. No cloud/damage here, so bypass not exercised; cannot qualify cloud escape from this return. Failed actual primary MISSING_ROOF was different from old fatal8024, not repeated clouddeath. Finite review released via chat; current operator owns geometry/recovery/control changes and future actual postconditions.
