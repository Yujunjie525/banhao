(() => {
  "use strict";

  const STORAGE_KEY = "thunder-warrior-h5-v1";
  const BOARD_SIZE = 6;
  const STAR_RATES = { 1: 0.5, 2: 0.75, 3: 1 };

  const RUNES = [
    { id: "r001", name: "闪电", glyph: "ϟ", color: "#62e4eb" },
    { id: "r002", name: "风暴盾", glyph: "◈", color: "#7db8ff" },
    { id: "r003", name: "雷锤", glyph: "T", color: "#f1c453" },
    { id: "r004", name: "疾风", glyph: "≋", color: "#74d493" },
    { id: "r005", name: "霹雳枪", glyph: "Y", color: "#ff7f6f" },
    { id: "r006", name: "银电刃", glyph: "∕", color: "#d9e3e7" },
    { id: "r007", name: "黑云", glyph: "●", color: "#a993df" },
    { id: "r008", name: "金雷戟", glyph: "Ψ", color: "#f3a94b" },
    { id: "r009", name: "青霆弩", glyph: "⋈", color: "#33c3a5" },
    { id: "r010", name: "天罚印", glyph: "✦", color: "#ef8fbd" }
  ];

  const HEROES = [
    {
      id: "c001",
      name: "雷霆勇士",
      short: "勇士",
      mark: "ϟ",
      role: "稳定蓄雷",
      color: "#62e4eb",
      accent: "#f1c453",
      skill: {
        id: "SK001",
        name: "雷霆号令",
        icon: "ϟ",
        type: "addEnergy",
        value: 10,
        cooldown: 35,
        effect: "立即获得 10 点雷霆能量"
      }
    },
    {
      id: "c002",
      name: "风暴剑姬",
      short: "剑姬",
      mark: "×",
      role: "盘面整理",
      color: "#7db8ff",
      accent: "#ff7f6f",
      skill: {
        id: "SK002",
        name: "风暴重排",
        icon: "⟳",
        type: "shuffle",
        value: 0,
        cooldown: 40,
        effect: "重排棋盘并保证至少存在一次合法消除"
      }
    },
    {
      id: "c003",
      name: "雷盾守卫",
      short: "守卫",
      mark: "◈",
      role: "容错防御",
      color: "#f1c453",
      accent: "#62e4eb",
      skill: {
        id: "SK003",
        name: "不灭雷盾",
        icon: "◇",
        type: "shield",
        value: 1,
        cooldown: 45,
        effect: "下一次敌方攻击免费触发雷盾格挡"
      }
    },
    {
      id: "c004",
      name: "雷纹祭司",
      short: "祭司",
      mark: "✦",
      role: "群体消除",
      color: "#a993df",
      accent: "#f1c453",
      skill: {
        id: "SK004",
        name: "雷纹共鸣",
        icon: "✦",
        type: "clearMost",
        value: 0,
        cooldown: 45,
        effect: "消除棋盘中数量最多的一类符文"
      }
    },
    {
      id: "c005",
      name: "霹雳游侠",
      short: "游侠",
      mark: "⋈",
      role: "倒计时控制",
      color: "#33c3a5",
      accent: "#ff7f6f",
      skill: {
        id: "SK005",
        name: "雷时延缓",
        icon: "◷",
        type: "extendTimer",
        value: 5,
        cooldown: 30,
        effect: "敌方攻击倒计时增加 5 秒"
      }
    }
  ];

  const MONSTERS = [
    { id: "m001", name: "蚀雷魔犬", kind: "hound", color: "#b65d72" },
    { id: "m002", name: "风暴行刑者", kind: "executioner", color: "#bd784e" },
    { id: "m003", name: "天穹毁灭者", kind: "armor", color: "#786eae" },
    { id: "m004", name: "雷鸣石像", kind: "idol", color: "#8c8068" },
    { id: "m005", name: "云海女妖", kind: "siren", color: "#6b9db5" },
    { id: "m006", name: "万雷之王", kind: "king", color: "#a96a58" }
  ];

  const LEVELS = [
    {
      id: "l_001", name: "雷云前哨", monsterId: "m001", interval: 12,
      monsterAttack: 10, counterDamage: 10, playerHp: 30, enemyHp: 30,
      goldBase: 100, runeCount: 4
    },
    {
      id: "l_002", name: "风暴断崖", monsterId: "m002", interval: 10,
      monsterAttack: 15, counterDamage: 15, playerHp: 50, enemyHp: 60,
      goldBase: 200, runeCount: 6
    },
    {
      id: "l_003", name: "天穹神殿", monsterId: "m003", interval: 8,
      monsterAttack: 20, counterDamage: 25, playerHp: 80, enemyHp: 150,
      goldBase: 400, runeCount: 8
    },
    {
      id: "l_004", name: "雷鸣回廊", monsterId: "m004", interval: 7,
      monsterAttack: 25, counterDamage: 30, playerHp: 100, enemyHp: 240,
      goldBase: 600, runeCount: 9
    },
    {
      id: "l_005", name: "云海祭坛", monsterId: "m005", interval: 6.5,
      monsterAttack: 30, counterDamage: 35, playerHp: 120, enemyHp: 350,
      goldBase: 800, runeCount: 10
    },
    {
      id: "l_006", name: "万雷王座", monsterId: "m006", interval: 6,
      monsterAttack: 40, counterDamage: 50, playerHp: 150, enemyHp: 600,
      goldBase: 1200, runeCount: 10
    }
  ];

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const runeById = (id) => RUNES.find((rune) => rune.id === id);
  const heroById = (id) => HEROES.find((hero) => hero.id === id) || HEROES[0];
  const monsterById = (id) => MONSTERS.find((monster) => monster.id === id) || MONSTERS[0];
  const levelById = (id) => LEVELS.find((level) => level.id === id) || LEVELS[0];

  function createDefaultProfile() {
    return {
      gold: 0,
      selectedHeroId: "c001",
      maxUnlocked: 1,
      progress: {},
      sound: true,
      activeBattle: null,
      adDaily: { date: todayKey(), revive: 0, freeze: 0 }
    };
  }

  function todayKey() {
    const date = new Date();
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  }

  function loadProfile() {
    const fallback = createDefaultProfile();
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (!parsed || typeof parsed !== "object") return fallback;
      const loaded = {
        ...fallback,
        ...parsed,
        progress: parsed.progress && typeof parsed.progress === "object" ? parsed.progress : {},
        adDaily: parsed.adDaily && typeof parsed.adDaily === "object" ? parsed.adDaily : fallback.adDaily
      };
      if (!HEROES.some((hero) => hero.id === loaded.selectedHeroId)) loaded.selectedHeroId = "c001";
      loaded.maxUnlocked = clamp(Number(loaded.maxUnlocked) || 1, 1, LEVELS.length);
      loaded.gold = Math.max(0, Math.floor(Number(loaded.gold) || 0));
      if (loaded.adDaily.date !== todayKey()) loaded.adDaily = fallback.adDaily;
      return loaded;
    } catch (error) {
      console.warn("存档读取失败，使用新存档", error);
      return fallback;
    }
  }

  let profile = loadProfile();
  let battle = null;
  let selectedRuneIndex = null;
  let previewHeroId = profile.selectedHeroId;
  let currentScreenId = "home-screen";
  let pointerStart = null;
  let toastTimer = null;
  let modalOnClose = null;
  let modalClosable = true;
  let audioContext = null;
  let lastFrameTime = performance.now();
  let effectPulse = { type: "idle", startedAt: 0 };

  function saveProfile() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch (error) {
      showToast("存档空间不足");
      console.warn("存档写入失败", error);
    }
  }

  function saveBattleCheckpoint() {
    if (!battle || battle.over) return;
    profile.activeBattle = {
      levelId: battle.level.id,
      heroId: battle.hero.id,
      board: [...battle.board],
      playerHp: battle.playerHp,
      enemyHp: battle.enemyHp,
      energy: battle.energy,
      attackRemaining: battle.attackRemaining,
      skillCooldown: battle.skillCooldown,
      shieldPending: battle.shieldPending,
      freezeRemaining: battle.freezeRemaining,
      reviveUsed: battle.reviveUsed,
      blessing: battle.blessing
    };
    saveProfile();
    renderHome();
  }

  function clearBattleCheckpoint() {
    profile.activeBattle = null;
    saveProfile();
  }

  function showScreen(id) {
    $$(".screen").forEach((screen) => screen.classList.toggle("active", screen.id === id));
    currentScreenId = id;
    if (id === "home-screen") renderHome();
    if (id === "levels-screen") renderLevels();
    if (id === "heroes-screen") renderHeroSelection();
  }

  function showToast(message) {
    const toast = $("#toast");
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 1800);
  }

  function openModal({ title, emblem = "ϟ", body = "", actions = [], closable = true, onClose = null }) {
    const overlay = $("#modal-overlay");
    $("#modal-title").textContent = title;
    $("#modal-emblem").textContent = emblem;
    $("#modal-body").innerHTML = body;
    const actionsNode = $("#modal-actions");
    actionsNode.innerHTML = "";
    actionsNode.classList.toggle("two", actions.length === 2);
    actions.forEach((action) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `command-button ${action.className || "secondary"}`;
      button.textContent = action.label;
      button.disabled = Boolean(action.disabled);
      button.addEventListener("click", () => {
        ensureAudio();
        playSfx("click");
        action.onClick?.();
      });
      actionsNode.append(button);
    });
    modalClosable = closable;
    modalOnClose = onClose;
    $("#modal-close-button").style.display = closable ? "grid" : "none";
    overlay.classList.add("open");
    overlay.setAttribute("aria-hidden", "false");
  }

  function closeModal(force = false) {
    if (!force && !modalClosable) return;
    const callback = modalOnClose;
    modalOnClose = null;
    $("#modal-overlay").classList.remove("open");
    $("#modal-overlay").setAttribute("aria-hidden", "true");
    callback?.();
  }

  function renderHome() {
    const hero = heroById(profile.selectedHeroId);
    $("#home-gold").textContent = profile.gold.toLocaleString("zh-CN");
    $("#home-hero-name").textContent = hero.name;
    $("#home-skill-icon").textContent = hero.skill.icon;
    $("#home-skill-name").textContent = hero.skill.name;
    $("#sound-button").textContent = profile.sound ? "♪" : "×";
    $("#sound-button").setAttribute("aria-label", profile.sound ? "关闭声音" : "打开声音");
    const highest = LEVELS[clamp(profile.maxUnlocked - 1, 0, LEVELS.length - 1)];
    $("#home-progress").textContent = highest.name;
    $("#start-button-label").textContent = profile.activeBattle ? "继续战斗" : "开始征战";
  }

  function renderLevels() {
    $("#levels-gold").textContent = profile.gold.toLocaleString("zh-CN");
    const list = $("#level-list");
    list.innerHTML = "";
    LEVELS.forEach((level, index) => {
      const unlocked = index + 1 <= profile.maxUnlocked;
      const progress = profile.progress[level.id] || { bestStars: 0, claimedGold: 0 };
      const card = document.createElement("button");
      card.type = "button";
      card.className = `level-card${unlocked ? "" : " locked"}`;
      card.disabled = !unlocked;
      card.innerHTML = `
        <span class="level-number">${unlocked ? index + 1 : "×"}</span>
        <span class="level-copy">
          <strong>${level.name}</strong>
          <span>${monsterById(level.monsterId).name} · ${level.interval.toFixed(1)}s</span>
        </span>
        <span class="level-reward">
          <span class="stars">${starText(progress.bestStars)}</span>
          <span class="claimed-gold">G ${progress.claimedGold}/${level.goldBase}</span>
        </span>`;
      if (unlocked) card.addEventListener("click", () => openLevelPreparation(level));
      list.append(card);
    });
  }

  function renderHeroSelection() {
    const hero = heroById(previewHeroId);
    $("#heroes-gold").textContent = profile.gold.toLocaleString("zh-CN");
    $("#hero-role").textContent = hero.role;
    $("#hero-detail-name").textContent = hero.name;
    $("#hero-detail-icon").textContent = hero.skill.icon;
    $("#hero-detail-skill").textContent = hero.skill.name;
    $("#hero-detail-effect").textContent = hero.skill.effect;
    $("#hero-detail-cooldown").textContent = `${hero.skill.cooldown}s`;
    const roster = $("#hero-roster");
    roster.innerHTML = "";
    HEROES.forEach((entry) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `hero-choice${entry.id === hero.id ? " selected" : ""}`;
      button.setAttribute("role", "option");
      button.setAttribute("aria-selected", entry.id === hero.id ? "true" : "false");
      button.innerHTML = `<span style="color:${entry.color}">${entry.mark}</span><small>${entry.short}</small>`;
      button.addEventListener("click", () => {
        previewHeroId = entry.id;
        playSfx("click");
        renderHeroSelection();
      });
      roster.append(button);
    });
  }

  function renderGoldCounters() {
    ["#home-gold", "#levels-gold", "#heroes-gold"].forEach((selector) => {
      const node = $(selector);
      if (node) node.textContent = profile.gold.toLocaleString("zh-CN");
    });
  }

  function starText(stars) {
    return `${"★".repeat(stars)}${"☆".repeat(3 - stars)}`;
  }

  function openLevelPreparation(level) {
    const progress = profile.progress[level.id] || { bestStars: 0, claimedGold: 0 };
    openModal({
      title: level.name,
      emblem: String(LEVELS.indexOf(level) + 1),
      body: `
        <strong>${monsterById(level.monsterId).name}</strong>
        <div class="level-preview">
          <div><span>攻击间隔</span><strong>${level.interval.toFixed(1)}s</strong></div>
          <div><span>怪物攻击</span><strong>${level.monsterAttack}</strong></div>
          <div><span>反击伤害</span><strong>${level.counterDamage}</strong></div>
        </div>
        <div class="level-preview">
          <div><span>历史星级</span><strong>${starText(progress.bestStars)}</strong></div>
          <div><span>已领钻石</span><strong>${progress.claimedGold}</strong></div>
          <div><span>三星钻石</span><strong>${level.goldBase}</strong></div>
        </div>`,
      actions: [
        { label: "直接挑战", className: "secondary", onClick: () => startLevel(level.id, false) },
        { label: "雷神赐福 +10", className: "primary", onClick: () => simulateAd("雷神赐福", () => startLevel(level.id, true)) }
      ]
    });
  }

  function simulateAd(label, onComplete) {
    openModal({
      title: label,
      emblem: "▶",
      body: `<strong>风暴信号连接中</strong><p>···</p>`,
      actions: [],
      closable: false
    });
    setTimeout(() => {
      playSfx("charge");
      onComplete();
    }, 850);
  }

  function createBoard(level) {
    const pool = RUNES.slice(0, level.runeCount).map((rune) => rune.id);
    for (let attempt = 0; attempt < 80; attempt += 1) {
      const board = [];
      for (let index = 0; index < BOARD_SIZE * BOARD_SIZE; index += 1) {
        const row = Math.floor(index / BOARD_SIZE);
        const col = index % BOARD_SIZE;
        let candidates = [...pool];
        if (col >= 2 && board[index - 1] === board[index - 2]) {
          candidates = candidates.filter((id) => id !== board[index - 1]);
        }
        if (row >= 2 && board[index - BOARD_SIZE] === board[index - BOARD_SIZE * 2]) {
          candidates = candidates.filter((id) => id !== board[index - BOARD_SIZE]);
        }
        board.push(candidates[Math.floor(Math.random() * candidates.length)]);
      }
      if (hasPossibleMove(board)) return board;
    }
    return Array.from({ length: BOARD_SIZE * BOARD_SIZE }, (_, index) => pool[index % pool.length]);
  }

  function startLevel(levelId, blessing = false) {
    const level = levelById(levelId);
    const hero = heroById(profile.selectedHeroId);
    battle = {
      level,
      hero,
      monster: monsterById(level.monsterId),
      board: createBoard(level),
      playerHp: level.playerHp,
      enemyHp: level.enemyHp,
      energy: blessing ? 10 : 0,
      attackRemaining: level.interval,
      skillCooldown: 0,
      shieldPending: 0,
      freezeRemaining: 0,
      reviveUsed: 0,
      blessing,
      boardLocked: false,
      paused: false,
      over: false,
      resolvingAttack: false,
      matched: new Set(),
      combo: 0
    };
    selectedRuneIndex = null;
    closeModal(true);
    showScreen("battle-screen");
    renderBoard();
    updateBattleHud();
    showCallout(blessing ? "雷神赐福 · 能量 +10" : "风暴逼近");
    saveBattleCheckpoint();
    playSfx("charge");
  }

  function resumeBattle() {
    const saved = profile.activeBattle;
    if (!saved) return false;
    const level = levelById(saved.levelId);
    const hero = heroById(saved.heroId);
    if (!Array.isArray(saved.board) || saved.board.length !== BOARD_SIZE * BOARD_SIZE) {
      clearBattleCheckpoint();
      return false;
    }
    battle = {
      level,
      hero,
      monster: monsterById(level.monsterId),
      board: [...saved.board],
      playerHp: clamp(Number(saved.playerHp), 1, level.playerHp),
      enemyHp: clamp(Number(saved.enemyHp), 1, level.enemyHp),
      energy: Math.max(0, Number(saved.energy) || 0),
      attackRemaining: clamp(Number(saved.attackRemaining) || level.interval, 0.2, level.interval),
      skillCooldown: Math.max(0, Number(saved.skillCooldown) || 0),
      shieldPending: Number(saved.shieldPending) || 0,
      freezeRemaining: Math.max(0, Number(saved.freezeRemaining) || 0),
      reviveUsed: Number(saved.reviveUsed) || 0,
      blessing: Boolean(saved.blessing),
      boardLocked: false,
      paused: false,
      over: false,
      resolvingAttack: false,
      matched: new Set(),
      combo: 0
    };
    selectedRuneIndex = null;
    showScreen("battle-screen");
    renderBoard();
    updateBattleHud();
    showCallout("战斗恢复");
    return true;
  }

  function findMatches(board) {
    const matches = new Set();
    for (let row = 0; row < BOARD_SIZE; row += 1) {
      let start = 0;
      for (let col = 1; col <= BOARD_SIZE; col += 1) {
        const current = col < BOARD_SIZE ? board[row * BOARD_SIZE + col] : null;
        const first = board[row * BOARD_SIZE + start];
        if (current !== first) {
          if (first && col - start >= 3) {
            for (let run = start; run < col; run += 1) matches.add(row * BOARD_SIZE + run);
          }
          start = col;
        }
      }
    }
    for (let col = 0; col < BOARD_SIZE; col += 1) {
      let start = 0;
      for (let row = 1; row <= BOARD_SIZE; row += 1) {
        const current = row < BOARD_SIZE ? board[row * BOARD_SIZE + col] : null;
        const first = board[start * BOARD_SIZE + col];
        if (current !== first) {
          if (first && row - start >= 3) {
            for (let run = start; run < row; run += 1) matches.add(run * BOARD_SIZE + col);
          }
          start = row;
        }
      }
    }
    return matches;
  }

  function areAdjacent(a, b) {
    const rowA = Math.floor(a / BOARD_SIZE);
    const colA = a % BOARD_SIZE;
    const rowB = Math.floor(b / BOARD_SIZE);
    const colB = b % BOARD_SIZE;
    return Math.abs(rowA - rowB) + Math.abs(colA - colB) === 1;
  }

  function swapBoardValues(board, a, b) {
    [board[a], board[b]] = [board[b], board[a]];
  }

  function hasPossibleMove(board) {
    for (let index = 0; index < board.length; index += 1) {
      const col = index % BOARD_SIZE;
      const candidates = [];
      if (col < BOARD_SIZE - 1) candidates.push(index + 1);
      if (index < board.length - BOARD_SIZE) candidates.push(index + BOARD_SIZE);
      for (const target of candidates) {
        swapBoardValues(board, index, target);
        const valid = findMatches(board).size > 0;
        swapBoardValues(board, index, target);
        if (valid) return true;
      }
    }
    return false;
  }

  function renderBoard() {
    if (!battle) return;
    const boardNode = $("#board");
    boardNode.innerHTML = "";
    battle.board.forEach((runeId, index) => {
      const rune = runeById(runeId);
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "rune-cell";
      if (selectedRuneIndex === index) cell.classList.add("selected");
      if (battle.matched.has(index)) cell.classList.add("matched");
      cell.style.setProperty("--rune-color", rune?.color || "#ffffff");
      cell.dataset.index = String(index);
      cell.setAttribute("role", "gridcell");
      cell.setAttribute("aria-label", `${rune?.name || "空符文"}，第 ${Math.floor(index / BOARD_SIZE) + 1} 行第 ${index % BOARD_SIZE + 1} 列`);
      cell.innerHTML = `<span class="rune-glyph">${rune?.glyph || ""}</span>`;
      cell.addEventListener("pointerdown", onRunePointerDown);
      cell.addEventListener("pointerup", onRunePointerUp);
      cell.addEventListener("pointercancel", () => { pointerStart = null; });
      boardNode.append(cell);
    });
    updateBoardSize();
  }

  function updateBoardSize() {
    const boardNode = $("#board");
    const shell = $(".board-shell");
    if (!boardNode || !shell || currentScreenId !== "battle-screen") return;
    const style = getComputedStyle(shell);
    const availableWidth = shell.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    const availableHeight = shell.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
    const size = Math.max(0, Math.floor(Math.min(390, availableWidth, availableHeight)));
    if (size > 0) {
      boardNode.style.width = `${size}px`;
      boardNode.style.height = `${size}px`;
    }
  }

  function onRunePointerDown(event) {
    if (!battle || battle.boardLocked || battle.paused || battle.over) return;
    event.preventDefault();
    ensureAudio();
    pointerStart = {
      index: Number(event.currentTarget.dataset.index),
      x: event.clientX,
      y: event.clientY
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }

  function onRunePointerUp(event) {
    if (!pointerStart || !battle || battle.boardLocked || battle.paused || battle.over) return;
    event.preventDefault();
    const start = pointerStart;
    pointerStart = null;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 16) {
      handleRuneTap(start.index);
      return;
    }
    const row = Math.floor(start.index / BOARD_SIZE);
    const col = start.index % BOARD_SIZE;
    let targetRow = row;
    let targetCol = col;
    if (Math.abs(dx) > Math.abs(dy)) targetCol += dx > 0 ? 1 : -1;
    else targetRow += dy > 0 ? 1 : -1;
    if (targetRow < 0 || targetRow >= BOARD_SIZE || targetCol < 0 || targetCol >= BOARD_SIZE) return;
    selectedRuneIndex = null;
    attemptSwap(start.index, targetRow * BOARD_SIZE + targetCol);
  }

  function handleRuneTap(index) {
    if (selectedRuneIndex === null) {
      selectedRuneIndex = index;
      playSfx("select");
      renderBoard();
      return;
    }
    if (selectedRuneIndex === index) {
      selectedRuneIndex = null;
      renderBoard();
      return;
    }
    if (areAdjacent(selectedRuneIndex, index)) {
      const first = selectedRuneIndex;
      selectedRuneIndex = null;
      attemptSwap(first, index);
      return;
    }
    selectedRuneIndex = index;
    playSfx("select");
    renderBoard();
  }

  async function attemptSwap(a, b) {
    if (!battle || battle.boardLocked || battle.paused || battle.over || !areAdjacent(a, b)) return;
    battle.boardLocked = true;
    swapBoardValues(battle.board, a, b);
    renderBoard();
    await wait(120);
    const matches = findMatches(battle.board);
    if (!matches.size) {
      swapBoardValues(battle.board, a, b);
      renderBoard();
      [a, b].forEach((index) => $("#board").children[index]?.classList.add("invalid"));
      playSfx("invalid");
      await wait(230);
      battle.boardLocked = false;
      return;
    }
    await resolveCascade(matches);
    if (battle && !battle.over) {
      if (!hasPossibleMove(battle.board)) {
        battle.board = createBoard(battle.level);
        showCallout("棋盘重组");
        renderBoard();
      }
      battle.boardLocked = false;
      saveBattleCheckpoint();
    }
  }

  async function resolveCascade(initialMatches) {
    if (!battle) return;
    let matches = new Set(initialMatches);
    let cascade = 0;
    while (matches.size && battle && !battle.over) {
      cascade += 1;
      battle.combo = cascade;
      battle.matched = matches;
      const gain = matches.size + (cascade > 1 ? 5 : 0);
      battle.energy += gain;
      $("#battle-combo").textContent = cascade > 1 ? `COMBO ×${cascade} +${gain}` : `蓄雷 +${gain}`;
      updateBattleHud();
      renderBoard();
      playSfx(cascade > 1 ? "combo" : "match", cascade);
      await wait(210);
      matches.forEach((index) => { battle.board[index] = null; });
      battle.matched = new Set();
      collapseBoard();
      renderBoard();
      await wait(180);
      matches = findMatches(battle.board);
    }
    if (battle) {
      battle.combo = 0;
      $("#battle-combo").textContent = "READY";
      updateBattleHud();
    }
  }

  function collapseBoard() {
    if (!battle) return;
    const pool = RUNES.slice(0, battle.level.runeCount).map((rune) => rune.id);
    for (let col = 0; col < BOARD_SIZE; col += 1) {
      const values = [];
      for (let row = BOARD_SIZE - 1; row >= 0; row -= 1) {
        const value = battle.board[row * BOARD_SIZE + col];
        if (value) values.push(value);
      }
      for (let row = BOARD_SIZE - 1; row >= 0; row -= 1) {
        battle.board[row * BOARD_SIZE + col] = values[BOARD_SIZE - 1 - row]
          || pool[Math.floor(Math.random() * pool.length)];
      }
    }
  }

  function updateBattleHud() {
    if (!battle) return;
    const levelIndex = LEVELS.indexOf(battle.level) + 1;
    $("#battle-level-index").textContent = `第 ${levelIndex} 关`;
    $("#battle-level-name").textContent = battle.level.name;
    $("#battle-hero-name").textContent = battle.hero.name;
    $("#battle-monster-name").textContent = battle.monster.name;
    $("#player-health-text").textContent = `${Math.max(0, Math.ceil(battle.playerHp))}/${battle.level.playerHp}`;
    $("#enemy-health-text").textContent = `${Math.max(0, Math.ceil(battle.enemyHp))}/${battle.level.enemyHp}`;
    $("#player-health-fill").style.transform = `scaleX(${clamp(battle.playerHp / battle.level.playerHp, 0, 1)})`;
    $("#enemy-health-fill").style.transform = `scaleX(${clamp(battle.enemyHp / battle.level.enemyHp, 0, 1)})`;
    $("#attack-timer-fill").style.transform = `scaleX(${clamp(battle.attackRemaining / battle.level.interval, 0, 1)})`;
    $("#attack-timer-text").textContent = battle.freezeRemaining > 0
      ? `冻结 ${battle.freezeRemaining.toFixed(1)}s`
      : `${Math.max(0, battle.attackRemaining).toFixed(1)}s`;
    $("#energy-text").textContent = `${Math.floor(battle.energy)} / 20`;
    $("#energy-fill").style.transform = `scaleX(${clamp(battle.energy / 20, 0, 1)})`;
    $(".energy-track").classList.toggle("overcharged", battle.energy >= 20);
    $("#battle-skill-icon").textContent = battle.hero.skill.icon;
    $("#battle-skill-name").textContent = battle.hero.skill.name;
    const skillButton = $("#skill-button");
    const pending = battle.hero.skill.type === "shield" && battle.shieldPending > 0;
    const unavailable = battle.skillCooldown > 0 || battle.boardLocked || battle.paused || battle.over || pending;
    skillButton.disabled = unavailable;
    skillButton.classList.toggle("pending", pending);
    $("#battle-skill-cooldown").textContent = pending
      ? "待触发"
      : battle.skillCooldown > 0
        ? `${battle.skillCooldown.toFixed(1)}s`
        : "可释放";
    const cooldownRatio = clamp(battle.skillCooldown / battle.hero.skill.cooldown, 0, 1);
    $("#skill-cooldown-mask").style.height = `${cooldownRatio * 100}%`;
  }

  function showCallout(message) {
    const node = $("#combat-callout");
    node.textContent = message;
    node.classList.remove("show");
    void node.offsetWidth;
    node.classList.add("show");
  }

  function resolveEnemyAttack() {
    if (!battle || battle.over || battle.paused || battle.resolvingAttack) return;
    battle.resolvingAttack = true;
    battle.attackRemaining = battle.level.interval;
    if (battle.shieldPending > 0) {
      battle.shieldPending -= 1;
      showCallout("不灭雷盾 · 完全格挡");
      effectPulse = { type: "shield", startedAt: performance.now() };
      playSfx("shield");
    } else if (battle.energy >= 20) {
      battle.energy -= 20;
      battle.enemyHp = Math.max(0, battle.enemyHp - battle.level.counterDamage);
      showCallout(`天雷反击 · ${battle.level.counterDamage}`);
      effectPulse = { type: "counter", startedAt: performance.now() };
      playSfx("counter");
    } else if (battle.energy >= 10) {
      battle.energy -= 10;
      showCallout("雷盾格挡");
      effectPulse = { type: "shield", startedAt: performance.now() };
      playSfx("shield");
    } else {
      battle.playerHp = Math.max(0, battle.playerHp - battle.level.monsterAttack);
      showCallout(`破甲受击 · ${battle.level.monsterAttack}`);
      effectPulse = { type: "hurt", startedAt: performance.now() };
      playSfx("hurt");
    }
    updateBattleHud();
    battle.resolvingAttack = false;
    saveBattleCheckpoint();
    if (battle.enemyHp <= 0) {
      battle.over = true;
      setTimeout(handleVictory, 650);
    } else if (battle.playerHp <= 0) {
      battle.over = true;
      setTimeout(handleDefeat, 650);
    }
  }

  async function useHeroSkill() {
    if (!battle || battle.over || battle.paused || battle.boardLocked || battle.skillCooldown > 0) return;
    const skill = battle.hero.skill;
    if (skill.type === "shield" && battle.shieldPending > 0) return;
    battle.skillCooldown = skill.cooldown;
    playSfx("charge");
    effectPulse = { type: "skill", startedAt: performance.now() };
    if (skill.type === "addEnergy") {
      battle.energy += skill.value;
      showCallout(`${skill.name} · 能量 +${skill.value}`);
    } else if (skill.type === "shuffle") {
      battle.boardLocked = true;
      showCallout(skill.name);
      await wait(220);
      battle.board = createBoard(battle.level);
      renderBoard();
      battle.boardLocked = false;
    } else if (skill.type === "shield") {
      battle.shieldPending = skill.value;
      showCallout(`${skill.name} · 待触发`);
    } else if (skill.type === "clearMost") {
      battle.boardLocked = true;
      const counts = new Map();
      battle.board.forEach((runeId) => counts.set(runeId, (counts.get(runeId) || 0) + 1));
      const selectedId = [...counts.entries()]
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0][0];
      const selected = new Set();
      battle.board.forEach((runeId, index) => { if (runeId === selectedId) selected.add(index); });
      showCallout(`${skill.name} · ${runeById(selectedId).name}`);
      await resolveCascade(selected);
      battle.boardLocked = false;
    } else if (skill.type === "extendTimer") {
      battle.attackRemaining = Math.min(battle.level.interval, battle.attackRemaining + skill.value);
      showCallout(`${skill.name} · +${skill.value}s`);
    }
    updateBattleHud();
    saveBattleCheckpoint();
  }

  function calculateStars() {
    if (!battle) return 1;
    if (battle.playerHp >= battle.level.playerHp) return 3;
    if (battle.playerHp / battle.level.playerHp >= 0.5) return 2;
    return 1;
  }

  function handleVictory() {
    if (!battle) return;
    battle.paused = true;
    const stars = calculateStars();
    const level = battle.level;
    const previous = profile.progress[level.id] || { bestStars: 0, claimedGold: 0 };
    const targetGold = Math.floor(level.goldBase * STAR_RATES[stars]);
    const grantGold = Math.max(0, targetGold - previous.claimedGold);
    const newBest = Math.max(previous.bestStars, stars);
    profile.gold += grantGold;
    profile.progress[level.id] = {
      bestStars: newBest,
      claimedGold: previous.claimedGold + grantGold
    };
    const index = LEVELS.indexOf(level);
    profile.maxUnlocked = Math.max(profile.maxUnlocked, Math.min(LEVELS.length, index + 2));
    profile.activeBattle = null;
    saveProfile();
    renderGoldCounters();
    playSfx("victory");
    const nextLevel = LEVELS[index + 1];
    openModal({
      title: "雷霆胜利",
      emblem: "★",
      closable: false,
      body: `
        <div class="result-stars">${starText(stars)}</div>
        <div class="result-grid">
          <div class="result-stat"><span>历史最佳</span><strong>${starText(previous.bestStars)} → ${starText(newBest)}</strong></div>
          <div class="result-stat"><span>三星钻石</span><strong>${level.goldBase}</strong></div>
          <div class="result-stat"><span>本次获得</span><strong class="gold-gain">+${grantGold}</strong></div>
          <div class="result-stat"><span>已累计</span><strong>${previous.claimedGold + grantGold}/${level.goldBase}</strong></div>
        </div>`,
      actions: [
        { label: "返回主界面", className: "secondary", onClick: () => leaveBattleToHome() },
        {
          label: nextLevel ? "下一关" : "再次挑战",
          className: "primary",
          onClick: () => nextLevel ? openLevelPreparation(nextLevel) : startLevel(level.id, false)
        }
      ]
    });
  }

  function handleDefeat() {
    if (!battle) return;
    battle.paused = true;
    const remaining = Math.max(0, 3 - profile.adDaily.revive);
    openModal({
      title: "雷铠破碎",
      emblem: "×",
      closable: false,
      body: `<strong>${battle.monster.name}</strong><p>雷霆重生次数：${remaining}/3</p>`,
      actions: [
        {
          label: remaining > 0 ? "雷霆重生" : "今日次数已尽",
          className: "primary",
          disabled: remaining <= 0,
          onClick: () => simulateAd("雷霆重生", reviveBattle)
        },
        { label: "放弃战斗", className: "ghost", onClick: () => leaveBattleToHome() },
        { label: "重新挑战", className: "secondary", onClick: () => startLevel(battle.level.id, false) }
      ]
    });
  }

  function reviveBattle() {
    if (!battle) return;
    profile.adDaily.revive += 1;
    battle.playerHp = Math.min(battle.level.playerHp, 30);
    battle.energy += 10;
    battle.attackRemaining = battle.level.interval;
    battle.paused = false;
    battle.over = false;
    battle.reviveUsed += 1;
    closeModal(true);
    updateBattleHud();
    showCallout("雷霆重生 · HP 30 · 能量 +10");
    saveBattleCheckpoint();
  }

  function leaveBattleToHome() {
    if (battle) {
      battle.paused = true;
      battle.over = true;
    }
    battle = null;
    clearBattleCheckpoint();
    closeModal(true);
    showScreen("home-screen");
  }

  function openPauseMenu() {
    if (!battle || battle.over) return;
    battle.paused = true;
    saveBattleCheckpoint();
    const freezeRemaining = Math.max(0, 5 - profile.adDaily.freeze);
    openModal({
      title: "战斗暂停",
      emblem: "Ⅱ",
      onClose: () => { if (battle && !battle.over) battle.paused = false; },
      body: `<strong>${battle.level.name}</strong><p>风暴眼次数：${freezeRemaining}/5</p>`,
      actions: [
        {
          label: "继续战斗",
          className: "primary",
          onClick: () => { closeModal(true); battle.paused = false; }
        },
        {
          label: freezeRemaining > 0 ? "风暴眼 · 冻结5秒" : "今日次数已尽",
          className: "secondary",
          disabled: freezeRemaining <= 0,
          onClick: () => simulateAd("风暴眼", () => {
            profile.adDaily.freeze += 1;
            battle.freezeRemaining = 5;
            battle.paused = false;
            closeModal(true);
            saveBattleCheckpoint();
            showCallout("风暴眼 · 倒计时冻结");
          })
        },
        { label: "退出战斗", className: "danger", onClick: leaveBattleToHome }
      ]
    });
  }

  function openSettings() {
    openModal({
      title: "设置",
      emblem: "⚙",
      body: `
        <div class="settings-row">
          <span>游戏声音</span>
          <button id="modal-sound-toggle" class="toggle-button ${profile.sound ? "on" : ""}" type="button">${profile.sound ? "开启" : "关闭"}</button>
        </div>
        <div class="settings-row">
          <span>本地进度</span>
          <strong>G ${profile.gold} · ${profile.maxUnlocked}/${LEVELS.length}</strong>
        </div>`,
      actions: [
        { label: "重置进度", className: "danger", onClick: confirmReset },
        { label: "完成", className: "primary", onClick: () => closeModal(true) }
      ]
    });
    setTimeout(() => {
      $("#modal-sound-toggle")?.addEventListener("click", () => {
        profile.sound = !profile.sound;
        saveProfile();
        closeModal(true);
        renderHome();
        openSettings();
      });
    }, 0);
  }

  function confirmReset() {
    openModal({
      title: "重置进度",
      emblem: "!",
      body: "<strong>钻石、星级与解锁关卡将全部清除。</strong>",
      actions: [
        { label: "取消", className: "secondary", onClick: openSettings },
        {
          label: "确认重置",
          className: "danger",
          onClick: () => {
            profile = createDefaultProfile();
            battle = null;
            previewHeroId = profile.selectedHeroId;
            saveProfile();
            closeModal(true);
            showScreen("home-screen");
            showToast("进度已重置");
          }
        }
      ]
    });
  }

  function toggleSound() {
    profile.sound = !profile.sound;
    saveProfile();
    renderHome();
    if (profile.sound) playSfx("click");
  }

  function ensureAudio() {
    if (!profile.sound) return;
    try {
      audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
      if (audioContext.state === "suspended") audioContext.resume();
    } catch (error) {
      profile.sound = false;
    }
  }

  function playTone(frequency, duration, type = "sine", gain = 0.035, delay = 0) {
    if (!profile.sound) return;
    ensureAudio();
    if (!audioContext) return;
    const oscillator = audioContext.createOscillator();
    const volume = audioContext.createGain();
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    volume.gain.setValueAtTime(0.0001, audioContext.currentTime + delay);
    volume.gain.exponentialRampToValueAtTime(gain, audioContext.currentTime + delay + 0.01);
    volume.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + delay + duration);
    oscillator.connect(volume).connect(audioContext.destination);
    oscillator.start(audioContext.currentTime + delay);
    oscillator.stop(audioContext.currentTime + delay + duration + 0.02);
  }

  function playSfx(type, intensity = 1) {
    if (!profile.sound) return;
    const sounds = {
      click: () => playTone(320, 0.08, "square", 0.025),
      select: () => playTone(460, 0.06, "sine", 0.018),
      invalid: () => playTone(120, 0.13, "sawtooth", 0.025),
      match: () => playTone(440, 0.12, "triangle", 0.03),
      combo: () => playTone(520 + intensity * 55, 0.14, "triangle", 0.035),
      charge: () => { playTone(180, 0.18, "sawtooth", 0.025); playTone(560, 0.14, "sine", 0.025, 0.06); },
      shield: () => { playTone(150, 0.2, "square", 0.04); playTone(300, 0.14, "triangle", 0.025); },
      counter: () => { playTone(90, 0.28, "sawtooth", 0.055); playTone(820, 0.2, "square", 0.03, 0.04); },
      hurt: () => playTone(80, 0.25, "sawtooth", 0.05),
      victory: () => [0, 0.12, 0.24].forEach((delay, index) => playTone([392, 523, 659][index], 0.25, "triangle", 0.04, delay))
    };
    sounds[type]?.();
  }

  function resizeCanvas(canvas) {
    const rect = canvas.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return null;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.round(rect.width * dpr));
    const height = Math.max(1, Math.round(rect.height * dpr));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    const context = canvas.getContext("2d");
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { context, width: rect.width, height: rect.height };
  }

  function drawLightning(context, x1, y1, x2, y2, seed, color = "#b9fbff", width = 1.5) {
    const segments = 8;
    context.save();
    context.beginPath();
    context.moveTo(x1, y1);
    for (let step = 1; step < segments; step += 1) {
      const ratio = step / segments;
      const baseX = x1 + (x2 - x1) * ratio;
      const baseY = y1 + (y2 - y1) * ratio;
      const offset = Math.sin(seed * 1.7 + step * 4.21) * 7;
      context.lineTo(baseX + offset, baseY);
    }
    context.lineTo(x2, y2);
    context.strokeStyle = color;
    context.lineWidth = width;
    context.shadowBlur = 9;
    context.shadowColor = color;
    context.stroke();
    context.restore();
  }

  function drawStormBackground(context, width, height, time, intensity = 1) {
    const sky = context.createLinearGradient(0, 0, 0, height);
    sky.addColorStop(0, "#142934");
    sky.addColorStop(0.58, "#0a151c");
    sky.addColorStop(1, "#05090d");
    context.fillStyle = sky;
    context.fillRect(0, 0, width, height);

    context.fillStyle = "rgba(92, 116, 121, 0.12)";
    for (let cloud = 0; cloud < 7; cloud += 1) {
      const x = (cloud * 93 + Math.sin(time * 0.00015 + cloud) * 20) % (width + 80) - 40;
      const y = 24 + (cloud % 3) * 28;
      context.beginPath();
      context.ellipse(x, y, 70, 22, 0, 0, Math.PI * 2);
      context.fill();
    }

    context.fillStyle = "#0c171d";
    const base = height * 0.76;
    for (let column = 0; column < 7; column += 1) {
      const columnWidth = width / 9;
      const x = column * width / 6 - columnWidth * 0.4;
      const top = base - (column % 2) * 24;
      context.fillRect(x, top, columnWidth, height - top);
      context.fillRect(x - 4, top, columnWidth + 8, 5);
    }
    context.fillStyle = "rgba(241, 196, 83, 0.16)";
    context.fillRect(0, base, width, 2);

    context.strokeStyle = `rgba(98, 228, 235, ${0.08 * intensity})`;
    context.lineWidth = 1;
    for (let rain = 0; rain < 28; rain += 1) {
      const x = (rain * 47 + time * 0.035) % (width + 30) - 15;
      const y = (rain * 71 + time * 0.08) % (height + 35) - 20;
      context.beginPath();
      context.moveTo(x, y);
      context.lineTo(x - 4, y + 13);
      context.stroke();
    }
  }

  function drawHero(context, x, y, scale, hero, facing = 1) {
    context.save();
    context.translate(x, y);
    context.scale(scale * facing, scale);

    context.fillStyle = "rgba(0,0,0,0.35)";
    context.beginPath();
    context.ellipse(0, 5, 34, 9, 0, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = hero.id === "c004" ? "#e4dfd0" : "#8b969b";
    context.fillRect(-16, -48, 12, 44);
    context.fillRect(5, -48, 12, 44);
    context.fillStyle = "#343f45";
    context.fillRect(-20, -10, 18, 8);
    context.fillRect(4, -10, 18, 8);

    context.fillStyle = hero.id === "c002" || hero.id === "c005" ? "#753a3e" : "#8f343c";
    context.beginPath();
    context.moveTo(-26, -102);
    context.lineTo(-40, -42);
    context.lineTo(-5, -56);
    context.closePath();
    context.fill();

    const armor = context.createLinearGradient(-25, -110, 28, -45);
    armor.addColorStop(0, "#d9e2e4");
    armor.addColorStop(0.5, "#536269");
    armor.addColorStop(1, "#1e292f");
    context.fillStyle = armor;
    context.beginPath();
    context.moveTo(-27, -104);
    context.lineTo(26, -104);
    context.lineTo(22, -50);
    context.lineTo(-20, -50);
    context.closePath();
    context.fill();
    context.strokeStyle = hero.color;
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(-18, -94);
    context.lineTo(6, -70);
    context.lineTo(18, -94);
    context.stroke();

    context.fillStyle = "#b9866f";
    context.beginPath();
    context.arc(0, -121, 13, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "#303c43";
    context.beginPath();
    context.moveTo(-16, -127);
    context.lineTo(0, -142);
    context.lineTo(17, -126);
    context.lineTo(13, -113);
    context.lineTo(-13, -113);
    context.closePath();
    context.fill();
    context.strokeStyle = hero.accent;
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(-10, -121);
    context.lineTo(10, -121);
    context.stroke();

    context.fillStyle = "#68767c";
    context.beginPath();
    context.arc(-29, -96, 11, 0, Math.PI * 2);
    context.arc(29, -96, 11, 0, Math.PI * 2);
    context.fill();

    context.strokeStyle = "#69767b";
    context.lineWidth = 9;
    context.lineCap = "round";
    context.beginPath();
    context.moveTo(-28, -94);
    context.lineTo(-36, -60);
    context.moveTo(28, -94);
    context.lineTo(38, -60);
    context.stroke();

    drawHeroWeapon(context, hero);
    drawLightning(context, -7, -95, 13, -58, 2.4, hero.color, 1.4);
    context.restore();
  }

  function drawHeroWeapon(context, hero) {
    context.save();
    context.strokeStyle = "#cbd6d9";
    context.fillStyle = "#48565c";
    context.lineWidth = 5;
    if (hero.id === "c001") {
      context.beginPath();
      context.moveTo(38, -64);
      context.lineTo(50, -125);
      context.stroke();
      context.fillRect(37, -132, 27, 16);
      context.strokeStyle = hero.color;
      context.strokeRect(39, -130, 23, 12);
      context.fillStyle = "#253238";
      context.beginPath();
      context.arc(-39, -72, 22, 0, Math.PI * 2);
      context.fill();
      context.strokeStyle = hero.accent;
      context.lineWidth = 2;
      context.stroke();
    } else if (hero.id === "c002") {
      context.lineWidth = 4;
      context.beginPath();
      context.moveTo(-36, -60);
      context.lineTo(-56, -122);
      context.moveTo(38, -60);
      context.lineTo(58, -124);
      context.stroke();
      drawLightning(context, -56, -122, -36, -60, 4.2, hero.color, 2);
      drawLightning(context, 58, -124, 38, -60, 6.2, hero.accent, 2);
    } else if (hero.id === "c003") {
      context.fillStyle = "#2f3c42";
      context.fillRect(-60, -118, 39, 70);
      context.strokeStyle = hero.accent;
      context.lineWidth = 3;
      context.strokeRect(-58, -116, 35, 66);
      context.beginPath();
      context.arc(-40, -83, 11, 0, Math.PI * 2);
      context.stroke();
    } else if (hero.id === "c004") {
      context.strokeStyle = "#d6c89f";
      context.lineWidth = 4;
      context.beginPath();
      context.moveTo(39, -54);
      context.lineTo(52, -139);
      context.stroke();
      context.strokeStyle = hero.color;
      context.lineWidth = 2;
      context.beginPath();
      context.arc(52, -143, 13, 0, Math.PI * 2);
      context.stroke();
      context.fillStyle = hero.accent;
      context.fillText("✦", 46, -137);
    } else {
      context.strokeStyle = "#9fc5bf";
      context.lineWidth = 4;
      context.beginPath();
      context.moveTo(35, -68);
      context.lineTo(64, -92);
      context.moveTo(45, -105);
      context.lineTo(64, -92);
      context.lineTo(48, -78);
      context.stroke();
      context.strokeStyle = hero.color;
      context.beginPath();
      context.moveTo(48, -106);
      context.lineTo(48, -78);
      context.stroke();
    }
    context.restore();
  }

  function drawMonster(context, x, y, scale, monster) {
    context.save();
    context.translate(x, y);
    context.scale(scale, scale);
    context.fillStyle = "rgba(0,0,0,0.38)";
    context.beginPath();
    context.ellipse(0, 4, 38, 9, 0, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = monster.color;
    context.strokeStyle = "#20272b";
    context.lineWidth = 3;

    if (monster.kind === "hound") {
      context.beginPath();
      context.ellipse(0, -48, 38, 22, -0.1, 0, Math.PI * 2);
      context.fill(); context.stroke();
      context.beginPath();
      context.moveTo(25, -58); context.lineTo(54, -72); context.lineTo(47, -41); context.closePath();
      context.fill(); context.stroke();
      [-25, -8, 18, 32].forEach((leg) => context.fillRect(leg, -34, 8, 35));
      context.fillStyle = "#f1c453";
      context.fillRect(42, -60, 5, 4);
    } else if (monster.kind === "executioner") {
      context.fillRect(-31, -96, 62, 86);
      context.beginPath(); context.arc(0, -111, 24, 0, Math.PI * 2); context.fill(); context.stroke();
      context.strokeStyle = "#8f9aa0"; context.lineWidth = 7;
      context.beginPath(); context.moveTo(25, -82); context.lineTo(60, -136); context.stroke();
      context.fillStyle = "#374147"; context.fillRect(50, -151, 26, 32);
    } else if (monster.kind === "armor") {
      context.beginPath();
      context.moveTo(-40, -98); context.lineTo(0, -132); context.lineTo(42, -98); context.lineTo(30, -29); context.lineTo(-30, -29); context.closePath();
      context.fill(); context.stroke();
      [0, Math.PI * 0.66, Math.PI * 1.33].forEach((angle) => {
        context.strokeStyle = "#a993df"; context.lineWidth = 3;
        context.beginPath(); context.arc(Math.cos(angle) * 42, -84 + Math.sin(angle) * 28, 13, 0, Math.PI * 2); context.stroke();
      });
    } else if (monster.kind === "idol") {
      context.fillRect(-45, -103, 90, 94);
      context.fillStyle = "#524b42";
      context.fillRect(-34, -127, 68, 35);
      context.strokeStyle = "#f1c453"; context.lineWidth = 4;
      context.beginPath(); context.arc(0, -64, 21, 0, Math.PI * 2); context.stroke();
      context.beginPath(); context.arc(0, -64, 10, 0, Math.PI * 2); context.stroke();
    } else if (monster.kind === "siren") {
      context.beginPath(); context.arc(0, -116, 17, 0, Math.PI * 2); context.fill();
      context.beginPath(); context.moveTo(-24, -103); context.lineTo(0, -34); context.lineTo(24, -103); context.closePath(); context.fill();
      context.strokeStyle = "#62e4eb"; context.lineWidth = 5;
      context.beginPath(); context.moveTo(-19, -97); context.quadraticCurveTo(-67, -120, -54, -46); context.moveTo(19, -97); context.quadraticCurveTo(67, -120, 54, -46); context.stroke();
    } else {
      context.fillRect(-39, -103, 78, 82);
      context.beginPath(); context.arc(0, -122, 24, 0, Math.PI * 2); context.fill(); context.stroke();
      context.strokeStyle = "#f1c453"; context.lineWidth = 4;
      context.beginPath(); context.moveTo(-25, -139); context.lineTo(-10, -155); context.lineTo(0, -140); context.lineTo(11, -157); context.lineTo(27, -139); context.stroke();
      context.fillStyle = "#5a4239"; context.fillRect(-58, -22, 116, 25);
    }
    drawLightning(context, -20, -87, 26, -48, monster.id.charCodeAt(3), "#e7fbff", 1.2);
    context.restore();
  }

  function drawAmbient(time) {
    const canvas = $("#ambient-canvas");
    const resized = resizeCanvas(canvas);
    if (!resized) return;
    const { context, width, height } = resized;
    drawStormBackground(context, width, height, time, 0.65);
    const flash = (Math.sin(time * 0.00037) + 1) * 0.5;
    if (flash > 0.97) drawLightning(context, width * 0.75, 0, width * 0.58, height * 0.32, time * 0.001, "rgba(185,251,255,0.42)", 1);
  }

  function drawHeroCanvas(canvas, hero, time) {
    const resized = resizeCanvas(canvas);
    if (!resized) return;
    const { context, width, height } = resized;
    drawStormBackground(context, width, height, time, 1);
    drawLightning(context, width * 0.18, 0, width * 0.35, height * 0.45, time * 0.001, "rgba(185,251,255,0.55)", 1.4);
    drawHero(context, width * 0.5, height * 0.88, Math.min(width / 290, height / 190), hero, 1);
    context.fillStyle = "rgba(241,196,83,0.22)";
    context.fillRect(0, height - 3, width, 3);
  }

  function drawBattleCanvas(time) {
    if (!battle) return;
    const canvas = $("#battle-canvas");
    const resized = resizeCanvas(canvas);
    if (!resized) return;
    const { context, width, height } = resized;
    drawStormBackground(context, width, height, time, 1.25);
    const scale = Math.min(width / 420, height / 210) * 0.82;
    drawHero(context, width * 0.24, height * 0.92, scale, battle.hero, 1);
    drawMonster(context, width * 0.76, height * 0.92, scale, battle.monster);
    const pulseAge = (time - effectPulse.startedAt) / 1000;
    if (pulseAge >= 0 && pulseAge < 0.65) {
      const alpha = 1 - pulseAge / 0.65;
      if (effectPulse.type === "counter" || effectPulse.type === "skill") {
        drawLightning(context, width * 0.38, height * 0.14, width * 0.72, height * 0.68, time * 0.02, `rgba(241,196,83,${alpha})`, 3);
      } else if (effectPulse.type === "hurt") {
        context.fillStyle = `rgba(255,108,105,${alpha * 0.26})`;
        context.fillRect(0, 0, width, height);
      } else if (effectPulse.type === "shield") {
        context.strokeStyle = `rgba(98,228,235,${alpha})`;
        context.lineWidth = 4;
        context.beginPath();
        context.arc(width * 0.24, height * 0.58, 45 + pulseAge * 18, 0, Math.PI * 2);
        context.stroke();
      }
    }
  }

  function frame(time) {
    const delta = Math.min(0.12, Math.max(0, (time - lastFrameTime) / 1000));
    lastFrameTime = time;
    drawAmbient(time);
    if (currentScreenId === "home-screen") drawHeroCanvas($("#hero-canvas"), heroById(profile.selectedHeroId), time);
    if (currentScreenId === "heroes-screen") drawHeroCanvas($("#select-hero-canvas"), heroById(previewHeroId), time);
    if (currentScreenId === "battle-screen" && battle) {
      drawBattleCanvas(time);
      if (!battle.paused && !battle.over) {
        battle.skillCooldown = Math.max(0, battle.skillCooldown - delta);
        if (battle.freezeRemaining > 0) battle.freezeRemaining = Math.max(0, battle.freezeRemaining - delta);
        else battle.attackRemaining -= delta;
        if (battle.attackRemaining <= 0) resolveEnemyAttack();
        updateBattleHud();
      }
    }
    requestAnimationFrame(frame);
  }

  function bindEvents() {
    $("#sound-button").addEventListener("click", () => { ensureAudio(); toggleSound(); });
    $("#settings-button").addEventListener("click", () => { ensureAudio(); playSfx("click"); openSettings(); });
    $("#levels-button").addEventListener("click", () => { playSfx("click"); showScreen("levels-screen"); });
    $("#heroes-button").addEventListener("click", () => {
      playSfx("click");
      previewHeroId = profile.selectedHeroId;
      showScreen("heroes-screen");
    });
    $("#start-button").addEventListener("click", () => {
      ensureAudio();
      playSfx("click");
      if (!resumeBattle()) openLevelPreparation(LEVELS[profile.maxUnlocked - 1]);
    });
    $$(".back-button").forEach((button) => button.addEventListener("click", () => {
      playSfx("click");
      showScreen("home-screen");
    }));
    $("#deploy-hero-button").addEventListener("click", () => {
      profile.selectedHeroId = previewHeroId;
      saveProfile();
      playSfx("charge");
      showScreen("home-screen");
      showToast(`${heroById(previewHeroId).name} 已出战`);
    });
    $("#battle-exit-button").addEventListener("click", openPauseMenu);
    $("#skill-button").addEventListener("click", () => { ensureAudio(); useHeroSkill(); });
    $("#modal-close-button").addEventListener("click", () => closeModal(false));
    $("#modal-overlay").addEventListener("pointerdown", (event) => {
      if (event.target === event.currentTarget) closeModal(false);
    });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden && battle && !battle.over) {
        battle.paused = true;
        saveBattleCheckpoint();
      }
    });
    window.addEventListener("beforeunload", saveBattleCheckpoint);
    window.addEventListener("resize", updateBoardSize);
  }

  function initialize() {
    bindEvents();
    renderHome();
    renderHeroSelection();
    requestAnimationFrame(frame);
  }

  initialize();
})();
