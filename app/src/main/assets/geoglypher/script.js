/* ===================================================
   GEOGLYPHER - GAMEPLAY ENGINE & COMPUTER VISION CORE
   =================================================== */

// --- GLOBAL DEBUGGING & ERROR TRACKING ---
window.addEventListener("error", (e) => {
  const msg = `[SYSTEM ERROR] ${e.message || "Script Exception"} @ ${e.filename || "script.js"}:${e.lineno || 0}:${e.colno || 0}`;
  console.error(msg, e.error);
  if (typeof addLogLine === "function") {
    addLogLine(msg, "text-danger");
  }
});

window.addEventListener("unhandledrejection", (e) => {
  const msg = `[UNHANDLED REJECTION] ${e.reason || "Promise rejection"}`;
  console.error(msg, e.reason);
  if (typeof addLogLine === "function") {
    addLogLine(msg, "text-danger");
  }
});

// --- GLYPH PATTERNS DATA ---
const GLYPHS = [
  {
    id: "roswell-propeller",
    name: "Roswell Propeller",
    difficulty: "EASY",
    description:
      "An introductory 4-pointed geometric star to calibrate your plasma-beam emitters. Make sure to cover Wiltshire field's wheat evenly.",
    path: "M 250 150 L 280 220 L 350 250 L 280 280 L 250 350 L 220 280 L 150 250 L 220 220 Z",
  },
  {
    id: "andromeda-helix",
    name: "Andromeda Helix",
    difficulty: "MEDIUM",
    description:
      "A dual logarithmic swirl to signal the auxiliary squadron. Requires high-precision curvature tracking using cubic-bezier directives.",
    path: "M 250 250 C 220 220 180 250 180 290 C 180 350 250 370 290 350 C 350 320 370 230 310 180 C 240 120 130 180 130 290",
  },
  {
    id: "alien-silhouette",
    name: "Roswell Grey",
    difficulty: "MEDIUM",
    description:
      "A self-portrait silhouette of our glorious pilot design. Useful to warn human researchers of extraterrestrial presence.",
    path: "M 250 140 C 300 140 330 180 310 260 C 290 320 270 360 250 360 C 230 360 210 320 190 260 C 170 180 200 140 250 140 M 215 235 C 230 235 240 265 220 275 C 205 275 205 245 215 235 Z M 285 235 C 270 235 260 265 280 275 C 295 275 295 245 285 235 Z",
  },
  {
    id: "hypercube",
    name: "Tesseract Frame",
    difficulty: "HARD",
    description:
      "A 4D hypercube orthographic projection. It tests the grid-vectoring modules to their absolute mathematical limits.",
    path: "M 150 150 H 350 V 350 H 150 Z M 200 200 H 300 V 300 H 200 Z M 150 150 L 200 200 M 350 150 L 300 200 M 350 350 L 300 300 M 150 350 L 200 300",
  },
  {
    id: "eye-of-horus",
    name: "Eye of Ra",
    difficulty: "HARD",
    description:
      "An ancient symbol left on earth by the Pharaoh-Division. Requires seamless integration of closed ellipses and decorative spline tails.",
    path: "M 150 240 C 200 190 300 190 350 240 C 300 290 200 290 150 240 Z M 210 240 C 210 210 290 210 290 240 C 290 270 210 270 210 240 Z M 200 260 L 180 310 M 300 260 C 290 310 260 330 240 320",
  },
];

// --- DEFAULT LEADERBOARD NAMES ---
const DEFAULT_LEADERBOARD = [
  {
    name: "ZORBLAX-9",
    glyph: "Roswell Propeller",
    score: 96.4,
    date: "2026-07-15",
  },
  { name: "XYLAR", glyph: "Andromeda Helix", score: 91.8, date: "2026-07-18" },
  { name: "KRONOS-7", glyph: "Eye of Ra", score: 88.5, date: "2026-07-10" },
  { name: "GLIP-GLOP", glyph: "Roswell Grey", score: 85.2, date: "2026-07-19" },
  {
    name: "COMMANDER_X",
    glyph: "Tesseract Frame",
    score: 82.7,
    date: "2026-07-12",
  },
  {
    name: "VULCAN-S3",
    glyph: "Roswell Propeller",
    score: 81.3,
    date: "2026-07-16",
  },
];

// --- STATE VARIABLES ---
let currentGlyphIndex = 0;
let ufoX = 250;
let ufoY = 250;
let isLaserActive = true;
let currentPathString = "M 250 250"; // Start at center
let pathHistory = []; // For Undo
let isAnimating = false;
let computedScore = 0.0;

// --- NEW TUTORIAL / AUTH / IAP STATE VARIABLES ---
let currentPilot = null; // Object { username, species, xp, history }
let activeTutorialStep = 1;
let hasCustomLogoPurchased = false;
let customLogoImgDataUrl = null;
let tutorialActionsDone = {
  steered: false,
  helperClicked: false,
  beamFired: false,
};

// --- WAYPOINT CALCULATOR STATE ---
let pathSteps = [{ type: "M", x: 250, y: 250 }];
let stepsList, selectNewCommand, btnAddVectorStep;

// --- EXTRA DOM ELEMENTS ---
let authModal,
  btnCloseAuth,
  modalTabLogin,
  modalTabRegister,
  panelLogin,
  panelRegister,
  panelProfile;
let loginUsername,
  loginPassword,
  btnLoginSubmit,
  registerUsername,
  registerPassword,
  registerSpecies,
  btnRegisterSubmit;
let profileCodename,
  profileSpecies,
  profileXp,
  profileHistoryList,
  btnLogout,
  hudPilotName,
  hudPilotAuth;
let iapModal,
  btnCloseIap,
  btnIapTrigger,
  logoUploadContainer,
  logoFileInput,
  billingCard,
  billingExp,
  billingCvv,
  billingZip,
  iapProcessing,
  btnPurchaseConfirm;
let tutorialModal,
  btnCloseTutorial,
  btnTutPrev,
  btnTutNext,
  btnTutorialFinish,
  hudTutorialBtn,
  hudAcademyStatus;

// --- DOM ELEMENTS ---
let selectGlyph,
  textGlyphName,
  textGlyphDifficulty,
  textGlyphDesc,
  targetCanvas;
let earthCanvas,
  svgDrawingPlane,
  svgTargetPath,
  svgUserPath,
  ufoSaucer,
  coordHud;
let tabEditor,
  tabPilot,
  editorTabContent,
  pilotTabContent,
  svgCodeInput,
  stepSlider,
  stepValue;
let btnLaserToggle, btnHoverToggle, btnClear, btnUndo, btnBeam;
let coherenceRing,
  coherencePercentage,
  matchRatingBadge,
  matchRatingLabel,
  humanComprehensionLabel,
  rankProjectionLabel;
let transmissionLogConsole,
  submissionBox,
  pilotCodenameInput,
  btnSubmitScore,
  leaderboardBody,
  plasmaChargeStat,
  detectionRiskStat;

// --- INITIALIZATION ---
window.addEventListener("DOMContentLoaded", () => {
  console.log("[SYSTEM] DOMContentLoaded event fired. Commencing Geoglypher boot sequence...");

  const initSteps = [
    { name: "DOM Core References", fn: initializeDOMElements },
    { name: "Level & Glyph Selector", fn: setupLevelSelector },
    { name: "Terminal Tabs Navigation", fn: setupTerminalTabs },
    { name: "Vector Syntax Helper Buttons", fn: setupSyntaxHelpers },
    { name: "Ship Autopilot Controls", fn: setupAutopilotControls },
    { name: "Scanner Action Buttons", fn: setupActionButtons },
    { name: "Pilot Auth (Guest Mode)", fn: setupAuthSystem },
    { name: "Galactic Branding & Logo Module", fn: setupIAPSystem },
    { name: "Flight Academy Tutorial System", fn: setupTutorialSystem },
    { name: "Orbital Leaderboard", fn: loadLeaderboard },
    { name: "Farmland Satellite Canvas", fn: drawProceduralFarmland },
    { name: "Initial Vector Glyph (Roswell)", fn: () => loadGlyph(0) },
    { name: "Custom Missions Engine", fn: setupCustomMissions },
    { name: "Telemetry Threat Radar Alerts", fn: setupTelemetryAlerts },
    { name: "Direct Tactical Drawing Plane", fn: setupDirectDrawing },
    { name: "Waypoint List Vector Builder", fn: setupWaypointBuilderEvents }
  ];

  initSteps.forEach((step) => {
    try {
      step.fn();
      console.log(`[INIT OK] ${step.name}`);
    } catch (err) {
      console.error(`[INIT WARN] Step '${step.name}' error:`, err);
      if (typeof addLogLine === "function") {
        addLogLine(`[INIT WARN] ${step.name} module warning: ${err.message}`, "text-danger");
      }
    }
  });

  if (typeof addLogLine === "function") {
    addLogLine("[SYSTEM READY] Stealth Orbital Engraver initialized. Alien Pilot Zorg authenticated.", "text-success");
  }
});

function setupDirectDrawing() {
  let isDrawing = false;
  let prevX = 250;
  let prevY = 250;

  function getLocalCoords(e) {
    const rect = svgDrawingPlane.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const x = Math.round(
      Math.max(0, Math.min(500, ((clientX - rect.left) / rect.width) * 500)),
    );
    const y = Math.round(
      Math.max(0, Math.min(500, ((clientY - rect.top) / rect.height) * 500)),
    );
    return { x, y };
  }

  function startDraw(e) {
    if (isAnimating) return;
    isDrawing = true;
    e.preventDefault();

    const coords = getLocalCoords(e);
    ufoX = coords.x;
    ufoY = coords.y;
    prevX = coords.x;
    prevY = coords.y;

    pathHistory.push(currentPathString);

    pathSteps = [{ type: "M", x: ufoX, y: ufoY }];

    rebuildPathFromSteps();
    renderPathStepsUI();
    ufoSaucer.classList.add("firing");
  }

  function moveDraw(e) {
    if (!isDrawing || isAnimating) return;
    e.preventDefault();

    const coords = getLocalCoords(e);
    if (coords.x === prevX && coords.y === prevY) return;

    const dx = coords.x - prevX;
    const dy = coords.y - prevY;

    prevX = coords.x;
    prevY = coords.y;
    ufoX = coords.x;
    ufoY = coords.y;

    pathSteps.push({ type: "l", dx, dy });

    rebuildPathFromSteps();
    renderPathStepsUI();
  }

  function endDraw() {
    if (!isDrawing) return;
    isDrawing = false;
    ufoSaucer.classList.remove("firing");
    evaluateGlyphDifference();
  }

  svgDrawingPlane.addEventListener("mousedown", startDraw);
  window.addEventListener("mousemove", moveDraw);
  window.addEventListener("mouseup", endDraw);

  svgDrawingPlane.addEventListener("touchstart", startDraw, { passive: false });
  window.addEventListener("touchmove", moveDraw, { passive: false });
  window.addEventListener("touchend", endDraw);
}

