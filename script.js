const LEVEL_START = 50;
const LEVEL_TARGET = 100;
const LEVEL_FAIL = 0;

const TRIGGERS = [
  "Saat dipuji, hati mulai condong pada rasa ingin terlihat lebih baik.",
  "Saat lelah, muncul dorongan mencari jalan pintas yang instan.",
  "Saat disalahkan, ego ingin langsung membela diri.",
  "Saat sendiri, muncul ruang untuk jujur pada niat batin.",
  "Saat berhasil, muncul bisikan merasa paling layak.",
  "Saat gagal, muncul dorongan menyalahkan keadaan.",
  "Saat hening, ada kesempatan menata nafas dan niat.",
];

const ATTACK_POOL = [
  "Dzikir Fokus",
  "Muraqabah Pulse",
  "Tawadhu Break",
  "Sabr Stance",
  "Muhasabah Cut",
  "Ikhlas Drive",
  "Tawakkal Guard",
  "Nafs Suppression",
  "Reality Veil Pierce",
  "Presence Merge",
  "Ego Collapse",
  "Truth Awakening",
];

const state = {
  tasawufLevel: LEVEL_START,
  turn: 1,
  gameOver: false,
  effectiveSkill: "",
  options: [],
};

const el = {
  enemyName: document.getElementById("enemy-name"),
  phase: document.getElementById("enemy-phase"),
  ego: document.getElementById("ego-value"),
  nafs: document.getElementById("nafs-value"),
  calm: document.getElementById("calm-value"),
  turmoil: document.getElementById("turmoil-value"),
  harmony: document.getElementById("harmony-value"),
  playerStage: document.getElementById("player-stage"),
  combo: document.getElementById("combo-chain"),
  steadfast: document.getElementById("steadfast"),
  narrative: document.getElementById("narrative"),
  skillButtons: document.getElementById("skill-buttons"),
  log: document.getElementById("battle-log"),
  advance: document.getElementById("advance-stage"),
  restart: document.getElementById("restart"),
};

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function sample(arr, count) {
  const copy = [...arr];
  const picked = [];
  while (picked.length < count && copy.length > 0) {
    const i = Math.floor(Math.random() * copy.length);
    picked.push(copy.splice(i, 1)[0]);
  }
  return picked;
}

function addLog(text, cls = "") {
  const li = document.createElement("li");
  li.textContent = text;
  if (cls) li.classList.add(cls);
  el.log.prepend(li);
}
function applySkill(skill) {
  if (state.gameOver) return;
  const stageIndex = STAGES.indexOf(skill.stage);
  if (stageIndex > state.stageIndex) return;

function derivedEnemyVisuals() {
  const ego = clamp(100 - state.tasawufLevel, 0, 100);
  const nafs = clamp(110 - state.tasawufLevel, 0, 100);
  const calm = clamp(state.tasawufLevel, 0, 100);
  const turmoil = ego + nafs - calm;
  const harmony = calm - Math.abs(ego - nafs) / 2;

  let phase = "BALANCE";
  if (nafs >= 70) phase = "NAFS_DOMINANCE";
  if (ego >= 70 && ego > nafs) phase = "EGO_SURGE";
  if (calm >= 70) phase = "CALM_AWAKENING";

  return { ego, nafs, calm, turmoil, harmony, phase };
}

function prepareTurn() {
  if (state.gameOver) return;
  state.options = sample(ATTACK_POOL, 4);
  state.effectiveSkill = state.options[Math.floor(Math.random() * state.options.length)];
  el.narrative.textContent = `Turn ${state.turn}: ${TRIGGERS[Math.floor(Math.random() * TRIGGERS.length)]}`;
  addLog(`Turn ${state.turn}: Trigger baru muncul. Pilih 1 dari 4 aksi.`);
  render();
}

function pickSkill(skillName) {
  if (state.gameOver) return;

  if (skillName === state.effectiveSkill) {
    state.tasawufLevel = clamp(state.tasawufLevel + 20, LEVEL_FAIL, LEVEL_TARGET);
    addLog(`✅ ${skillName} efektif! Tasawuf Level +20.`, "success");
  } else {
    state.tasawufLevel = clamp(state.tasawufLevel - 10, LEVEL_FAIL, LEVEL_TARGET);
    addLog(`❌ ${skillName} tidak efektif. Tasawuf Level -10.`, "critical");
  }

  if (state.tasawufLevel >= LEVEL_TARGET) {
    state.gameOver = true;
    addLog("Transformasi sukses: Tasawuf Level mencapai 100.", "success");
    render();
    return;
  }

  if (state.tasawufLevel <= LEVEL_FAIL) {
    state.gameOver = true;
    addLog("Jiwa runtuh: Tasawuf Level mencapai 0.", "critical");
    render();
    return;
  }

  state.turn += 1;
  prepareTurn();
}

function render() {
  const d = derivedEnemyVisuals();
  el.enemyName.textContent = "Jiwa Musuh";
  el.phase.textContent = d.phase;
  el.ego.textContent = d.ego;
  el.nafs.textContent = d.nafs;
  el.calm.textContent = d.calm;
  el.turmoil.textContent = Math.round(d.turmoil);
  el.harmony.textContent = Math.round(d.harmony);

  el.playerStage.textContent = `Tasawuf Level ${state.tasawufLevel}`;
  el.combo.textContent = state.turn;
  el.steadfast.textContent = state.gameOver ? "END" : "ACTIVE";

  el.skillButtons.innerHTML = "";
  state.options.forEach((name) => {
    const btn = document.createElement("button");
    btn.className = "skill-btn";
    btn.disabled = state.gameOver;
    btn.textContent = name;
    btn.addEventListener("click", () => pickSkill(name));
    el.skillButtons.appendChild(btn);
  });

  el.advance.disabled = true;
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
  state.tasawufLevel = LEVEL_START;
  state.turn = 1;
  state.gameOver = false;
  state.options = [];
  state.effectiveSkill = "";
  el.log.innerHTML = "";
  addLog("Battle dimulai dari Tasawuf Level 50.");
  prepareTurn();
}

el.restart.addEventListener("click", restart);
el.advance.addEventListener("click", () => {});

restart();
