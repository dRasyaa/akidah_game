const STAGES = ["SYARIAT", "TAREKAT", "HAKIKAT", "MARIFAT"];

const BOSS_BY_STAGE = {
  SYARIAT: { name: "The Loud Self", ego: 75, nafs: 55, calm: 25, narrative: "Ia dihina di depan banyak orang, lalu ego berteriak untuk membalas." },
  TAREKAT: { name: "The Burning Desire", ego: 48, nafs: 82, calm: 20, narrative: "Godaan instan datang bertubi-tubi, nafs ingin menang sekarang juga." },
  HAKIKAT: { name: "The Veiled Mind", ego: 62, nafs: 62, calm: 38, narrative: "Pikiran dipenuhi ilusi, sulit membedakan dorongan dan kebenaran." },
  MARIFAT: { name: "The Final Separation", ego: 68, nafs: 68, calm: 68, narrative: "Jiwa berada di ambang penyatuan, namun separasi lama belum runtuh." },
};

const SKILLS = [
  { key: "ablu", stage: "SYARIAT", name: "Ablution Guard", tags: ["Purify"], effect: { ego: -8, nafs: -6, calm: +10 } },
  { key: "takbir", stage: "SYARIAT", name: "Takbir Resonance", tags: ["Purify"], effect: { ego: -10, calm: +6 } },
  { key: "sujud", stage: "SYARIAT", name: "Sujud Anchor", tags: ["Purify"], effect: { nafs: -12, calm: +8 } },

  { key: "nafs_bind", stage: "TAREKAT", name: "Nafs Bind Sigil", tags: ["Discipline"], effect: { nafs: -16, ego: -4 } },
  { key: "istiqamah", stage: "TAREKAT", name: "Istiqamah Pulse", tags: ["Discipline"], effect: { calm: +14 }, buff: "STEADFAST" },
  { key: "mujahadah", stage: "TAREKAT", name: "Mujahadah Strike", tags: ["Discipline"], effect: { ego: -12, nafs: -10, calm: -2 } },

  { key: "veil", stage: "HAKIKAT", name: "Veil Rend", tags: ["Insight"], special: "HIGHEST_MINUS" },
  { key: "mirror", stage: "HAKIKAT", name: "Mirror of Reality", tags: ["Insight"], special: "BALANCE_EGO_NAFS" },
  { key: "truth", stage: "HAKIKAT", name: "Truth Awakening", tags: ["Insight"], effect: { calm: +18, ego: -8 } },

  { key: "merge", stage: "MARIFAT", name: "Presence Merge", tags: ["Unity"], special: "CONVERT_20" },
  { key: "collapse", stage: "MARIFAT", name: "Ego Collapse", tags: ["Unity"], effect: { ego: -22 } },
  { key: "horizon", stage: "MARIFAT", name: "Unity Horizon", tags: ["Unity"], special: "FINISHER" },
];

const state = {
  stageIndex: 0,
  combo: 0,
  steadfast: 0,
  lastTag: null,
  stabilizeTurns: 0,
  gameOver: false,
  enemy: { ego: 75, nafs: 55, calm: 25, phase: "EGO_SURGE", name: "The Loud Self" },
};

const el = {
  playerStage: document.getElementById("player-stage"),
  combo: document.getElementById("combo-chain"),
  steadfast: document.getElementById("steadfast"),
  enemyName: document.getElementById("enemy-name"),
  phase: document.getElementById("enemy-phase"),
  ego: document.getElementById("ego-value"),
  nafs: document.getElementById("nafs-value"),
  calm: document.getElementById("calm-value"),
  turmoil: document.getElementById("turmoil-value"),
  harmony: document.getElementById("harmony-value"),
  narrative: document.getElementById("narrative"),
  skillButtons: document.getElementById("skill-buttons"),
  log: document.getElementById("battle-log"),
  advance: document.getElementById("advance-stage"),
  restart: document.getElementById("restart"),
};