function initializeDOMElements() {
  selectGlyph = document.getElementById("glyph-select");
  textGlyphName = document.getElementById("glyph-name");
  textGlyphDifficulty = document.getElementById("glyph-difficulty");
  textGlyphDesc = document.getElementById("glyph-desc");
  targetCanvas = document.getElementById("target-canvas");

  earthCanvas = document.getElementById("earth-canvas");
  svgDrawingPlane = document.getElementById("svg-drawing-plane");
  svgTargetPath = document.getElementById("svg-target-path");
  svgUserPath = document.getElementById("svg-user-path");
  ufoSaucer = document.getElementById("ufo-saucer");
  coordHud = document.getElementById("coordinates-hud");

  tabEditor = document.getElementById("tab-editor");
  tabPilot = document.getElementById("tab-pilot");
  editorTabContent = document.getElementById("editor-tab-content");
  pilotTabContent = document.getElementById("pilot-tab-content");
  svgCodeInput = document.getElementById("svg-code-input");
  stepSlider = document.getElementById("step-slider");
  stepValue = document.getElementById("step-value");

  stepsList = document.getElementById("steps-list");
  selectNewCommand = document.getElementById("select-new-command");
  btnAddVectorStep = document.getElementById("btn-add-vector-step");

  btnLaserToggle = document.getElementById("btn-laser-toggle");
  btnHoverToggle = document.getElementById("btn-hover-toggle");
  btnClear = document.getElementById("btn-clear");
  btnUndo = document.getElementById("btn-undo");
  btnBeam = document.getElementById("btn-beam");

  coherenceRing = document.getElementById("coherence-ring");
  coherencePercentage = document.getElementById("coherence-percentage");
  matchRatingBadge = document.getElementById("match-rating-badge");
  matchRatingLabel = document.getElementById("match-rating-label");
  humanComprehensionLabel = document.getElementById(
    "human-comprehension-label",
  );
  rankProjectionLabel = document.getElementById("rank-projection-label");

  transmissionLogConsole = document.getElementById("transmission-log-console");
  submissionBox = document.getElementById("submission-box");
  pilotCodenameInput = document.getElementById("pilot-codename-input");
  btnSubmitScore = document.getElementById("btn-submit-score");
  leaderboardBody = document.getElementById("leaderboard-body");

  plasmaChargeStat = document.getElementById("plasma-charge");
  detectionRiskStat = document.getElementById("detection-risk");
}

// --- PROCEDURAL FARMLAND BACKGROUND ---
function drawProceduralFarmland() {
  const ctx = earthCanvas.getContext("2d");
  const width = earthCanvas.width;
  const height = earthCanvas.height;

  // Fill base color with Wiltshire soil green/brown
  ctx.fillStyle = "#16281a";
  ctx.fillRect(0, 0, width, height);

  // Create crop fields coordinates
  // A pattern of rectangular fields resembling English agricultural landscape
  const fields = [
    { x: 0, y: 0, w: 180, h: 120, color: "#1e3c25" },
    { x: 180, y: 0, w: 170, h: 140, color: "#2d4d29" },
    { x: 350, y: 0, w: 150, h: 100, color: "#253b1b" },

    { x: 0, y: 120, w: 120, h: 160, color: "#2d441e" },
    { x: 120, y: 140, w: 160, h: 180, color: "#345c2f" },
    { x: 280, y: 100, w: 220, h: 150, color: "#3e5223" },

    { x: 0, y: 280, w: 150, h: 220, color: "#1f4024" },
    { x: 150, y: 320, w: 180, h: 180, color: "#2e4a1a" },
    { x: 330, y: 250, w: 170, h: 250, color: "#1e3c21" },
  ];

  // Draw each agricultural field
  fields.forEach((field) => {
    ctx.fillStyle = field.color;
    ctx.fillRect(field.x, field.y, field.w, field.h);

    // Add internal texture / wheat row stripes
    ctx.strokeStyle = "rgba(0,0,0,0.12)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    // Stripe directions alternate to look like ploughed fields
    const dir = (field.x + field.y) % 3;
    if (dir === 0) {
      for (let i = field.x; i < field.x + field.w; i += 6) {
        ctx.moveTo(i, field.y);
        ctx.lineTo(i, field.y + field.h);
      }
    } else if (dir === 1) {
      for (let i = field.y; i < field.y + field.h; i += 6) {
        ctx.moveTo(field.x, i);
        ctx.lineTo(field.x + field.w, i);
      }
    } else {
      for (let i = -field.h; i < field.w; i += 8) {
        ctx.moveTo(field.x + i, field.y);
        ctx.lineTo(field.x + i + field.h, field.y + field.h);
      }
    }
    ctx.stroke();

    // Draw hedges/trees divider borders
    ctx.strokeStyle = "#0b150d";
    ctx.lineWidth = 3;
    ctx.strokeRect(field.x, field.y, field.w, field.h);
  });

  // Draw 2 massive circular center-pivot irrigation crops
  ctx.fillStyle = "#27502b";
  ctx.beginPath();
  ctx.arc(80, 420, 60, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.15)";
  ctx.lineWidth = 1;
  for (let r = 10; r < 60; r += 8) {
    ctx.beginPath();
    ctx.arc(80, 420, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.fillStyle = "#436a28";
  ctx.beginPath();
  ctx.arc(420, 80, 50, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.strokeStyle = "#1b3010";
  ctx.lineWidth = 2;
  ctx.arc(420, 80, 50, 0, Math.PI * 2);
  ctx.stroke();

  // Draw winding dirt farm roads
  ctx.strokeStyle = "#4d3d2c";
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(0, 120);
  ctx.lineTo(150, 130);
  ctx.lineTo(240, 220);
  ctx.lineTo(240, 320);
  ctx.lineTo(500, 340);
  ctx.stroke();

  ctx.strokeStyle = "#3d2f21";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Add wheat grain noise overlay
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    // Subtle noise addition in green channel
    const noise = (Math.random() - 0.5) * 14;
    data[i] = Math.max(0, Math.min(255, data[i] + noise * 0.5));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise * 0.3));
  }
  ctx.putImageData(imgData, 0, 0);
}

// --- LEVEL SETUP ---
function setupLevelSelector() {
  selectGlyph.innerHTML = "";
  GLYPHS.forEach((glyph, index) => {
    const opt = document.createElement("option");
    opt.value = index;
    opt.textContent = `${glyph.name} (${glyph.difficulty})`;
    selectGlyph.appendChild(opt);
  });

  selectGlyph.addEventListener("change", (e) => {
    loadGlyph(parseInt(e.target.value));
  });

  // Direct click on difficulty badge cycles difficulty: EASY -> MEDIUM -> HARD -> EASY
  if (textGlyphDifficulty) {
    textGlyphDifficulty.style.cursor = "pointer";
    textGlyphDifficulty.title = "Click to cycle target difficulty";
    textGlyphDifficulty.addEventListener("click", (e) => {
      e.stopPropagation();
      const diffOrder = ["EASY", "MEDIUM", "HARD"];
      const currentDiff = GLYPHS[currentGlyphIndex] ? GLYPHS[currentGlyphIndex].difficulty : "EASY";
      const nextDiffIndex = (diffOrder.indexOf(currentDiff) + 1) % diffOrder.length;
      const targetDiff = diffOrder[nextDiffIndex];

      // Find first glyph matching target difficulty
      const newIndex = GLYPHS.findIndex((g) => g.difficulty === targetDiff);
      if (newIndex !== -1) {
        selectGlyph.value = newIndex;
        loadGlyph(newIndex);
        addLogLine(
          `[DIFFICULTY] Switched target difficulty to ${targetDiff}: ${GLYPHS[newIndex].name}. Precision calibration updated.`,
          "text-system"
        );
      }
    });
  }
}

function loadGlyph(index) {
  console.log("Loading glyph", index);
  currentGlyphIndex = index;
  const glyph = GLYPHS[index];
  if (!glyph) {
      console.error("Glyph not found for index:", index);
      return;
  }
  
  if (textGlyphName) {
    textGlyphName.textContent = glyph.name;
  }
  if (textGlyphDifficulty) {
    textGlyphDifficulty.textContent = glyph.difficulty;
    // Style difficulty badge
    textGlyphDifficulty.className = "difficulty-tag " + glyph.difficulty;
  }
  if (textGlyphDesc) {
    textGlyphDesc.textContent = glyph.description;
  }

  // Update UFO container size and complexity based on difficulty
  const ufoSaucer = document.getElementById("ufo-saucer");
  if (ufoSaucer) {
    ufoSaucer.className =
      "ufo-container difficulty-" + glyph.difficulty.toLowerCase();
  }

  // Clean up any custom logo target guidelines
  const logoOverlay = document.getElementById("svg-custom-logo-overlay");
  if (logoOverlay) {
    logoOverlay.remove();
  }

  // Update targets SVG background path layer
  svgTargetPath.setAttribute("d", glyph.path);

  // Render the target hologram in left canvas
  renderTargetHologram(glyph.path);

  // Clear any existing user drawing
  resetDrawing();

  // Log message to crew chat
  addLogLine(
    `[SYSTEM] Loaded sector coordinates for ${glyph.name}.`,
    "text-system",
  );
  triggerCrewChatForSector(glyph.name);
}

function renderTargetHologram(svgPathString) {
  const ctx = targetCanvas.getContext("2d");
  const w = targetCanvas.width;
  const h = targetCanvas.height;

  ctx.clearRect(0, 0, w, h);

  // Draw scanlines/grid inside target box
  ctx.fillStyle = "#020706";
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = "rgba(0, 240, 255, 0.1)";
  ctx.lineWidth = 1;
  for (let i = 20; i < w; i += 20) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, h);
    ctx.moveTo(0, i);
    ctx.lineTo(w, i);
    ctx.stroke();
  }

  if (
    GLYPHS[currentGlyphIndex].id === "custom-logo-target" &&
    customLogoImgDataUrl
  ) {
    const img = new Image();
    img.onload = function () {
      // Draw image with padding to avoid clipping
      ctx.drawImage(img, 15, 15, w - 30, h - 30);

      // Apply holographic green tint
      const imgData = ctx.getImageData(0, 0, w, h);
      const d = imgData.data;
      for (let i = 0; i < d.length; i += 4) {
        const r = d[i],
          g = d[i + 1],
          b = d[i + 2];
        const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
        if (luminance > 15) {
          d[i] = 208; // R (lavender glow matching Sleek Interface)
          d[i + 1] = 188; // G
          d[i + 2] = 255; // B
          d[i + 3] = 240; // Alpha
        }
      }
      ctx.putImageData(imgData, 0, 0);
    };
    img.src = customLogoImgDataUrl;

    // Draw onto main tactical coordinate plane as hologram guide
    drawCustomLogoOnEarthMap();
  } else {
    // Render target path scaled from 500x500 to 160x160
    const path2D = new Path2D(svgPathString);
    ctx.save();
    ctx.scale(w / 500, h / 500);

    // Draw glow shadow
    ctx.strokeStyle = "rgba(0, 240, 255, 0.4)";
    ctx.lineWidth = 15;
    ctx.stroke(path2D);

    ctx.strokeStyle = "rgba(0, 240, 255, 0.8)";
    ctx.lineWidth = 6;
    ctx.stroke(path2D);

    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.stroke(path2D);
    ctx.restore();
  }
}

