# AWAMI ARENA — 2D Arcade Edition

This is a **fully 2D**, offline playable two-player browser fighting game. No WebGL, 3D models, or third-party JS dependencies are used. Real 2D illustrated fighters were cut into transparent sprite assets from the new arcade character artwork. Side-view moves use procedural sprite animation overlays, not hand-drawn animation sheets. This is an original Pakistani-themed political-parody game prototype, not a reproduction of copyrighted game assets.

## Run
- **Easiest:** open `AWAMI_ARENA_2D_PLAY.html` from the ZIP in Chrome or Edge. It includes all images and scripts.
- **Editable project:** open `index.html`. Keep the `assets` folder, `styles.css` and `game.js` together.
- For deploying: upload the editable project directory to any static web host (GitHub Pages, Netlify, Vercel, Cloudflare Pages etc.). No backend needed.

## Controls

| Action | Player 1 | Player 2 |
| --- | --- | --- |
| Left / right | A / D | Left / right arrow |
| Jump | W | Up arrow |
| Hold block | S | Down arrow |
| Punch | F | K |
| Kick | G | L |
| Pause | Esc | Esc |

- **Jump attacks:** press Punch or Kick in midair. Attack hitboxes account for the player's vertical height and overlap with enemy hurtbox.
- **Block:** hold the block key before the attack hits. Block reduces damage to zero but drains guard meter. Holding guard while attacking does not interrupt an attack.
- **Guard break:** if the guard meter hits zero, the defender is briefly stunned.
- **Rounds:** Best-of-three. Health replenishes each round; meter carries forward.
- Characters: Imran Khan (all-rounder) and Nawaz Sharif (heavyweight) as fictional stylized 2D parody representations. Others are not included yet.

## Tech and limitations
- Canvas 2D renderer, fixed 60 Hz logic, pixelated sprites, two-player single keyboard.
- Two Islamabad stage palettes (day/night), HUD, power/guard, hit sparks, KO, audio FX, selection, pause and rematch.
- Art is pixel-styled cutout sprites, not a full frame-by-frame animation sheet. Attacks use lightweight procedural overlays, which will need a dedicated sprite-sheet animation pass for authentic hand-animated KOF-level movement.
- Keyboard ghosting depends on keyboard hardware.
- Performance is best on desktop; small touch screens don't have touch fighting controls in this build.