function clamp(v) { return Math.max(0, Math.min(100, Math.round(v))); }
function addLog(msg, type = "") {
  const li = document.createElement("li");
  li.textContent = msg;
  if (type) li.classList.add(type);
  el.log.prepend(li);
}
function metrics() {
  return {
    turmoil: state.enemy.ego + state.enemy.nafs - state.enemy.calm,
    harmony: state.enemy.calm - Math.abs(state.enemy.ego - state.enemy.nafs) / 2,
  };
}
function recalcPhase() {
  const e = state.enemy;
  if (e.ego >= 70 && e.ego > e.nafs) return "EGO_SURGE";
  if (e.nafs >= 70 && e.nafs >= e.ego) return "NAFS_DOMINANCE";
  if (e.calm >= 65 && e.ego <= 45 && e.nafs <= 45) return "CALM_AWAKENING";
  if (Math.max(e.ego, e.nafs, e.calm) - Math.min(e.ego, e.nafs, e.calm) <= 20) return "BALANCE";
  return "UNSTABLE";
}
function naturalEnemyUpdate() {
  if (state.enemy.nafs > 60) state.enemy.ego += 8;
  if (state.enemy.ego > 60) state.enemy.calm -= 10;
  if (state.enemy.calm > 60) { state.enemy.ego -= 7; state.enemy.nafs -= 7; }
  const roll = Math.random();
  if (roll < 0.34) state.enemy.ego += Math.floor(Math.random() * 5) - 2;
  else if (roll < 0.67) state.enemy.nafs += Math.floor(Math.random() * 5) - 2;
  else state.enemy.calm += Math.floor(Math.random() * 5) - 2;
  state.enemy.ego = clamp(state.enemy.ego);
  state.enemy.nafs = clamp(state.enemy.nafs);
  state.enemy.calm = clamp(state.enemy.calm);
}
function enemyAction() {
  const p = state.enemy.phase;
  if (p === "EGO_SURGE") { state.enemy.ego += 6; state.enemy.calm -= 5; addLog("Enemy: Self-Justification memicu Ego Surge."); }
  else if (p === "NAFS_DOMINANCE") { state.enemy.nafs += 7; state.enemy.ego += 4; addLog("Enemy: Impulse Burst menaikkan Nafs."); }
  else if (p === "CALM_AWAKENING") { state.enemy.ego -= 8; state.enemy.nafs -= 8; state.enemy.calm += 5; addLog("Enemy: Quiet Reflection memperkuat ketenangan."); }
  else { state.enemy.ego += 2; state.enemy.nafs += 2; addLog("Enemy: Oscillation menjaga ketidakstabilan."); }
  state.enemy.ego = clamp(state.enemy.ego);
  state.enemy.nafs = clamp(state.enemy.nafs);
  state.enemy.calm = clamp(state.enemy.calm);
}
function applySkill(skill) {
  if (state.gameOver) return;
  const stageIndex = STAGES.indexOf(skill.stage);
  if (stageIndex > state.stageIndex) return;

  if (skill.effect) {
    state.enemy.ego = clamp(state.enemy.ego + (skill.effect.ego ?? 0));
    state.enemy.nafs = clamp(state.enemy.nafs + (skill.effect.nafs ?? 0));
    state.enemy.calm = clamp(state.enemy.calm + (skill.effect.calm ?? 0));
  }

  if (skill.special === "HIGHEST_MINUS") {
    const top = ["ego", "nafs", "calm"].sort((a, b) => state.enemy[b] - state.enemy[a])[0];
    state.enemy[top] = clamp(state.enemy[top] - 18);
  } else if (skill.special === "BALANCE_EGO_NAFS") {
    const avg = clamp((state.enemy.ego + state.enemy.nafs) / 2);
    state.enemy.ego = avg; state.enemy.nafs = avg; state.enemy.calm = clamp(state.enemy.calm + 8);
  } else if (skill.special === "CONVERT_20") {
    const pool = state.enemy.ego + state.enemy.nafs;
    const shift = Math.round(pool * 0.2);
    state.enemy.ego = clamp(state.enemy.ego - shift / 2);
    state.enemy.nafs = clamp(state.enemy.nafs - shift / 2);
    state.enemy.calm = clamp(state.enemy.calm + shift);
  } else if (skill.special === "FINISHER") {
    const { harmony } = metrics();
    if (state.combo >= 4 && harmony >= 40) {
      state.enemy.phase = "CALM_AWAKENING";
      state.enemy.calm = clamp(state.enemy.calm + 20);
      state.enemy.ego = clamp(state.enemy.ego - 15);
      state.enemy.nafs = clamp(state.enemy.nafs - 15);
      addLog("Unity Horizon aktif! Phase dipaksa ke Calm Awakening.", "success");
    } else {
      addLog("Unity Horizon gagal: butuh Combo >= 4 & Harmony >= 40.", "critical");
    }
  }

  if (skill.buff === "STEADFAST") state.steadfast = Math.min(3, state.steadfast + 1);

  state.combo = (state.lastTag && state.lastTag !== skill.tags[0]) ? state.combo + 1 : 1;
  state.lastTag = skill.tags[0];

  addLog(`Player memakai ${skill.name}.`);

  naturalEnemyUpdate();
  state.enemy.phase = recalcPhase();
  enemyAction();
  state.enemy.phase = recalcPhase();

  const stable = state.enemy.ego <= 20 && state.enemy.nafs <= 20 && state.enemy.calm >= 80;
  state.stabilizeTurns = stable ? state.stabilizeTurns + 1 : 0;
  if (state.stabilizeTurns >= 2) {
    state.gameOver = true;
    addLog("Transformasi berhasil: Soul Stabilized selama 2 turn!", "success");
  }

  render();
}