function drawCustomLogoOnEarthMap() {
  if (
    GLYPHS[currentGlyphIndex].id === "custom-logo-target" &&
    customLogoImgDataUrl
  ) {
    const img = new Image();
    img.onload = function () {
      const overlayId = "svg-custom-logo-overlay";
      let overlay = document.getElementById(overlayId);
      if (!overlay) {
        overlay = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "image",
        );
        overlay.setAttribute("id", overlayId);
        svgDrawingPlane.insertBefore(overlay, svgDrawingPlane.firstChild);
      }
      overlay.setAttribute("href", customLogoImgDataUrl);
      overlay.setAttribute("x", "100");
      overlay.setAttribute("y", "100");
      overlay.setAttribute("width", "300");
      overlay.setAttribute("height", "300");
      overlay.setAttribute("opacity", "0.35");
      overlay.setAttribute(
        "style",
        "filter: drop-shadow(0px 0px 8px #d0bcff);",
      );
    };
    img.src = customLogoImgDataUrl;
  }
}

// --- TERMINAL TAB NAVIGATION ---
function setupTerminalTabs() {
  tabEditor.addEventListener("click", () => {
    tabEditor.classList.add("active");
    tabPilot.classList.remove("active");
    editorTabContent.classList.remove("hidden");
    pilotTabContent.classList.add("hidden");
  });

  tabPilot.addEventListener("click", () => {
    tabPilot.classList.add("active");
    tabEditor.classList.remove("active");
    pilotTabContent.classList.remove("hidden");
    editorTabContent.classList.add("hidden");
  });
}

// --- MANUAL TERMINAL SYNTAX HELPERS ---
function setupSyntaxHelpers() {
  // Sync textarea manual inputs with local variables
  svgCodeInput.addEventListener("input", () => {
    const rawVal = svgCodeInput.value.trim();
    if (rawVal) {
      currentPathString = "M 250 250 " + rawVal;
    } else {
      currentPathString = "M 250 250";
    }
    // Update live preview paths
    svgUserPath.setAttribute("d", currentPathString);
    updateUFOPositionFromPath(currentPathString);

    // Sync Waypoint steps
    pathSteps = parseSVGPathToSteps(currentPathString);
    renderPathStepsUI();
  });

  // Syntax buttons injection
  document.querySelectorAll(".syntax-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      // Tutorial Checkpoint
      if (
        typeof tutorialModal !== "undefined" &&
        tutorialModal &&
        !tutorialModal.classList.contains("hidden") &&
        activeTutorialStep === 4
      ) {
        tutorialActionsDone.helperClicked = true;
        const chk = document.getElementById("tut-step4-chk");
        if (chk) {
          chk.textContent = "✔ CHECKPOINT SECURED: COMPILER CALIBRATED";
          chk.className = "checkpoint-indicator green";
        }
      }

      const cmd = btn.getAttribute("data-cmd");
      let snippet = "";

      switch (cmd) {
        case "M":
          snippet = "M 250 250 ";
          break;
        case "L":
          snippet = "L 300 300 ";
          break;
        case "C":
          snippet = "C 200 150 300 150 350 250 ";
          break;
        case "H":
          snippet = "H 350 ";
          break;
        case "V":
          snippet = "V 350 ";
          break;
        case "Z":
          snippet = "Z ";
          break;
      }

      const text = svgCodeInput.value;
      const start = svgCodeInput.selectionStart;
      const end = svgCodeInput.selectionEnd;

      svgCodeInput.value =
        text.substring(0, start) + snippet + text.substring(end);
      svgCodeInput.focus();
      svgCodeInput.selectionStart = svgCodeInput.selectionEnd =
        start + snippet.length;

      // Force trigger preview update
      svgCodeInput.dispatchEvent(new Event("input"));
    });
  });
}

// Helper to parser end coordinate of a path to position the UFO icon
function updateUFOPositionFromPath(pathStr) {
  try {
    // Create an offscreen path to use the native browser measuring tool
    const tempPath = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path",
    );
    tempPath.setAttribute("d", pathStr);
    const len = tempPath.getTotalLength();
    if (len > 0) {
      const pt = tempPath.getPointAtLength(len);
      ufoX = Math.round(pt.x);
      ufoY = Math.round(pt.y);
      moveUFOElement(ufoX, ufoY);
    }
  } catch (err) {
    // Gracefully handle parsing failures during typing
  }
}

// --- PILOT CONSOLE DIRECTIONAL JOYSTICK ---
function setupAutopilotControls() {
  // Step Slider
  stepSlider.addEventListener("input", (e) => {
    stepValue.textContent = e.target.value + "px";
  });

  // Emitter Config Toggles
  btnLaserToggle.addEventListener("click", () => {
    isLaserActive = true;
    btnLaserToggle.classList.add("active");
    btnHoverToggle.classList.remove("active");
  });

  btnHoverToggle.addEventListener("click", () => {
    isLaserActive = false;
    btnHoverToggle.classList.add("active");
    btnLaserToggle.classList.remove("active");
  });

  // Joystick Buttons
  document.querySelectorAll(".joy-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (isAnimating) return;

      // Tutorial Checkpoint
      if (
        typeof tutorialModal !== "undefined" &&
        tutorialModal &&
        !tutorialModal.classList.contains("hidden") &&
        activeTutorialStep === 3
      ) {
        tutorialActionsDone.steered = true;
        const chk = document.getElementById("tut-step3-chk");
        if (chk) {
          chk.textContent = "✔ CHECKPOINT SECURED: SPACESHIP MOVED";
          chk.className = "checkpoint-indicator green";
        }
      }

      const dir = btn.getAttribute("data-dir");
      const step = parseInt(stepSlider.value);

      let dx = 0;
      let dy = 0;

      switch (dir) {
        case "n":
          dy = -step;
          break;
        case "ne":
          dy = -step * 0.7;
          dx = step * 0.7;
          break;
        case "e":
          dx = step;
          break;
        case "se":
          dy = step * 0.7;
          dx = step * 0.7;
          break;
        case "s":
          dy = step;
          break;
        case "sw":
          dy = step * 0.7;
          dx = -step * 0.7;
          break;
        case "w":
          dx = -step;
          break;
        case "nw":
          dy = -step * 0.7;
          dx = -step * 0.7;
          break;
      }

      // Calculate coordinates and clip to sandbox bounds (0 to 500)
      let newX = Math.round(Math.max(0, Math.min(500, ufoX + dx)));
      let newY = Math.round(Math.max(0, Math.min(500, ufoY + dy)));

      if (newX === ufoX && newY === ufoY) return; // No change

      // Record history
      pathHistory.push(currentPathString);

      const cmdChar = isLaserActive ? "L" : "M";

      // Append command
      currentPathString += ` ${cmdChar} ${newX} ${newY}`;

      // Sync variables
      ufoX = newX;
      ufoY = newY;

      // Update UI elements
      svgUserPath.setAttribute("d", currentPathString);
      moveUFOElement(ufoX, ufoY);

      // Update manual terminal text (strip the starting 'M 250 250' prefix for neatness if possible)
      let strippedPath = currentPathString.replace(/^M 250 250\s*/, "");
      svgCodeInput.value = strippedPath;
      svgCodeInput.dispatchEvent(new Event("input"));

      // Play a quick jet-burst UI sound or effect
      ufoSaucer.classList.add("firing");
      setTimeout(() => {
        if (!isAnimating) ufoSaucer.classList.remove("firing");
      }, 200);

      addLogLine(
        `[STEER] Spaceship navigated to coordinates (${ufoX}, ${ufoY}) via ${isLaserActive ? "LASER-CUT" : "HOVER"}.`,
        "text-system",
      );
    });
  });
}

function moveUFOElement(x, y) {
  ufoSaucer.style.left = `${(x / 500) * 100}%`;
  ufoSaucer.style.top = `${(y / 500) * 100}%`;
  coordHud.textContent = `X: ${x} | Y: ${y}`;
}

// --- CORE ACTIONS CONTROL HUB ---
function setupActionButtons() {
  btnClear.addEventListener("click", () => {
    if (isAnimating) return;
    resetDrawing();
    addLogLine(
      `[DESTRUCT] Plasma field collapsed. Cleared current vector trails.`,
      "text-system",
    );
  });

  btnUndo.addEventListener("click", () => {
    if (isAnimating) return;
    if (pathHistory.length > 0) {
      currentPathString = pathHistory.pop();
      svgUserPath.setAttribute("d", currentPathString);
      updateUFOPositionFromPath(currentPathString);

      let strippedPath = currentPathString.replace(/^M 250 250\s*/, "");
      svgCodeInput.value = strippedPath;
      svgCodeInput.dispatchEvent(new Event("input"));

      addLogLine(
        `[ROLLBACK] Reverted spacecraft to previous waypoint.`,
        "text-system",
      );
    } else {
      addLogLine(
        `[ERROR] No flight coordinates available to rollback.`,
        "text-error",
      );
    }
  });

  btnBeam.addEventListener("click", () => {
    if (isAnimating) return;
    executeLaserBeamEngrave();
  });

  btnSubmitScore.addEventListener("click", () => {
    submitScoreToLeaderboard();
  });
}

function resetDrawing() {
  ufoX = 250;
  ufoY = 250;
  currentPathString = "M 250 250";
  pathHistory = [];

  svgUserPath.setAttribute("d", "");
  moveUFOElement(ufoX, ufoY);
  svgCodeInput.value = "";
  svgCodeInput.dispatchEvent(new Event("input"));

  // Reset scoreboards
  updateScoreUI(0.0);
  submissionBox.classList.add("hidden");
  transmissionLogConsole.classList.remove("hidden");
}

