const MAX_HP = 100;

const state = {
  turn: "player",
  playerHp: MAX_HP,
  enemyHp: MAX_HP,
  gameOver: false,
};

const playerHpEl = document.getElementById("player-hp");
const enemyHpEl = document.getElementById("enemy-hp");
const playerAttackBtn = document.getElementById("player-attack");
const enemyAttackBtn = document.getElementById("enemy-attack");
const battleLogEl = document.getElementById("battle-log");
const restartBtn = document.getElementById("restart");
const playerCard = document.getElementById("player-card");
const enemyCard = document.getElementById("enemy-card");

function randomDamage() {
  return Math.floor(Math.random() * 13) + 8; // 8-20
}

function addLog(message, isCritical = false) {
  const item = document.createElement("li");
  item.textContent = message;
  if (isCritical) {
    item.classList.add("critical");
  }
  battleLogEl.prepend(item);
}

function render() {
  playerHpEl.textContent = state.playerHp;
  enemyHpEl.textContent = state.enemyHp;

  const isPlayerTurn = state.turn === "player";
  playerAttackBtn.disabled = !isPlayerTurn || state.gameOver;
  enemyAttackBtn.disabled = isPlayerTurn || state.gameOver;

  playerCard.classList.toggle("active", isPlayerTurn && !state.gameOver);
  enemyCard.classList.toggle("active", !isPlayerTurn && !state.gameOver);
}

function checkWinner() {
  if (state.playerHp <= 0 || state.enemyHp <= 0) {
    state.gameOver = true;

    if (state.playerHp <= 0 && state.enemyHp <= 0) {
      addLog("Draw! Dua monster tumbang bersamaan.", true);
    } else if (state.playerHp <= 0) {
      addLog("Pemain 2 menang!", true);
    } else {
      addLog("Pemain 1 menang!", true);
    }

    render();
    return true;
  }

  return false;
}

function attack(attacker) {
  if (state.gameOver) return;

  const isPlayer = attacker === "player";
  if (state.turn !== attacker) return;

  const damage = randomDamage();

  if (isPlayer) {
    state.enemyHp = Math.max(0, state.enemyHp - damage);
    addLog(`Pemain 1 menyerang dan memberi ${damage} damage.`);
  } else {
    state.playerHp = Math.max(0, state.playerHp - damage);
    addLog(`Pemain 2 menyerang dan memberi ${damage} damage.`);
  }

  if (checkWinner()) return;

  state.turn = isPlayer ? "enemy" : "player";
  render();
}

function restart() {
  state.turn = "player";
  state.playerHp = MAX_HP;
  state.enemyHp = MAX_HP;
  state.gameOver = false;
  battleLogEl.innerHTML = "";
  addLog("Match dimulai! Giliran Pemain 1 menyerang.");
  render();
}

playerAttackBtn.addEventListener("click", () => attack("player"));
enemyAttackBtn.addEventListener("click", () => attack("enemy"));
restartBtn.addEventListener("click", restart);

restart();
