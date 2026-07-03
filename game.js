// Sifu Nathan's Wushu Academy — canvas management game with rhythm & timing mini-games.
// Virtual resolution 960x540, fixed 60Hz simulation, seeded logic RNG, strings in strings.js.
import { STR, fmt } from "./strings.js";

// ============================== CONFIG (see design/thresholds.md) ==============================
const CFG = {
  W: 960, H: 540, DPR_CAP: 1.5, STEP: 1000 / 60,
  startCash: 150,
  baseGain: 6,
  tuition: 15,
  fatigueTrain: 18, fatigueRest: -35, fatigueMini: 8, fatigueMult: 220,
  rankTotal: [0, 60, 120, 200, 280, 340],
  rankAcc: [0, 0.55, 0.60, 0.65, 0.70, 0.75],
  perfectMs: 90, goodMs: 180, approachMs: 1400,
  examBpm: r => 84 + 8 * r, examNotes: r => 12 + 4 * r,
  sparCount: 8,
  sparTelegraph: d => Math.max(550, 1000 - 60 * d),
  sparActive: 0.45,
  sandaPerWin: 1.2,
  tourneyEvery: 4, finalWeek: 24, maxEntrants: 3,
  entryRank: 2, entrySanda: 10,
  rivalBase: t => 100 + 55 * t,
  prizeGold: t => 150 + 120 * t, prizePr: t => 25 + 15 * t, partPr: t => 4 + 2 * t,
  repThresholds: [0, 50, 150, 350, 700],
  hallCost: [300, 700, 1500], equipCost: [200, 450, 900], coachCost: [400, 1000],
  refreshCost: 30,
  slots: hall => 3 + 2 * hall,
};

const DISC = {
  changquan: { stats: ["pow", "bal"], mult: 1.0, lvl: 1 },
  nanquan:   { stats: ["pow", "dis"], mult: 1.0, lvl: 1 },
  taijiquan: { stats: ["flx", "bal"], mult: 1.0, lvl: 1 },
  jian:      { stats: ["flx", "dis"], mult: 1.3, lvl: 2 },
  dao:       { stats: ["pow", "flx"], mult: 1.3, lvl: 2 },
  gun:       { stats: ["bal", "dis"], mult: 1.4, lvl: 3 },
  qiang:     { stats: ["pow", "bal"], mult: 1.4, lvl: 3 },
};
const DISC_KEYS = Object.keys(DISC);
const TRAITS = {
  fiery:    { pow: 1.4, fatigue: 6 },
  graceful: { flx: 1.4 },
  stoic:    { dis: 1.4 },
  steady:   { bal: 1.4 },
  prodigy:  { all: 1.2 },
  carefree: { all: 0.85, fatigue: -6 },
};
const TRAIT_KEYS = Object.keys(TRAITS);
const STATS = ["pow", "flx", "dis", "bal"];

// Palette (style formula v1)
const C = {
  bg: "#14100e", wood: "#6b4a2f", woodL: "#96683f", crimson: "#a32222", crimsonD: "#6e1414",
  gold: "#e8b23a", goldL: "#ffd97a", jade: "#3fbf7f", jadeG: "#6fffb0", charcoal: "#23201c",
  panel: "#2b2118", panelL: "#3a2c1e", cream: "#f2e6c8", grey: "#9a9184", red: "#e05545",
  shadow: "rgba(0,0,0,0.45)",
};
const SASH = ["#f2f2ee", "#e8c93a", "#3fbf7f", "#3f7fd9", "#8a5a2f", "#2a2a2e"];
const STATC = { pow: "#e05545", flx: "#c77fe0", dis: "#e8b23a", bal: "#3fbf7f" };

// ============================== RNG ==============================
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
let visT = 0; // visual clock for animation, never feeds logic

// ============================== ASSETS ==============================
// Each asset tries its bundled relative path first, then the hosted URL
// (the build environment could not bundle the files locally), then code fallback.
const CDN = "https://d8j0ntlcm91z4.cloudfront.net/user_39jkECl6IuSdAMcrP0agAhd2dzJ/";
const ASSETS = {
  dojo:   { srcs: ["./assets/bg_dojo.png", CDN + "hf_20260703_140318_75238a6c-1fbe-4c11-a0c0-584944cbfc70.png"] },
  arena:  { srcs: ["./assets/bg_arena.png", CDN + "hf_20260703_140322_c9c8869d-18d1-4775-89df-2125bd2223cd.png"] },
  title:  { srcs: ["./assets/bg_title.png", CDN + "hf_20260703_140325_126a45a2-4e3a-424d-aad6-b96d02da63c8.png"] },
  rival:  { srcs: ["./assets/portrait_rival.png", CDN + "hf_20260703_140332_562a52dc-5ccc-424f-abeb-fd60992ab984.png"] },
  nathan: { srcs: ["./assets/nathan.jpg", "https://d2ol7oe51mr4n9.cloudfront.net/user_39jkECl6IuSdAMcrP0agAhd2dzJ/a906b6ff-a9d8-456a-b1f5-17d5fb8ab5c5.jpg"] },
};
for (const a of Object.values(ASSETS)) {
  a.img = new Image();
  a.ok = false;
  let i = 0;
  a.img.onload = () => { a.ok = true; a.pix = null; };
  a.img.onerror = () => { i++; if (i < a.srcs.length) a.img.src = a.srcs[i]; };
  a.img.src = a.srcs[0];
}
// pixelate a portrait into an offscreen canvas so photos sit in the pixel style
function pixelPortrait(asset, size) {
  if (!asset.ok) return null;
  if (asset.pix) return asset.pix;
  const small = document.createElement("canvas");
  const s = 56;
  small.width = s; small.height = s;
  const sc = small.getContext("2d");
  const iw = asset.img.width, ih = asset.img.height, side = Math.min(iw, ih);
  sc.drawImage(asset.img, (iw - side) / 2, (ih - side) / 2, side, side, 0, 0, s, s);
  const big = document.createElement("canvas");
  big.width = size; big.height = size;
  const bc = big.getContext("2d");
  bc.imageSmoothingEnabled = false;
  bc.drawImage(small, 0, 0, size, size);
  asset.pix = big;
  return big;
}

// ============================== AUDIO ==============================
let AC = null, muted = false;
function audio() {
  if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { /* no audio */ } }
  if (AC && AC.state === "suspended") AC.resume();
  return AC;
}
function tone(freq, dur, type, vol, when) {
  const ac = AC; if (!ac || muted) return;
  const t = ac.currentTime + (when || 0);
  const o = ac.createOscillator(), g = ac.createGain();
  o.type = type || "square"; o.frequency.value = freq;
  g.gain.setValueAtTime(vol || 0.08, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(ac.destination);
  o.start(t); o.stop(t + dur + 0.02);
}
const sfx = {
  click: () => tone(660, 0.06, "square", 0.05),
  tick: () => tone(880, 0.04, "square", 0.04),
  perfect: () => { tone(1040, 0.08, "square", 0.07); tone(1560, 0.1, "square", 0.05, 0.05); },
  good: () => tone(780, 0.08, "square", 0.06),
  miss: () => tone(140, 0.15, "sawtooth", 0.08),
  chime: () => { [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.25, "triangle", 0.07, i * 0.09)); },
  fail: () => { tone(300, 0.2, "sawtooth", 0.07); tone(220, 0.3, "sawtooth", 0.07, 0.15); },
  gong: () => { tone(196, 1.2, "triangle", 0.12); tone(98, 1.4, "sine", 0.1, 0.02); },
  coin: () => { tone(988, 0.06, "square", 0.06); tone(1319, 0.09, "square", 0.06, 0.05); },
};

// ============================== CANVAS ==============================
const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");
let SCALE = 1, OX = 0, OY = 0;
function resize() {
  const dpr = Math.min(devicePixelRatio || 1, CFG.DPR_CAP);
  canvas.width = innerWidth * dpr; canvas.height = innerHeight * dpr;
  canvas.style.width = innerWidth + "px"; canvas.style.height = innerHeight + "px";
  const s = Math.min(innerWidth / CFG.W, innerHeight / CFG.H);
  SCALE = s * dpr;
  OX = (innerWidth * dpr - CFG.W * SCALE) / 2;
  OY = (innerHeight * dpr - CFG.H * SCALE) / 2;
}
addEventListener("resize", resize);
addEventListener("orientationchange", resize);
resize();
function toVirtual(cx, cy) {
  const dpr = Math.min(devicePixelRatio || 1, CFG.DPR_CAP);
  return { x: (cx * dpr - OX) / SCALE, y: (cy * dpr - OY) / SCALE };
}
function font(px, bold) { return (bold ? "bold " : "") + px + 'px "Courier New", monospace'; }

