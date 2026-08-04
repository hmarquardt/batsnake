# Next steps

`0.5.0-rc1` remains blocked. Milestones 6 and 7 intentionally continued environment and presentation development, and their automated regressions are recorded separately from the still-open human release gates. Do not treat cave, sensory, or boa completion as RC approval.

Complete only the concrete release gates in `RELEASE_CHECKLIST.md`:

1. Human eyes-closed audio identity pass for all listed events, with collision versus echolocation treated as a hard distinction.
2. Human first-run Bat/Snake and reduced-HUD playability pass.
3. Twenty player-controlled Night Flight strikes with target distance, crossing angle, charge, result, miss class, and attempt number.
4. Five seeds per mode per difficulty, recording the requested per-session metrics and reviewing individual pathological seeds.
5. Direct stable-browser and physical-gamepad coverage on the platforms that will be claimed.
6. Interactive 1920×1080 performance trace covering first hero animation, peak echo, and peak thermal. Milestone 7 removed the automated first-use sensory submit spike, but headless cadence still cannot certify sustained presentation or GPU headroom.
7. Identify the missing “13 RC hardening items” source or remove that gate if it was never a real artifact.

Also include the authored cave and refined boa in that human review: confirm landmark recognition in normal, echo, and thermal play; the two localized Shelf/Guano close brushes; physical readability of all three boa supports; strike posture, close-pass scale, capture contact, and mouth/menu composition. This is validation of completed presentation work, not a request for another environment or predator system.

After those checks, update only the evidence documents and choose READY or BLOCKED again. If READY, stop autonomous development and use external playtesting as the next input; then add the requested lightweight `PLAYTEST_FEEDBACK.md` template. Do not add telemetry, analytics, accounts, a build system, or runtime networking.
