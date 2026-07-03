# Numeric thresholds (fixed before code)

Performance: 60 fps target, DPR cap 1.5, < 200 draw ops/frame, zero per-frame allocations
in steady state (dojo scene), asset budget << 25 MiB.

Stats 0–100 each. Rank totals (sum of 4 stats) and exam accuracy to pass:
Yellow 60 / 55% · Green 120 / 60% · Blue 200 / 65% · Brown 280 / 70% · Black 340 / 75%.

Rhythm windows: PERFECT ±90 ms (10 pts), GOOD ±180 ms (6 pts), else miss.
Note approach time 1400 ms; exam BPM 84 + 8·rank; notes 12 + 4·rank.
Guided-form training multiplier: 0.5 + accuracy (0.5×–1.5×).

Sparring: telegraph 1000 ms − 60·difficulty (min 550); active window = final 45% of
telegraph; 8 exchanges; sanda gain = wins × 1.2 (+trait/equip multipliers), cap 100.

Training: base gain 6/week split over discipline stats ±20% jitter; equipment +15%/tier
(max 3), instructor +12% each (max 2), trait ±(see strings), weapon disciplines ×1.3–1.4;
fatigue multiplier (1 − fatigue/220); fatigue +18/train week, −35 rest, +8 per mini-game.

Economy: tuition 15 g/student/week; recruits 40–160 g; refresh pool 30 g;
hall 300/700/1500 g; equipment 200/450/900 g; instructor 400/1000 g.
Tournament (tier t = 0..5): entry free; prizes champion 150+120t g / 25+15t prestige,
runner-up 60% gold, semi 30%; participation 4+2t prestige.
Rival fighter score ≈ (210 + 52t) ± 15% rng; player score = weighted stats + 2·sanda,
±15% rng. Reputation tiers at prestige 0/50/150/350/700.