// ============================== INPUT ==============================
const BIND = {
  ArrowLeft: ["lane0", "act0"], KeyA: ["lane0"], KeyJ: ["act0"],
  ArrowDown: ["lane1"], KeyS: ["lane1"],
  ArrowUp: ["lane2", "act1"], KeyW: ["lane2"], KeyK: ["act1"],
  ArrowRight: ["lane3", "act2"], KeyD: ["lane3"], KeyL: ["act2"],
  Space: ["advance"], Enter: ["advance"], KeyM: ["mute"],
};
let pressQueue = [];
addEventListener("keydown", (e) => {
  const cmds = BIND[e.code];
  if (cmds) { if (!e.repeat) pressQueue.push(...cmds); e.preventDefault(); audio(); }
});
// gamepad edge detection
const padPrev = {};
const PADMAP = { 14: ["lane0", "act0"], 13: ["lane1"], 12: ["lane2", "act1"], 15: ["lane3", "act2"], 0: ["advance"], 2: ["act0"], 3: ["act1"], 1: ["act2"] };
function pollPads() {
  const pads = navigator.getGamepads ? navigator.getGamepads() : [];
  for (const gp of pads) {
    if (!gp) continue;
    const prev = padPrev[gp.index] || (padPrev[gp.index] = []);
    gp.buttons.forEach((b, i) => {
      if (b.pressed && !prev[i] && PADMAP[i]) pressQueue.push(...PADMAP[i]);
      prev[i] = b.pressed;
    });
  }
}
// pointer
let buttons = []; // rebuilt each render
let hover = { x: -1, y: -1 };
canvas.addEventListener("pointermove", (e) => { hover = toVirtual(e.clientX, e.clientY); });
canvas.addEventListener("pointerdown", (e) => {
  e.preventDefault(); audio();
  const p = toVirtual(e.clientX, e.clientY);
  // topmost button first
  for (let i = buttons.length - 1; i >= 0; i--) {
    const b = buttons[i];
    if (p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h) {
      if (!b.disabled) { sfx.click(); b.cb(); }
      return;
    }
  }
  if (DLG) { pressQueue.push("advance"); return; }
  if (scene === "form" && FORM && !FORM.done) {
    const lane = Math.floor((p.x - FORM_X0) / LANE_W);
    if (lane >= 0 && lane < 4 && p.y > 60) pressQueue.push("lane" + lane);
    return;
  }
  if (scene === "title") pressQueue.push("advance");
});
addEventListener("blur", () => { paused = true; });
addEventListener("focus", () => { paused = false; last = performance.now(); });

// ============================== UI HELPERS ==============================
function btn(x, y, w, h, label, cb, opts) {
  opts = opts || {};
  buttons.push({ x, y, w, h, label, cb, disabled: opts.disabled });
  const hov = !opts.disabled && hover.x >= x && hover.x <= x + w && hover.y >= y && hover.y <= y + h;
  ctx.fillStyle = C.shadow; ctx.fillRect(x + 3, y + 3, w, h);
  ctx.fillStyle = opts.disabled ? "#3a352e" : (opts.color || (hov ? "#c23a2a" : C.crimson));
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = opts.disabled ? "#555" : C.gold; ctx.lineWidth = 2;
  ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
  ctx.fillStyle = opts.disabled ? "#777" : (opts.text || C.cream);
  ctx.font = font(opts.size || 14, true);
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(label, x + w / 2, y + h / 2 + 1);
  ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
}
function panel(x, y, w, h, title) {
  ctx.fillStyle = C.shadow; ctx.fillRect(x + 4, y + 4, w, h);
  ctx.fillStyle = C.panel; ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = C.wood; ctx.lineWidth = 3; ctx.strokeRect(x + 1.5, y + 1.5, w - 3, h - 3);
  if (title) {
    ctx.fillStyle = C.gold; ctx.font = font(15, true);
    ctx.fillText(title, x + 12, y + 22);
    ctx.strokeStyle = C.wood; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x + 8, y + 30); ctx.lineTo(x + w - 8, y + 30); ctx.stroke();
  }
}
function bar(x, y, w, h, frac, color, back) {
  ctx.fillStyle = back || "#1a1512"; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = color; ctx.fillRect(x, y, Math.max(0, Math.min(1, frac)) * w, h);
  ctx.strokeStyle = "#000"; ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
}
function text(s, x, y, px, color, bold, align) {
  ctx.fillStyle = color || C.cream; ctx.font = font(px || 14, bold);
  ctx.textAlign = align || "left";
  ctx.fillText(s, x, y);
  ctx.textAlign = "left";
}
// toasts
let toasts = [];
function toast(msg, color) { toasts.push({ msg, color: color || C.goldL, t: 0 }); }
function drawToasts(dt) {
  let y = 64;
  toasts = toasts.filter(t => (t.t += dt) < 2600);
  for (const t of toasts) {
    const a = t.t < 200 ? t.t / 200 : t.t > 2200 ? (2600 - t.t) / 400 : 1;
    ctx.globalAlpha = Math.max(0, a);
    ctx.font = font(15, true);
    const w = ctx.measureText(t.msg).width + 24;
    ctx.fillStyle = "rgba(20,14,10,0.85)"; ctx.fillRect(CFG.W / 2 - w / 2, y - 16, w, 24);
    ctx.strokeStyle = C.gold; ctx.strokeRect(CFG.W / 2 - w / 2 + 0.5, y - 15.5, w - 1, 23);
    text(t.msg, CFG.W / 2, y + 1, 15, t.color, true, "center");
    ctx.globalAlpha = 1;
    y += 30;
  }
}

// ============================== GAME STATE ==============================
let scene = "title";
let G = null;
let DLG = null;       // {lines,[i],onDone}
let REPORT = null;    // {title, lines:[]}
let FORM = null, SPAR = null, TOUR = null;
let selected = 0;
let tab = "train";
let dismissArm = 0;

const NAMES1 = ["Mei", "Jun", "Wei", "Ling", "Bo", "Yan", "Xiu", "Kai", "Ting", "Rui", "Ana", "Leo", "Sam", "Nia", "Omar", "Ivy", "Tao", "Lan", "Chen", "Fay"];
const NAMES2 = ["Zhang", "Li", "Wang", "Chen", "Liu", "Yang", "Huang", "Zhao", "Wu", "Zhou", "Silva", "Okafor", "Reyes", "Novak", "Kim", "Sato"];

function newGame() {
  const seed = (performance.now() * 1000 | 0) ^ 0x5EED;
  G = {
    seed, rng: mulberry32(seed),
    week: 1, cash: CFG.startCash, prestige: 0, repTier: 0,
    students: [], pool: [],
    upgrades: { hall: 0, equip: 0, coach: 0 },
    tourneyUnlocks: [],
    flags: {},
    nextId: 1,
    endless: false,
  };
  refreshPool();
  scene = "dojo"; tab = "train"; selected = 0;
  story("storyIntro");
}
const level = () => 1 + G.upgrades.hall;
const slots = () => CFG.slots(G.upgrades.hall);
function unlockedDiscs() {
  return DISC_KEYS.filter(k => DISC[k].lvl <= level() || G.tourneyUnlocks.includes(k));
}
function repTierOf(pr) {
  let t = 0;
  for (let i = 0; i < CFG.repThresholds.length; i++) if (pr >= CFG.repThresholds[i]) t = i;
  return t;
}
function statTotal(s) { return STATS.reduce((a, k) => a + s.stats[k], 0); }
function makeRecruit(rare) {
  const r = G.rng;
  const q = G.repTier + (rare ? 3 : 0);
  const stats = {};
  for (const k of STATS) stats[k] = Math.round(4 + r() * (12 + q * 7));
  const potential = Math.round((0.85 + r() * 0.35 + q * 0.06) * 100) / 100;
  const trait = TRAIT_KEYS[Math.floor(r() * TRAIT_KEYS.length)];
  const name = NAMES1[Math.floor(r() * NAMES1.length)] + " " + NAMES2[Math.floor(r() * NAMES2.length)];
  const total = STATS.reduce((a, k) => a + stats[k], 0);
  const cost = Math.round(40 + total * 1.2 + (potential - 0.85) * 120 + (rare ? 60 : 0));
  return {
    id: G.nextId++, name, stats, potential, trait, rare: !!rare, cost,
    rank: 0, sanda: 0, fatigue: 0, assignment: "changquan",
    trained: false, examCooldown: 0,
    look: { skin: ["#e8b48c", "#c98a5a", "#8a5a3a", "#f2cfa0"][Math.floor(r() * 4)], hair: ["#221a14", "#4a2c14", "#111", "#6e3a1a"][Math.floor(r() * 4)] },
  };
}
function refreshPool() {
  G.pool = [makeRecruit(), makeRecruit(), makeRecruit()];
}

