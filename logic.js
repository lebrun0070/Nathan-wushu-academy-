// Solo game — platform-required rules module stub (see build pipeline §1).
export const meta = { game: "sifu-nathans-wushu-academy", minPlayers: 1, maxPlayers: 1 };
export function setup() { return {}; }
export function validateAction() { return { ok: true }; }
export function applyAction(state) { return state; }
export function isGameOver() { return { over: false }; }
export function viewFor(state) { return state; }