// --- SPACE SHIP PATH TRACE & LASER ENGRAVER ANIMATION ---
function executeLaserBeamEngrave() {
  // Read code input first to ensure we execute what's typed
  const rawCode = svgCodeInput.value.trim();
  currentPathString = "M 250 250" + (rawCode ? " " + rawCode : "");

  svgUserPath.setAttribute("d", currentPathString);

  // Validate path
  const totalLength = svgUserPath.getTotalLength();
  if (totalLength === 0) {
    addLogLine(
      `[SYSTEM] Emitter inactive. Set flight path coordinates first!`,
      "text-error",
    );
    return;
  }

  // Lock UI
  isAnimating = true;
  ufoSaucer.classList.add("firing");
  btnBeam.disabled = true;
  btnClear.disabled = true;
  btnUndo.disabled = true;

  // Prepare stroke animation
  svgUserPath.style.strokeDasharray = totalLength;
  svgUserPath.style.strokeDashoffset = totalLength;

  // Setup timeline
  let startTime = null;
  // Plasma charge decreases while beaming
  plasmaChargeStat.textContent = "CHARGING...";
  plasmaChargeStat.className = "value cyan-glow animate-pulse";

  const flightDuration = Math.min(5000, Math.max(1500, totalLength * 6)); // Scaled animation duration

  addLogLine(
    `[ENGRAVE] Commencing plasma beam sweep. Length: ${Math.round(totalLength)} vector units.`,
    "text-success",
  );

  function animateStep(timestamp) {
    if (!startTime) startTime = timestamp;
    const progress = (timestamp - startTime) / flightDuration;

    if (progress < 1) {
      const currentDist = progress * totalLength;

      // Get point along path
      try {
        const pt = svgUserPath.getPointAtLength(currentDist);
        ufoX = Math.round(pt.x);
        ufoY = Math.round(pt.y);
        moveUFOElement(ufoX, ufoY);
      } catch (e) {
        // Fallback
      }

      // Update path reveal
      svgUserPath.style.strokeDashoffset = totalLength - currentDist;

      // Randomly fluctuation plasma stats
      plasmaChargeStat.textContent = `${Math.round(100 - progress * 40)}%`;
      if (Math.random() < 0.05) {
        detectionRiskStat.textContent =
          Math.random() < 0.5 ? "ELEVATED" : "MODERATE";
        detectionRiskStat.className = "value red-glow animate-pulse";
      }

      requestAnimationFrame(animateStep);
    } else {
      // Completed!
      finishLaserSweep();
    }
  }

  requestAnimationFrame(animateStep);
}

function finishLaserSweep() {
  svgUserPath.style.strokeDashoffset = 0;
  ufoSaucer.classList.remove("firing");
  isAnimating = false;
  btnBeam.disabled = false;
  btnClear.disabled = false;
  btnUndo.disabled = false;

  plasmaChargeStat.textContent = "100%";
  plasmaChargeStat.className = "value cyan-glow";
  detectionRiskStat.textContent = "MINIMAL";
  detectionRiskStat.className = "value green-glow";

  addLogLine(
    `[SYSTEM] Inscription pattern sealed. Computing quantum coherence accuracy...`,
    "text-system",
  );

  // Tutorial Checkpoint
  if (
    typeof tutorialModal !== "undefined" &&
    tutorialModal &&
    !tutorialModal.classList.contains("hidden") &&
    activeTutorialStep === 5
  ) {
    tutorialActionsDone.beamFired = true;
    const chk = document.getElementById("tut-step5-chk");
    if (chk) {
      chk.textContent = "✔ CHECKPOINT SECURED: BEAM DISCHARGED";
      chk.className = "checkpoint-indicator green";
    }
    setTimeout(() => {
      activeTutorialStep = "success";
      updateTutorialUI();
    }, 1500);
  }

  // Evaluate Score using image difference
  evaluateGlyphDifference();
}

// --- COMPUTER VISION & PATTERN OVERLAP ENGINE ---
function evaluateGlyphDifference() {
  const size = 100; // Fast 100x100 resolution grid for pixel scans

  // Create offscreen canvas for Target Path
  const targetCanvasOff = document.createElement("canvas");
  targetCanvasOff.width = size;
  targetCanvasOff.height = size;
  const tCtx = targetCanvasOff.getContext("2d");

  tCtx.fillStyle = "#000";
  tCtx.fillRect(0, 0, size, size);

  if (
    GLYPHS[currentGlyphIndex].id === "custom-logo-target" &&
    customLogoImgDataUrl
  ) {
    const img = new Image();
    img.onload = function () {
      tCtx.drawImage(img, 5, 5, size - 10, size - 10);

      // Binarize logo to solid white matching drawing canvas
      const imgData = tCtx.getImageData(0, 0, size, size);
      const d = imgData.data;
      for (let i = 0; i < d.length; i += 4) {
        const r = d[i],
          g = d[i + 1],
          b = d[i + 2];
        const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
        if (luminance > 15) {
          d[i] = 255;
          d[i + 1] = 255;
          d[i + 2] = 255;
        } else {
          d[i] = 0;
          d[i + 1] = 0;
          d[i + 2] = 0;
        }
      }
      tCtx.putImageData(imgData, 0, 0);
      performPixelComparison(targetCanvasOff);
    };
    img.src = customLogoImgDataUrl;
  } else {
    tCtx.strokeStyle = "#fff";
    tCtx.lineWidth = 1.2; // Adjusted stroke width for 100x100 scale
    tCtx.lineCap = "round";
    tCtx.lineJoin = "round";

    const targetPath2D = new Path2D(GLYPHS[currentGlyphIndex].path);
    tCtx.save();
    tCtx.scale(size / 500, size / 500);
    tCtx.stroke(targetPath2D);
    tCtx.restore();

    performPixelComparison(targetCanvasOff);
  }
}

function performPixelComparison(targetCanvasOff) {
  const size = 100;
  const tCtx = targetCanvasOff.getContext("2d");

  // Create offscreen canvas for User Path
  const userCanvasOff = document.createElement("canvas");
  userCanvasOff.width = size;
  userCanvasOff.height = size;
  const uCtx = userCanvasOff.getContext("2d");

  uCtx.fillStyle = "#000";
  uCtx.fillRect(0, 0, size, size);

  uCtx.strokeStyle = "#fff";
  uCtx.lineWidth = 1.2;
  uCtx.lineCap = "round";
  uCtx.lineJoin = "round";

  const userPath2D = new Path2D(currentPathString);
  uCtx.save();
  uCtx.scale(size / 500, size / 500);
  uCtx.stroke(userPath2D);
  uCtx.restore();

  // Compare pixel grids
  const tData = tCtx.getImageData(0, 0, size, size).data;
  const uData = uCtx.getImageData(0, 0, size, size).data;

  let intersection = 0;
  let targetSum = 0;
  let userSum = 0;

  for (let i = 0; i < tData.length; i += 4) {
    const tVal = tData[i] / 255.0; // grayscale intensity of white drawing
    const uVal = uData[i] / 255.0;

    intersection += Math.min(tVal, uVal);
    targetSum += tVal;
    userSum += uVal;
  }

  // Dice Coefficient / F1-Score Similarity
  let dice = 0;
  if (targetSum + userSum > 0) {
    dice = (2.0 * intersection) / (targetSum + userSum);
  }

  let rawScore = dice * 100;

  // Adjust based on Difficulty levels
  const diff = GLYPHS[currentGlyphIndex].difficulty;
  if (diff === "EASY") {
    computedScore = parseFloat(Math.min(100.0, rawScore * 1.15).toFixed(1));
  } else if (diff === "MEDIUM") {
    computedScore = parseFloat(Math.min(100.0, rawScore).toFixed(1));
  } else if (diff === "HARD") {
    // Penalize discrepancy more severely on HARD difficulty
    computedScore = parseFloat((rawScore * 0.9).toFixed(1));
  }

  if (computedScore < 0.0) computedScore = 0.0;

  updateScoreUI(computedScore);
  triggerCrewChatForScore(computedScore);
}

function updateScoreUI(score) {
  // Update Coherence circle ring
  const circleOffset = 251.2 - (251.2 * score) / 100;
  coherenceRing.style.strokeDashoffset = circleOffset;
  coherencePercentage.textContent = `${score.toFixed(1)}%`;

  const diff = GLYPHS[currentGlyphIndex].difficulty;
  let reqStable = 70;
  let reqOptimal = 90;
  if (diff === "EASY") {
    reqStable = 60;
    reqOptimal = 80;
  } else if (diff === "HARD") {
    reqStable = 82;
    reqOptimal = 93;
  }

  if (currentPilot) {
    pilotCodenameInput.value = currentPilot.username;
  }

  // Update status label fields
  if (score === 0) {
    matchRatingBadge.textContent = "UNALIGNED";
    matchRatingBadge.className = "badge-blue";
    matchRatingLabel.textContent = "UNALIGNED";
    matchRatingLabel.className = "stat-val text-white";
    humanComprehensionLabel.textContent = "0% (NONE)";
    humanComprehensionLabel.className = "stat-val red-glow";
    rankProjectionLabel.textContent = "NOT SUBMITTED";
    rankProjectionLabel.className = "stat-val text-system";
  } else if (score >= reqOptimal) {
    matchRatingBadge.textContent = "OPTIMAL";
    matchRatingBadge.className = "badge-green";
    matchRatingLabel.textContent = "QUANTUM RESONANCE";
    matchRatingLabel.className = "stat-val green-glow";
    humanComprehensionLabel.textContent = `${Math.min(99, Math.round(score + 2))}% (CHILBOLTON ALERT)`;
    humanComprehensionLabel.className = "stat-val red-glow animate-pulse";

    // Enable submissions
    transmissionLogConsole.classList.add("hidden");
    submissionBox.classList.remove("hidden");
    pilotCodenameInput.focus();
  } else if (score >= reqStable) {
    matchRatingBadge.textContent = "STABLE";
    matchRatingBadge.className = "badge-blue";
    matchRatingLabel.textContent = "COHERENT WAVE";
    matchRatingLabel.className = "stat-val cyan-glow";
    humanComprehensionLabel.textContent = `${Math.max(10, Math.round(score - 15))}% (LOCAL RUMORS)`;
    humanComprehensionLabel.className = "stat-val text-white";

    // Enable submissions
    transmissionLogConsole.classList.add("hidden");
    submissionBox.classList.remove("hidden");
    pilotCodenameInput.focus();
  } else {
    matchRatingBadge.textContent = "DISTORTED";
    matchRatingBadge.className = "badge-blue";
    matchRatingLabel.textContent = "DE-COHERENCE ERR";
    matchRatingLabel.className = "stat-val red-glow";
    humanComprehensionLabel.textContent = "5% (TERRESTRIAL STATIC)";
    humanComprehensionLabel.className = "stat-val text-system";

    addLogLine(
      `[WARNING] Coherence rating too low for ${diff} difficulty (Requires ${reqStable}%). Submit score blocked.`,
      "text-error",
    );
  }
}

// --- CREW LOG DIALOG SYSTEM ---
function addLogLine(text, className) {
  const div = document.createElement("div");
  div.className = `log-line ${className}`;
  div.innerHTML = text;
  transmissionLogConsole.appendChild(div);

  // Auto scroll
  transmissionLogConsole.scrollTop = transmissionLogConsole.scrollHeight;
}

function triggerCrewChatForSector(sectorName) {
  const logs = [
    {
      sender: "Xylar",
      text: `Vector scanner locking on sector field: '${sectorName}'. Preparing beam emitters.`,
    },
    {
      sender: "Zorblax",
      text: `Roger. Adjusting stealth cloaking coils. Local weather reports show thick Wiltshire fog — excellent human visual cover.`,
    },
  ];

  logs.forEach((log, i) => {
    setTimeout(
      () => {
        addLogLine(
          `[COMM] <span class="alien-name">${log.sender}</span>: ${log.text}`,
          "text-alien",
        );
      },
      (i + 1) * 800,
    );
  });
}