// ---------- training ----------
function traitMult(stu, stat) {
  const t = TRAITS[stu.trait];
  return (t.all || 1) * (t[stat] || 1);
}
function applyTraining(stu, disc, mult) {
  const d = DISC[disc];
  const equip = 1 + 0.15 * G.upgrades.equip;
  const coach = 1 + 0.12 * G.upgrades.coach;
  const fat = Math.max(0.25, 1 - stu.fatigue / CFG.fatigueMult);
  const parts = [];
  for (const k of d.stats) {
    const jitter = 0.8 + G.rng() * 0.4;
    let g = CFG.baseGain / d.stats.length * d.mult * equip * coach * fat * stu.potential * traitMult(stu, k) * mult * jitter;
    g = Math.round(g * 10) / 10;
    const before = stu.stats[k];
    stu.stats[k] = Math.min(100, Math.round((stu.stats[k] + g) * 10) / 10);
    parts.push(STR["stat" + k[0].toUpperCase() + k.slice(1)] + " +" + Math.round((stu.stats[k] - before) * 10) / 10);
  }
  stu.fatigue = Math.min(100, stu.fatigue + CFG.fatigueTrain + (TRAITS[stu.trait].fatigue || 0));
  return STR.disciplines[disc] + ": " + parts.join(", ");
}
function nextRankReady(stu) {
  return stu.rank < 5 && statTotal(stu) >= CFG.rankTotal[stu.rank + 1] && stu.examCooldown <= 0;
}
function endWeek() {
  const lines = [];
  let tuition = 0;
  for (const s of G.students) {
    if (s.trained) { s.trained = false; }
    else if (s.assignment === "rest") {
      s.fatigue = Math.max(0, s.fatigue + CFG.fatigueRest);
      lines.push(fmt(STR.reportGain, { name: s.name, what: STR.reportRest }));
    } else {
      lines.push(fmt(STR.reportGain, { name: s.name, what: applyTraining(s, s.assignment, 1) }));
    }
    if (s.examCooldown > 0) s.examCooldown--;
    tuition += CFG.tuition;
  }
  if (tuition) { G.cash += tuition; lines.push(fmt(STR.reportTuition, { n: tuition })); }
  for (const s of G.students) if (nextRankReady(s)) lines.push("★ " + fmt(STR.rankUpReady, { name: s.name, rank: STR.ranks[s.rank + 1] }));
  G.week++;
  refreshPool();
  checkRep();
  REPORT = { title: fmt(STR.reportTitle, { n: G.week - 1 }), lines };
  sfx.coin();
}
function checkRep() {
  const t = repTierOf(G.prestige);
  if (t > G.repTier) {
    G.repTier = t;
    toast(STR.repTiers[t] + "!", C.jadeG);
    if (!G.flags["rep" + t]) { G.flags["rep" + t] = true; story("storyRepUp"); }
  }
}
function isTourneyWeek(w) { return w % CFG.tourneyEvery === 0 && w >= CFG.tourneyEvery; }
function tourneyTier(w) { return Math.min(5, Math.floor(w / CFG.tourneyEvery) - 1); }

// ---------- dialogue / story ----------
function story(key, onDone) {
  const lines = STR[key];
  if (!lines) { if (onDone) onDone(); return; }
  DLG = { lines, i: 0, onDone };
}
function updateDialogue(cmds) {
  if (cmds.includes("advance")) {
    sfx.click();
    DLG.i++;
    if (DLG.i >= DLG.lines.length) { const cb = DLG.onDone; DLG = null; if (cb) cb(); }
  }
}

