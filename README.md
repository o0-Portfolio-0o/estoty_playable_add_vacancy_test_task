Link to live demo:
https://luxury-cendol-2742c1.netlify.app/
# Playable Ad – Feedback Checklist

## Controls & Movement
- [ ] Fix character movement bug: running currently glitches and stops randomly. Needs to be completely smooth.

## Camera & Guidance
- [ ] Clarify the overall goal (upgrading to escape) early on.
- [ ] Add an intro camera pan to the initial breakable boxes.
- [ ] Add camera pans to highlight the next area whenever the objective changes.
- [ ] Add a guiding arrow that actively points to the current objective to explain the task.
- [ ] **Bonus:** Add a striped hazard zone under breakables to highlight areas that need clearing.

## Level Design & Environment
- [ ] Shrink the overall map size to reduce empty running space and increase action pacing.
- [ ] Group breakables into piles (e.g., blocking the fence exit, then blocking the next area after upgrading) instead of scattering them aimlessly.
- [ ] Replace the lvl 2 boxes blocking the fence exit with a locked gate.
- [ ] Add a visual drop zone next to the upgrade station for depositing scrap.
- [ ] Grey out the area outside the starting fence to visually indicate it is locked.
- [ ] Add a minimal ground texture so the character feels anchored to the environment.

## User Interface (UI)
- [ ] Add simple objective text updates in the center of the screen (e.g., "Gather scrap" -> "Upgrade weapon").
- [ ] Show a red "UPGRADE NEEDED" pop-up when hitting advanced boxes with a level 1 weapon.
- [ ] Replace the word "WOOD" in the UI with a wood log sprite and move the resource counter to the top right.
- [ ] Remove the unnecessary gate icon UI from the top right.

## Interaction, VFX & Audio
- [ ] Speed up the box-breaking animations and object decay times.
- [ ] Sync box decay and destruction perfectly with the actual weapon hit.
- [ ] Add a white blink or outline to boxes so players know they can interact with them.
- [ ] Sync the hit sound effects to perfectly match the breaking animation to remove the current audio delay.
- [ ] Add visual effects (VFX) triggered by the weapon upgrade.
- [ ] Add background music.
- [ ] **Bonus:** Make broken boxes drop scrap sprites for the player to physically pick up.