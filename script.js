/* =========================
   APP STATE
========================= */
const AppState = {
  currentGame: null,
  gamesPlayed: StorageManager.getNumber(StorageKeys.gamesPlayed, 0),
  playerName: StorageManager.getString(StorageKeys.playerName, "Guest"),
  soundOn: StorageManager.getBoolean(StorageKeys.soundOn, true),
  theme: StorageManager.getString(StorageKeys.theme, "midnight")
};

/* =========================
   GAME METADATA
========================= */
const GAME_META = {
  ticTacToe: {
    title: "Tic Tac Toe",
    desc: "Classic 2-player mode. First to align 3 symbols wins."
  },
  rps: {
    title: "Rock Paper Scissors",
    desc: "Play against the computer and track your performance."
  },
  reaction: {
    title: "Reaction Speed Test",
    desc: "Wait for the signal, then click as fast as possible."
  },
  memory: {
    title: "Memory Match",
    desc: "Match all pairs with the fewest moves possible."
  },
  mole: {
    title: "Whack-a-Mole",
    desc: "Hit the active mole as many times as possible before time runs out."
  },
  typing: {
    title: "Typing Speed Test",
    desc: "Type the prompt accurately and measure your typing speed."
  },
  snake: {
    title: "Snake",
    desc: "Collect food, grow longer, and avoid collisions."
  },
  game2048: {
    title: "2048",
    desc: "Merge tiles and chase higher scores."
  }
};

/* =========================
   APP ACTIONS
========================= */
function savePlayerName() {
  const input = document.getElementById("playerNameInput");
  const value = input.value.trim() || "Guest";

  AppState.playerName = value;
  StorageManager.set(StorageKeys.playerName, value);

  UI.updatePlayerName(value);
  SoundManager.beep(680, 0.05);
}

function toggleSound() {
  AppState.soundOn = !AppState.soundOn;
  StorageManager.set(StorageKeys.soundOn, AppState.soundOn);

  SoundManager.setEnabled(AppState.soundOn);
  UI.updateSoundLabel(AppState.soundOn);

  if (AppState.soundOn) {
    SoundManager.beep(720, 0.05);
  }
}

function toggleTheme() {
  AppState.theme = AppState.theme === "midnight" ? "neon" : "midnight";
  StorageManager.set(StorageKeys.theme, AppState.theme);

  UI.applyTheme(AppState.theme);
  UI.updateThemeLabel(AppState.theme);
  SoundManager.beep(520, 0.05);
}

function openGame(gameId) {
  const meta = GAME_META[gameId];
  if (!meta) return;

  AppState.currentGame = gameId;
  AppState.gamesPlayed += 1;
  StorageManager.set(StorageKeys.gamesPlayed, AppState.gamesPlayed);

  UI.showGameArena(gameId, meta.title, meta.desc);
  UI.updateStats({
    gamesPlayed: AppState.gamesPlayed,
    currentGame: meta.title,
    playerName: AppState.playerName,
    achievementCount: AchievementManager.getUnlockedCount()
  });

  AchievementManager.unlock("first_play");

  // Phase 2 real game initializers
  if (gameId === "ticTacToe" && window.TicTacToeGame) {
    TicTacToeGame.init();
  } else if (gameId === "rps" && window.RPSGame) {
    RPSGame.init();
  } else if (gameId === "reaction" && window.ReactionGame) {
    ReactionGame.init();
  } else if (gameId === "memory" && window.MemoryGame) {
    MemoryGame.init();
  }
}

function backToMenu() {
  if (window.ReactionGame && typeof ReactionGame.cleanup === "function") {
    ReactionGame.cleanup();
  }

  AppState.currentGame = null;

  UI.showMenu();
  UI.updateStats({
    gamesPlayed: AppState.gamesPlayed,
    currentGame: "Menu",
    playerName: AppState.playerName,
    achievementCount: AchievementManager.getUnlockedCount()
  });
}

function restartCurrentGame() {
  if (!AppState.currentGame) return;

  if (AppState.currentGame === "ticTacToe" && window.TicTacToeGame) {
    TicTacToeGame.init();
  } else if (AppState.currentGame === "rps" && window.RPSGame) {
    RPSGame.init();
  } else if (AppState.currentGame === "reaction" && window.ReactionGame) {
    ReactionGame.init();
  } else if (AppState.currentGame === "memory" && window.MemoryGame) {
    MemoryGame.init();
  } else {
    openGame(AppState.currentGame);
  }
}

function resetLeaderboard() {
  const keysToReset = [
    StorageKeys.reactionBest,
    StorageKeys.memoryBest,
    StorageKeys.moleBest,
    StorageKeys.typingBest,
    StorageKeys.snakeBest,
    StorageKeys.best2048
  ];

  keysToReset.forEach(key => localStorage.removeItem(key));
  UI.renderLeaderboard();
  SoundManager.beep(300, 0.05);

  if (window.ReactionGame && typeof ReactionGame.syncUI === "function") {
    ReactionGame.syncUI();
  }
}

/* =========================
   EVENT BINDINGS
========================= */
function bindEvents() {
  document.getElementById("saveNameBtn").addEventListener("click", savePlayerName);
  document.getElementById("soundToggleBtn").addEventListener("click", toggleSound);
  document.getElementById("themeToggleBtn").addEventListener("click", toggleTheme);
  document.getElementById("restartGameBtn").addEventListener("click", restartCurrentGame);
  document.getElementById("backToMenuBtn").addEventListener("click", backToMenu);
  document.getElementById("resetLeaderboardBtn").addEventListener("click", resetLeaderboard);

  document.querySelectorAll("[data-game]").forEach(btn => {
    btn.addEventListener("click", () => {
      const gameId = btn.dataset.game;
      openGame(gameId);
    });
  });
}

/* =========================
   INIT
========================= */
function initApp() {
  SoundManager.setEnabled(AppState.soundOn);

  UI.applyTheme(AppState.theme);
  UI.updateThemeLabel(AppState.theme);
  UI.updateSoundLabel(AppState.soundOn);
  UI.prefillPlayerName(AppState.playerName);

  UI.updateStats({
    gamesPlayed: AppState.gamesPlayed,
    currentGame: "Menu",
    playerName: AppState.playerName,
    achievementCount: AchievementManager.getUnlockedCount()
  });

  UI.renderLeaderboard();
  UI.renderAchievements();

  bindEvents();
}

initApp();