// ============================== FORM MINI-GAME ==============================
const FORM_X0 = 300, LANE_W = 90, HIT_Y = 430;
const ARROWS = ["◀", "▼", "▲", "▶"];
function startForm(stu, mode) {
  const targetRank = stu.rank + 1;
  const diff = mode === "exam" ? targetRank : Math.max(1, stu.rank);
  const bpm = CFG.examBpm(diff), count = CFG.examNotes(diff);
  const beat = 60000 / bpm;
  const r = mulberry32(G.seed + G.week * 97 + stu.id * 31);
  const notes = [];
  for (let i = 0; i < count; i++) notes.push({ lane: Math.floor(r() * 4), t: 2600 + i * beat, hit: false, judged: false, grade: 0 });
  FORM = {
    stu, mode, bpm, beat, notes, t: 0, score: 0, max: count * 10, combo: 0, bestCombo: 0,
    lastBeat: -1, done: false, endT: 0, flash: 0, feedback: [],
  };
  scene = "form";
}
function formAccuracy() { return FORM.score / FORM.max; }
function updateForm(dt, cmds) {
  const F = FORM;
  if (F.done) {
    F.endT += dt;
    return;
  }
  F.t += dt;
  // metronome
  const b = Math.floor((F.t - 2600) / F.beat);
  if (b !== F.lastBeat && F.t >= 1400) { F.lastBeat = b; sfx.tick(); }
  // lane presses
  for (const c of cmds) {
    if (!c.startsWith("lane")) continue;
    const lane = +c[4];
    let best = null, bestD = 1e9;
    for (const n of F.notes) {
      if (n.lane !== lane || n.judged) continue;
      const d = Math.abs(n.t - F.t);
      if (d < bestD) { bestD = d; best = n; }
    }
    if (best && bestD <= CFG.goodMs) {
      best.judged = true; best.hit = true;
      if (bestD <= CFG.perfectMs) { best.grade = 10; F.combo++; sfx.perfect(); F.feedback.push({ msg: STR.perfect, t: 0, lane, color: C.jadeG }); }
      else { best.grade = 6; F.combo++; sfx.good(); F.feedback.push({ msg: STR.good, t: 0, lane, color: C.goldL }); }
      F.bestCombo = Math.max(F.bestCombo, F.combo);
      F.score += best.grade;
      F.flash = 100;
    } else {
      F.combo = 0; sfx.miss();
      F.feedback.push({ msg: STR.miss, t: 0, lane, color: C.red });
    }
  }
  // misses
  for (const n of F.notes) {
    if (!n.judged && F.t - n.t > CFG.goodMs) {
      n.judged = true; F.combo = 0; sfx.miss();
      F.feedback.push({ msg: STR.miss, t: 0, lane: n.lane, color: C.red });
    }
  }
  F.feedback = F.feedback.filter(f => (f.t += dt) < 700);
  if (F.flash > 0) F.flash -= dt;
  const lastT = F.notes[F.notes.length - 1].t;
  if (F.t > lastT + 900) {
    F.done = true;
    finishForm();
  }
}
function finishForm() {
  const F = FORM, acc = formAccuracy(), stu = F.stu;
  if (F.mode === "exam") {
    const target = stu.rank + 1;
    if (acc >= CFG.rankAcc[target]) {
      stu.rank = target;
      F.passed = true;
      sfx.chime();
    } else {
      stu.examCooldown = 1;
      stu.fatigue = Math.min(100, stu.fatigue + 15);
      F.passed = false;
      sfx.fail();
    }
  } else {
    const line = applyTraining(stu, stu.assignment, 0.5 + acc);
    stu.trained = true;
    stu.fatigue = Math.min(100, stu.fatigue + CFG.fatigueMini);
    F.trainLine = line;
    if (acc >= 0.7) sfx.chime(); else sfx.good();
  }
}
function renderForm(dt) {
  const F = FORM;
  drawBg(ASSETS.dojo, 0.35);
  // header
  text(F.mode === "exam" ? fmt(STR.formExamTitle, { rank: STR.ranks[F.stu.rank + 1] }) : STR.formTitle, CFG.W / 2, 34, 22, C.goldL, true, "center");
  text(F.stu.name + "  ·  " + STR.formHelp, CFG.W / 2, 56, 12, C.grey, false, "center");
  // lanes
  for (let l = 0; l < 4; l++) {
    const x = FORM_X0 + l * LANE_W;
    ctx.fillStyle = "rgba(10,8,6,0.55)";
    ctx.fillRect(x + 4, 60, LANE_W - 8, 440);
    // hit ring
    ctx.strokeStyle = F.flash > 0 ? C.jadeG : C.gold; ctx.lineWidth = 3;
    ctx.strokeCircle ? 0 : 0;
    ctx.beginPath(); ctx.arc(x + LANE_W / 2, HIT_Y, 26, 0, Math.PI * 2); ctx.stroke();
    text(ARROWS[l], x + LANE_W / 2, HIT_Y + 8, 24, "rgba(242,230,200,0.35)", true, "center");
  }
  // notes
  for (const n of F.notes) {
    if (n.judged && n.hit) continue;
    const y = HIT_Y - (n.t - F.t) / CFG.approachMs * 370;
    if (y < 50 || y > 530) continue;
    const x = FORM_X0 + n.lane * LANE_W + LANE_W / 2;
    ctx.fillStyle = n.judged ? "rgba(224,85,69,0.4)" : C.crimson;
    ctx.beginPath(); ctx.arc(x, y, 22, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = C.goldL; ctx.lineWidth = 2; ctx.stroke();
    text(ARROWS[n.lane], x, y + 8, 22, C.cream, true, "center");
  }
  // feedback floaters
  for (const f of F.feedback) {
    const x = FORM_X0 + f.lane * LANE_W + LANE_W / 2;
    ctx.globalAlpha = 1 - f.t / 700;
    text(f.msg, x, HIT_Y - 50 - f.t / 14, 16, f.color, true, "center");
    ctx.globalAlpha = 1;
  }
  // score
  text(STR.accuracy + ": " + Math.round(formAccuracy() * 100) + "%", 40, 100, 16, C.cream, true);
  if (F.combo > 1) text(F.combo + " " + STR.combo, 40, 130, 16, C.jadeG, true);
  if (F.mode === "exam") text((CFG.rankAcc[F.stu.rank + 1] * 100) + "% to pass", 40, 160, 12, C.grey);
  if (F.t < 2600 && !F.done) text(STR.getReady, CFG.W / 2, 260, 26, C.goldL, true, "center");
  if (F.done) {
    panel(CFG.W / 2 - 190, 180, 380, 190);
    const acc = Math.round(formAccuracy() * 100);
    if (F.mode === "exam") {
      text(F.passed ? STR.passed : STR.failed, CFG.W / 2, 235, 20, F.passed ? C.jadeG : C.red, true, "center");
      if (F.passed) text(F.stu.name + " → " + STR.ranks[F.stu.rank], CFG.W / 2, 268, 15, C.goldL, true, "center");
    } else {
      text(fmt(STR.formResult, { acc }), CFG.W / 2, 235, 18, C.goldL, true, "center");
      if (F.trainLine) text(F.trainLine, CFG.W / 2, 268, 12, C.cream, false, "center");
    }
    text(STR.accuracy + " " + acc + "%  ·  " + STR.combo + " x" + F.bestCombo, CFG.W / 2, 300, 13, C.grey, false, "center");
    btn(CFG.W / 2 - 80, 320, 160, 36, STR.continueBtn, () => { FORM = null; scene = "dojo"; });
  }
}

// ============================== SPAR MINI-GAME ==============================
function startSpar(stu) {
  const diff = Math.min(6, 1 + Math.floor(G.week / 4));
  const r = mulberry32(G.seed + G.week * 131 + stu.id * 17);
  const ex = [];
  for (let i = 0; i < CFG.sparCount; i++) ex.push(Math.floor(r() * 3));
  SPAR = {
    stu, diff, ex, cur: -1, phase: "gap", t: 400, wins: 0, done: false,
    telegraph: CFG.sparTelegraph(diff), result: null, msg: null, msgT: 0, shake: 0,
  };
  scene = "spar";
}
function sparPrompt(type) { return [STR.sparHigh, STR.sparLow, STR.sparGrab][type]; }
function updateSpar(dt, cmds) {
  const S = SPAR;
  if (S.done) return;
  S.t -= dt;
  if (S.msgT > 0) S.msgT -= dt;
  if (S.shake > 0) S.shake -= dt;
  if (S.phase === "gap") {
    if (S.t <= 0) {
      S.cur++;
      if (S.cur >= S.ex.length) { finishSpar(); return; }
      S.phase = "telegraph"; S.t = S.telegraph; S.answered = false;
      sfx.tick();
    }
    return;
  }
  // telegraph phase
  const act = cmds.find(c => c.startsWith("act"));
  if (act && !S.answered) {
    S.answered = true;
    const a = +act[3];
    const elapsed = S.telegraph - S.t;
    const activeStart = S.telegraph * (1 - CFG.sparActive);
    if (elapsed < activeStart) { S.msg = STR.tooEarly; S.msgT = 600; sfx.miss(); S.phase = "gap"; S.t = 650; }
    else if (a === S.ex[S.cur]) { S.wins++; S.msg = STR.hit; S.msgT = 600; sfx.perfect(); S.phase = "gap"; S.t = 650; }
    else { S.msg = STR.ouch; S.msgT = 600; S.shake = 300; sfx.miss(); S.phase = "gap"; S.t = 650; }
  } else if (S.t <= 0) {
    S.msg = STR.ouch; S.msgT = 600; S.shake = 300; sfx.miss();
    S.phase = "gap"; S.t = 650;
  }
}
function finishSpar() {
  const S = SPAR, stu = S.stu;
  const gain = Math.round(S.wins * CFG.sandaPerWin * stu.potential * 10) / 10;
  stu.sanda = Math.min(100, Math.round((stu.sanda + gain) * 10) / 10);
  stu.trained = true;
  stu.fatigue = Math.min(100, stu.fatigue + CFG.fatigueMini);
  S.gain = gain; S.done = true;
  if (S.wins >= 6) sfx.chime(); else sfx.good();
}
function renderSpar(dt) {
  const S = SPAR;
  const sx = S.shake > 0 ? (Math.sin(visT / 18) * 5 * (S.shake / 300)) : 0;
  ctx.save(); ctx.translate(sx, 0);
  drawBg(ASSETS.dojo, 0.45);
  text(STR.sparTitle, CFG.W / 2, 34, 22, C.goldL, true, "center");
  text(S.stu.name + "  ·  " + STR.sparHelp, CFG.W / 2, 56, 12, C.grey, false, "center");
  // dummy
  drawDummy(CFG.W / 2 + 120, 330, 4);
  drawStudent({ look: S.stu.look, rank: S.stu.rank }, CFG.W / 2 - 160, 330, 4, Math.floor(visT / 250) % 2);
  // exchange counter
  text((Math.min(S.cur + 1, S.ex.length)) + " / " + S.ex.length, CFG.W / 2, 90, 16, C.cream, true, "center");
  text(S.wins + " ✓", CFG.W - 60, 90, 16, C.jadeG, true, "center");
  if (S.phase === "telegraph" && !S.done) {
    const frac = S.t / S.telegraph;
    const active = frac <= CFG.sparActive;
    text(sparPrompt(S.ex[S.cur]), CFG.W / 2, 150, 24, active ? C.jadeG : C.cream, true, "center");
    bar(CFG.W / 2 - 150, 170, 300, 16, frac, active ? C.jade : C.crimson);
    // jade window marker
    ctx.strokeStyle = C.jadeG; ctx.lineWidth = 2;
    ctx.strokeRect(CFG.W / 2 - 150 + 0.5, 170.5, 300 * CFG.sparActive, 15);
  }
  if (S.msgT > 0 && S.msg) text(S.msg, CFG.W / 2, 220, 20, S.msg === STR.hit ? C.jadeG : C.red, true, "center");
  // action buttons (also touch controls)
  const labels = [STR.block, STR.jump, STR.counter];
  for (let i = 0; i < 3; i++) {
    btn(240 + i * 170, 470, 150, 46, labels[i] + "  (" + "JKL"[i] + ")", (() => { const k = i; return () => pressQueue.push("act" + k); })(), { color: "#4a3524" });
  }
  ctx.restore();
  if (S.done) {
    panel(CFG.W / 2 - 190, 170, 380, 170);
    text(fmt(STR.sparResult, { n: S.wins, m: S.ex.length }), CFG.W / 2, 225, 18, C.goldL, true, "center");
    text(fmt(STR.sandaGain, { n: S.gain }), CFG.W / 2, 258, 16, C.jadeG, true, "center");
    btn(CFG.W / 2 - 80, 285, 160, 36, STR.continueBtn, () => { SPAR = null; scene = "dojo"; });
  }
}

// ============================== TOURNAMENT ==============================
function startTournament() {
  const t = tourneyTier(G.week);
  TOUR = {
    tier: t, name: STR.tourneyNames[Math.min(t, STR.tourneyNames.length - 1)],
    phase: "select", entrants: [], fights: [], fightIdx: 0, lineIdx: 0,
    placement: -1, done: false, isFinal: G.week === CFG.finalWeek,
  };
  scene = "tourney";
  sfx.gong();
}
function eligible(s) { return s.rank >= CFG.entryRank && s.sanda >= CFG.entrySanda; }
function fighterScore(s, r) {
  const total = statTotal(s);
  const minStat = Math.min(...STATS.map(k => s.stats[k]));
  const fat = Math.max(0.7, 1 - s.fatigue / 300);
  return (total * 0.8 + minStat * 0.5 + s.sanda * 2) * fat * (0.85 + r() * 0.3);
}
const RIVAL_NAMES = ["Serpent Kang", "Iron Wu", "Viper Chao", "Steel Fang Lu", "Grey Mantis", "Serpent Duan"];
function runFights() {
  const T = TOUR;
  const r = mulberry32(G.seed + G.week * 977);
  T.fights = [];
  let bestWins = 0;
  for (const s of T.entrants) {
    let wins = 0;
    const rounds = [];
    for (let round = 0; round < 3; round++) {
      const rivalName = (round === 2 && T.tier >= 2) ? RIVAL_NAMES[T.tier] : "Fighter " + "ABCDEFGH"[Math.floor(r() * 8)];
      const rivalPow = CFG.rivalBase(T.tier) * (1 + 0.08 * round) * ((round === 2 && T.tier >= 2) ? 1.1 : 1) * (0.85 + r() * 0.3);
      const mine = fighterScore(s, r);
      const win = mine >= rivalPow;
      rounds.push({ rival: rivalName, win, mine: Math.round(mine), theirs: Math.round(rivalPow) });
      if (win) { wins++; s.sanda = Math.min(100, s.sanda + 2); } else break;
    }
    bestWins = Math.max(bestWins, wins);
    T.fights.push({ stu: s, rounds, wins });
  }
  T.placement = bestWins; // 3=champion 2=finalist 1=semi 0=out
  const t = T.tier;
  if (bestWins === 3) { T.gold = CFG.prizeGold(t); T.pr = CFG.prizePr(t); }
  else if (bestWins === 2) { T.gold = Math.round(CFG.prizeGold(t) * 0.6); T.pr = Math.round(CFG.prizePr(t) * 0.6); }
  else if (bestWins === 1) { T.gold = Math.round(CFG.prizeGold(t) * 0.3); T.pr = Math.round(CFG.prizePr(t) * 0.3); }
  else { T.gold = 0; T.pr = CFG.partPr(t); }
  // bonus events
  T.bonus = null;
  if (bestWins === 3 && t >= 2 && !G.tourneyUnlocks.includes("qiang") && level() < 3) {
    G.tourneyUnlocks.push("qiang");
    T.bonus = fmt(STR.unlockDiscipline, { d: STR.disciplines.qiang });
  } else if (bestWins === 3 && t >= 1 && r() < 0.35) {
    G.pool[0] = makeRecruit(true);
    T.bonus = STR.rareInvite;
  }
}
function concludeTournament(skipped) {
  const T = TOUR;
  if (!skipped) {
    G.cash += T.gold; G.prestige += T.pr;
    for (const s of G.students) {
      if (T.entrants.includes(s)) s.fatigue = Math.min(100, s.fatigue + 25);
      else s.fatigue = Math.max(0, s.fatigue - 20);
      s.trained = false;
      if (s.examCooldown > 0) s.examCooldown--;
    }
    G.cash += G.students.length * CFG.tuition;
  } else {
    for (const s of G.students) { s.fatigue = Math.max(0, s.fatigue - 20); s.trained = false; if (s.examCooldown > 0) s.examCooldown--; }
  }
  const wasFinal = T.isFinal, won = T.placement === 3;
  G.week++;
  refreshPool();
  checkRep();
  TOUR = null;
  scene = "dojo";
  if (wasFinal && !skipped) {
    if (won) {
      G.flags.champion = true; G.endless = true;
      story("storyFinalWin", () => { scene = "champ"; });
    } else {
      G.endless = true;
      story("storyFinalLose");
    }
  } else if (G.week > 8 && !G.flags.back1) {
    G.flags.back1 = true;
    story("storyBackstory1");
  }
}
function renderTourney(dt) {
  const T = TOUR;
  drawBg(ASSETS.arena, 1);
  ctx.fillStyle = "rgba(10,6,4,0.35)"; ctx.fillRect(0, 0, CFG.W, CFG.H);
  text(T.name, CFG.W / 2, 40, 26, C.goldL, true, "center");
  if (T.phase === "select") {
    panel(180, 70, 600, 400, fmt(STR.tourneySelect, { n: CFG.maxEntrants }));
    text(STR.tourneyNeed, 200, 52 + 70 - 52 + 46, 12, C.grey); // y=116
    let y = 140;
    const elig = G.students.filter(eligible);
    if (!elig.length) text(STR.tourneyNoFighters, CFG.W / 2, 240, 14, C.red, true, "center");
    for (const s of elig.slice(0, 8)) {
      const inT = T.entrants.includes(s);
      ctx.fillStyle = inT ? "#3a4a2e" : C.panelL; ctx.fillRect(200, y, 460, 34);
      ctx.strokeStyle = inT ? C.jadeG : C.wood; ctx.strokeRect(200.5, y + 0.5, 459, 33);
      ctx.fillStyle = SASH[s.rank]; ctx.fillRect(206, y + 8, 14, 18);
      text(s.name, 230, y + 22, 14, C.cream, true);
      text(STR.statSanda + " " + Math.round(s.sanda) + " · " + Math.round(statTotal(s)), 470, y + 22, 12, C.grey);
      buttons.push({
        x: 200, y, w: 460, h: 34, label: "", cb: () => {
          if (inT) T.entrants = T.entrants.filter(e => e !== s);
          else if (T.entrants.length < CFG.maxEntrants) T.entrants.push(s);
        }
      });
      y += 42;
    }
    btn(320, 480, 150, 40, STR.tourneyEnter, () => { runFights(); T.phase = "fights"; sfx.gong(); }, { disabled: !T.entrants.length });
    btn(500, 480, 150, 40, STR.skipTournament, () => concludeTournament(true), { color: "#4a3524" });
  } else if (T.phase === "fights") {
    // show fights progressively, click to advance
    panel(150, 70, 660, 380);
    let shown = 0, y = 110;
    outer: for (let fi = 0; fi < T.fights.length; fi++) {
      const f = T.fights[fi];
      text(f.stu.name, 175, y, 15, C.goldL, true);
      y += 26;
      for (const rd of f.rounds) {
        if (shown >= T.lineIdx) break outer;
        text((rd.win ? "✓ " : "✗ ") + fmt(rd.win ? STR.roundWin : STR.roundLose, { a: f.stu.name.split(" ")[0], b: rd.rival }) + "  (" + rd.mine + " vs " + rd.theirs + ")",
          195, y, 13, rd.win ? C.jadeG : C.red);
        y += 22; shown++;
      }
      y += 8;
    }
    const totalLines = T.fights.reduce((a, f) => a + f.rounds.length, 0);
    if (T.lineIdx < totalLines) {
      btn(CFG.W / 2 - 70, 470, 140, 40, STR.next, () => { T.lineIdx++; sfx.click(); });
    } else {
      const key = T.placement === 3 ? "placement1" : T.placement === 2 ? "placement2" : T.placement === 1 ? "placement3" : "placementNone";
      text(fmt(STR[key], { gold: T.gold, pr: T.pr }), CFG.W / 2, 420, 16, T.placement === 3 ? C.jadeG : C.goldL, true, "center");
      if (T.bonus) text("★ " + T.bonus, CFG.W / 2, 444, 13, C.jadeG, false, "center");
      btn(CFG.W / 2 - 90, 470, 180, 40, STR.continueBtn, () => {
        if (T.placement === 3) sfx.chime();
        concludeTournament(false);
      });
    }
  }
}

// ============================== SPRITES (procedural, formula palette) ==============================
const spriteCache = new Map();
function studentSpriteKey(look, rank, frame) { return look.skin + look.hair + rank + frame; }
function drawStudent(stu, x, y, scale, frame) {
  // x,y = feet center. Prerendered 20x28 cell.
  const key = studentSpriteKey(stu.look, stu.rank, frame);
  let cv = spriteCache.get(key);
  if (!cv) {
    cv = document.createElement("canvas"); cv.width = 20; cv.height = 28;
    const c = cv.getContext("2d");
    const P = (px, py, w, h, col) => { c.fillStyle = col; c.fillRect(px, py, w, h); };
    const skin = stu.look.skin, hair = stu.look.hair, sash = SASH[Math.max(0, Math.min(5, stu.rank))];
    // hair + head
    P(7, 0, 6, 2, hair); P(6, 1, 8, 3, hair);
    P(7, 3, 6, 4, skin);
    P(8, 5, 1, 1, "#1a1a1a"); P(11, 5, 1, 1, "#1a1a1a");
    // uniform body (white gi, crimson trim)
    P(6, 7, 8, 8, "#efe9dc");
    P(6, 7, 1, 8, C.crimson); P(13, 7, 1, 8, C.crimson);
    // sash
    P(6, 12, 8, 2, sash);
    // arms: frame 0 down, frame 1 stance out
    if (frame === 0) { P(4, 8, 2, 6, "#efe9dc"); P(14, 8, 2, 6, "#efe9dc"); P(4, 13, 2, 2, skin); P(14, 13, 2, 2, skin); }
    else { P(2, 7, 4, 2, "#efe9dc"); P(14, 7, 4, 2, "#efe9dc"); P(1, 7, 1, 2, skin); P(18, 7, 1, 2, skin); }
    // legs (dark trousers)
    if (frame === 0) { P(7, 15, 2, 9, "#2b2b30"); P(11, 15, 2, 9, "#2b2b30"); }
    else { P(5, 15, 3, 9, "#2b2b30"); P(12, 15, 3, 9, "#2b2b30"); }
    // feet
    P(6, 24, 4, 2, "#111"); P(11, 24, 4, 2, "#111");
    // outline pass: cheap — dark base shadow
    spriteCache.set(key, cv);
  }
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = "rgba(0,0,0,0.3)";
  ctx.beginPath(); ctx.ellipse(x, y + 2, 9 * scale, 3 * scale, 0, 0, Math.PI * 2); ctx.fill();
  ctx.drawImage(cv, x - 10 * scale, y - 28 * scale + (frame === 1 ? -1 * scale : 0), 20 * scale, 28 * scale);
}
let dummyCv = null;
function drawDummy(x, y, scale) {
  if (!dummyCv) {
    dummyCv = document.createElement("canvas"); dummyCv.width = 24; dummyCv.height = 40;
    const c = dummyCv.getContext("2d");
    const P = (px, py, w, h, col) => { c.fillStyle = col; c.fillRect(px, py, w, h); };
    P(10, 2, 4, 30, C.woodL);            // trunk
    P(9, 2, 6, 4, "#b98a54");            // head block
    P(2, 8, 20, 2, "#7a5230");           // upper arms
    P(4, 14, 16, 2, "#7a5230");          // lower arms
    P(11, 20, 8, 2, "#7a5230");          // leg peg
    P(6, 32, 12, 6, C.wood);             // base
    P(4, 37, 16, 3, C.charcoal);
  }
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = "rgba(0,0,0,0.3)";
  ctx.beginPath(); ctx.ellipse(x, y + 2, 10 * scale, 3 * scale, 0, 0, Math.PI * 2); ctx.fill();
  ctx.drawImage(dummyCv, x - 12 * scale, y - 40 * scale, 24 * scale, 40 * scale);
}

// ============================== BACKGROUNDS ==============================
function drawBg(asset, dim) {
  if (asset.ok) {
    ctx.imageSmoothingEnabled = false;
    const iw = asset.img.width, ih = asset.img.height;
    const s = Math.max(CFG.W / iw, CFG.H / ih);
    ctx.drawImage(asset.img, (CFG.W - iw * s) / 2, (CFG.H - ih * s) / 2, iw * s, ih * s);
  } else {
    // fallback: wooden hall gradient
    const g = ctx.createLinearGradient(0, 0, 0, CFG.H);
    g.addColorStop(0, "#3a2418"); g.addColorStop(0.6, "#54351f"); g.addColorStop(1, "#2b1a10");
    ctx.fillStyle = g; ctx.fillRect(0, 0, CFG.W, CFG.H);
    ctx.fillStyle = "#6e1414"; ctx.fillRect(0, 330, CFG.W, 8);
    for (let i = 0; i < 6; i++) { ctx.fillStyle = "#5c3a22"; ctx.fillRect(40 + i * 170, 60, 26, 280); }
  }
  if (dim) { ctx.fillStyle = "rgba(12,8,6," + (1 - dim) + ")"; ctx.fillRect(0, 0, CFG.W, CFG.H); }
}

// ============================== DOJO SCENE ==============================
function goalText() {
  if (!G.students.length) return STR.goalRecruit;
  if (isTourneyWeek(G.week)) return STR.goalTournament;
  const ready = G.students.find(nextRankReady);
  if (ready) return fmt(STR.goalExam, { name: ready.name.split(" ")[0] });
  if (G.week < CFG.finalWeek) return STR.goalEndWeek + "  ·  " + fmt(STR.goalWin, {});
  return G.flags.champion ? STR.goalDone : STR.goalWin;
}
function renderHUD() {
  ctx.fillStyle = "rgba(16,10,8,0.92)"; ctx.fillRect(0, 0, CFG.W, 40);
  ctx.strokeStyle = C.wood; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, 40); ctx.lineTo(CFG.W, 40); ctx.stroke();
  text(STR.week + " " + G.week, 16, 26, 16, C.goldL, true);
  text(G.cash + "g", 130, 26, 16, C.gold, true);
  text(STR.prestige + " " + G.prestige, 230, 26, 14, C.jadeG, true);
  text(STR.repTiers[G.repTier], 420, 26, 13, C.grey);
  text(STR.students + " " + G.students.length + "/" + slots(), 640, 26, 13, C.cream);
  btn(CFG.W - 120, 6, 110, 28, muted ? STR.muted : STR.unmuted, () => { muted = !muted; }, { color: "#4a3524", size: 11 });
  // goal line
  text(goalText(), 16, CFG.H - 10, 12, C.jadeG, false);
}
function renderDojoScene() {
  drawBg(ASSETS.dojo, 1);
  // students in the hall (left area), training dummy
  drawDummy(520, 400, 3);
  const n = G.students.length;
  for (let i = 0; i < n; i++) {
    const s = G.students[i];
    const col = i % 3, row = Math.floor(i / 3);
    const x = 100 + col * 150 + (row % 2) * 40, y = 300 + row * 78;
    const training = s.assignment !== "rest" || s.trained;
    const frame = training ? Math.floor((visT + i * 137) / 320) % 2 : 0;
    const bob = training ? 0 : Math.sin(visT / 500 + i) * 1.5;
    drawStudent(s, x, y + bob, 3, frame);
    if (i === selected && tab === "train") {
      ctx.strokeStyle = C.jadeG; ctx.lineWidth = 2;
      ctx.strokeRect(x - 34, y - 88, 68, 96);
    }
    // clickable
    buttons.push({ x: x - 34, y: y - 88, w: 68, h: 96, label: "", cb: ((k) => () => { selected = k; tab = "train"; })(i) });
  }
}
function cycleAssignment(stu, dir) {
  const opts = ["rest", ...unlockedDiscs()];
  let i = opts.indexOf(stu.assignment);
  if (i < 0) i = 0;
  i = (i + dir + opts.length) % opts.length;
  stu.assignment = opts[i];
}
function renderRosterPanel() {
  panel(620, 48, 330, 400);
  if (!G.students.length) {
    text(STR.emptyRoster, 640, 100, 13, C.grey);
    return;
  }
  // list
  let y = 62;
  for (let i = 0; i < G.students.length; i++) {
    const s = G.students[i];
    const sel = i === selected;
    ctx.fillStyle = sel ? "#4a3524" : C.panelL; ctx.fillRect(630, y, 140, 30);
    if (sel) { ctx.strokeStyle = C.jadeG; ctx.strokeRect(630.5, y + 0.5, 139, 29); }
    ctx.fillStyle = SASH[s.rank]; ctx.fillRect(635, y + 8, 10, 14);
    text(s.name.split(" ")[0], 652, y + 20, 12, C.cream, sel);
    if (nextRankReady(s)) text("★", 752, y + 20, 12, C.goldL, true);
    buttons.push({ x: 630, y, w: 140, h: 30, label: "", cb: ((k) => () => { selected = k; dismissArm = 0; })(i) });
    y += 34;
  }
  // detail
  const s = G.students[Math.min(selected, G.students.length - 1)];
  if (!s) return;
  const dx = 782, dw = 158;
  text(s.name, dx, 74, 13, C.goldL, true);
  text(STR.ranks[s.rank], dx, 90, 11, SASH[s.rank] === "#2a2a2e" ? C.grey : SASH[s.rank]);
  text(STR.traits[s.trait] + " · " + STR.potential + " " + s.potential, dx, 105, 10, C.grey);
  text(STR.traitDesc[s.trait], dx, 118, 9, C.grey);
  let sy = 130;
  for (const k of STATS) {
    text(STR["stat" + k[0].toUpperCase() + k.slice(1)], dx, sy + 9, 10, C.cream, true);
    bar(dx + 38, sy, 110, 9, s.stats[k] / 100, STATC[k]);
    text(Math.round(s.stats[k]), dx + 38 + 112, sy + 9, 9, C.grey);
    sy += 15;
  }
  text(STR.statSanda, dx, sy + 9, 10, C.cream, true);
  bar(dx + 38, sy, 110, 9, s.sanda / 100, "#e08a3a");
  text(Math.round(s.sanda), dx + 150, sy + 9, 9, C.grey);
  sy += 15;
  text(STR.fatigue, dx, sy + 9, 10, s.fatigue > 60 ? C.red : C.cream);
  bar(dx + 60, sy, 88, 9, s.fatigue / 100, s.fatigue > 60 ? C.red : "#8a8378");
  sy += 22;
  // assignment cycler
  btn(dx, sy, 20, 24, "<", () => cycleAssignment(s, -1), { size: 12, color: "#4a3524" });
  ctx.fillStyle = C.charcoal; ctx.fillRect(dx + 22, sy, 114, 24);
  ctx.strokeStyle = C.wood; ctx.strokeRect(dx + 22.5, sy + 0.5, 113, 23);
  text(STR.disciplines[s.assignment], dx + 79, sy + 16, 11, C.cream, true, "center");
  btn(dx + 138, sy, 20, 24, ">", () => cycleAssignment(s, 1), { size: 12, color: "#4a3524" });
  sy += 27;
  text(STR.discDesc[s.assignment], dx, sy + 6, 9, C.grey);
  sy += 14;
  // actions
  const busy = s.trained;
  btn(dx, sy, 158, 26, busy ? STR.doneThisWeek : STR.actGuidedForm,
    () => startForm(s, "train"), { size: 11, disabled: busy || s.assignment === "rest" });
  sy += 30;
  const canSpar = s.rank >= CFG.entryRank;
  btn(dx, sy, 158, 26, canSpar ? STR.actSpar : STR.needGreenSash,
    () => startSpar(s), { size: 11, disabled: busy || !canSpar });
  sy += 30;
  let examLabel = STR.actExam, examDis = true;
  if (s.rank >= 5) { examLabel = STR.ranks[5]; }
  else if (s.examCooldown > 0) { examLabel = STR.examCooldown; }
  else if (nextRankReady(s)) { examLabel = fmt(STR.examReady, { rank: STR.rankShort[s.rank + 1] }); examDis = false; }
  else { examLabel = fmt(STR.examNeeds, { total: CFG.rankTotal[s.rank + 1] }); }
  btn(dx, sy, 158, 26, examLabel, () => startForm(s, "exam"), { size: 10, disabled: examDis, color: examDis ? undefined : "#3a6e3a" });
  sy += 30;
  btn(dx, sy, 158, 22, dismissArm > 0 ? STR.confirmDismiss : STR.dismiss, () => {
    if (dismissArm > 0) { G.students = G.students.filter(x => x !== s); selected = 0; dismissArm = 0; }
    else dismissArm = 3000;
  }, { size: 10, color: "#3a2a24" });
}
function renderRecruitPanel() {
  panel(620, 48, 330, 400, STR.recruitTitle);
  let y = 90;
  for (const cand of G.pool) {
    ctx.fillStyle = C.panelL; ctx.fillRect(632, y, 306, 92);
    ctx.strokeStyle = cand.rare ? C.goldL : C.wood; ctx.strokeRect(632.5, y + 0.5, 305, 91);
    drawStudent(cand, 660, y + 78, 2.4, 0);
    text(cand.name, 692, y + 18, 12, C.cream, true);
    if (cand.rare) text(STR.rareRecruit, 692, y + 32, 10, C.goldL, true);
    else text(STR.traits[cand.trait] + " — " + STR.traitDesc[cand.trait], 692, y + 32, 9, C.grey);
    let bx = 692;
    for (const k of STATS) {
      text(STR["stat" + k[0].toUpperCase() + k.slice(1)], bx, y + 50, 9, STATC[k], true);
      text(Math.round(cand.stats[k]), bx, y + 62, 10, C.cream);
      bx += 42;
    }
    text(STR.potential + " " + cand.potential, 692, y + 80, 9, C.jadeG);
    const full = G.students.length >= slots();
    const afford = G.cash >= cand.cost;
    btn(852, y + 56, 80, 28, fmt(STR.hire, { cost: cand.cost }), ((cd) => () => {
      G.cash -= cd.cost;
      G.students.push(cd);
      G.pool = G.pool.filter(p => p !== cd);
      selected = G.students.length - 1;
      toast(cd.name + " joins!", C.jadeG);
      sfx.chime();
    })(cand), { size: 9, disabled: full || !afford });
    y += 100;
  }
  if (G.students.length >= slots()) text(STR.rosterFull, 640, 420, 11, C.red);
  btn(700, 400, 170, 30, STR.refresh, () => { G.cash -= CFG.refreshCost; refreshPool(); }, { size: 11, disabled: G.cash < CFG.refreshCost, color: "#4a3524" });
  text(STR.refreshFree, 640, 442, 10, C.grey);
}
function renderAcademyPanel() {
  panel(620, 48, 330, 400, fmt(STR.academyTitle, { lvl: level() }));
  const rows = [
    { key: "hall", name: STR.upgHall, desc: STR.upgHallDesc, costs: CFG.hallCost, extra: STR.slots + ": " + slots() },
    { key: "equip", name: STR.upgEquip, desc: STR.upgEquipDesc, costs: CFG.equipCost, extra: "+" + (G.upgrades.equip * 15) + "%" },
    { key: "coach", name: STR.upgCoach, desc: STR.upgCoachDesc, costs: CFG.coachCost, extra: "+" + (G.upgrades.coach * 12) + "%" },
  ];
  let y = 95;
  for (const rw of rows) {
    const lvl = G.upgrades[rw.key];
    const maxed = lvl >= rw.costs.length;
    ctx.fillStyle = C.panelL; ctx.fillRect(632, y, 306, 78);
    ctx.strokeStyle = C.wood; ctx.strokeRect(632.5, y + 0.5, 305, 77);
    text(rw.name, 644, y + 20, 13, C.goldL, true);
    text(rw.desc, 644, y + 37, 10, C.grey);
    text(rw.extra + "  ·  " + lvl + "/" + rw.costs.length, 644, y + 54, 10, C.jadeG);
    const cost = maxed ? 0 : rw.costs[lvl];
    btn(830, y + 40, 100, 30, maxed ? STR.upgMax : fmt(STR.upgBuy, { cost }),
      ((k, c2) => () => {
        G.cash -= c2; G.upgrades[k]++;
        toast(rw.name + " ✓", C.jadeG); sfx.coin();
        if (k === "hall") toast(fmt(STR.academyTitle, { lvl: level() }), C.goldL);
      })(rw.key, cost), { size: 10, disabled: maxed || G.cash < cost });
    y += 88;
  }
  // discipline unlock hints
  let hy = y + 8;
  for (const k of DISC_KEYS) {
    if (!unlockedDiscs().includes(k)) {
      text(STR.disciplines[k] + " — " + fmt(STR.lockedAt, { n: DISC[k].lvl }), 640, hy, 10, C.grey);
      hy += 14;
    }
  }
}
function renderDojo(dt) {
  renderDojoScene();
  renderHUD();
  if (tab === "train") renderRosterPanel();
  else if (tab === "recruit") renderRecruitPanel();
  else renderAcademyPanel();
  // tabs + end week
  const tabs = [["train", STR.tabTrain], ["recruit", STR.tabRecruit], ["academy", STR.tabAcademy]];
  tabs.forEach(([k, label], i) => {
    btn(16 + i * 120, CFG.H - 76, 110, 34, label, () => { tab = k; dismissArm = 0; }, { color: tab === k ? "#c23a2a" : "#4a3524" });
  });
  if (isTourneyWeek(G.week)) {
    const pulse = Math.sin(visT / 200) > 0;
    btn(CFG.W - 200, CFG.H - 80, 184, 42, STR.goTournament, () => {
      const pre = () => startTournament();
      if (G.week === 8 && !G.flags.rival) { G.flags.rival = true; story("storyRival", pre); }
      else if (G.week === 16 && !G.flags.escalate) { G.flags.escalate = true; story("storyEscalate", pre); }
      else if (G.week === CFG.finalWeek && !G.flags.finalPre) { G.flags.finalPre = true; story("storyFinalPre", pre); }
      else if (G.week === 4 && !G.flags.firstT) { G.flags.firstT = true; story("storyFirstTourney", pre); }
      else pre();
    }, { color: pulse ? "#c23a2a" : C.crimson, size: 16 });
  } else {
    btn(CFG.W - 200, CFG.H - 80, 184, 42, STR.endWeek, () => endWeek(), { size: 16 });
  }
  if (dismissArm > 0) dismissArm -= dt;
}

