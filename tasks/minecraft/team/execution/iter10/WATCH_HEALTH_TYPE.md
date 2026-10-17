# Watcher failure and narrow correction, 04:52 UTC

Read-only watcher90010 crashed about04:50:29: ending_alert compared record4912 hp=[5.333,5.333] to0, TypeError list<=int. Raw source record saved before failure. No player/server process changed. Repaired owned presenter to accept only positive numeric non-boolean scalar health; unrecognized health shape yields no alert, remains in raw/summary and requires manual interpretation. No conversion of pair into current scalar metadata.

Small host tests before restart: list/None/dict/bool/string rejected without crash; numeric20 alerts,0 does not. Real4550/4517/4499/4487/4031 all expected resultsPASS. Restarted watcher1655 at04:51:23; failed record4912 re-read successfully. New source has no general schema inference. This is a reporter fix, not a world repair.

4912 actual hp pair is explicitly before/after in owner source, unchanged5.333; fullfalse and both work/ending placement refused at(-131,63,-430). Manual review preserves failure despite no scalar-health alert. Arena then records04:50:46 P2 fireballed by Blaze(-131.5,62,-429.7), Nether.4913 camp20HP/LOW_HEIGHT is new life, not repair. Live Blaze presence is now physically established; rod pair[0,0] does not establish a retained rod.
