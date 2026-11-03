# AWAMI ARENA — Five Fighters 2D Arcade Edition

A playable two-player offline browser-based political parody fighting game.

## Play

**Easiest:** Open `AWAMI_ARENA_5_FIGHTERS_PLAY.html` in Chrome or Edge. All art, code and sound effects are embedded; no installation or internet needed.

**Editable project:** Open `AWAMI_ARENA_5_FIGHTERS_PROJECT/index.html` (keep the `assets/` folder adjacent). If browser blocks local asset loading, use a local static file server (`python -m http.server`).

## Fighters

1. Imran Khan — All-Rounder
2. Nawaz Sharif — Power Fighter
3. Asif Ali Zardari — Counter Fighter
4. Shehbaz Sharif — Rush Fighter
5. Bilawal Bhutto Zardari — Fast Fighter

All five sprite atlases come from their prior 62-frame pose packs. This edition uses frame-based whole-body animation: idle, walk forward/backward, crouch, block, punch, low kick, high kick, jump, air kick, hit, knockdown.

## Controls

| Action | Player 1 | Player 2 |
| --- | --- | --- |
| Move | A / D | Left / Right arrows |
| Jump | W | Up arrow |
| Block | S (hold) | Down arrow (hold) |
| Crouch | C (hold) | M (hold) |
| Punch | F | K |
| Kick | G | L |
| Low kick | C + G | M + L |
| Air attack | Jump then F or G | Jump then K or L |
| Pause | Esc | Esc |

Character selection: P1 A/D, P2 left/right. Click `EDIT: PLAYER 1/2` to assign the roster-card mouse click to a player. Same-character fights are supported. Day/night stages available.

## Technical

- 1280×720 Canvas2D game running fixed-step 60Hz update loop.
- 5 2048×2048 transparent atlas textures; compact lossless PNGs.
- No required external scripts, frameworks or online APIs.
- Health / guard meters, hit detection, airborne strikes, KO / rounds, pause, synthesized sound effects.

## Current art limitations

The existing pose packs are source art, not fully hand-cleaned production animation. The Shehbaz and Zardari packs have known inconsistencies; mitigations are applied but visual artifacts can still occur. Some Nawaz and Bilawal frames also vary in size/sharpness. Future upgrades should reillustrate these frames, align pivot points, and hand-correct edges. This build focuses on integrating the five requested characters with playable combat.