// ============================== REPORT / DIALOGUE / TITLE / CHAMP ==============================
function renderReport() {
  ctx.fillStyle = "rgba(8,5,4,0.7)"; ctx.fillRect(0, 0, CFG.W, CFG.H);
  const h = Math.min(420, 110 + REPORT.lines.length * 20);
  panel(CFG.W / 2 - 250, 60, 500, h, REPORT.title);
  let y = 108;
  for (const l of REPORT.lines.slice(0, 14)) {
    text(l, CFG.W / 2 - 230, y, 12, l.startsWith("★") ? C.goldL : C.cream);
    y += 20;
  }
  btn(CFG.W / 2 - 80, 60 + h - 50, 160, 34, STR.continueBtn, () => { REPORT = null; });
}
function renderDialogue() {
  ctx.fillStyle = "rgba(8,5,4,0.55)"; ctx.fillRect(0, 0, CFG.W, CFG.H);
  const [who, line] = DLG.lines[DLG.i];
  const isN = who === "nathan";
  panel(80, CFG.H - 180, CFG.W - 160, 150);
  // portrait
  const px = 100, py = CFG.H - 165, ps = 120;
  ctx.fillStyle = C.charcoal; ctx.fillRect(px, py, ps, ps);
  const asset = isN ? ASSETS.nathan : ASSETS.rival;
  const pix = pixelPortrait(asset, ps);
  if (pix) { ctx.imageSmoothingEnabled = false; ctx.drawImage(pix, px, py, ps, ps); }
  else {
    // fallback portrait: pixel face
    ctx.fillStyle = isN ? "#c98a5a" : "#b8865a"; ctx.fillRect(px + 30, py + 25, 60, 60);
    ctx.fillStyle = "#1a1a1a"; ctx.fillRect(px + 45, py + 45, 8, 8); ctx.fillRect(px + 68, py + 45, 8, 8);
    ctx.fillStyle = isN ? "#221a14" : "#555"; ctx.fillRect(px + 25, py + 12, 70, 18);
  }
  ctx.strokeStyle = isN ? C.gold : "#8a8a92"; ctx.lineWidth = 3; ctx.strokeRect(px + 1.5, py + 1.5, ps - 3, ps - 3);
  text(isN ? STR.nathan : STR.rival, px + ps + 24, py + 24, 16, isN ? C.goldL : "#c8c8d0", true);
  // wrap text
  ctx.font = font(14);
  const words = line.split(" ");
  let cur = "", y2 = py + 52;
  ctx.fillStyle = C.cream;
  for (const w of words) {
    if (ctx.measureText(cur + w).width > CFG.W - 160 - ps - 80) { ctx.fillText(cur, px + ps + 24, y2); cur = w + " "; y2 += 20; }
    else cur += w + " ";
  }
  ctx.fillText(cur, px + ps + 24, y2);
  if (Math.sin(visT / 300) > 0) text(STR.next, CFG.W - 110, CFG.H - 48, 16, C.goldL, true);
}
function renderTitle() {
  drawBg(ASSETS.title, 1);
  ctx.fillStyle = "rgba(10,6,4,0.35)"; ctx.fillRect(0, 0, CFG.W, CFG.H);
  const bob = Math.sin(visT / 600) * 4;
  ctx.save();
  ctx.shadowColor = "#000"; ctx.shadowBlur = 0; ctx.shadowOffsetX = 4; ctx.shadowOffsetY = 4;
  text(STR.title, CFG.W / 2, 150 + bob, 44, C.goldL, true, "center");
  text(STR.title2, CFG.W / 2, 205 + bob, 52, C.crimson, true, "center");
  ctx.restore();
  ctx.strokeStyle = C.gold; ctx.lineWidth = 2;
  ctx.strokeRect(CFG.W / 2 - 260, 100, 520, 130);
  if (G) {
    btn(CFG.W / 2 - 190, 330, 180, 48, STR.continueGame, () => { scene = "dojo"; }, { size: 16 });
    btn(CFG.W / 2 + 10, 330, 180, 48, STR.newGame, () => newGame(), { size: 16 });
  } else {
    btn(CFG.W / 2 - 100, 330, 200, 52, STR.newGame, () => newGame(), { size: 18 });
  }
  if (Math.sin(visT / 400) > -0.3) text(STR.tapToStart, CFG.W / 2, 440, 14, C.cream, false, "center");
}
function renderChamp() {
  drawBg(ASSETS.arena, 0.8);
  ctx.fillStyle = "rgba(10,6,4,0.5)"; ctx.fillRect(0, 0, CFG.W, CFG.H);
  text(STR.champTitle, CFG.W / 2, 200, 44, C.goldL, true, "center");
  text(STR.champSub, CFG.W / 2, 250, 16, C.cream, false, "center");
  text(STR.week + " " + G.week + " · " + STR.prestige + " " + G.prestige, CFG.W / 2, 290, 14, C.jadeG, false, "center");
  btn(CFG.W / 2 - 110, 340, 220, 48, STR.keepPlaying, () => { scene = "dojo"; }, { size: 16 });
}