function triggerCrewChatForScore(score) {
  let comments = [];
  if (score >= 90) {
    comments = [
      {
        sender: "Xylar",
        text: `Incredible! A perfect match of ${score}%. The humans will think a hyper-dimensional gravitational vortex created this overnight!`,
      },
      {
        sender: "Zorblax",
        text: `Spectacular work, Pilot! Space-force intelligence confirms zero human crop disruption suspicion. High-resonance signal transmitted to mother-vessel.`,
      },
    ];
  } else if (score >= 70) {
    comments = [
      {
        sender: "Commander Xylos",
        text: `Coherence level stable at ${score}%. It will suffice for our orbital coordinate beacons.`,
      },
      {
        sender: "Xylar",
        text: `Agreed, but you clipped the wheat slightly at the edges. Make sure your splines are clean next orbit.`,
      },
    ];
  } else {
    comments = [
      {
        sender: "Zorblax",
        text: `Disastrous calibration! A measly ${score}% accuracy. It looks like a drunken terrestrial tractor drove through the fields.`,
      },
      {
        sender: "Commander Xylos",
        text: `Warning! Local human farmers are already posting photos claiming 'fake CGI crop circles'. Recalibrate and overwrite immediate vector trails!`,
      },
    ];
  }

  comments.forEach((log, i) => {
    setTimeout(
      () => {
        addLogLine(
          `[COMM] <span class="alien-name">${log.sender}</span>: ${log.text}`,
          "text-alien",
        );
      },
      (i + 1) * 600,
    );
  });
}

// --- LEADERBOARD LOCAL STORAGE ENGINE ---
function loadLeaderboard() {
  let stored = localStorage.getItem("geoglypher_leaderboard_v1");
  if (!stored) {
    // Populate defaults
    localStorage.setItem(
      "geoglypher_leaderboard_v1",
      JSON.stringify(DEFAULT_LEADERBOARD),
    );
    stored = JSON.stringify(DEFAULT_LEADERBOARD);
  }

  const scores = JSON.parse(stored);
  renderLeaderboard(scores);
}

function renderLeaderboard(scoresList) {
  leaderboardBody.innerHTML = "";

  // Sort scores primarily by score descending, then by pathLength ascending (smaller is better/more efficient)
  scoresList.sort((a, b) => {
    if (Math.abs(b.score - a.score) > 0.01) {
      return b.score - a.score;
    }
    const aLen = a.pathLength !== undefined ? a.pathLength : 9999;
    const bLen = b.pathLength !== undefined ? b.pathLength : 9999;
    return aLen - bLen;
  });

  // Display top 8 entries
  scoresList.slice(0, 8).forEach((item, index) => {
    const tr = document.createElement("tr");

    const tdPilot = document.createElement("td");
    tdPilot.textContent = `${index + 1}. ${item.name}`;
    if (index === 0) tdPilot.classList.add("rank-highlight");

    const tdGlyph = document.createElement("td");
    tdGlyph.textContent = item.glyph;

    const tdScore = document.createElement("td");
    const lenText = item.pathLength
      ? `<span class="len-sub">${item.pathLength}ch</span>`
      : "";
    tdScore.innerHTML = `<span class="green-glow">${item.score.toFixed(1)}%</span>${lenText}`;

    tr.appendChild(tdPilot);
    tr.appendChild(tdGlyph);
    tr.appendChild(tdScore);
    leaderboardBody.appendChild(tr);
  });
}

function submitScoreToLeaderboard() {
  const codename = pilotCodenameInput.value.trim().toUpperCase() || "ZORG";
  const currentGlyphName = GLYPHS[currentGlyphIndex].name;

  // Get minified character length of drawing path for the tiebreaker
  const rawPathCode = svgCodeInput
    ? svgCodeInput.value.trim().replace(/\s+/g, " ")
    : "";
  const pathLen = rawPathCode.length;

  let stored = localStorage.getItem("geoglypher_leaderboard_v1");
  const scores = stored ? JSON.parse(stored) : [];

  const newEntry = {
    name: codename,
    glyph: currentGlyphName,
    score: computedScore,
    pathLength: pathLen,
    date: new Date().toISOString().split("T")[0],
  };

  scores.push(newEntry);
  localStorage.setItem("geoglypher_leaderboard_v1", JSON.stringify(scores));

  // Reload scoreboard display
  renderLeaderboard(scores);

  // Find Rank
  scores.sort((a, b) => {
    if (Math.abs(b.score - a.score) > 0.01) {
      return b.score - a.score;
    }
    const aLen = a.pathLength !== undefined ? a.pathLength : 9999;
    const bLen = b.pathLength !== undefined ? b.pathLength : 9999;
    return aLen - bLen;
  });
  const myRank =
    scores.findIndex(
      (x) =>
        x.name === codename &&
        x.score === computedScore &&
        x.glyph === currentGlyphName &&
        x.pathLength === pathLen,
    ) + 1;
  rankProjectionLabel.textContent = `#${myRank} OF ${scores.length}`;
  rankProjectionLabel.className = "stat-val green-glow";

  // Update Pilot Experience and historical records on login
  if (currentPilot && codename === currentPilot.username) {
    if (!currentPilot.history) currentPilot.history = [];
    currentPilot.history.push({
      glyph: currentGlyphName,
      score: computedScore,
    });

    // Calculate difficulty reward
    const diff = GLYPHS[currentGlyphIndex].difficulty;
    let xpAward = 50;
    if (diff === "MEDIUM") xpAward = 100;
    if (diff === "HARD") xpAward = 200;

    currentPilot.xp += xpAward;

    const accounts = JSON.parse(
      localStorage.getItem("geoglypher_accounts_v1") || "{}",
    );
    if (accounts[currentPilot.username]) {
      accounts[currentPilot.username].history = currentPilot.history;
      accounts[currentPilot.username].xp = currentPilot.xp;
      localStorage.setItem("geoglypher_accounts_v1", JSON.stringify(accounts));
    }
    localStorage.setItem(
      "geoglypher_active_pilot_v1",
      JSON.stringify(currentPilot),
    );
    refreshProfileUI();

    addLogLine(
      `[XP-GAIN] Awarded +${xpAward} Flight Experience to Pilot ${codename}!`,
      "text-success",
    );
  }

  // Switch UI panels back
  submissionBox.classList.add("hidden");

  // Automatically activate the rankings tab so they see their score instantly on the cockpit dashboard!
  const btnTabLeaderboard = document.getElementById("btn-tab-leaderboard");
  const btnTabComms = document.getElementById("btn-tab-comms");
  const leaderboardConsole = document.getElementById("leaderboard-console");
  const transmissionLogConsole = document.getElementById(
    "transmission-log-console",
  );
  const transmissionDrawer = document.getElementById("transmission-drawer");
  const drawerContent = document.getElementById("drawer-content");
  const drawerToggleArrow = document.getElementById("drawer-toggle-arrow");

  if (
    btnTabLeaderboard &&
    btnTabComms &&
    leaderboardConsole &&
    transmissionLogConsole
  ) {
    btnTabLeaderboard.classList.add("active");
    btnTabComms.classList.remove("active");
    leaderboardConsole.classList.remove("hidden");
    transmissionLogConsole.classList.add("hidden");

    // Auto expand drawer
    if (
      transmissionDrawer &&
      transmissionDrawer.classList.contains("minimized")
    ) {
      transmissionDrawer.classList.remove("minimized");
      if (drawerContent) drawerContent.classList.remove("hidden");
      if (drawerToggleArrow) drawerToggleArrow.textContent = "▼ COLLAPSE";
    }
  } else {
    transmissionLogConsole.classList.remove("hidden");
  }

  // Asynchronous background telemetry dispatch
  addLogLine(
    `[TELEMETRY] Connecting to Kepler-186f Telemetry Server...`,
    "text-system",
  );
  window.firstGeoglyphCompleted = true;

  setTimeout(() => {
    addLogLine(
      `[TELEMETRY] Connection secured! Telemetry data successfully uploaded to Kepler-186f.`,
      "text-success",
    );
  }, 1000);

  addLogLine(
    `[TELEMETRY] Local coherence log saved. Telemetry Rank: #${myRank}.`,
    "text-success",
  );
}

/* ===================================================
   SECURE AUTHENTICATION SYSTEM & PILOT PROFILES
   =================================================== */
function setupAuthSystem() {
  authModal = document.getElementById("auth-modal");
  hudPilotName = document.getElementById("hud-pilot-name");
  hudPilotAuth = document.getElementById("hud-pilot-auth");

  // Keep auth modal permanently hidden
  if (authModal) {
    authModal.classList.add("hidden");
    authModal.style.display = "none";
  }

  // Automatically authenticate as alien Pilot ZORG without requiring login screen
  currentPilot = {
    username: "ZORG",
    species: "Zeta Reticuli Grey",
    xp: 2850,
    history: []
  };

  if (hudPilotName) {
    hudPilotName.textContent = "ZORG (AUTHENTICATED)";
    hudPilotName.className = "value green-glow";
  }

  if (hudPilotAuth) {
    hudPilotAuth.style.cursor = "default";
  }

  if (typeof addLogLine === "function") {
    addLogLine("[AUTH] Direct neural authorization active. Pilot ZORG authenticated.", "text-success");
  }
}

function refreshProfileUI() {
  if (hudPilotName) {
    hudPilotName.textContent = "ZORG (AUTHENTICATED)";
    hudPilotName.className = "value green-glow";
  }
}

/* ===================================================
   IN-APP PURCHASE ($999 COMPANY LOGO PROJECTOR)
   =================================================== */
