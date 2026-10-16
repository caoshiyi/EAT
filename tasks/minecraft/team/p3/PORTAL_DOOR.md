# Current OW portal door — VERIFIED #1104
At (6,68,90): SPRUCE_DOOR lower, facing SOUTH, hinge LEFT; upper (6,69,90). Default CLOSED. Replaced fence gate, which is now LOWER banked. Roof70 and both flanks/rear retained. Front feet68.

Observed closed panel: North face z90..90.1875, both y68..70. Player from North stoppedcenterz89.7. Open panel is EAST x6.8125..7, so safe open passage center **x6.40625**. P3 physically passed (6.4047,68,90.5561), exitedNorth, reclosed, returnedcampHP20. Head-height ray from (6.5,69.62,91.5) NORTH hit upper door69: former fencegate headgap is now blocked.

Transit:
1. Stop navigation/controls, deactivate item, unsneak before interaction.
2. Inspect lower door, activate ONLY if closed, wait4ticks, verify OPEN.
3. Align x6.40625 outside door (derive current shape if hinge changes). No jump. North approach6,68,89; doorway6,68,90; portal6,68,91.
4. Close only after body clear of closed panel, wait4ticks, verify. Explicit interaction needed: default pathfinder canOpenDoors=false and OPENwooden doors may still be unpathable; use manual short pulses in doorway.
5. Returning from Nether: stop safely in portal frame, open same door from South, alignX while on full obsidian floor, walkNorth throughdoor thenrow89, close afterclear. Respect portalcooldown with a freshly checked off-portal tile inNether; OLD South tile1,65,3 is now cubbywall.

Limits: closed/open physical player test and static headray only, not a hostile damage trial. No ghast/explosion guarantee. Don't idle against closedpanel with an already-overlapping mob. Don't reuse old fencegate-specific scripts.

Potential non-portal waiting nook: exact bodycenter z90.55 appears to fit between closed Northpane and portalcell91 (playerhalfwidth.3). This has NOT been idle/teleport-tested; do not call it a verified endpoint. Current protected endpoint remainscamp orP1sealedNethercubby.

Nether cubby door note:
If replacing P1frontplugs(1,65/66,3), P1shouldplace fromINSIDE facingNORTH so closedpanelz3.8125..4 aligns sidewallsat4. OutsideNorth placement facesSOUTH and maypermit lateralbypass unless extraflanksbuilt. SupplyitemforP1placement; checkactualpanelorientation/closure. Native pathfinding mayreject openDoorcells, so P1mustadaptmanualthreshold traversal before replacingworkingpluglogic.
