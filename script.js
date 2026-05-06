const LEVEL_START = 50;
const LEVEL_WIN = 100;
const LEVEL_LOSE = 0;

const TRIGGERS = [
  "Ada pujian datang, ego ingin jadi pusat perhatian.",
  "Ada hinaan datang, hati ingin membalas cepat.",
  "Ada godaan instan, nafs minta hasil tanpa proses.",
  "Ada momen hening, jiwa punya peluang menata niat.",
  "Ada kegagalan kecil, batin ingin menyalahkan orang lain.",
  "Ada keberhasilan, muncul bisikan merasa paling hebat.",
];

const ATTACK_POOL = [
  "Dzikir Fokus",
  "Muraqabah Pulse",
  "Sabr Stance",
  "Ikhlas Drive",
  "Nafs Suppression",
  "Tawakkal Guard",
  "Muhasabah Cut",
  "Ego Collapse",
  "Truth Awakening",
  "Presence Merge",
];

const state = {
  level: LEVEL_START,
  turn: 1,
  options: [],
  effective: "",
  gameOver: false,
};

const el = {
  level: document.getElementById("tasawuf-level"),
  turn: document.getElementById("turn-value"),
  narrative: document.getElementById("narrative"),
  skills: document.getElementById("skill-buttons"),
  log: document.getElementById("battle-log"),
  restart: document.getElementById("restart"),
};

function randomInt(max) {
  return Math.floor(Math.random() * max);
}

function addLog(text, cls = "") {
  const li = document.createElement("li");
  li.textContent = text;
  if (cls) li.classList.add(cls);
  el.log.prepend(li);
}

function pickRandomUnique(source, count) {
  const pool = [...source];
  const out = [];
  while (out.length < count && pool.length > 0) {
    out.push(pool.splice(randomInt(pool.length), 1)[0]);
  }
  return out;
}

function startTurn() {
  if (state.gameOver) return;

  const trigger = TRIGGERS[randomInt(TRIGGERS.length)];
  state.options = pickRandomUnique(ATTACK_POOL, 4);
  state.effective = state.options[randomInt(state.options.length)];

  el.narrative.textContent = `Turn ${state.turn}: ${trigger}`;
  addLog(`Turn ${state.turn} dimulai. Trigger baru muncul.`);

  render();
}

function resolveChoice(skill) {
  if (state.gameOver) return;

  const correct = skill === state.effective;
  state.level += correct ? 20 : -10;
  state.level = Math.max(LEVEL_LOSE, Math.min(LEVEL_WIN, state.level));

  if (correct) {
    addLog(`✅ ${skill} efektif. Tasawuf Level +20.`, "success");
  } else {
    addLog(`❌ ${skill} gagal. Tasawuf Level -10.`, "critical");
  }

  if (state.level >= LEVEL_WIN) {
    state.gameOver = true;
    addLog("Menang: Tasawuf Level musuh mencapai 100.", "success");
    render();
    return;
  }

  if (state.level <= LEVEL_LOSE) {
    state.gameOver = true;
    addLog("Kalah: Tasawuf Level musuh jatuh ke 0.", "critical");
    render();
    return;
  }

  state.turn += 1;
  startTurn();
}

function render() {
  el.level.textContent = state.level;
  el.turn.textContent = state.turn;

  el.skills.innerHTML = "";
  state.options.forEach((skill) => {
    const btn = document.createElement("button");
    btn.className = "skill-btn";
    btn.disabled = state.gameOver;
    btn.textContent = skill;
    btn.addEventListener("click", () => resolveChoice(skill));
    el.skills.appendChild(btn);
  });
}

function restart() {
  state.level = LEVEL_START;
  state.turn = 1;
  state.options = [];
  state.effective = "";
  state.gameOver = false;
  el.log.innerHTML = "";
  addLog("Game di-reset. Tasawuf Level musuh dimulai dari 50.");
  startTurn();
}

el.restart.addEventListener("click", restart);
restart();
