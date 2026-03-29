window.ReactionGame = {
  timeoutId: null,
  startTime: 0,
  waiting: false,
  ready: false,
  lastTime: null,

  init() {
    this.cleanup();

    const box = document.getElementById("reactionBox");
    if (!box) return;

    box.className = "reaction-box waiting";
    box.textContent = "Wait for the green signal...";

    this.waiting = true;
    this.ready = false;

    const delay = Math.floor(Math.random() * 3000) + 2000;

    this.timeoutId = setTimeout(() => {
      this.ready = true;
      this.waiting = false;
      this.startTime = performance.now();

      box.className = "reaction-box ready";
      box.textContent = "CLICK NOW!";
    }, delay);

    box.onclick = () => this.handleClick();
    this.syncUI();
  },

  handleClick() {
    const box = document.getElementById("reactionBox");
    if (!box) return;

    if (this.waiting) {
      this.cleanup();
      box.className = "reaction-box too-soon";
      box.textContent = "Too soon! Click Restart and try again.";
      SoundManager.beep(180, 0.06);
      return;
    }

    if (this.ready) {
      const time = Math.round(performance.now() - this.startTime);
      this.lastTime = time;

      const best = StorageManager.getNumber(StorageKeys.reactionBest, 0);
      if (!best || time < best) {
        StorageManager.set(StorageKeys.reactionBest, time);
      }

      if (time < 250) {
        AchievementManager.unlock("reaction_master");
      }

      this.ready = false;
      box.className = "reaction-box";
      box.textContent = `Your reaction time: ${time} ms. Click Restart to try again.`;

      SoundManager.beep(840, 0.04);
      UI.renderLeaderboard();
      this.syncUI();
    }
  },

  syncUI() {
    const best = StorageManager.getNumber(StorageKeys.reactionBest, 0);
    document.getElementById("reactionBest").textContent = best ? `${best} ms` : "--";
    document.getElementById("reactionLast").textContent = this.lastTime !== null ? `${this.lastTime} ms` : "--";
  },

  cleanup() {
    clearTimeout(this.timeoutId);
    this.timeoutId = null;
    this.waiting = false;
  }
};