function renderSkillButtons() {
  el.skillButtons.innerHTML = "";
  SKILLS.forEach((skill) => {
    const btn = document.createElement("button");
    btn.className = "skill-btn";
    btn.textContent = `${skill.name} [${skill.stage}]`;
    btn.disabled = STAGES.indexOf(skill.stage) > state.stageIndex || state.gameOver;
    btn.addEventListener("click", () => applySkill(skill));
    el.skillButtons.appendChild(btn);
  });
}
function loadBoss() {
  const key = STAGES[state.stageIndex];
  const boss = BOSS_BY_STAGE[key];
  state.enemy = { ego: boss.ego, nafs: boss.nafs, calm: boss.calm, phase: recalcPhase(), name: boss.name };
  el.narrative.textContent = boss.narrative;
}
function render() {
  const m = metrics();
  el.playerStage.textContent = STAGES[state.stageIndex];
  el.combo.textContent = state.combo;
  el.steadfast.textContent = state.steadfast;
  el.enemyName.textContent = state.enemy.name;
  el.phase.textContent = state.enemy.phase;
  el.ego.textContent = state.enemy.ego;
  el.nafs.textContent = state.enemy.nafs;
  el.calm.textContent = state.enemy.calm;
  el.turmoil.textContent = Math.round(m.turmoil);
  el.harmony.textContent = Math.round(m.harmony);
  renderSkillButtons();
}
function restart() {
  state.stageIndex = 0; state.combo = 0; state.steadfast = 0; state.lastTag = null; state.stabilizeTurns = 0; state.gameOver = false;
  el.log.innerHTML = "";
  loadBoss();
  addLog("Battle dimulai. Stabilkan jiwa musuh, bukan menghancurkannya.");
  render();
}

el.advance.addEventListener("click", () => {
  if (state.stageIndex < STAGES.length - 1) {
    state.stageIndex += 1;
    state.combo = 0; state.lastTag = null; state.steadfast = 0; state.stabilizeTurns = 0; state.gameOver = false;
    loadBoss();
    addLog(`Masuk stage ${STAGES[state.stageIndex]}: boss baru muncul.`);
    render();
  }
});
el.restart.addEventListener("click", restart);
restart();
