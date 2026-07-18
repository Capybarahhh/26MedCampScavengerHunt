// Shared scoring constants — single source of truth so the score-popup
// "net gain" display in PuzzleBeat/ColorPickBeat can't drift from the
// actual deduction logic in App.jsx (they used to duplicate the wrong-answer
// penalty as a literal, which silently went stale the last time it changed).
export const WRONG_PENALTY = 20;
export const HINT_COST = 200;
export const FORCE_PASS_WRONG_COUNT = 10;