function setupIAPSystem() {
  iapModal = document.getElementById("iap-modal");
  btnCloseIap = document.getElementById("btn-close-iap");
  btnIapTrigger = document.getElementById("btn-iap-trigger");
  logoUploadContainer = document.getElementById("logo-upload-container");
  logoFileInput = document.getElementById("logo-file-input");
  billingCard = document.getElementById("billing-card");
  billingExp = document.getElementById("billing-exp");
  billingCvv = document.getElementById("billing-cvv");
  billingZip = document.getElementById("billing-zip");
  iapProcessing = document.getElementById("iap-processing");
  btnPurchaseConfirm = document.getElementById("btn-purchase-confirm");

  // Always enable custom logo for free!
  hasCustomLogoPurchased = true;
  if (btnIapTrigger) {
    btnIapTrigger.classList.add("hidden");
  }
  if (logoUploadContainer) {
    logoUploadContainer.classList.remove("hidden");
  }

  if (btnIapTrigger && iapModal) {
    btnIapTrigger.addEventListener("click", () => {
      iapModal.classList.remove("hidden");
    });
  }

  if (btnCloseIap && iapModal) {
    btnCloseIap.addEventListener("click", () => {
      iapModal.classList.add("hidden");
    });
  }

  if (btnPurchaseConfirm && iapModal) {
    btnPurchaseConfirm.addEventListener("click", () => {
      hasCustomLogoPurchased = true;
      if (btnIapTrigger) btnIapTrigger.classList.add("hidden");
      if (logoUploadContainer) logoUploadContainer.classList.remove("hidden");
      iapModal.classList.add("hidden");
    });
  }

  if (logoFileInput) {
    logoFileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (evt) {
        customLogoImgDataUrl = evt.target.result;

        const customGlyph = {
          id: "custom-logo-target",
          name: "Branded Crop Circle",
          difficulty: "HARD",
          description:
            "Your custom company logo outline projected on Earth soils. Execute vector alignments to calibrate brand outreach.",
          path: "M 250 150 C 350 150 350 350 250 350 C 150 350 150 150 250 150 Z",
        };

        const existingIdx = GLYPHS.findIndex(
          (x) => x.id === "custom-logo-target",
        );
        if (existingIdx !== -1) {
          GLYPHS[existingIdx] = customGlyph;
        } else {
          GLYPHS.push(customGlyph);
        }

        setupLevelSelector();

        const customIdx = GLYPHS.findIndex(
          (x) => x.id === "custom-logo-target",
        );
        selectGlyph.value = customIdx;
        loadGlyph(customIdx);

        addLogLine(
          "[ASSETS] Successfully ingested corporate PNG asset. Recalibrating Hologram Matrix Profiler.",
          "text-success",
        );
      };
      reader.readAsDataURL(file);
    }
  });
}
}

/* ===================================================
   FLIGHT ACADEMY INTERACTIVE ONBOARDING TUTORIAL
   =================================================== */
function setupTutorialSystem() {
  tutorialModal = document.getElementById("tutorial-modal");
  btnCloseTutorial = document.getElementById("btn-close-tutorial");
  btnTutPrev = document.getElementById("btn-tut-prev");
  btnTutNext = document.getElementById("btn-tut-next");
  btnTutorialFinish = document.getElementById("btn-tutorial-finish");
  hudTutorialBtn = document.getElementById("hud-tutorial-btn");
  hudAcademyStatus = document.getElementById("hud-academy-status");

  if (hudTutorialBtn) {
    hudTutorialBtn.addEventListener("click", () => {
      openTutorial();
    });
  }

  btnCloseTutorial.addEventListener("click", () => {
    tutorialModal.classList.add("hidden");
  });

  btnTutPrev.addEventListener("click", () => {
    if (activeTutorialStep > 1) {
      activeTutorialStep--;
      updateTutorialUI();
    }
  });

  btnTutNext.addEventListener("click", () => {
    if (activeTutorialStep < 5) {
      if (activeTutorialStep === 3 && !tutorialActionsDone.steered) {
        addLogLine(
          "[TUTORIAL] Pilot navigation lock active! Select 'SHIP AUTOPILOT' tab and press a directional joystick button to steer.",
          "text-warning"
        );
        return;
      }
      if (activeTutorialStep === 4 && !tutorialActionsDone.helperClicked) {
        addLogLine(
          "[TUTORIAL] Syntax compiler calibration needed! Click 'L [X] [Y]' button or enter path directives in 'PLASMA CODER' tab.",
          "text-warning"
        );
        return;
      }
      activeTutorialStep++;
      updateTutorialUI();
    } else {
      activeTutorialStep = "success";
      updateTutorialUI();
    }
  });

  btnTutorialFinish.addEventListener("click", () => {
    tutorialModal.classList.add("hidden");

    if (currentPilot) {
      currentPilot.xp += 250;
      const accounts = JSON.parse(
        localStorage.getItem("geoglypher_accounts_v1") || "{}",
      );
      if (accounts[currentPilot.username]) {
        accounts[currentPilot.username].xp = currentPilot.xp;
        localStorage.setItem(
          "geoglypher_accounts_v1",
          JSON.stringify(accounts),
        );
      }
      localStorage.setItem(
        "geoglypher_active_pilot_v1",
        JSON.stringify(currentPilot),
      );
      refreshProfileUI();
    }

    hudAcademyStatus.textContent = "COMPLETED";
    hudAcademyStatus.className = "value green-glow";
    addLogLine(
      "[ACADEMY] Flight training certificate received. +250 XP synchronized.",
      "text-success",
    );
  });

  localStorage.setItem("geoglypher_completed_tutorial_v1", "true");
}

function openTutorial() {
  activeTutorialStep = 1;
  tutorialActionsDone = {
    steered: false,
    helperClicked: false,
    beamFired: false,
  };
  tutorialModal.classList.remove("hidden");
  updateTutorialUI();
}

function updateTutorialUI() {
  document
    .querySelectorAll(".tutorial-step-pane")
    .forEach((pane) => pane.classList.add("hidden"));

  document.querySelectorAll(".progress-step").forEach((step, idx) => {
    step.className = "progress-step";
    const sNum = idx + 1;
    if (sNum === activeTutorialStep) {
      step.classList.add("active");
    } else if (sNum < activeTutorialStep || activeTutorialStep === "success") {
      step.classList.add("completed");
    }
  });

  if (activeTutorialStep === "success") {
    document.getElementById("tutorial-step-success").classList.remove("hidden");
    document.getElementById("tutorial-nav-actions").classList.add("hidden");
  } else {
    document
      .getElementById(`tutorial-step-content-${activeTutorialStep}`)
      .classList.remove("hidden");
    document.getElementById("tutorial-nav-actions").classList.remove("hidden");

    btnTutPrev.classList.toggle("hidden", activeTutorialStep === 1);

    if (activeTutorialStep === 5) {
      btnTutNext.textContent = "COMPLETE CALIBRATION";
    } else {
      btnTutNext.textContent = "NEXT SYSTEM";
    }
  }

  highlightCockpitPanel(activeTutorialStep);
}

function highlightCockpitPanel(step) {
  document.querySelectorAll(".hud-panel").forEach((p) => (p.style.border = ""));

  if (step === 2) {
    document.getElementById("panel-targets").style.border =
      "1px solid var(--border-neon)";
    document.getElementById("panel-map").style.border =
      "1px solid var(--border-target)";
    document.getElementById("panel-controls").style.border =
      "1px solid var(--border-neon)";
  } else if (step === 3) {
    document.getElementById("panel-map").style.border =
      "2px solid var(--border-target)";
    document.getElementById("panel-controls").style.border =
      "2px solid var(--border-neon)";
    tabPilot.click();
  } else if (step === 4) {
    document.getElementById("panel-controls").style.border =
      "2px solid var(--border-neon)";
    tabEditor.click();
  } else if (step === 5) {
    document.getElementById("panel-controls").style.border =
      "2px solid var(--border-target)";
  }
}

// --- WAYPOINT CALCULATOR CORE IMPL ---
function setupWaypointBuilderEvents() {
  if (btnAddVectorStep) {
    btnAddVectorStep.addEventListener("click", () => {
      const type = selectNewCommand.value;
      let newStep;
      if (type === "l") {
        newStep = { type: "l", dx: 30, dy: 30 };
      } else if (type === "c") {
        newStep = {
          type: "c",
          dx1: 10,
          dy1: -20,
          dx2: 40,
          dy2: -20,
          dx: 50,
          dy: 0,
        };
      } else if (type === "h") {
        newStep = { type: "h", dx: 30 };
      } else if (type === "v") {
        newStep = { type: "v", dy: 30 };
      } else if (type === "z") {
        newStep = { type: "z" };
      }

      pathSteps.push(newStep);
      renderPathStepsUI();
      rebuildPathFromSteps();

      // Scroll steps list to bottom
      if (stepsList) {
        stepsList.scrollTop = stepsList.scrollHeight;
      }
    });
  }

  // Delegated inputs inside the scroll container
  if (stepsList) {
    stepsList.addEventListener("input", (e) => {
      if (e.target.classList.contains("step-num-input")) {
        const idx = parseInt(e.target.getAttribute("data-step"));
        const field = e.target.getAttribute("data-field");
        const val = parseInt(e.target.value) || 0;

        if (pathSteps[idx]) {
          pathSteps[idx][field] = val;
          rebuildPathFromSteps();
        }
      }
    });

    // Delegated delete buttons
    stepsList.addEventListener("click", (e) => {
      if (e.target.classList.contains("btn-delete-step")) {
        const idx = parseInt(e.target.getAttribute("data-step"));
        pathSteps.splice(idx, 1);
        renderPathStepsUI();
        rebuildPathFromSteps();
      }
    });
  }

  // Minimizable Flight deck overlay toggle
  const flightOverlay = document.getElementById("flight-panel-overlay");
  const btnToggleFlight = document.getElementById("btn-toggle-flight-overlay");
  const btnToggleFlightInner = document.getElementById(
    "btn-toggle-flight-overlay-inner",
  );
  const flightContent = document.getElementById("flight-overlay-content");

  function toggleFlightOverlay() {
    if (!flightOverlay || !flightContent) return;
    if (flightOverlay.classList.contains("minimized")) {
      flightOverlay.classList.remove("minimized");
      flightContent.classList.remove("hidden");
      if (btnToggleFlightInner) btnToggleFlightInner.textContent = "COLLAPSE";
    } else {
      flightOverlay.classList.add("minimized");
      flightContent.classList.add("hidden");
      if (btnToggleFlightInner) btnToggleFlightInner.textContent = "EXPAND";
    }
  }

  if (btnToggleFlight) {
    btnToggleFlight.addEventListener("click", toggleFlightOverlay);
  }
  if (btnToggleFlightInner) {
    btnToggleFlightInner.addEventListener("click", toggleFlightOverlay);
  }

  // --- CONNECT VERTICAL LEFT GLYPH SELECTORS ---
  document.querySelectorAll(".tool-glyph-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const cmd = btn.getAttribute("data-cmd");

      // Update active state visual cue
      document
        .querySelectorAll(".tool-glyph-btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      if (cmd === "m") {
        // 'm' sets start coordinate. We default reset path steps to the ship's current coordinates
        pathSteps = [{ type: "M", x: Math.round(ufoX), y: Math.round(ufoY) }];
        rebuildPathFromSteps();
        renderPathStepsUI();
      } else {
        const selectNewCommand = document.getElementById("select-new-command");
        const btnAddVectorStep = document.getElementById("btn-add-vector-step");
        if (selectNewCommand && btnAddVectorStep) {
          selectNewCommand.value = cmd;
          btnAddVectorStep.click();
        }
      }
    });
  });

  // --- RIGHT WAYPOINTS CODE VS LIST TOGGLE ---
  const btnToggleRawCompiler = document.getElementById(
    "btn-toggle-raw-compiler",
  );
  const waypointListView = document.getElementById("waypoint-list-view");
  const rawCompilerView = document.getElementById("raw-compiler-view");

  if (btnToggleRawCompiler && waypointListView && rawCompilerView) {
    btnToggleRawCompiler.addEventListener("click", () => {
      if (waypointListView.classList.contains("hidden")) {
        waypointListView.classList.remove("hidden");
        rawCompilerView.classList.add("hidden");
        btnToggleRawCompiler.textContent = "CODE";
      } else {
        waypointListView.classList.add("hidden");
        rawCompilerView.classList.remove("hidden");
        btnToggleRawCompiler.textContent = "LIST";
      }
    });
  }

  // --- BOTTOM COLLAPSIBLE TRANSMISSION DRAWER & TAB MECHANICS ---
  const transmissionDrawer = document.getElementById("transmission-drawer");
  const btnToggleDrawer = document.getElementById("btn-toggle-drawer");
  const drawerContent = document.getElementById("drawer-content");
  const drawerToggleArrow = document.getElementById("drawer-toggle-arrow");
  const btnTabComms = document.getElementById("btn-tab-comms");
  const btnTabLeaderboard = document.getElementById("btn-tab-leaderboard");
  const transmissionLogConsole = document.getElementById(
    "transmission-log-console",
  );
  const leaderboardConsole = document.getElementById("leaderboard-console");

  if (transmissionDrawer && btnToggleDrawer && drawerContent) {
    btnToggleDrawer.addEventListener("click", () => {
      if (transmissionDrawer.classList.contains("minimized")) {
        transmissionDrawer.classList.remove("minimized");
        drawerContent.classList.remove("hidden");
        if (drawerToggleArrow) drawerToggleArrow.textContent = "▼ COLLAPSE";
      } else {
        transmissionDrawer.classList.add("minimized");
        drawerContent.classList.add("hidden");
        if (drawerToggleArrow) drawerToggleArrow.textContent = "▲ EXPAND";
      }
    });
  }

  if (
    btnTabComms &&
    btnTabLeaderboard &&
    transmissionLogConsole &&
    leaderboardConsole
  ) {
    btnTabComms.addEventListener("click", (e) => {
      e.stopPropagation();
      btnTabComms.classList.add("active");
      btnTabLeaderboard.classList.remove("active");
      transmissionLogConsole.classList.remove("hidden");
      leaderboardConsole.classList.add("hidden");

      // Auto expand if minimized
      if (
        transmissionDrawer &&
        transmissionDrawer.classList.contains("minimized")
      ) {
        transmissionDrawer.classList.remove("minimized");
        drawerContent.classList.remove("hidden");
        if (drawerToggleArrow) drawerToggleArrow.textContent = "▼ COLLAPSE";
      }
    });

    btnTabLeaderboard.addEventListener("click", (e) => {
      e.stopPropagation();
      btnTabLeaderboard.classList.add("active");
      btnTabComms.classList.remove("active");
      leaderboardConsole.classList.remove("hidden");
      transmissionLogConsole.classList.add("hidden");

      // Auto expand if minimized
      if (
        transmissionDrawer &&
        transmissionDrawer.classList.contains("minimized")
      ) {
        transmissionDrawer.classList.remove("minimized");
        drawerContent.classList.remove("hidden");
        if (drawerToggleArrow) drawerToggleArrow.textContent = "▼ COLLAPSE";
      }
    });
  }

  // Initial draw
  renderPathStepsUI();
}

