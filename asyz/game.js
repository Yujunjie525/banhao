(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const lerp = (from, to, amount) => from + (to - from) * amount;
  const keyOf = (x, y) => `${x},${y}`;
  const PROFILE_KEY = "arcane-warrior-h5-profile-v1";

  const GLOBAL = {
    maxStamina: 30,
    staminaRecoverIntervalSec: 360,
    analysisWidth: 5,
    analysisHeight: 5,
    analysisCooldownSec: 0.6,
    analysisShakePx: 2,
    analysisShakeHz: 12,
    monsterWakeSec: 3
  };

  const HEROES = [
    { id: "C001", name: "奥术勇者", speed: 4.0, size: 0.4, color: "#59d4b3", accent: "#d8b25b", cloak: "#354449" },
    { id: "C002", name: "星界旅者", speed: 4.7, size: 0.36, color: "#77c7db", accent: "#d7c58a", cloak: "#344e67" },
    { id: "C003", name: "符文智者", speed: 3.5, size: 0.4, color: "#d8b25b", accent: "#8ed2c1", cloak: "#77766d" },
    { id: "C004", name: "秘银斥候", speed: 3.9, size: 0.32, color: "#b8c7c7", accent: "#c75b4a", cloak: "#48565a" },
    { id: "C005", name: "回廊行者", speed: 4.3, size: 0.38, color: "#85b583", accent: "#d8b25b", cloak: "#334d41" }
  ];

  const MONSTERS = {
    M001: {
      id: "M001", name: "噬能魔影", role: "基础追兵", speed: 2.5, size: 1, lifetime: 15,
      behavior: "standard_chase", color: "#4ec0b0", accent: "#16292b"
    },
    M002: {
      id: "M002", name: "符文巨像", role: "空间压迫", speed: 1.5, size: 2, lifetime: 25,
      behavior: "standard_chase", color: "#9b7448", accent: "#d6b35e"
    },
    M003: {
      id: "M003", name: "裂隙猎犬", role: "突进追兵", speed: 3.0, size: 1, lifetime: 10,
      behavior: "dash_chase", dashEvery: 5, dashCharge: 0.6, dashDistance: 2,
      color: "#b95147", accent: "#d8c5a2"
    },
    M004: {
      id: "M004", name: "秘法监视者", role: "路线截击", speed: 2.0, size: 1, lifetime: 18,
      behavior: "predictive_chase", predictionInterval: 3, predictionDistance: 2,
      color: "#8c79b4", accent: "#d8b25b"
    },
    M005: {
      id: "M005", name: "穿行秘偶", role: "集群穿插", speed: 2.2, size: 1, lifetime: 14,
      behavior: "phase_chase", ignoreSoftCollision: true,
      color: "#cabd91", accent: "#5b7f7c"
    }
  };

  const LEVELS = [
    {
      id: "L001", name: "初识回廊", width: 10, height: 10, targetTime: 90, speedMultiplier: 1.0,
      start: { x: 1, y: 1 }, exit: { x: 8, y: 8 },
      blocked: [{ x: 5, y: 0 }, { x: 5, y: 1 }, { x: 5, y: 8 }, { x: 5, y: 9 }],
      seals: [
        { x: 4, y: 3, monsterId: "M001" },
        { x: 6, y: 2, monsterId: "M004" },
        { x: 4, y: 7, monsterId: "M003" }
      ]
    },
    {
      id: "L002", name: "铜印中庭", width: 15, height: 10, targetTime: 120, speedMultiplier: 1.15,
      start: { x: 0, y: 5 }, exit: { x: 14, y: 5 },
      blocked: [
        { x: 6, y: 0 }, { x: 6, y: 1 }, { x: 6, y: 2 },
        { x: 8, y: 7 }, { x: 8, y: 8 }, { x: 8, y: 9 }
      ],
      seals: [
        { x: 4, y: 4, monsterId: "M001" },
        { x: 4, y: 6, monsterId: "M003" },
        { x: 9, y: 5, monsterId: "M002" },
        { x: 11, y: 8, monsterId: "M004" },
        { x: 12, y: 2, monsterId: "M005" }
      ]
    },
    {
      id: "L003", name: "永夜钟庭", width: 20, height: 15, targetTime: 180, speedMultiplier: 1.3,
      start: { x: 1, y: 1 }, exit: { x: 18, y: 13 },
      blocked: [
        { x: 7, y: 0 }, { x: 7, y: 1 }, { x: 7, y: 2 },
        { x: 12, y: 12 }, { x: 12, y: 13 }, { x: 12, y: 14 }
      ],
      seals: [
        { x: 5, y: 5, monsterId: "M002" },
        { x: 10, y: 7, monsterId: "M002" },
        { x: 15, y: 3, monsterId: "M004" },
        { x: 16, y: 12, monsterId: "M003" },
        { x: 8, y: 10, monsterId: "M001" },
        { x: 13, y: 9, monsterId: "M005" }
      ]
    }
  ];

  const screens = $$(".screen");
  const modalOverlay = $("#modal-overlay");
  const input = { joystickX: 0, joystickY: 0, keys: new Set(), lastX: 0, lastY: 0 };
  let currentScreen = "home-screen";
  let selectedLevelId = "L001";
  let previewHeroId = "C001";
  let battle = null;
  let lastFrame = performance.now();
  let toastTimer = 0;
  let audioContext = null;
  let musicNodes = [];

  function defaultProfile() {
    return {
      saveVersion: "1.0.0",
      stamina: GLOBAL.maxStamina,
      staminaUpdatedAt: Date.now(),
      selectedHeroId: "C001",
      maxUnlockedLevel: 1,
      stars: {},
      tutorialStep: 0,
      music: true,
      sfx: true,
      vibration: true
    };
  }

  function loadProfile() {
    try {
      const saved = JSON.parse(localStorage.getItem(PROFILE_KEY));
      return { ...defaultProfile(), ...saved, stars: { ...(saved?.stars || {}) } };
    } catch (error) {
      return defaultProfile();
    }
  }

  let profile = loadProfile();

  function saveProfile() {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  }

  function recoverStamina() {
    const now = Date.now();
    if (profile.stamina >= GLOBAL.maxStamina) {
      profile.stamina = GLOBAL.maxStamina;
      profile.staminaUpdatedAt = now;
      return;
    }
    const elapsed = Math.floor((now - profile.staminaUpdatedAt) / 1000);
    const recovered = Math.floor(elapsed / GLOBAL.staminaRecoverIntervalSec);
    if (recovered > 0) {
      profile.stamina = Math.min(GLOBAL.maxStamina, profile.stamina + recovered);
      profile.staminaUpdatedAt += recovered * GLOBAL.staminaRecoverIntervalSec * 1000;
      saveProfile();
    }
  }

  function heroById(id) {
    return HEROES.find((hero) => hero.id === id) || HEROES[0];
  }

  function levelById(id) {
    return LEVELS.find((level) => level.id === id) || LEVELS[0];
  }

  function levelIndex(level) {
    return LEVELS.indexOf(level);
  }

  function showScreen(id) {
    currentScreen = id;
    screens.forEach((screen) => screen.classList.toggle("active", screen.id === id));
    if (id === "home-screen") renderHome();
    if (id === "levels-screen") renderLevels();
    if (id === "heroes-screen") renderHeroes();
  }

  function showToast(message) {
    const toast = $("#toast");
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 1500);
  }

  function openModal({ title, emblem = "◇", body = "", actions = [], onBackdrop = null }) {
    $("#modal-title").textContent = title;
    $("#modal-emblem").textContent = emblem;
    $("#modal-body").innerHTML = body;
    const actionsRoot = $("#modal-actions");
    actionsRoot.innerHTML = "";
    actions.forEach((action) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `command-button ${action.className || "secondary"}`;
      button.textContent = action.label;
      button.disabled = Boolean(action.disabled);
      button.addEventListener("click", () => {
        playSfx("click");
        action.onClick?.();
      });
      actionsRoot.appendChild(button);
    });
    modalOverlay.classList.add("open");
    modalOverlay.setAttribute("aria-hidden", "false");
    modalOverlay._onBackdrop = onBackdrop;
  }

  function closeModal() {
    modalOverlay.classList.remove("open");
    modalOverlay.setAttribute("aria-hidden", "true");
    modalOverlay._onBackdrop = null;
  }

  function renderHome() {
    recoverStamina();
    const hero = heroById(profile.selectedHeroId);
    $("#home-stamina").textContent = `${profile.stamina}/${GLOBAL.maxStamina}`;
    $("#home-hero-name").textContent = hero.name;
    $("#home-hero-stats").textContent = `移速 ${hero.speed.toFixed(1)} · 体型 ${hero.size.toFixed(2)}`;
  }

  function renderLevels() {
    recoverStamina();
    $("#levels-stamina").textContent = `${profile.stamina}/${GLOBAL.maxStamina}`;
    const root = $("#level-list");
    root.innerHTML = "";
    LEVELS.forEach((level, index) => {
      const locked = index + 1 > profile.maxUnlockedLevel;
      const button = document.createElement("button");
      button.type = "button";
      button.className = `level-card ${selectedLevelId === level.id ? "selected" : ""} ${locked ? "locked" : ""}`;
      button.disabled = locked;
      const stars = profile.stars[level.id] || 0;
      button.innerHTML = `
        <span class="level-index">${String(index + 1).padStart(2, "0")}</span>
        <strong>${level.name}</strong>
        <small>目标 ${level.targetTime} 秒<br>魔物速度 ×${level.speedMultiplier.toFixed(2)}</small>
        <span class="stars">${"★".repeat(stars)}${"☆".repeat(3 - stars)}</span>`;
      button.addEventListener("click", () => {
        selectedLevelId = level.id;
        playSfx("select");
        renderLevels();
      });
      root.appendChild(button);
    });
    const selected = levelById(selectedLevelId);
    $("#selected-level-name").textContent = selected.name;
    $("#selected-level-detail").textContent = `目标 ${selected.targetTime} 秒 · 怪物速度 ×${selected.speedMultiplier.toFixed(2)}`;
    const locked = levelIndex(selected) + 1 > profile.maxUnlockedLevel;
    $("#level-enter-button").disabled = locked;
  }

  function renderHeroes() {
    const hero = heroById(previewHeroId);
    $("#selected-hero-name").textContent = hero.name;
    $("#selected-hero-speed").textContent = hero.speed.toFixed(1);
    $("#selected-hero-size").textContent = hero.size.toFixed(2);
    const root = $("#hero-roster");
    root.innerHTML = "";
    HEROES.forEach((item, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `hero-choice ${item.id === previewHeroId ? "selected" : ""}`;
      button.setAttribute("role", "option");
      button.setAttribute("aria-selected", item.id === previewHeroId ? "true" : "false");
      button.innerHTML = `<span>${index + 1}</span><strong>${item.name}</strong>`;
      button.addEventListener("click", () => {
        previewHeroId = item.id;
        playSfx("select");
        renderHeroes();
      });
      root.appendChild(button);
    });
    $("#deploy-button").textContent = profile.selectedHeroId === previewHeroId ? "当前出战" : "设为出战";
  }

  function openSettings() {
    openModal({
      title: "设置",
      emblem: "⚙",
      body: `
        <div class="settings-list">
          <div class="settings-row"><span>音乐</span><button id="music-toggle" class="toggle-button ${profile.music ? "on" : ""}" type="button" aria-label="切换音乐"></button></div>
          <div class="settings-row"><span>音效</span><button id="sfx-toggle" class="toggle-button ${profile.sfx ? "on" : ""}" type="button" aria-label="切换音效"></button></div>
          <div class="settings-row"><span>振动</span><button id="vibration-toggle" class="toggle-button ${profile.vibration ? "on" : ""}" type="button" aria-label="切换振动"></button></div>
          <div class="settings-row"><span>新手引导</span><button id="tutorial-reset" class="command-button ghost" type="button">重置</button></div>
        </div>`,
      actions: [{ label: "关闭", className: "primary", onClick: closeModal }],
      onBackdrop: closeModal
    });
    $("#music-toggle").addEventListener("click", () => {
      profile.music = !profile.music;
      saveProfile();
      profile.music ? startMusic() : stopMusic();
      openSettings();
    });
    $("#sfx-toggle").addEventListener("click", () => {
      profile.sfx = !profile.sfx;
      saveProfile();
      openSettings();
    });
    $("#vibration-toggle").addEventListener("click", () => {
      profile.vibration = !profile.vibration;
      saveProfile();
      openSettings();
    });
    $("#tutorial-reset").addEventListener("click", () => {
      profile.tutorialStep = 0;
      saveProfile();
      closeModal();
      showToast("新手引导已重置");
    });
  }

  function formatTime(seconds) {
    const total = Math.max(0, Math.floor(seconds));
    return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
  }

  function starsText(count) {
    return `${"★".repeat(count)}${"☆".repeat(3 - count)}`;
  }

  function ensureAudio() {
    try {
      audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
      if (audioContext.state === "suspended") audioContext.resume();
      if (profile.music) startMusic();
    } catch (error) {
      profile.music = false;
      profile.sfx = false;
    }
  }

  function startMusic() {
    if (!profile.music || !audioContext || musicNodes.length) return;
    const gain = audioContext.createGain();
    gain.gain.value = 0.008;
    gain.connect(audioContext.destination);
    [55, 82.5].forEach((frequency, index) => {
      const oscillator = audioContext.createOscillator();
      oscillator.type = index ? "triangle" : "sine";
      oscillator.frequency.value = frequency;
      oscillator.connect(gain);
      oscillator.start();
      musicNodes.push(oscillator);
    });
    musicNodes.push(gain);
  }

  function stopMusic() {
    musicNodes.forEach((node) => {
      try { node.stop?.(); } catch (error) { /* already stopped */ }
      try { node.disconnect?.(); } catch (error) { /* already disconnected */ }
    });
    musicNodes = [];
  }

  function playTone(frequency, duration = 0.1, type = "sine", volume = 0.025, delay = 0) {
    if (!profile.sfx) return;
    ensureAudio();
    if (!audioContext) return;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, audioContext.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(volume, audioContext.currentTime + delay + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + delay + duration);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start(audioContext.currentTime + delay);
    oscillator.stop(audioContext.currentTime + delay + duration + 0.03);
  }

  function playSfx(type) {
    const sounds = {
      click: () => playTone(280, 0.07, "square", 0.018),
      select: () => playTone(410, 0.08, "triangle", 0.02),
      analyzeHold: () => playTone(170, 0.22, "sine", 0.018),
      analyze: () => { playTone(260, 0.14, "triangle", 0.028); playTone(520, 0.16, "sine", 0.018, 0.04); },
      seal: () => { playTone(105, 0.25, "sawtooth", 0.035); playTone(360, 0.18, "square", 0.018, 0.08); },
      wake: () => playTone(145, 0.2, "square", 0.03),
      fade: () => playTone(620, 0.22, "sine", 0.022),
      fail: () => playTone(75, 0.35, "sawtooth", 0.04),
      win: () => [0, 0.12, 0.24].forEach((delay, i) => playTone([392, 523, 659][i], 0.3, "triangle", 0.035, delay))
    };
    sounds[type]?.();
  }

  function vibrate(pattern) {
    if (profile.vibration && navigator.vibrate) navigator.vibrate(pattern);
  }

  function openStaminaModal() {
    openModal({
      title: "体力不足",
      emblem: "◆",
      body: `<p>当前体力 ${profile.stamina}/${GLOBAL.maxStamina}</p>`,
      actions: [
        {
          label: "补给 5 点",
          className: "primary",
          onClick: () => {
            profile.stamina = Math.min(GLOBAL.maxStamina, profile.stamina + 5);
            profile.staminaUpdatedAt = Date.now();
            saveProfile();
            closeModal();
            renderHome();
            showToast("体力已补给");
          }
        },
        { label: "返回", className: "ghost", onClick: closeModal }
      ]
    });
  }

  function startSelectedLevel() {
    startLevel(levelById(selectedLevelId));
  }

  function startLevel(level) {
    recoverStamina();
    if (levelIndex(level) + 1 > profile.maxUnlockedLevel) {
      showToast("关卡尚未解锁");
      return false;
    }
    if (profile.stamina < 1) {
      openStaminaModal();
      return false;
    }

    ensureAudio();
    profile.stamina -= 1;
    profile.staminaUpdatedAt = Date.now();
    saveProfile();
    selectedLevelId = level.id;

    const blocked = new Set(level.blocked.map((point) => keyOf(point.x, point.y)));
    const revealed = Array.from({ length: level.height }, () => Array(level.width).fill(false));
    revealed[level.start.y][level.start.x] = true;

    battle = {
      level,
      hero: heroById(profile.selectedHeroId),
      player: { x: level.start.x + 0.5, y: level.start.y + 0.5, facing: 1 },
      blocked,
      revealed,
      seals: level.seals.map((seal, index) => ({ ...seal, key: `${seal.x},${seal.y},${index}`, awakened: false })),
      brokenSeals: new Set(),
      monsters: [],
      effects: [],
      elapsed: 0,
      paused: false,
      over: false,
      analysisHolding: false,
      analysisPointerId: null,
      analysisCooldown: 0,
      camera: { x: 0, y: 0 },
      cellSize: 48,
      tutorialStep: profile.tutorialStep === 0 && level.id === "L001" ? 101 : 0,
      tutorialTarget: null,
      stats: { spawned: 0, faded: 0, maxActive: 0 }
    };

    resetInput();
    $("#battle-level-name").textContent = level.name;
    showScreen("battle-screen");
    updateBattleHud();
    return true;
  }

  function resetInput() {
    input.joystickX = 0;
    input.joystickY = 0;
    input.keys.clear();
    const knob = $("#joystick-knob");
    if (knob) knob.style.transform = "translate(-50%, -50%)";
  }

  function isInside(level, x, y) {
    return x >= 0 && y >= 0 && x < level.width && y < level.height;
  }

  function isTileWalkable(x, y) {
    if (!battle || !isInside(battle.level, x, y)) return false;
    return battle.revealed[y][x] && !battle.blocked.has(keyOf(x, y));
  }

  function circleRectOverlap(cx, cy, radius, left, top, right, bottom) {
    const closestX = clamp(cx, left, right);
    const closestY = clamp(cy, top, bottom);
    const dx = cx - closestX;
    const dy = cy - closestY;
    return dx * dx + dy * dy < radius * radius;
  }

  function canPlayerStandAt(x, y) {
    const radius = battle.hero.size;
    const minX = Math.floor(x - radius);
    const maxX = Math.floor(x + radius);
    const minY = Math.floor(y - radius);
    const maxY = Math.floor(y + radius);
    for (let tileY = minY; tileY <= maxY; tileY += 1) {
      for (let tileX = minX; tileX <= maxX; tileX += 1) {
        if (isTileWalkable(tileX, tileY)) continue;
        if (circleRectOverlap(x, y, radius, tileX, tileY, tileX + 1, tileY + 1)) return false;
      }
    }
    return true;
  }

  function movePlayer(dx, dy, delta) {
    if (!battle || (!dx && !dy)) return;
    const length = Math.hypot(dx, dy) || 1;
    const nx = dx / length;
    const ny = dy / length;
    input.lastX = nx;
    input.lastY = ny;
    battle.player.facing = nx < -0.05 ? -1 : nx > 0.05 ? 1 : battle.player.facing;
    const distance = battle.hero.speed * delta;
    const nextX = battle.player.x + nx * distance;
    const nextY = battle.player.y + ny * distance;
    if (canPlayerStandAt(nextX, battle.player.y)) battle.player.x = nextX;
    if (canPlayerStandAt(battle.player.x, nextY)) battle.player.y = nextY;

    const playerCellX = Math.floor(battle.player.x);
    const playerCellY = Math.floor(battle.player.y);
    if (battle.tutorialStep === 102 && battle.tutorialTarget && playerCellX === battle.tutorialTarget.x && playerCellY === battle.tutorialTarget.y) {
      battle.tutorialStep = 0;
      battle.tutorialTarget = null;
      profile.tutorialStep = 102;
      saveProfile();
      playSfx("select");
      showToast("引导完成");
    }

    if (battle.revealed[battle.level.exit.y][battle.level.exit.x]
      && playerCellX === battle.level.exit.x && playerCellY === battle.level.exit.y) {
      finishBattle(true);
    }
  }

  function movementVector() {
    let x = input.joystickX;
    let y = input.joystickY;
    if (input.keys.has("ArrowLeft") || input.keys.has("KeyA")) x -= 1;
    if (input.keys.has("ArrowRight") || input.keys.has("KeyD")) x += 1;
    if (input.keys.has("ArrowUp") || input.keys.has("KeyW")) y -= 1;
    if (input.keys.has("ArrowDown") || input.keys.has("KeyS")) y += 1;
    const length = Math.hypot(x, y);
    return length > 1 ? { x: x / length, y: y / length } : { x, y };
  }

  function analysisCells() {
    if (!battle) return [];
    const centerX = Math.floor(battle.player.x);
    const centerY = Math.floor(battle.player.y);
    const halfW = Math.floor(GLOBAL.analysisWidth / 2);
    const halfH = Math.floor(GLOBAL.analysisHeight / 2);
    const cells = [];
    for (let y = centerY - halfH; y <= centerY + halfH; y += 1) {
      for (let x = centerX - halfW; x <= centerX + halfW; x += 1) {
        if (isInside(battle.level, x, y)) cells.push({ x, y });
      }
    }
    return cells;
  }

  function hasNewAnalysisCells() {
    return analysisCells().some(({ x, y }) => !battle.revealed[y][x] && !battle.blocked.has(keyOf(x, y)));
  }

  function beginAnalysis(pointerId = null) {
    if (!battle || battle.paused || battle.over || battle.analysisCooldown > 0 || !hasNewAnalysisCells()) return false;
    battle.analysisHolding = true;
    battle.analysisPointerId = pointerId;
    $("#analyze-button").classList.add("holding");
    $("#analyze-label").textContent = "松开解析";
    $("#analyze-cooldown").textContent = "预览 5×5";
    playSfx("analyzeHold");
    return true;
  }

  function cancelAnalysis() {
    if (!battle?.analysisHolding) return;
    battle.analysisHolding = false;
    battle.analysisPointerId = null;
    $("#analyze-button").classList.remove("holding");
    updateAnalyzeButton();
  }

  function releaseAnalysis(execute = true) {
    if (!battle?.analysisHolding) return;
    battle.analysisHolding = false;
    battle.analysisPointerId = null;
    $("#analyze-button").classList.remove("holding");
    if (execute && !battle.paused && !battle.over) executeAnalysis();
    else updateAnalyzeButton();
  }

  function executeAnalysis() {
    const cells = analysisCells();
    const newlyRevealed = [];
    cells.forEach(({ x, y }) => {
      if (battle.blocked.has(keyOf(x, y)) || battle.revealed[y][x]) return;
      battle.revealed[y][x] = true;
      newlyRevealed.push({ x, y });
    });
    if (!newlyRevealed.length) {
      updateAnalyzeButton();
      return;
    }

    battle.analysisCooldown = GLOBAL.analysisCooldownSec;
    playSfx("analyze");
    vibrate(20);
    const newSet = new Set(newlyRevealed.map((cell) => keyOf(cell.x, cell.y)));
    let spawned = 0;
    battle.seals.forEach((seal) => {
      if (seal.awakened || !newSet.has(keyOf(seal.x, seal.y))) return;
      seal.awakened = true;
      battle.brokenSeals.add(keyOf(seal.x, seal.y));
      spawnMonster(seal);
      spawned += 1;
    });
    if (spawned) {
      playSfx("seal");
      vibrate([30, 30, 50]);
    }

    const center = cells[Math.floor(cells.length / 2)] || { x: battle.player.x, y: battle.player.y };
    spawnEffect(center.x + 0.5, center.y + 0.5, "#59d4b3", 18, "ring");

    if (battle.tutorialStep === 101) {
      const candidates = newlyRevealed.filter(({ x, y }) => isTileWalkable(x, y));
      candidates.sort((a, b) => {
        const da = Math.abs(a.x - battle.player.x) + Math.abs(a.y - battle.player.y);
        const db = Math.abs(b.x - battle.player.x) + Math.abs(b.y - battle.player.y);
        return db - da;
      });
      battle.tutorialTarget = candidates[0] || null;
      battle.tutorialStep = battle.tutorialTarget ? 102 : 0;
    }
    updateBattleHud();
  }

  function spawnMonster(seal) {
    const cfg = MONSTERS[seal.monsterId];
    battle.monsters.push({
      uid: `${cfg.id}-${battle.stats.spawned}-${performance.now().toFixed(0)}`,
      cfg,
      x: seal.x,
      y: seal.y,
      wakeRemaining: GLOBAL.monsterWakeSec,
      lifeRemaining: cfg.lifetime,
      path: [],
      pathIndex: 0,
      repathRemaining: 0,
      predictionRemaining: 0,
      movedSinceDash: 0,
      dashChargeRemaining: 0,
      dashDistanceRemaining: 0
    });
    battle.stats.spawned += 1;
    battle.stats.maxActive = Math.max(battle.stats.maxActive, battle.monsters.length);
    spawnEffect(seal.x + cfg.size / 2, seal.y + cfg.size / 2, cfg.color, 22, "burst");
  }

  function hiddenSealCountAround(x, y) {
    let count = 0;
    battle.seals.forEach((seal) => {
      if (seal.awakened) return;
      if (Math.abs(seal.x - x) <= 1 && Math.abs(seal.y - y) <= 1 && !(seal.x === x && seal.y === y)) count += 1;
    });
    return count;
  }

  function canMonsterOccupy(x, y, size) {
    if (!battle) return false;
    for (let offsetY = 0; offsetY < size; offsetY += 1) {
      for (let offsetX = 0; offsetX < size; offsetX += 1) {
        if (!isTileWalkable(x + offsetX, y + offsetY)) return false;
      }
    }
    return true;
  }

  function monsterRectOverlap(a, x, y, size) {
    return a.x < x + size && a.x + a.cfg.size > x && a.y < y + size && a.y + a.cfg.size > y;
  }

  function softPathCost(monster, x, y) {
    if (monster.cfg.ignoreSoftCollision) return 0;
    return battle.monsters.some((other) => other !== monster && other.wakeRemaining <= 0 && monsterRectOverlap(other, x, y, monster.cfg.size)) ? 2.5 : 0;
  }

  function nearestMonsterGoal(targetX, targetY, size) {
    let best = null;
    let bestDistance = Infinity;
    for (let y = 0; y <= battle.level.height - size; y += 1) {
      for (let x = 0; x <= battle.level.width - size; x += 1) {
        if (!canMonsterOccupy(x, y, size)) continue;
        const distance = Math.abs(x + size / 2 - targetX) + Math.abs(y + size / 2 - targetY);
        if (distance < bestDistance) {
          bestDistance = distance;
          best = { x, y };
        }
      }
    }
    return best;
  }

  function findPath(monster, goal) {
    const size = monster.cfg.size;
    let startX = Math.round(monster.x);
    let startY = Math.round(monster.y);
    if (!canMonsterOccupy(startX, startY, size)) {
      startX = Math.floor(monster.x);
      startY = Math.floor(monster.y);
    }
    if (!canMonsterOccupy(startX, startY, size) || !goal) return [];

    const open = [{ x: startX, y: startY, g: 0, f: Math.abs(goal.x - startX) + Math.abs(goal.y - startY) }];
    const cameFrom = new Map();
    const bestG = new Map([[keyOf(startX, startY), 0]]);
    const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];

    while (open.length) {
      open.sort((a, b) => a.f - b.f);
      const current = open.shift();
      if (current.x === goal.x && current.y === goal.y) {
        const path = [];
        let cursorKey = keyOf(goal.x, goal.y);
        while (cursorKey !== keyOf(startX, startY)) {
          const [x, y] = cursorKey.split(",").map(Number);
          path.push({ x, y });
          cursorKey = cameFrom.get(cursorKey);
          if (!cursorKey) return [];
        }
        return path.reverse();
      }

      directions.forEach(([dx, dy]) => {
        const x = current.x + dx;
        const y = current.y + dy;
        if (!canMonsterOccupy(x, y, size)) return;
        const nextKey = keyOf(x, y);
        const g = current.g + 1 + softPathCost(monster, x, y);
        if (g >= (bestG.get(nextKey) ?? Infinity)) return;
        bestG.set(nextKey, g);
        cameFrom.set(nextKey, keyOf(current.x, current.y));
        const h = Math.abs(goal.x - x) + Math.abs(goal.y - y);
        open.push({ x, y, g, f: g + h });
      });
    }
    return [];
  }

  function repathMonster(monster) {
    let targetX = battle.player.x;
    let targetY = battle.player.y;
    if (monster.cfg.behavior === "predictive_chase") {
      targetX += input.lastX * monster.cfg.predictionDistance;
      targetY += input.lastY * monster.cfg.predictionDistance;
    }
    const goal = nearestMonsterGoal(targetX, targetY, monster.cfg.size);
    monster.path = findPath(monster, goal);
    monster.pathIndex = 0;
    monster.repathRemaining = monster.cfg.behavior === "predictive_chase" ? monster.cfg.predictionInterval : 0.35;
  }

  function moveMonster(monster, delta) {
    if (monster.dashChargeRemaining > 0) {
      monster.dashChargeRemaining = Math.max(0, monster.dashChargeRemaining - delta);
      if (monster.dashChargeRemaining === 0) monster.dashDistanceRemaining = monster.cfg.dashDistance;
      return;
    }
    monster.repathRemaining -= delta;
    if (monster.repathRemaining <= 0 || monster.pathIndex >= monster.path.length) repathMonster(monster);
    const target = monster.path[monster.pathIndex];
    if (!target) return;

    const dx = target.x - monster.x;
    const dy = target.y - monster.y;
    const distance = Math.hypot(dx, dy);
    const dashMultiplier = monster.dashDistanceRemaining > 0 ? 2.8 : 1;
    const speed = monster.cfg.speed * battle.level.speedMultiplier * dashMultiplier;
    const step = Math.min(distance, speed * delta);
    if (distance > 0.0001) {
      monster.x += dx / distance * step;
      monster.y += dy / distance * step;
    }
    monster.movedSinceDash += step;
    if (monster.dashDistanceRemaining > 0) monster.dashDistanceRemaining = Math.max(0, monster.dashDistanceRemaining - step);
    if (distance <= step + 0.001) monster.pathIndex += 1;

    if (monster.cfg.behavior === "dash_chase" && monster.dashDistanceRemaining <= 0 && monster.movedSinceDash >= monster.cfg.dashEvery) {
      monster.movedSinceDash = 0;
      monster.dashChargeRemaining = monster.cfg.dashCharge;
      spawnEffect(monster.x + 0.5, monster.y + 0.5, monster.cfg.color, 10, "charge");
    }
  }

  function playerTouchesMonster(monster) {
    if (monster.wakeRemaining > 0) return false;
    return circleRectOverlap(
      battle.player.x,
      battle.player.y,
      battle.hero.size,
      monster.x,
      monster.y,
      monster.x + monster.cfg.size,
      monster.y + monster.cfg.size
    );
  }

  function updateMonsters(delta) {
    const survivors = [];
    battle.monsters.forEach((monster) => {
      if (monster.wakeRemaining > 0) {
        const previous = monster.wakeRemaining;
        monster.wakeRemaining = Math.max(0, monster.wakeRemaining - delta);
        if (previous > 0 && monster.wakeRemaining === 0) {
          playSfx("wake");
          spawnEffect(monster.x + monster.cfg.size / 2, monster.y + monster.cfg.size / 2, monster.cfg.accent, 14, "ring");
        }
        survivors.push(monster);
        return;
      }

      monster.lifeRemaining -= delta;
      if (monster.lifeRemaining <= 0) {
        battle.stats.faded += 1;
        playSfx("fade");
        spawnEffect(monster.x + monster.cfg.size / 2, monster.y + monster.cfg.size / 2, monster.cfg.color, 18, "fade");
        return;
      }
      moveMonster(monster, delta);
      if (playerTouchesMonster(monster)) {
        finishBattle(false, monster);
        survivors.push(monster);
        return;
      }
      survivors.push(monster);
    });
    battle.monsters = survivors;
  }

  function exploredPercent() {
    if (!battle) return 0;
    let total = 0;
    let revealed = 0;
    for (let y = 0; y < battle.level.height; y += 1) {
      for (let x = 0; x < battle.level.width; x += 1) {
        if (battle.blocked.has(keyOf(x, y))) continue;
        total += 1;
        if (battle.revealed[y][x]) revealed += 1;
      }
    }
    return total ? Math.round(revealed / total * 100) : 0;
  }

  function finishBattle(won, killer = null) {
    if (!battle || battle.over) return;
    battle.over = true;
    battle.paused = true;
    cancelAnalysis();
    resetInput();

    if (!won) {
      playSfx("fail");
      vibrate([80, 40, 100]);
      const failedLevel = battle.level;
      openModal({
        title: "探索失败",
        emblem: "!",
        body: `
          <p><strong>${killer ? `被${killer.cfg.name}触碰` : "探索中断"}</strong></p>
          <div class="result-grid">
            <span>用时 <strong>${formatTime(battle.elapsed)}</strong></span>
            <span>已解析 <strong>${exploredPercent()}%</strong></span>
          </div>`,
        actions: [
          {
            label: "重新挑战", className: "primary", onClick: () => {
              closeModal();
              battle = null;
              startLevel(failedLevel);
            }
          },
          { label: "返回主界面", className: "ghost", onClick: returnHomeFromBattle }
        ]
      });
      return;
    }

    const withinTime = battle.elapsed <= battle.level.targetTime;
    const stars = withinTime && battle.monsters.length === 0 ? 3 : withinTime ? 2 : 1;
    profile.stars[battle.level.id] = Math.max(profile.stars[battle.level.id] || 0, stars);
    profile.maxUnlockedLevel = Math.min(LEVELS.length, Math.max(profile.maxUnlockedLevel, levelIndex(battle.level) + 2));
    saveProfile();
    playSfx("win");
    const completedLevel = battle.level;
    const nextLevel = LEVELS[levelIndex(completedLevel) + 1];
    openModal({
      title: "遗迹净化完成",
      emblem: "✦",
      body: `
        <div class="result-stars">${starsText(stars)}</div>
        <div class="result-grid">
          <span>用时 <strong>${formatTime(battle.elapsed)}</strong></span>
          <span>已解析 <strong>${exploredPercent()}%</strong></span>
          <span>消散魔物 <strong>${battle.stats.faded}</strong></span>
          <span>最大追兵 <strong>${battle.stats.maxActive}</strong></span>
        </div>`,
      actions: [
        { label: "返回主界面", className: "ghost", onClick: returnHomeFromBattle },
        ...(nextLevel ? [{
          label: "下一层", className: "primary", onClick: () => {
            closeModal();
            battle = null;
            selectedLevelId = nextLevel.id;
            startLevel(nextLevel);
          }
        }] : [])
      ]
    });
  }

  function returnHomeFromBattle() {
    closeModal();
    battle = null;
    resetInput();
    showScreen("home-screen");
  }

  function openPauseMenu() {
    if (!battle || battle.over) return;
    battle.paused = true;
    cancelAnalysis();
    resetInput();
    openModal({
      title: "暂停",
      emblem: "Ⅱ",
      body: `<p>已解析 <strong>${exploredPercent()}%</strong> · 追兵 <strong>${battle.monsters.length}</strong></p>`,
      actions: [
        {
          label: "继续", className: "primary", onClick: () => {
            closeModal();
            battle.paused = false;
          }
        },
        {
          label: profile.sfx ? "音效：开" : "音效：关", className: "secondary", onClick: () => {
            profile.sfx = !profile.sfx;
            saveProfile();
            closeModal();
            openPauseMenu();
          }
        },
        { label: "退出本局", className: "danger", onClick: returnHomeFromBattle }
      ]
    });
  }

  function updateAnalyzeButton() {
    const button = $("#analyze-button");
    if (!battle) return;
    const onCooldown = battle.analysisCooldown > 0;
    const noCells = !hasNewAnalysisCells();
    button.disabled = battle.paused || battle.over || onCooldown || noCells;
    if (battle.analysisHolding) return;
    $("#analyze-label").textContent = "按住解析";
    $("#analyze-cooldown").textContent = onCooldown ? `${battle.analysisCooldown.toFixed(1)}s` : noCells ? "移动选位" : "就绪";
    button.classList.toggle("tutorial-highlight", battle.tutorialStep === 101);
  }

  function updateBattleHud() {
    if (!battle) return;
    $("#battle-time").textContent = formatTime(battle.elapsed);
    $("#explore-percent").textContent = `${exploredPercent()}%`;
    const timerMarkup = battle.monsters.slice(0, 4).map((monster) => {
      const waking = monster.wakeRemaining > 0;
      const time = waking ? monster.wakeRemaining : monster.lifeRemaining;
      return `<span class="monster-timer ${waking ? "waking" : ""}"><b>${monster.cfg.name}</b><strong>${waking ? "苏醒" : "存活"} ${time.toFixed(1)}s</strong></span>`;
    }).join("");
    const extra = battle.monsters.length > 4 ? `<span class="monster-timer"><b>其他</b><strong>+${battle.monsters.length - 4}</strong></span>` : "";
    const root = $("#monster-timers");
    const markup = timerMarkup + extra;
    if (root._markup !== markup) {
      root.innerHTML = markup;
      root._markup = markup;
    }
    updateAnalyzeButton();
  }

  function spawnEffect(x, y, color, count = 12, type = "burst") {
    if (!battle) return;
    const particles = [];
    for (let index = 0; index < count; index += 1) {
      const angle = Math.PI * 2 * index / count + Math.random() * 0.35;
      const speed = type === "ring" ? 0.9 : 0.6 + Math.random() * 1.8;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: type === "fade" ? 0.8 : 0.55 + Math.random() * 0.35,
        maxLife: type === "fade" ? 0.8 : 0.9,
        size: 0.04 + Math.random() * 0.08
      });
    }
    battle.effects.push({ color, type, particles });
  }

  function updateEffects(delta) {
    if (!battle) return;
    battle.effects.forEach((effect) => {
      effect.particles.forEach((particle) => {
        particle.x += particle.vx * delta;
        particle.y += particle.vy * delta;
        particle.vx *= 0.98;
        particle.vy *= 0.98;
        particle.life -= delta;
      });
      effect.particles = effect.particles.filter((particle) => particle.life > 0);
    });
    battle.effects = battle.effects.filter((effect) => effect.particles.length);
  }

  function resizeCanvas(canvas) {
    const rect = canvas.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return null;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const pixelWidth = Math.max(1, Math.round(rect.width * dpr));
    const pixelHeight = Math.max(1, Math.round(rect.height * dpr));
    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
    }
    const context = canvas.getContext("2d");
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.imageSmoothingEnabled = false;
    return { context, width: rect.width, height: rect.height };
  }

  function drawStoneBackdrop(context, width, height, time, accent = "#59d4b3") {
    context.fillStyle = "#090d0e";
    context.fillRect(0, 0, width, height);
    const brickH = 34;
    const brickW = 72;
    context.strokeStyle = "rgba(78, 98, 99, 0.18)";
    context.lineWidth = 1;
    for (let y = -brickH; y < height + brickH; y += brickH) {
      const row = Math.floor(y / brickH);
      for (let x = -brickW; x < width + brickW; x += brickW) {
        const offset = row % 2 ? brickW / 2 : 0;
        context.strokeRect(Math.floor(x + offset), Math.floor(y), brickW, brickH);
      }
    }
    context.fillStyle = "rgba(216, 178, 91, 0.025)";
    for (let index = 0; index < 36; index += 1) {
      const x = (index * 97 + 41) % width;
      const y = (index * 61 + 17) % height;
      context.fillRect(x, y, 2, 2);
    }
    context.strokeStyle = accent;
    context.globalAlpha = 0.08 + Math.sin(time * 0.0012) * 0.025;
    context.lineWidth = 2;
    context.beginPath();
    context.arc(width * 0.56, height * 0.5, Math.min(width, height) * 0.31, 0, Math.PI * 2);
    context.stroke();
    context.globalAlpha = 1;
  }

  function drawArcaneCompass(context, x, y, radius, time, color = "#d8b25b") {
    context.save();
    context.translate(x, y);
    context.rotate(time * 0.00004);
    context.strokeStyle = color;
    context.globalAlpha = 0.28;
    context.lineWidth = 2;
    [1, 0.72, 0.42].forEach((ratio) => {
      context.beginPath();
      context.arc(0, 0, radius * ratio, 0, Math.PI * 2);
      context.stroke();
    });
    for (let spoke = 0; spoke < 12; spoke += 1) {
      const angle = spoke / 12 * Math.PI * 2;
      context.beginPath();
      context.moveTo(Math.cos(angle) * radius * 0.44, Math.sin(angle) * radius * 0.44);
      context.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
      context.stroke();
    }
    context.globalAlpha = 1;
    context.restore();
  }

  function drawHero(context, x, y, scale, hero, time, facing = 1) {
    context.save();
    context.translate(Math.round(x), Math.round(y));
    context.scale(scale * facing, scale);

    context.fillStyle = "rgba(0,0,0,0.38)";
    context.beginPath();
    context.ellipse(0, 4, 24, 7, 0, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = hero.cloak;
    context.beginPath();
    context.moveTo(-18, -48);
    context.lineTo(18, -48);
    context.lineTo(27, 0);
    context.lineTo(-26, 0);
    context.closePath();
    context.fill();

    context.fillStyle = "#8c6e50";
    context.fillRect(-12, -55, 24, 34);
    context.fillStyle = hero.color;
    context.fillRect(-14, -47, 28, 5);
    context.fillRect(-3, -54, 6, 30);

    context.fillStyle = "#ba8d72";
    context.fillRect(-8, -70, 16, 15);
    context.fillStyle = "#202a2c";
    context.fillRect(-11, -74, 22, 8);
    context.fillRect(-12, -68, 4, 11);

    context.fillStyle = "#7f8c8c";
    context.fillRect(-20, -48, 7, 30);
    context.fillRect(13, -48, 7, 30);
    context.fillStyle = hero.accent;
    context.fillRect(-22, -24, 11, 8);
    context.fillRect(11, -24, 11, 8);

    context.strokeStyle = "#c9b779";
    context.lineWidth = 3;
    context.beginPath();
    context.moveTo(21, -38);
    context.lineTo(32, -78);
    context.stroke();
    context.strokeStyle = hero.color;
    context.lineWidth = 2;
    context.beginPath();
    context.arc(32, -81, 7 + Math.sin(time * 0.004) * 1.2, 0, Math.PI * 2);
    context.stroke();

    context.strokeStyle = hero.accent;
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(-18, -34);
    context.lineTo(-32, -9);
    context.lineTo(-22, -13);
    context.stroke();
    context.restore();
  }

  function drawHomeCanvas(time) {
    const resized = resizeCanvas($("#home-canvas"));
    if (!resized) return;
    const { context, width, height } = resized;
    const hero = heroById(profile.selectedHeroId);
    drawStoneBackdrop(context, width, height, time, hero.color);
    drawArcaneCompass(context, width * 0.58, height * 0.54, Math.min(width, height) * 0.34, time);
    context.fillStyle = "rgba(89, 212, 179, 0.08)";
    context.fillRect(width * 0.41, height * 0.18, 2, height * 0.62);
    drawHero(context, width * 0.57, height * 0.79, Math.min(width / 520, height / 300), hero, time, 1);
  }

  function drawHeroSelectCanvas(time) {
    const resized = resizeCanvas($("#hero-select-canvas"));
    if (!resized) return;
    const { context, width, height } = resized;
    const hero = heroById(previewHeroId);
    drawStoneBackdrop(context, width, height, time, hero.color);
    drawArcaneCompass(context, width * 0.34, height * 0.56, Math.min(width, height) * 0.25, time, hero.accent);
    drawHero(context, width * 0.34, height * 0.82, Math.min(width / 650, height / 260), hero, time, 1);
  }

  const clueColors = ["#5c7775", "#65d0bd", "#d8b25b", "#d36b55", "#8c79b4", "#db8c62", "#79a9d6", "#c9d2cf", "#e0d2a2"];

  function battleCamera(width, height, cellSize) {
    const mapWidth = battle.level.width * cellSize;
    const mapHeight = battle.level.height * cellSize;
    const targetX = mapWidth <= width ? (mapWidth - width) / 2 : clamp(battle.player.x * cellSize - width / 2, 0, mapWidth - width);
    const targetY = mapHeight <= height ? (mapHeight - height) / 2 : clamp(battle.player.y * cellSize - height / 2, 0, mapHeight - height);
    battle.camera.x = lerp(battle.camera.x, targetX, 0.16);
    battle.camera.y = lerp(battle.camera.y, targetY, 0.16);
  }

  function tileScreenPosition(x, y, cellSize) {
    return { x: x * cellSize - battle.camera.x, y: y * cellSize - battle.camera.y };
  }

  function isPreviewCell(x, y, previewSet) {
    return battle.analysisHolding && previewSet.has(keyOf(x, y)) && !battle.revealed[y][x] && !battle.blocked.has(keyOf(x, y));
  }

  function drawBattleTile(context, x, y, cellSize, time, previewSet) {
    const screen = tileScreenPosition(x, y, cellSize);
    const blocked = battle.blocked.has(keyOf(x, y));
    const revealed = battle.revealed[y][x];
    let offsetX = 0;
    let offsetY = 0;
    if (isPreviewCell(x, y, previewSet)) {
      const phase = time / 1000 * GLOBAL.analysisShakeHz * Math.PI * 2 + x * 1.7 + y * 2.3;
      offsetX = Math.round(Math.sin(phase) * GLOBAL.analysisShakePx);
      offsetY = Math.round(Math.cos(phase * 1.13) * GLOBAL.analysisShakePx);
    }
    const px = Math.floor(screen.x + offsetX);
    const py = Math.floor(screen.y + offsetY);
    const gap = 1;

    if (blocked) {
      context.fillStyle = "#121819";
      context.fillRect(px + gap, py + gap, cellSize - gap * 2, cellSize - gap * 2);
      context.fillStyle = "#293234";
      context.fillRect(px + 4, py + 4, cellSize - 8, 6);
      context.fillStyle = "#0a0e0f";
      context.fillRect(px + 8, py + 14, cellSize - 16, cellSize - 22);
      return;
    }

    if (!revealed) {
      context.fillStyle = isPreviewCell(x, y, previewSet) ? "#172d2b" : "#070a0b";
      context.fillRect(px + gap, py + gap, cellSize - gap * 2, cellSize - gap * 2);
      context.strokeStyle = isPreviewCell(x, y, previewSet) ? "rgba(89,212,179,0.58)" : "rgba(58,73,75,0.3)";
      context.strokeRect(px + 3.5, py + 3.5, cellSize - 7, cellSize - 7);
      context.fillStyle = isPreviewCell(x, y, previewSet) ? "rgba(89,212,179,0.22)" : "rgba(216,178,91,0.06)";
      context.fillRect(px + cellSize / 2 - 2, py + cellSize / 2 - 2, 4, 4);
      return;
    }

    context.fillStyle = (x + y) % 2 ? "#263638" : "#2b3b3d";
    context.fillRect(px + gap, py + gap, cellSize - gap * 2, cellSize - gap * 2);
    context.strokeStyle = "rgba(128, 155, 151, 0.18)";
    context.strokeRect(px + 4.5, py + 4.5, cellSize - 9, cellSize - 9);

    if (battle.brokenSeals.has(keyOf(x, y))) {
      context.strokeStyle = "#b85c4b";
      context.lineWidth = 2;
      context.beginPath();
      context.moveTo(px + cellSize * 0.2, py + cellSize * 0.28);
      context.lineTo(px + cellSize * 0.48, py + cellSize * 0.5);
      context.lineTo(px + cellSize * 0.36, py + cellSize * 0.78);
      context.moveTo(px + cellSize * 0.78, py + cellSize * 0.24);
      context.lineTo(px + cellSize * 0.55, py + cellSize * 0.52);
      context.lineTo(px + cellSize * 0.7, py + cellSize * 0.76);
      context.stroke();
    } else {
      const count = hiddenSealCountAround(x, y);
      if (count > 0) {
        context.fillStyle = clueColors[count];
        context.font = `700 ${Math.max(14, Math.floor(cellSize * 0.38))}px Georgia, serif`;
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(String(count), px + cellSize / 2, py + cellSize / 2 + 1);
      }
    }

    if (x === battle.level.exit.x && y === battle.level.exit.y) {
      context.strokeStyle = "#e3c05f";
      context.lineWidth = 3;
      context.strokeRect(px + 6, py + 6, cellSize - 12, cellSize - 12);
      context.fillStyle = "rgba(216,178,91,0.26)";
      context.fillRect(px + 9, py + 9, cellSize - 18, cellSize - 18);
      context.fillStyle = "#ffe59a";
      context.font = `700 ${Math.floor(cellSize * 0.3)}px "Microsoft YaHei"`;
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText("出", px + cellSize / 2, py + cellSize / 2);
    }
  }

  function drawMonster(context, monster, cellSize, time) {
    const center = tileScreenPosition(monster.x + monster.cfg.size / 2, monster.y + monster.cfg.size / 2, cellSize);
    const scale = cellSize * monster.cfg.size;
    context.save();
    context.translate(Math.round(center.x), Math.round(center.y));
    const wakingPulse = monster.wakeRemaining > 0 ? 1 + Math.sin(time * 0.015) * 0.06 : 1;
    context.scale(wakingPulse, wakingPulse);

    context.fillStyle = "rgba(0,0,0,0.42)";
    context.beginPath();
    context.ellipse(0, scale * 0.3, scale * 0.35, scale * 0.12, 0, 0, Math.PI * 2);
    context.fill();

    if (monster.cfg.id === "M001") {
      context.fillStyle = monster.cfg.accent;
      context.beginPath();
      context.moveTo(0, -scale * 0.4);
      context.lineTo(scale * 0.34, scale * 0.34);
      context.lineTo(-scale * 0.34, scale * 0.34);
      context.closePath();
      context.fill();
      context.fillStyle = monster.cfg.color;
      context.fillRect(-scale * 0.13, -scale * 0.22, scale * 0.26, scale * 0.18);
    } else if (monster.cfg.id === "M002") {
      context.fillStyle = monster.cfg.color;
      context.fillRect(-scale * 0.36, -scale * 0.38, scale * 0.72, scale * 0.7);
      context.fillStyle = "#43372a";
      context.fillRect(-scale * 0.22, -scale * 0.22, scale * 0.44, scale * 0.4);
      context.strokeStyle = monster.cfg.accent;
      context.lineWidth = Math.max(2, scale * 0.035);
      context.strokeRect(-scale * 0.29, -scale * 0.31, scale * 0.58, scale * 0.56);
    } else if (monster.cfg.id === "M003") {
      context.fillStyle = monster.cfg.color;
      context.beginPath();
      context.moveTo(-scale * 0.38, scale * 0.08);
      context.lineTo(-scale * 0.12, -scale * 0.28);
      context.lineTo(scale * 0.34, -scale * 0.12);
      context.lineTo(scale * 0.42, scale * 0.2);
      context.closePath();
      context.fill();
      context.strokeStyle = monster.cfg.accent;
      context.lineWidth = 3;
      context.beginPath();
      context.moveTo(-scale * 0.2, scale * 0.12);
      context.lineTo(-scale * 0.28, scale * 0.38);
      context.moveTo(scale * 0.18, scale * 0.1);
      context.lineTo(scale * 0.28, scale * 0.38);
      context.stroke();
    } else if (monster.cfg.id === "M004") {
      context.fillStyle = monster.cfg.color;
      context.beginPath();
      context.arc(0, -scale * 0.05, scale * 0.32, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = "#151819";
      context.beginPath();
      context.ellipse(0, -scale * 0.05, scale * 0.2, scale * 0.1, 0, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = monster.cfg.accent;
      context.beginPath();
      context.arc(0, -scale * 0.05, scale * 0.055, 0, Math.PI * 2);
      context.fill();
    } else {
      context.fillStyle = monster.cfg.color;
      context.fillRect(-scale * 0.26, -scale * 0.3, scale * 0.2, scale * 0.28);
      context.fillRect(scale * 0.06, -scale * 0.3, scale * 0.2, scale * 0.28);
      context.strokeStyle = monster.cfg.accent;
      context.lineWidth = 3;
      context.beginPath();
      context.moveTo(-scale * 0.18, -scale * 0.02);
      context.lineTo(-scale * 0.28, scale * 0.34);
      context.moveTo(scale * 0.18, -scale * 0.02);
      context.lineTo(scale * 0.28, scale * 0.34);
      context.stroke();
    }

    const total = monster.wakeRemaining > 0 ? GLOBAL.monsterWakeSec : monster.cfg.lifetime;
    const remaining = monster.wakeRemaining > 0 ? monster.wakeRemaining : monster.lifeRemaining;
    const ratio = clamp(remaining / total, 0, 1);
    context.strokeStyle = monster.wakeRemaining > 0 ? "#d8b25b" : monster.cfg.color;
    context.lineWidth = 3;
    context.beginPath();
    context.arc(0, -scale * 0.48, scale * 0.27, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ratio);
    context.stroke();
    context.restore();
  }

  function drawBattleEffects(context, cellSize) {
    battle.effects.forEach((effect) => {
      context.fillStyle = effect.color;
      effect.particles.forEach((particle) => {
        const screen = tileScreenPosition(particle.x, particle.y, cellSize);
        context.globalAlpha = clamp(particle.life / particle.maxLife, 0, 1);
        const size = Math.max(2, particle.size * cellSize);
        context.fillRect(Math.round(screen.x - size / 2), Math.round(screen.y - size / 2), Math.round(size), Math.round(size));
      });
    });
    context.globalAlpha = 1;
  }

  function drawTutorialTarget(context, cellSize, time) {
    if (!battle.tutorialTarget) return;
    const screen = tileScreenPosition(battle.tutorialTarget.x, battle.tutorialTarget.y, cellSize);
    const pulse = 4 + Math.sin(time * 0.008) * 2;
    context.strokeStyle = "#d8b25b";
    context.lineWidth = 3;
    context.strokeRect(screen.x + pulse, screen.y + pulse, cellSize - pulse * 2, cellSize - pulse * 2);
    const player = tileScreenPosition(battle.player.x, battle.player.y, cellSize);
    context.setLineDash([6, 6]);
    context.strokeStyle = "rgba(216,178,91,0.65)";
    context.beginPath();
    context.moveTo(player.x, player.y);
    context.lineTo(screen.x + cellSize / 2, screen.y + cellSize / 2);
    context.stroke();
    context.setLineDash([]);
  }

  function drawBattleCanvas(time) {
    if (!battle) return;
    const resized = resizeCanvas($("#battle-canvas"));
    if (!resized) return;
    const { context, width, height } = resized;
    context.fillStyle = "#070a0b";
    context.fillRect(0, 0, width, height);
    const cellSize = clamp(height / 8.4, 36, 58);
    battle.cellSize = cellSize;
    battleCamera(width, height, cellSize);

    const previewSet = new Set(analysisCells().map((cell) => keyOf(cell.x, cell.y)));
    const startX = clamp(Math.floor(battle.camera.x / cellSize) - 1, 0, battle.level.width - 1);
    const endX = clamp(Math.ceil((battle.camera.x + width) / cellSize) + 1, 0, battle.level.width - 1);
    const startY = clamp(Math.floor(battle.camera.y / cellSize) - 1, 0, battle.level.height - 1);
    const endY = clamp(Math.ceil((battle.camera.y + height) / cellSize) + 1, 0, battle.level.height - 1);

    for (let y = startY; y <= endY; y += 1) {
      for (let x = startX; x <= endX; x += 1) drawBattleTile(context, x, y, cellSize, time, previewSet);
    }

    if (battle.analysisHolding) {
      const cells = analysisCells();
      if (cells.length) {
        const minX = Math.min(...cells.map((cell) => cell.x));
        const minY = Math.min(...cells.map((cell) => cell.y));
        const maxX = Math.max(...cells.map((cell) => cell.x));
        const maxY = Math.max(...cells.map((cell) => cell.y));
        const start = tileScreenPosition(minX, minY, cellSize);
        context.strokeStyle = "#59d4b3";
        context.lineWidth = 3;
        context.strokeRect(start.x + 1.5, start.y + 1.5, (maxX - minX + 1) * cellSize - 3, (maxY - minY + 1) * cellSize - 3);
      }
    }

    battle.monsters.forEach((monster) => drawMonster(context, monster, cellSize, time));
    drawBattleEffects(context, cellSize);
    drawTutorialTarget(context, cellSize, time);

    const player = tileScreenPosition(battle.player.x, battle.player.y, cellSize);
    drawHero(context, player.x, player.y + cellSize * 0.3, cellSize / 82, battle.hero, time, battle.player.facing);

    context.strokeStyle = "rgba(216,178,91,0.28)";
    context.lineWidth = 2;
    context.strokeRect(1, 1, width - 2, height - 2);
  }

  function updateBattle(delta) {
    if (!battle || battle.paused || battle.over) return;
    battle.elapsed += delta;
    battle.analysisCooldown = Math.max(0, battle.analysisCooldown - delta);
    const move = movementVector();
    movePlayer(move.x, move.y, delta);
    if (battle.over) return;
    updateMonsters(delta);
    updateEffects(delta);
    updateBattleHud();
  }

  function frame(time) {
    const delta = Math.min(0.05, Math.max(0, (time - lastFrame) / 1000));
    lastFrame = time;
    if (currentScreen === "home-screen") drawHomeCanvas(time);
    if (currentScreen === "heroes-screen") drawHeroSelectCanvas(time);
    if (currentScreen === "battle-screen" && battle) {
      updateBattle(delta);
      drawBattleCanvas(time);
    }
    requestAnimationFrame(frame);
  }

  function joystickEventVector(event) {
    const rect = $("#joystick").getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const maxRadius = rect.width * 0.35;
    let dx = event.clientX - centerX;
    let dy = event.clientY - centerY;
    const distance = Math.hypot(dx, dy);
    if (distance > maxRadius) {
      dx = dx / distance * maxRadius;
      dy = dy / distance * maxRadius;
    }
    input.joystickX = dx / maxRadius;
    input.joystickY = dy / maxRadius;
    $("#joystick-knob").style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
  }

  function bindEvents() {
    $("#settings-button").addEventListener("click", () => { ensureAudio(); playSfx("click"); openSettings(); });
    $("#levels-button").addEventListener("click", () => { playSfx("click"); showScreen("levels-screen"); });
    $("#heroes-button").addEventListener("click", () => {
      playSfx("click");
      previewHeroId = profile.selectedHeroId;
      showScreen("heroes-screen");
    });
    $("#start-button").addEventListener("click", () => {
      playSfx("click");
      selectedLevelId = LEVELS[Math.max(0, profile.maxUnlockedLevel - 1)].id;
      startSelectedLevel();
    });
    $("#level-enter-button").addEventListener("click", startSelectedLevel);
    $$(".back-button").forEach((button) => button.addEventListener("click", () => { playSfx("click"); showScreen("home-screen"); }));
    $("#deploy-button").addEventListener("click", () => {
      profile.selectedHeroId = previewHeroId;
      saveProfile();
      playSfx("select");
      renderHeroes();
      showToast(`${heroById(previewHeroId).name} 已出战`);
    });
    $("#pause-button").addEventListener("click", openPauseMenu);

    modalOverlay.addEventListener("pointerdown", (event) => {
      if (event.target === modalOverlay) modalOverlay._onBackdrop?.();
    });

    const joystick = $("#joystick");
    joystick.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      ensureAudio();
      joystick.setPointerCapture(event.pointerId);
      joystick._pointerId = event.pointerId;
      joystickEventVector(event);
    });
    joystick.addEventListener("pointermove", (event) => {
      if (joystick._pointerId !== event.pointerId) return;
      joystickEventVector(event);
    });
    const releaseJoystick = (event) => {
      if (joystick._pointerId !== event.pointerId) return;
      joystick._pointerId = null;
      input.joystickX = 0;
      input.joystickY = 0;
      $("#joystick-knob").style.transform = "translate(-50%, -50%)";
    };
    joystick.addEventListener("pointerup", releaseJoystick);
    joystick.addEventListener("pointercancel", releaseJoystick);

    const analyze = $("#analyze-button");
    analyze.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      ensureAudio();
      if (!beginAnalysis(event.pointerId)) return;
      analyze.setPointerCapture(event.pointerId);
    });
    analyze.addEventListener("pointerup", (event) => {
      if (battle?.analysisPointerId !== event.pointerId) return;
      releaseAnalysis(true);
    });
    analyze.addEventListener("pointercancel", (event) => {
      if (battle?.analysisPointerId !== event.pointerId) return;
      cancelAnalysis();
    });

    window.addEventListener("keydown", (event) => {
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Space"].includes(event.code)) event.preventDefault();
      if (event.code === "Space" && !event.repeat && currentScreen === "battle-screen") beginAnalysis("keyboard");
      else input.keys.add(event.code);
    });
    window.addEventListener("keyup", (event) => {
      input.keys.delete(event.code);
      if (event.code === "Space" && battle?.analysisPointerId === "keyboard") releaseAnalysis(true);
    });

    document.addEventListener("visibilitychange", () => {
      if (!document.hidden || !battle || battle.over || currentScreen !== "battle-screen") return;
      battle.paused = true;
      cancelAnalysis();
      resetInput();
    });
    window.addEventListener("focus", () => {
      if (battle?.paused && !battle.over && currentScreen === "battle-screen" && !modalOverlay.classList.contains("open")) openPauseMenu();
    });
    window.addEventListener("beforeunload", saveProfile);
  }

  function initialize() {
    bindEvents();
    recoverStamina();
    selectedLevelId = LEVELS[Math.max(0, profile.maxUnlockedLevel - 1)].id;
    previewHeroId = profile.selectedHeroId;
    renderHome();
    renderLevels();
    renderHeroes();
    setInterval(() => {
      recoverStamina();
      if (currentScreen === "home-screen") renderHome();
      if (currentScreen === "levels-screen") renderLevels();
    }, 30000);
    requestAnimationFrame(frame);
  }

  window.__arcaneGame = {
    getState: () => ({
      screen: currentScreen,
      profile: JSON.parse(JSON.stringify(profile)),
      battle: battle ? {
        levelId: battle.level.id,
        elapsed: battle.elapsed,
        paused: battle.paused,
        holding: battle.analysisHolding,
        explored: exploredPercent(),
        monsters: battle.monsters.map((monster) => ({
          id: monster.cfg.id,
          waking: monster.wakeRemaining,
          lifetime: monster.lifeRemaining,
          x: monster.x,
          y: monster.y
        }))
      } : null
    }),
    startLevel: (id = "L001") => startLevel(levelById(id)),
    analyze: () => {
      if (!battle) return false;
      if (!beginAnalysis("debug")) return false;
      releaseAnalysis(true);
      return true;
    },
    resetProfile: () => {
      profile = defaultProfile();
      saveProfile();
      location.reload();
    }
  };

  initialize();
})();
