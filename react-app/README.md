# AI Kids Game (React)

A React + Dexie rewrite of the original browser game. It lives in this separate `react-app/` folder and does not affect the legacy app.

## Features (initial)
- Options modal (letter case, font style) persisted locally via IndexedDB (Dexie)
- Home page with game selection
- Theme selection page (reads from DB seed)
- Word Game (basic parity)
- Syllable Game (basic parity)

More games can be ported next using the same patterns.

## Tech
- React 18 + React Router
- Dexie (IndexedDB) + dexie-react-hooks
- Vite + TypeScript

## Run
```bash
# from the repo root
cd react-app
npm install
npm run dev
```
Then open the shown local URL.

## Structure
```
react-app/
  src/
    db/           # dexie + seed
    games/
      words/      # Word game
      syllables/  # Syllable game
    pages/        # Home, ThemeSelect
    state/        # Options context
    styles/       # variables + global
```

## Notes
- The DB seeds the themes/words on first run.
- Lint errors you see in the editor disappear after `npm install`.
- Styling is intentionally similar to the legacy app but modernized.