function parseSVGPathToSteps(pathStr) {
  const steps = [];
  const tokens = pathStr.match(/([a-df-z]|[+-]?\d+(\.\d+)?)/gi) || [];

  let i = 0;
  while (i < tokens.length) {
    let token = tokens[i];
    if (isNaN(token)) {
      const cmd = token;
      i++;

      if (cmd.toUpperCase() === "M") {
        const x = Math.round(parseFloat(tokens[i++])) || 250;
        const y = Math.round(parseFloat(tokens[i++])) || 250;
        steps.push({ type: "M", x, y });
      } else if (cmd === "l") {
        const dx = Math.round(parseFloat(tokens[i++])) || 0;
        const dy = Math.round(parseFloat(tokens[i++])) || 0;
        steps.push({ type: "l", dx, dy });
      } else if (cmd === "c") {
        const dx1 = Math.round(parseFloat(tokens[i++])) || 0;
        const dy1 = Math.round(parseFloat(tokens[i++])) || 0;
        const dx2 = Math.round(parseFloat(tokens[i++])) || 0;
        const dy2 = Math.round(parseFloat(tokens[i++])) || 0;
        const dx = Math.round(parseFloat(tokens[i++])) || 0;
        const dy = Math.round(parseFloat(tokens[i++])) || 0;
        steps.push({ type: "c", dx1, dy1, dx2, dy2, dx, dy });
      } else if (cmd === "h") {
        const dx = Math.round(parseFloat(tokens[i++])) || 0;
        steps.push({ type: "h", dx });
      } else if (cmd === "v") {
        const dy = Math.round(parseFloat(tokens[i++])) || 0;
        steps.push({ type: "v", dy });
      } else if (cmd === "z" || cmd === "Z") {
        steps.push({ type: "z" });
      } else {
        // Absolute commands conversion to relative
        if (cmd === "L") {
          const prevPt = getAbsolutePositionAt(steps, steps.length);
          const x = Math.round(parseFloat(tokens[i++])) || 250;
          const y = Math.round(parseFloat(tokens[i++])) || 250;
          steps.push({ type: "l", dx: x - prevPt.x, dy: y - prevPt.y });
        } else if (cmd === "H") {
          const prevPt = getAbsolutePositionAt(steps, steps.length);
          const x = Math.round(parseFloat(tokens[i++])) || 250;
          steps.push({ type: "h", dx: x - prevPt.x });
        } else if (cmd === "V") {
          const prevPt = getAbsolutePositionAt(steps, steps.length);
          const y = Math.round(parseFloat(tokens[i++])) || 250;
          steps.push({ type: "v", dy: y - prevPt.y });
        } else if (cmd === "C") {
          const prevPt = getAbsolutePositionAt(steps, steps.length);
          const x1 = Math.round(parseFloat(tokens[i++])) || 0;
          const y1 = Math.round(parseFloat(tokens[i++])) || 0;
          const x2 = Math.round(parseFloat(tokens[i++])) || 0;
          const y2 = Math.round(parseFloat(tokens[i++])) || 0;
          const x = Math.round(parseFloat(tokens[i++])) || 0;
          const y = Math.round(parseFloat(tokens[i++])) || 0;
          steps.push({
            type: "c",
            dx1: x1 - prevPt.x,
            dy1: y1 - prevPt.y,
            dx2: x2 - prevPt.x,
            dy2: y2 - prevPt.y,
            dx: x - prevPt.x,
            dy: y - prevPt.y,
          });
        }
      }
    } else {
      i++;
    }
  }

  if (steps.length === 0 || steps[0].type !== "M") {
    steps.unshift({ type: "M", x: 250, y: 250 });
  }
  return steps;
}

function getAbsolutePositionAt(steps, index) {
  let x = 250;
  let y = 250;
  for (let i = 0; i < index && i < steps.length; i++) {
    const s = steps[i];
    if (s.type === "M") {
      x = s.x;
      y = s.y;
    } else if (s.type === "l") {
      x += s.dx;
      y += s.dy;
    } else if (s.type === "h") {
      x += s.dx;
    } else if (s.type === "v") {
      y += s.dy;
    } else if (s.type === "c") {
      x += s.dx;
      y += s.dy;
    }
  }
  return { x, y };
}

function renderPathStepsUI() {
  if (!stepsList) return;
  stepsList.innerHTML = "";

  pathSteps.forEach((step, idx) => {
    const card = document.createElement("div");
    card.className = "step-card";

    if (step.type === "M") {
      card.classList.add("step-card-start");
      card.innerHTML = `
        <div class="step-meta">
          <span class="step-icon">🛰️</span>
          <span class="step-title">GPS SECTOR START COORDS</span>
        </div>
        <div class="step-inputs">
          <label>LAT (X): <input type="number" class="step-num-input" data-step="${idx}" data-field="x" value="${step.x}" min="0" max="500"></label>
          <label>LONG (Y): <input type="number" class="step-num-input" data-step="${idx}" data-field="y" value="${step.y}" min="0" max="500"></label>
        </div>
      `;
    } else if (step.type === "l") {
      card.innerHTML = `
        <div class="step-meta">
          <span class="step-index">#${idx}</span>
          <span class="step-icon">➡️</span>
          <span class="step-title">LASER VECTOR</span>
          <button class="btn-delete-step" data-step="${idx}">&times;</button>
        </div>
        <div class="step-inputs">
          <label>ΔX: <input type="number" class="step-num-input" data-step="${idx}" data-field="dx" value="${step.dx}"></label>
          <label>ΔY: <input type="number" class="step-num-input" data-step="${idx}" data-field="dy" value="${step.dy}"></label>
        </div>
      `;
    } else if (step.type === "c") {
      card.innerHTML = `
        <div class="step-meta">
          <span class="step-index">#${idx}</span>
          <span class="step-icon">🌀</span>
          <span class="step-title">CURVED SPLINE</span>
          <button class="btn-delete-step" data-step="${idx}">&times;</button>
        </div>
        <div class="step-inputs-grid">
          <label>CP1 ΔX: <input type="number" class="step-num-input" data-step="${idx}" data-field="dx1" value="${step.dx1}"></label>
          <label>CP1 ΔY: <input type="number" class="step-num-input" data-step="${idx}" data-field="dy1" value="${step.dy1}"></label>
          <label>CP2 ΔX: <input type="number" class="step-num-input" data-step="${idx}" data-field="dx2" value="${step.dx2}"></label>
          <label>CP2 ΔY: <input type="number" class="step-num-input" data-step="${idx}" data-field="dy2" value="${step.dy2}"></label>
          <label>DEST ΔX: <input type="number" class="step-num-input" data-step="${idx}" data-field="dx" value="${step.dx}"></label>
          <label>DEST ΔY: <input type="number" class="step-num-input" data-step="${idx}" data-field="dy" value="${step.dy}"></label>
        </div>
      `;
    } else if (step.type === "h") {
      card.innerHTML = `
        <div class="step-meta">
          <span class="step-index">#${idx}</span>
          <span class="step-icon">↔️</span>
          <span class="step-title">HORIZONTAL CUT</span>
          <button class="btn-delete-step" data-step="${idx}">&times;</button>
        </div>
        <div class="step-inputs">
          <label>ΔX: <input type="number" class="step-num-input" data-step="${idx}" data-field="dx" value="${step.dx}"></label>
        </div>
      `;
    } else if (step.type === "v") {
      card.innerHTML = `
        <div class="step-meta">
          <span class="step-index">#${idx}</span>
          <span class="step-icon">↕️</span>
          <span class="step-title">VERTICAL CUT</span>
          <button class="btn-delete-step" data-step="${idx}">&times;</button>
        </div>
        <div class="step-inputs">
          <label>ΔY: <input type="number" class="step-num-input" data-step="${idx}" data-field="dy" value="${step.dy}"></label>
        </div>
      `;
    } else if (step.type === "z") {
      card.classList.add("step-card-close");
      card.innerHTML = `
        <div class="step-meta">
          <span class="step-index">#${idx}</span>
          <span class="step-icon">🔒</span>
          <span class="step-title">SEAL & COMPLETE</span>
          <button class="btn-delete-step" data-step="${idx}">&times;</button>
        </div>
        <div class="step-inputs" style="padding: 4px 8px;">
          <span class="step-desc" style="font-size: 9px; color: #79a199;">Returns to start point and seals the crop circle.</span>
        </div>
      `;
    }

    stepsList.appendChild(card);
  });
}

