# Protected camp tree conversion — iteration10

Physical result: #4747 planted one spruce sapling at (5,69,83), on existing DIRT wall cap (5,68,83), after removing only a benign SNOW layer at root. Player stayed INSIDE camp, both doors closed. No wall/floor/roof blocks were removed. Root and trunk column70..76 were qualified from actual client blocks before planting. First three bone meal left stage1; #4750 the fourth use grew a tree (two bone meal retained from two bones). This is this geometry/result, not a guaranteed four-use growth rule.

Player stood (6.3,67.5625,83.7), eyeY69.1825. #4753 actual rays through the west roof slit hit LOG70 bottom face (not an intervening roof block). Normal reach/raycast checks preceded each cut. Root69 and LOG70/71 were hand-cut and collected. LOG72/73 were axe-cut and collected. LOG74 remains beyond the chosen4.4m reach limit; leaves remain75+. Do not assume this column is reusable for growth while the old tree remains.

Five logs produced one fresh wooden pick, sword, axe, three sticks, and two logs. Recipes were single calls with ordinary inventory deltas and closed windows. Bank #4758 fresh pick0→1/sword0→1, #4764 log0→2, independently fresh-read #4775. Beneficiary P1's actual empty post-Drowned-death body; recipient withdrawal/use not yet observed at04:21. P4 retained axe(wear2),sticks3,meal2,20HP20food, observer life token1792208042861:0.

Receipt counterexample: #4760 LOG72 became AIR and axe wear increased, but own log count was still0 after15ticks. No further cut was made. Fresh #4762 showed ordinary LOG1 and no nearby item entities. Thus early zero was not drop loss. #4763 bounded wait up to48ticks ended on LOG+1 and passed LOG73 receipt. The extra delay is observed; precise packet/physical pickup cause was not isolated.

Field alternatives13,67,95 failed NAV_BOUND/PATH_timeout before planting or meal use (#4731/#4738); no tree was planted there. Retired after two access negatives. The inside method changed physical access rather than raising path timeouts. Prior north cache trips never opened the cache; the two bones were incidental receipts, not claimed cache contents or attributed kills.

Reuse sources: camp_tree.js initial planting; camp_tree_finish.js final growth; trunk_rays.js; trunk_harvest.js; trunk_last_reach.js; tree_tools.js; bank_tree_tools.js; bank_tree_logs.js. Inspect current blocks/body/storage before reuse; these are exact historical coordinates, not a universal shelter/tree helper.

## Last log and actual ending04:49
P1 actual4787 withdrew pick/sword/log2;4805 converted logs to table/plank2/stick4. Subsequent P1 fourth death means that delivered kit is no longer currently retained; do not rewrite its successful receipt/use as current inventory.

P4 #4899 obtained SIXTH/last log at(5,74,83) from native grounded BOTTOMslab step(6,68,83), feet68.5/eye70.12. Temporarily removed main TOProof slabs(6/7,69,83), placed one as step, normal jump from bed67.5625. Only leaf(6,71,83) blocked actual ray; hand-cleared it, then normal BOTTOMface log dig within4.5m and ordinary log+1. Cleanup removes step, collects its slab from leftbed (earlier4890 far-right wait failed; separate4892 fixed), restores BOTH original TOProof slabs. Same NEWlife observertoken1792208042861:2/20HP20food/all7false. This is protected-volume-only normal reach, not field rescue.

#4905 log1→plank4 actualreceipt; two planks close Southdonor(7,69,84) and Eastcap(8,69,83); spare2 bank fresh0→2. FinalE(8,Y67/68/69,Z83)=CLOSED EASTfacingSPRUCE_GATE / DIRT / SPRUCE_PLANKS. S(7,Y67/68/69,Z84)=DIRT/DIRT/SPRUCE_PLANKS. Mainroof6/7,Y69,Z83 originalTOPslabs; temporarySTEP6,68,83AIR. Gate is not a full cube/qualified travel entrance, but measured1.5m gate collision overlaps full head/cap blocks. All leasesreleased.
