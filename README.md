# Flashcards

A Quizlet-style flashcard app built with Vue 3 + Vite. No backend, no login — decks and study progress live in the browser via `localStorage`, with JSON export/import for backup and transfer between devices.

Build decks two ways:
- **Manually**, entering term/meaning pairs by hand.
- **From a PDF**, importing a vocabulary list (one `term  meaning` pair per line) and reviewing/editing the parsed cards before saving.

Deployed to GitHub Pages at https://semanurcelebi.github.io/flashcards/.

## Setup

```sh
npm install
npm run dev
```

## Build

```sh
npm run build
```

## Test

```sh
npm run test:unit
```