function rebuildPathFromSteps() {
  let pathStr = "";
  pathSteps.forEach((step, idx) => {
    if (step.type === "M") {
      pathStr += `M ${step.x} ${step.y} `;
    } else if (step.type === "l") {
      pathStr += `l ${step.dx} ${step.dy} `;
    } else if (step.type === "c") {
      pathStr += `c ${step.dx1} ${step.dy1} ${step.dx2} ${step.dy2} ${step.dx} ${step.dy} `;
    } else if (step.type === "h") {
      pathStr += `h ${step.dx} `;
    } else if (step.type === "v") {
      pathStr += `v ${step.dy} `;
    } else if (step.type === "z") {
      pathStr += `z `;
    }
  });

  currentPathString = pathStr.trim();
  if (svgUserPath) {
    svgUserPath.setAttribute("d", currentPathString);
  }
  updateUFOPositionFromPath(currentPathString);

  const strippedPath = currentPathString.replace(/^M \d+ \d+\s*/, "");
  if (svgCodeInput) {
    svgCodeInput.value = strippedPath;
  }

  evaluateGlyphDifference();
}

/* ===================================================
   UNIFIED COCKPIT STARTUP SCREEN & ORBITAL MISSION CONTROL
   =================================================== */
window.firstGeoglyphCompleted = false;

function setupCustomMissions() {
  const missionModal = document.getElementById("mission-selector-modal");
  const btnCloseMissions = document.getElementById("btn-close-missions");
  const btnOpenMissions = document.getElementById("btn-open-missions");
  const btnEngageMission = document.getElementById("btn-engage-mission");
  const missionPilotNameInput = document.getElementById("mission-pilot-name");
  const missionCardsGrid = document.getElementById("mission-cards-grid");

  let selectedIndex = 0;

  // Render cards
  if (missionCardsGrid) {
    missionCardsGrid.innerHTML = "";
    GLYPHS.forEach((glyph, index) => {
      const card = document.createElement("div");
      card.className = "mission-card" + (index === 0 ? " active" : "");
      card.setAttribute("data-index", index);

      let diffClass = "easy";
      if (glyph.difficulty === "MEDIUM") diffClass = "medium";
      if (glyph.difficulty === "HARD") diffClass = "hard";

      // HTML inside card representing the custom ship difficulty
      let shipHTML = "";
      if (diffClass === "easy") {
        shipHTML = `
          <div class="saucer-core">
            <div class="cabin-lights"></div>
            <div class="stealth-hull"></div>
            <div class="jet-thrusters"></div>
          </div>
        `;
      } else if (diffClass === "medium") {
        shipHTML = `
          <div class="saucer-core">
            <div class="cabin-lights"></div>
            <div class="stealth-hull"></div>
            <div class="jet-thrusters"></div>
            <div class="aux-hull-left"></div>
            <div class="aux-hull-right"></div>
          </div>
        `;
      } else {
        shipHTML = `
          <div class="saucer-core">
            <div class="cabin-lights"></div>
            <div class="stealth-hull"></div>
            <div class="jet-thrusters"></div>
            <div class="aux-hull-left"></div>
            <div class="aux-hull-right"></div>
            <div class="antenna-spire"></div>
            <div class="solar-panels"></div>
          </div>
        `;
      }

      card.innerHTML = `
        <div class="ship-preview-box">
          <div class="ufo-container difficulty-${diffClass}">
            ${shipHTML}
          </div>
        </div>
        <div class="mission-card-title">${glyph.name}</div>
        <div class="mission-card-diff ${diffClass}">${glyph.difficulty}</div>
        <div class="mission-card-desc">${glyph.description}</div>
      `;

      const selectCard = (e) => {
        document
          .querySelectorAll(".mission-card")
          .forEach((c) => c.classList.remove("active"));
        card.classList.add("active");
        selectedIndex = index;
      };
      card.addEventListener("click", selectCard);
      card.addEventListener("touchstart", selectCard, { passive: true });

      missionCardsGrid.appendChild(card);
    });
  }

  // Wire up difficulty filter tabs
  const filterBtns = document.querySelectorAll(".diff-filter-btn");
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => {
        b.classList.remove("active");
        b.style.background = "rgba(255, 255, 255, 0.03)";
        b.style.borderColor = "rgba(255, 255, 255, 0.15)";
        b.style.color = "#888";
      });
      btn.classList.add("active");
      btn.style.background = "rgba(0, 255, 204, 0.15)";
      btn.style.borderColor = "#00ffcc";
      btn.style.color = "#00ffcc";

      const diff = btn.getAttribute("data-diff");
      const cards = document.querySelectorAll(".mission-card");
      let firstVisibleIndex = -1;

      cards.forEach((card) => {
        const idx = parseInt(card.getAttribute("data-index"));
        const glyph = GLYPHS[idx];
        if (diff === "ALL" || glyph.difficulty === diff) {
          card.style.display = "flex";
          if (firstVisibleIndex === -1) {
            firstVisibleIndex = idx;
          }
        } else {
          card.style.display = "none";
        }
      });

      // If current active card is hidden, select the first visible one
      const currentSelectedCard = document.querySelector(".mission-card.active");
      if (currentSelectedCard && currentSelectedCard.style.display === "none") {
        if (firstVisibleIndex !== -1) {
          cards.forEach((c) => c.classList.remove("active"));
          const newActiveCard = document.querySelector(
            `.mission-card[data-index="${firstVisibleIndex}"]`
          );
          if (newActiveCard) {
            newActiveCard.classList.add("active");
            selectedIndex = firstVisibleIndex;
          }
        }
      }
    });
  });

  // Open modal via top HUD click
  const currentGlyphHUD = document.getElementById("hud-current-glyph");
  if (currentGlyphHUD) {
    currentGlyphHUD.addEventListener("click", () => {
      if (btnCloseMissions) btnCloseMissions.style.display = "block";
      if (missionModal) missionModal.classList.remove("hidden");
    });
  }

  // Pre-fill active pilot profile name if available, otherwise default to "ZORG"
  const activeSession = localStorage.getItem("geoglypher_active_pilot_v1");
  if (activeSession) {
    try {
      const pilot = JSON.parse(activeSession);
      if (pilot && pilot.username) {
        if (missionPilotNameInput) {
          missionPilotNameInput.value = pilot.username;
        }
        if (pilotCodenameInput) {
          pilotCodenameInput.value = pilot.username;
        }
      }
    } catch (e) {}
  } else {
    // Grey alien default name as requested: Zorg
    if (missionPilotNameInput) {
      missionPilotNameInput.value = "ZORG";
      missionPilotNameInput.placeholder = "👽 Zorg";
    }
    if (pilotCodenameInput) {
      pilotCodenameInput.value = "ZORG";
      pilotCodenameInput.placeholder = "👽 Zorg";
    }
  }

  // Listen to input focus to empty the Zorg example if desired
  if (missionPilotNameInput) {
    missionPilotNameInput.addEventListener("focus", () => {
      if (missionPilotNameInput.value === "ZORG") {
        missionPilotNameInput.value = "";
      }
    });
    missionPilotNameInput.addEventListener("blur", () => {
      if (missionPilotNameInput.value.trim() === "") {
        missionPilotNameInput.value = "ZORG";
      }
    });
  }

  // Open button (Alien head glyph 👽)
  if (btnOpenMissions) {
    btnOpenMissions.addEventListener("click", () => {
      if (btnCloseMissions) btnCloseMissions.style.display = "block";
      if (missionModal) missionModal.classList.remove("hidden");
    });
  }

  // Close button
  if (btnCloseMissions) {
    btnCloseMissions.addEventListener("click", () => {
      if (missionModal) missionModal.classList.add("hidden");
    });
  }

  // Engage button
  if (btnEngageMission) {
    const engageAction = (e) => {
      try {
        console.log("ENGAGE BUTTON CLICKED");
        const pName =
          (missionPilotNameInput
            ? missionPilotNameInput.value.trim().toUpperCase()
            : "") || "ZORG";
        if (pilotCodenameInput) {
          pilotCodenameInput.value = pName;
        }

        // Update select element and trigger change
        if (selectGlyph) {
          selectGlyph.value = selectedIndex;
          loadGlyph(selectedIndex);
        }

        // Hide modal
        if (missionModal) {
          missionModal.classList.add("hidden");
        }

        addLogLine(
          `[ORBIT] Calibrated orbital sensors on ${GLYPHS[selectedIndex].name} (${GLYPHS[selectedIndex].difficulty}). Pilot codename: ${pName}.`,
          "text-success",
        );
      } catch (err) {
        console.error("Error in engageAction:", err);
      }
    };
    
    btnEngageMission.addEventListener("touchstart", (e) => {
      e.preventDefault();
      engageAction(e);
    }, { passive: false });
    btnEngageMission.addEventListener("click", (e) => {
      engageAction(e);
    });
  }
}

function setupTelemetryAlerts() {
  const alertOverlay = document.getElementById("telemetry-alert-overlay");
  const btnIgnore = document.getElementById("btn-telemetry-ignore");
  const btnRetry = document.getElementById("btn-telemetry-retry");
  const btnClose = document.getElementById("btn-close-telemetry-alert");

  if (btnIgnore && alertOverlay) {
    btnIgnore.addEventListener("click", () => {
      alertOverlay.classList.add("hidden");
      addLogLine(
        `[TELEMETRY] Warning bypassed. Continuing orbital session in OFFLINE cache mode.`,
        "text-system",
      );
    });
  }

  if (btnClose && alertOverlay) {
    btnClose.addEventListener("click", () => {
      alertOverlay.classList.add("hidden");
    });
  }

  if (btnRetry && alertOverlay) {
    btnRetry.addEventListener("click", () => {
      addLogLine(
        `[TELEMETRY] Re-transmitting Kepler-186f quantum handshake...`,
        "text-system",
      );
      btnRetry.textContent = "⚡ SYNCING...";
      btnRetry.disabled = true;
      setTimeout(() => {
        btnRetry.textContent = "🔄 RETRY SYNC";
        btnRetry.disabled = false;
        alertOverlay.classList.add("hidden");
        addLogLine(
          `[TELEMETRY] Connection secured! Telemetry data successfully uploaded.`,
          "text-success",
        );
      }, 1500);
    });
  }
}