// ============================== MAIN LOOP ==============================
let paused = false, last = performance.now(), acc = 0;
let frames = 0, fpsAt = last, fps = 0;
const dev = new URLSearchParams(location.search).has("dev");
const devEl = document.getElementById("dev");
if (dev) devEl.style.display = "block";

function update(dt) {
  pollPads();
  const cmds = pressQueue;
  pressQueue = [];
  if (cmds.includes("mute")) muted = !muted;
  visT += dt;
  if (DLG) { updateDialogue(cmds); return; }
  if (REPORT) { if (cmds.includes("advance")) REPORT = null; return; }
  if (scene === "title" && cmds.includes("advance") && !G) { newGame(); return; }
  if (scene === "form" && FORM) {
    updateForm(dt, cmds);
    if (FORM && FORM.done && cmds.includes("advance") && FORM.endT > 400) { FORM = null; scene = "dojo"; }
  } else if (scene === "spar" && SPAR) {
    updateSpar(dt, cmds);
    if (SPAR && SPAR.done && cmds.includes("advance")) { SPAR = null; scene = "dojo"; }
  } else if (scene === "champ" && cmds.includes("advance")) {
    scene = "dojo";
  }
}
function render(dt) {
  buttons = [];
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.setTransform(SCALE, 0, 0, SCALE, OX, OY);
  ctx.imageSmoothingEnabled = false;
  if (scene === "title") renderTitle();
  else if (scene === "dojo") renderDojo(dt);
  else if (scene === "form" && FORM) renderForm(dt);
  else if (scene === "spar" && SPAR) renderSpar(dt);
  else if (scene === "tourney" && TOUR) renderTourney(dt);
  else if (scene === "champ") renderChamp();
  if (REPORT) renderReport();
  if (DLG) renderDialogue();
  drawToasts(dt);
  if (paused) {
    ctx.fillStyle = "rgba(0,0,0,0.5)"; ctx.fillRect(0, 0, CFG.W, CFG.H);
    text("⏸", CFG.W / 2, CFG.H / 2, 40, C.cream, true, "center");
  }
}
function frame(now) {
  requestAnimationFrame(frame);
  if (paused) { render(0); return; }
  acc += now - last; last = now;
  if (acc > 500) acc = 500; // spiral-of-death guard
  while (acc >= CFG.STEP) { update(CFG.STEP); acc -= CFG.STEP; }
  render(CFG.STEP);
  if (dev) {
    frames++;
    if (now - fpsAt >= 500) {
      fps = Math.round(frames * 1000 / (now - fpsAt)); frames = 0; fpsAt = now;
      devEl.textContent = fps + " " + STR.devFps + "  scene:" + scene + (G ? "  seed:" + G.seed + " wk:" + G.week : "");
    }
  }
}
requestAnimationFrame(frame);

// Dev-only instrumentation (?dev=1): readable state + programmatic input for testing.
if (dev) {
  window.__dbg = {
    get state() { return { G, scene, FORM, SPAR, TOUR, DLG: !!DLG, REPORT: !!REPORT }; },
    press: (c) => pressQueue.push(c),
    boost: (i, stat, sanda) => {
      const s = G.students[i]; if (!s) return;
      for (const k of STATS) s.stats[k] = stat;
      s.sanda = sanda; s.fatigue = 0;
    },
    give: (g) => { G.cash += g; },
  };
}
