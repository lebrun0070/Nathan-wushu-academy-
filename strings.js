// All player-visible text lives here. Switching language = swapping this module.
export const STR = {
  title: "SIFU NATHAN'S",
  title2: "WUSHU ACADEMY",
  tapToStart: "CLICK / TAP TO BEGIN",
  newGame: "NEW GAME",
  continueGame: "CONTINUE",
  muted: "SOUND OFF",
  unmuted: "SOUND ON",

  week: "Week",
  cash: "Gold",
  prestige: "Prestige",
  students: "Students",

  repTiers: ["Unknown School", "Local Dojo", "Respected School", "Renowned Academy", "Legendary Academy"],

  tabTrain: "DOJO",
  tabRecruit: "RECRUIT",
  tabAcademy: "UPGRADE",
  endWeek: "END WEEK",
  goTournament: "TOURNAMENT!",
  skipTournament: "Skip event",

  goalRecruit: "Goal: recruit your first student",
  goalAssign: "Goal: assign training to every student",
  goalEndWeek: "Goal: end the week to train",
  goalTournament: "Goal: the tournament is today — enter!",
  goalExam: "Goal: ${name} is ready to test for a new sash",
  goalWin: "Goal: win the National Final (week 24)",
  goalDone: "You are the national champion school. Keep building!",

  // Stats
  statPow: "POW",
  statFlx: "FLX",
  statDis: "DIS",
  statBal: "BAL",
  statSanda: "SANDA",
  fatigue: "Fatigue",
  potential: "Talent",

  ranks: ["White Sash", "Yellow Sash", "Green Sash", "Blue Sash", "Brown Sash", "Black Sash"],
  rankShort: ["White", "Yellow", "Green", "Blue", "Brown", "Black"],

  disciplines: {
    rest: "Rest",
    changquan: "Changquan",
    nanquan: "Nanquan",
    taijiquan: "Taijiquan",
    jian: "Jian (Sword)",
    dao: "Dao (Saber)",
    gun: "Gun (Staff)",
    qiang: "Qiang (Spear)",
  },
  discDesc: {
    rest: "Recovers fatigue",
    changquan: "Long fist: Power + Balance",
    nanquan: "Southern fist: Power + Discipline",
    taijiquan: "Taiji: Flexibility + Balance",
    jian: "Straight sword: Flexibility + Discipline",
    dao: "Broadsword: Power + Flexibility",
    gun: "Staff: Balance + Discipline",
    qiang: "Spear: Power + Balance",
  },
  lockedAt: "Unlocks at academy level ${n}",

  traits: {
    fiery: "Fiery",
    graceful: "Graceful",
    stoic: "Stoic",
    steady: "Steady",
    prodigy: "Prodigy",
    carefree: "Carefree",
  },
  traitDesc: {
    fiery: "+40% Power gains, tires faster",
    graceful: "+40% Flexibility gains",
    stoic: "+40% Discipline gains",
    steady: "+40% Balance gains",
    prodigy: "+20% all training gains",
    carefree: "-15% gains, recovers fast",
  },

  // Roster / actions
  assignment: "Training",
  actGuidedForm: "GUIDED FORM",
  actSpar: "SPARRING",
  actExam: "SASH EXAM",
  doneThisWeek: "Trained this week",
  examCooldown: "Shaken — rest 1 week",
  needGreenSash: "Needs Green Sash",
  examNeeds: "Needs ${total} total stats",
  examReady: "Ready to test for ${rank}!",
  dismiss: "Dismiss",
  confirmDismiss: "Really dismiss?",

  emptyRoster: "No students yet. Open RECRUIT to find your first.",
  rosterFull: "The dojo is full — expand the training hall.",

  // Recruit
  recruitTitle: "Walk-in hopefuls",
  hire: "ACCEPT — ${cost}g",
  refresh: "New faces — 30g",
  refreshFree: "Fresh faces arrive weekly",
  rareRecruit: "INVITED CHAMPION!",

  // Academy
  academyTitle: "Academy — Level ${lvl}",
  upgHall: "Expand training hall",
  upgHallDesc: "+2 student places, +1 academy level",
  upgEquip: "Better equipment",
  upgEquipDesc: "+15% training gains",
  upgCoach: "Hire assistant instructor",
  upgCoachDesc: "+12% training gains",
  upgBuy: "BUY — ${cost}g",
  upgMax: "MAXED",
  slots: "Places",

  // Form mini-game
  formTitle: "FORM PRACTICE",
  formExamTitle: "SASH EXAM: ${rank}",
  formHelp: "Hit the arrows on the ring — arrows / WASD / tap lanes",
  perfect: "PERFECT",
  good: "GOOD",
  miss: "MISS",
  combo: "COMBO",
  accuracy: "Accuracy",
  passed: "EXAM PASSED!",
  failed: "Not yet. Train and return.",
  formResult: "Session quality: ${acc}%",
  getReady: "GET READY...",

  // Sparring
  sparTitle: "SANDA SPARRING",
  sparHelp: "Answer each move in the jade window — J/K/L, arrows, or tap",
  sparHigh: "HIGH STRIKE — BLOCK!",
  sparLow: "LOW SWEEP — JUMP!",
  sparGrab: "GRAB — COUNTER!",
  block: "BLOCK",
  jump: "JUMP",
  counter: "COUNTER",
  tooEarly: "TOO EARLY",
  hit: "GOT IT",
  ouch: "HIT!",
  sparResult: "${n} of ${m} exchanges won",
  sandaGain: "Sanda +${n}",

  // Tournament
  tourneyNames: ["City Open", "Twin Rivers Invitational", "Regional Championship", "Golden Lion Gala", "Provincial Championship", "NATIONAL FINAL"],
  tourneySelect: "Choose up to ${n} fighters",
  tourneyNeed: "Entry needs Green Sash and Sanda 10+",
  tourneyEnter: "FIGHT!",
  tourneyNoFighters: "No eligible fighters — train Sanda in sparring.",
  vs: "VS",
  roundWin: "${a} defeats ${b}!",
  roundLose: "${b} overwhelms ${a}.",
  placement1: "CHAMPION! +${gold}g, +${pr} prestige",
  placement2: "Runner-up. +${gold}g, +${pr} prestige",
  placement3: "Semi-finalist. +${gold}g, +${pr} prestige",
  placementNone: "Eliminated early. +${pr} prestige for showing up",
  continueBtn: "CONTINUE",
  unlockDiscipline: "New discipline taught citywide: ${d}!",
  rareInvite: "A champion asks to join your school!",

  // Weekly report
  reportTitle: "Week ${n} report",
  reportTuition: "Tuition +${n}g",
  reportGain: "${name}: ${what}",
  reportRest: "rested",
  rankUpReady: "${name} can test for ${rank}!",

  // Story
  next: "▼",
  nathan: "Sifu Nathan",
  rival: "Master Shen",
  student: "Student",
  storyIntro: [
    ["nathan", "So you're the new head instructor. Good. This hall has been quiet too long."],
    ["nathan", "I'll handle the philosophy. You build the roster. Recruit anyone with fire in their eyes."],
    ["nathan", "Train them well, test them for their sashes, and when the tournaments come — we show this city real wushu."],
  ],
  storyFirstTourney: [
    ["nathan", "First tournament week. Send only students with a Green Sash and sparring experience."],
    ["nathan", "Win or lose, they'll come back sharper. And the prize gold buys better equipment."],
  ],
  storyRival: [
    ["rival", "So this is the famous... hm. Small hall. Creaky floor. And Nathan hiding behind new students."],
    ["nathan", "Shen. Still measuring schools by the price of their floors, I see."],
    ["rival", "My Iron Serpent Academy takes gold at every event this season. Bring your little sashes and watch."],
    ["nathan", "We'll bring more than sashes."],
  ],
  storyBackstory1: [
    ["nathan", "You fought well out there. Shen and I... we trained under the same master, long ago."],
    ["nathan", "The year of my national final, my knee gave out mid-form. Shen took the gold. I took a teaching license."],
    ["nathan", "I don't regret it. A trophy shines for a night. A student shines for a lifetime."],
  ],
  storyEscalate: [
    ["rival", "Still here? Your students have... adequate footwork. My serpents will swallow them at provincials."],
    ["nathan", "Adequate footwork beats an inflated ego, old friend."],
    ["rival", "We are NOT friends. The National Final will settle what the old master never did."],
  ],
  storyFinalPre: [
    ["nathan", "The National Final. Twenty years I've waited to send someone through that gate again."],
    ["nathan", "Whatever happens in that arena — you've already built what Shen never could. A school with a soul."],
    ["nathan", "Now go. Show them our wushu."],
  ],
  storyFinalWin: [
    ["rival", "...A clean victory. Your students fight like they mean something."],
    ["nathan", "They do. That was always the difference, Shen."],
    ["rival", "Hmph. Next season, Nathan. Next season."],
    ["nathan", "We'll be here. CHAMPIONS of the nation — and still just getting started."],
  ],
  storyFinalLose: [
    ["rival", "Close. Genuinely close. There may be a school in you yet, Nathan."],
    ["nathan", "Chin up. We take this loss, we train through winter, and next season the gold comes home."],
  ],
  storyRepUp: [
    ["nathan", "Word is spreading. Stronger hopefuls are knocking on our door now."],
  ],

  champTitle: "NATIONAL CHAMPIONS",
  champSub: "The academy's name is known across the nation.",
  keepPlaying: "KEEP TRAINING",

  devFps: "fps",
};

// Tiny template helper: fmt("${a} x", {a:1})
export function fmt(s, vars) {
  return s.replace(/\$\{(\w+)\}/g, (_, k) => (vars && vars[k] !== undefined ? vars[k] : ""));
}
