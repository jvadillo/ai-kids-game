# Hitzak eta Zenbakiak Ikasten

A tiny browser game for kids to learn words and numbers (Basque). Four mini-games:

- **Words**: drag letters to complete the word matching an emoji.
- **Syllables**: count syllables (shown with clap emojis 👏) and pick the correct number.
- **Syllable Sort**: drag multiple emoji-word cards into the 1–4 syllable zones.
- **Numbers**: count emojis and pick the correct number.

## What's changed (structure)

To make maintenance and future expansion easier, the single HTML file has been split into separate assets:

- `src/css/styles.css` — all styles (previously inline in `index.html`).
- `src/js/app.js` — all JavaScript/game logic (previously inline in `index.html`).
- `index.html` — markup and external links only.

This is a behavior-preserving refactor: no logic changes, just file organization.

As of the modular split, JavaScript is organized into small browser-friendly modules attached to a global `App` namespace (no bundler required):

- `src/js/utils.js` — helpers like `shuffleArray`, `getRandomInt`.
- `src/js/screens.js` — screen show/hide logic.
- `src/js/options.js` — options state and UI (modal, letter case/font), `applyOptions`, `formatLetter`.
- `src/js/wordGame.js` — word game logic and state (drag & drop letters).
- `src/js/syllableGame.js` — syllable counting game logic (clap buttons).
- `src/js/numberGame.js` — number game logic and state.
- `src/js/app.js` — orchestrates init and navigation wiring.

## Run locally

You can open `index.html` directly in a browser. For best results (and to avoid any future CORS issues), run a tiny local server and open http://localhost:8000:

```bash
# Option 1: Python 3
python -m http.server 8000

# Option 2: Node (using "serve")
npx serve -l 8000
```

Then visit `http://localhost:8000`.

## Project structure

```
ai-kids-game/
├─ index.html          # Main page (links external CSS/JS)
└─ src/
   ├─ css/
   │  └─ styles.css    # All styles
   └─ js/
      ├─ app.js        # Orchestrator
      ├─ utils.js      # Utilities
      ├─ screens.js    # Screen manager
      ├─ options.js    # Options state + UI
   ├─ wordGame.js         # Word game (drag & drop)
   ├─ syllableGame.js     # Syllable counting game
   ├─ syllableSortGame.js # Syllable sorting (drag items to zones)
   └─ numberGame.js       # Number game
```

## Game Features

### Word Game
- Select a theme (animals, school, clothes, colors, park, food)
- Drag letters to form words
- Progressive difficulty with distractor letters
- Level progression system

### Syllable Game
- Select a theme (same themes as word game)
- View an emoji and count syllables
- Choose from 1-4 clap buttons (👏)
- Level progression system
- Visual feedback for correct/incorrect answers

### Syllable Sort Game
- Select a theme (same themes as word game)
- Each round shows several emoji-word cards
- Drag each card into the correct syllable zone (1–4)
- Instant feedback and automatic next rounds

### Number Game
- Count emoji objects (1-10)
- Select the correct number
- Random emoji variety
- Instant feedback

## Next steps (optional, non-breaking)

- Add tests for core helpers (e.g., `shuffleArray`, `generateLetterPool`).
- Add a simple CI to run a linter and basic checks.
- i18n: externalize text into a messages file for easy translation.
- Add sound effects for feedback.

## License

MIT (or your preferred license).
