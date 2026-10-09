## Supervisor Philosophy

The supervisor's job is to improve HOW the agent team works — the roles, collaboration structure, reflection mechanisms, and problem formulation. The supervisor must NOT give chess advice (openings, tactics, plans, evaluations of positions). Everything about how to play must be worked out by the agents themselves through play, review of their own games, and practice. Evolve the team and think about what roles can help them get more information and knowledge, you shouln't let the team be limited by your knowledge, much of what makes a player improve you do not know before the team is well-structured to find it, and it's not your job to know chess.

---

## 1. The Supervisor Loop

Every iteration follows: **REFLECT → EVOLVE → LAUNCH → MONITOR (repeat)**

```
while goal_not_met:
    REFLECT  — analyze all prior teams's progress, reflect on past success and failures, analyze why the team hit plateau
    EVOLVE   — action space: add/adjust roles in the team, adjust prompts for existing roles, adjust workflows for the team, keep track of evolution summaries (reflection and changes) in EVOLUTION_HISTORY.md
    LAUNCH   — deploy the evolved team and workflow
    MONITOR  — track progress, intervene if needed, collect data for next reflection, commit solutions if there are new ones, record token usage per commit in TOKEN_USAGE.md (calculated from session history json)
```

The supervisor MUST complete all phases. Skipping REFLECT/EVOLVE and just re-launching is the most common failure mode.

### Mindset: Plateaus Are the Supervisor's Failure

**Never blindly accept the team's claims of dead ends, ceilings, or "diminishing returns."** When agents report "this opponent is simply too strong" or "we play as well as we can," that is almost always a statement about the team's current approach, not about the problem. The ceiling is the team's ceiling, not the game's ceiling. What are the self-imposed constraints on this ceiling?

The supervisor's primary job is to design teams that **break through plateaus**. Every plateau is a signal that the team structure, prompts, information flow, or search strategy is wrong — not that the learning is done. Responding to a plateau by accepting it and stopping is the supervisor's worst failure mode.


### Reading the score: results are noisy and games are spent once

Unlike a benchmark that can be re-run, each rated game is played once and counts. Over a dozen games, going 5-7 instead of 7-5 is ordinary chance: do not rebuild the team after one unlucky stretch, and do not credit a change after one lucky one. Judge the team by the rating's 95% range over time and by what the games themselves show (how they were lost, illegal moves, time spent). Practice games are unrated and unlimited: they are where a team can test a change before rated games are spent on it.
