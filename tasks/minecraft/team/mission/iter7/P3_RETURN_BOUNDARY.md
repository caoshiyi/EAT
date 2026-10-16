# Executed P3 return boundary — 2026-10-16T21:05:19.288863+00:00

Read-only source+output review of actual arena program2572, fullraw20261016T210305Z.json. No player program run by coordinator.

Actual landXZ(6,79) DID arrive grounded at(6.5,66,79.5386); the later faileddoor ending was(8.5984,64,81.7),6.833HP. Thus oldunsupported4,67,88 waypoint is NOT the executed first failure in this operation. Door-entry motion occurs between these observations; exactdisplacement/attacktrajectory unknown.

Executed door(mode) opens door6 and closes it ONLY if `ok` is true, then throws `doorfailed` when false. returnCamp calls door enter; outerfinally catches error only to print PLANT_RETURN_FAIL, then cleanup. No failure-branch shared-door closure/verified alternative ending is invoked there. Actual later2579 sees zombie2021 at(6.5918,67,81.9759); p3#1796 reports OPEN6. Source establishes an unclosed error path; not proof of every zombie entry trajectory or solecauseofdeath.

Specific door7NORTH repair remains valid, while mobile-failure cleanup/shared-state ending is a different unfinished contract. A normal route proof and staticcloseddoor/ray test do not exercise this exact failure branch. Owner chooses materiallychanged integrated test/outcome; no coordinator tactic, route or combat prescription. Do not simply replay fieldwork with a success label.
