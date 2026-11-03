# AWAMI ARENA — The Desi Showdown

**Playable browser-based 3D political parody fighting game — Visual Overhaul Build**

## Start the game

Open `index.html` in a current desktop version of Chrome or Edge. Everything the game needs is bundled into the HTML file — no CDN, internet connection, account, or installation is required. The game requires a browser with WebGL 2 enabled and a functioning GPU or software rendering driver. For a local web server instead, run `python -m http.server 8000` in this folder and open `http://localhost:8000`.

Click **ENTER THE ARENA**, select fighters for both players, and choose **FIGHT NOW**.

## Keyboard controls

| Action | Player 1 | Player 2 |
|---|---|---|
| Move left / right | A / D | Left / right arrow |
| Jump | W | Up arrow |
| Guard / block | S (hold) | Down arrow (hold) |
| Punch | F | K |
| Kick | G | L |
| Pause / resume | Escape | Escape |
| Toggle audio | M | M |

First fighter to win **two rounds** wins the match. Punches and kicks are counterable by holding guard; guard absorbs most damage but drains the guard meter and may break. Both fighters can move, jump, attack, guard and take knockback. Characters can be the same in mirror matches.

## Features in this build

- Two selectable, distinguishable stylized political caricature 3D fighter assets: Imran Khan and Nawaz Sharif.
- Polished arcade game UI: title screen, character selection, fighter portraits, fight HUD, health bars, guard bars, round counter, timer, announcement overlays, match result and rematch.
- 3D political parody arena with neon color grading, crowd stands, cinematic camera, lights, and VFX.
- Local two-player same-keyboard fighting with procedural idle, walking, punching, kicking, jumping, blocking and hit reactions.
- Attack hitboxes, range checks, hitstop, knockback, block damage, guard break, audiovisual hit effects, K.O. and best-of-three scoring.
- Procedurally synthesized original gameplay sounds and a subtle arena rhythm (no music licensing or external media dependencies).
- A custom, library-free WebGL 2 renderer and compressed geometry embedded in the game to minimize network and draw-call overhead.
- Pause menu graphics preset: **Balanced** (adaptive resolution), **Performance**, or **High**.

## Editing / extending

`index.html` is fully self-contained. `models/` contains the original source GLB models from which the optimized embedded geometry was packed. `source/` contains the build scripts and the HTML template. The project is plain JavaScript/CSS/HTML with an explicit WebGL 2 renderer; the Python scripts depend on `trimesh` and `numpy` only for asset rebuilding.

## What is *not* finished yet

This is a substantial **playable polished prototype**, **not** a commercial-quality Tekken or Street Fighter release. The head/body models are upgraded low-poly caricature blockouts, **not final sculpted realistic likenesses**. Animations use segmented procedural movement rather than professionally motion-captured skeletons. Additional Pakistani political characters are visible as future roster slots, not unlocked fighters. There is no online multiplayer, licensed soundtrack, complex combo system, controller support, or mobile touch support.

The game is purely fictional political satire. It does not endorse or represent any politician or party.

## Test summary

Verified in Chromium with WebGL 2 software rendering: UI flow, 3D model display, punches and health loss, kicks, pause/resume, K.O., match result, rematch, and character selection. Performance is hardware-dependent; use **Performance** in the pause menu if needed. Tested primarily at desktop 1440 × 900.
