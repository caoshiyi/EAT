# Exact-version public client class check — 2026-10-17 13:24 UTC

Bounded question: does ordinary attack of loaded dragon root route to damage in actual1.20.4, or was prior adjacent1.20.3-pre1 review misleading? Public official Mojang version manifest identified1.20.4 (release2023-12-07); client archive24,445,539B and mappings8,897,012B downloaded into memory, SHA1 matched manifest, selected5 public classes/mapping sections only saved. This is public client distribution, no arena server, console, filesystem, `.work/` or network connection touched. Full archive not retained. Provenance exactURLs/SHA1 in version_provenance.json; `javap -c -p cao.class` saved dragon_bytecode.txt.

Confirmed exact1.20.4 bytecode + official mappings:

- `EnderDragon.hurt(DamageSource,float)` (`cao.a(bkt,float)`, bytecode line1946) on server side delegates to `hurt(body,source,damage)`. Root ID attack is a meaningful selected physical test; root `isPickable` still false. No unseen/made-up multipart entity IDs are needed or used. Real client-to-server reach/LOS and resulting HP effect remain untested.
- Part `hurt` (line1848): current phase modifies damage, nonhead scales `damage/4 + min(damage,1)`, then requires player source OR tagged source; invokes real hurt and tracks sitting damage. A stone sword nominal5 becomes2.25 before any other actual state. Do not predict exact observed damage without cooldown/phase/health receipt.
- Sitting accumulated damage exceeding0.25*maxHealth changes phase/takeoff. Existing older review's50hp threshold for max200 is matched in this class; actual live metadata needed.
- `checkCrystals` (`ge`, line1490): retained nearest crystal heals1health every10ticks while below max. It searches within box inflated32 for crystal periodically. Removing crystals remains useful even though not a separate task requirement. No inference of current crystal state.

Execution decision: retain stationary one-swing actual-root caller. Do not add multipart ID spoofing or a mandatory all-crystals prerequisite. If two equivalent physical no-damage cases occur, change approach/geometry rather than repeating fixtures. P4 owns crystals; P1 owns actual root melee proof/combat. This offline source evidence earns no milestone or damage credit.
