# Sifu Nathan's Wushu Academy

A retro pixel-art management game: run a Wushu school alongside Sifu Nathan —
recruit students, train them across authentic disciplines, pass sash exams in a
rhythm mini-game, sharpen Sanda in timing-based sparring, and take on the rival
Iron Serpent Academy in tournaments up to the week-24 National Final.

**Play it live:** https://breezy-knot-341.higgsfield.gg/

## Run locally

```
python3 -m http.server 8000
# open http://localhost:8000
```

(ES modules require serving over http; opening index.html via file:// won't work.)

## Controls

- **Everything**: mouse / touch
- **Form practice (rhythm)**: arrow keys / WASD / tap the four lanes / gamepad d-pad
- **Sparring**: J = Block, K = Jump, L = Counter (or arrows / on-screen buttons / gamepad)
- **M**: toggle sound · **Space/Enter**: advance dialogue
- Append `?dev=1` to the URL for the FPS/state overlay and test hooks

## Project layout

- `index.html`, `game.js`, `strings.js` — the game (canvas, fixed 60 Hz step, seeded RNG; all player-visible text lives in `strings.js`)
- `logic.js` — platform rules-module stub required by the deploy engine
- `design/` — asset manifest, condensed plan, and tuning thresholds
- `wushu-academy.zip` — the packaged build that was deployed (deploy artifact)

Art: backgrounds, the rival portrait, cover and crest were generated in one
locked pixel-art style; Nathan's dialogue portrait uses the provided photo,
pixelated in-engine. Images load from their hosted URLs with procedural
fallbacks (this build environment could not bundle them locally).
