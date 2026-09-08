/* =====================================================
   BUCKET LIST · Windows 95/Y2K  ·  Lógica
   ===================================================== */

const COOLDOWN_MS = 60 * 60 * 1000;
const ROLL_MS     = 2200;

const K_LAST            = "bucketlist:last";
const K_MUTE            = "bucketlist:mute";
const K_SEASON_OVERRIDE = "bucketlist:season";
const K_WALLPAPER       = "bucketlist:wallpaper";
const K_FIRST_USE       = "bucketlist:firstuse";

const SCRAMBLE = "!<>-_\\/[]{}—=+*^?#________";

const SEASON_CONFIG = {
  summer: { title: "summer_bucket_list.exe", label: "💾 summer_bucket_list.exe" },
  autumn: { title: "autumn_bucket_list.exe", label: "💾 autumn_bucket_list.exe" },
  winter: { title: "winter_bucket_list.exe", label: "💾 winter_bucket_list.exe" },
  spring: { title: "spring_bucket_list.exe", label: "💾 spring_bucket_list.exe" },
};

const SEASON_NAMES = {
  summer: "Verano", autumn: "Otoño", winter: "Invierno", spring: "Primavera"
};

const SEASON_WALLPAPERS = {
  summer: "bliss",
  autumn: "autumn",
  winter: "ascent",
  spring: "tulips",
};

const el = {
  missionText:  document.getElementById("missionText"),
  label:        document.getElementById("resultLabel"),
  titleText:    document.getElementById("titleText"),
  statusText:   document.getElementById("statusText"),
  btn:          document.getElementById("rollBtn"),
  btnText:      document.getElementById("btnText"),
  cooldown:     document.getElementById("cooldown"),
  timer:        document.getElementById("timer"),
  barFill:      document.getElementById("barFill"),
  mute:         document.getElementById("muteBtn"),
  clock:        document.getElementById("clock"),
  taskbarItem:  document.getElementById("taskbarItem"),
};

let cdInterval = null;
let muted      = localStorage.getItem(K_MUTE) === "1";
let season     = "";
let list       = [];

// =====================================================
//  DETECCIÓN DE ESTACIÓN (hemisferio norte)
// =====================================================
function getSeason() {
  const now = new Date();
  const m   = now.getMonth() + 1;
  const d   = now.getDate();
  if ((m === 6 && d >= 21) || m === 7 || m === 8 || (m === 9 && d <= 20)) return "summer";
  if ((m === 9 && d >= 21) || m === 10 || m === 11 || (m === 12 && d <= 20)) return "autumn";
  if ((m === 12 && d >= 21) || m === 1 || m === 2 || (m === 3 && d <= 19)) return "winter";
  return "spring";
}

function getEffectiveSeason() {
  const override = localStorage.getItem(K_SEASON_OVERRIDE);
  if (override && override !== "auto") return override;
  return getSeason();
}

function kResult()  { return `bucketlist:result:${season}`; }
function kHistory() { return `bucketlist:history:${season}`; }

// =====================================================
//  WALLPAPER
// =====================================================
function applyWallpaper(name) {
  const desktop = document.querySelector(".desktop");
  [...desktop.classList].filter(c => c.startsWith("wp-")).forEach(c => desktop.classList.remove(c));
  if (name && name !== "bliss") desktop.classList.add(`wp-${name}`);
}

// =====================================================
//  SONIDO — estilo Windows / MSN
// =====================================================
let audioCtx = null;
function getCtx() {
  audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}
function playTone(freq, dur, vol = 0.07) {
  if (muted) return;
  try {
    const ctx = getCtx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine"; o.frequency.value = freq;
    g.gain.setValueAtTime(vol, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    o.connect(g); g.connect(ctx.destination);
    o.start(); o.stop(ctx.currentTime + dur);
  } catch(e) {}
}
function playClick() {
  if (muted) return;
  try {
    const ctx = getCtx();
    const dur = 0.012;
    const buf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * dur), ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.035, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    src.connect(g); g.connect(ctx.destination);
    src.start();
  } catch(e) {}
}
function msnNotify()    { playTone(587, 0.16); setTimeout(() => playTone(880, 0.22), 140); }
function windowsDing()  { playTone(800, 0.45, 0.06); }
function windowsClick() { playTone(1000, 0.12, 0.04); }

// =====================================================
//  RELOJ
// =====================================================
function updateClock() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, "0");
  const m = String(now.getMinutes()).padStart(2, "0");
  el.clock.textContent = `${h}:${m}`;
}

// =====================================================
//  ARRANQUE
// =====================================================
function init() {
  updateMuteLabel();
  updateClock();
  setInterval(updateClock, 10000);

  season = getEffectiveSeason();
  applySeasonUI();
  applyWallpaper(localStorage.getItem(K_WALLPAPER) || "bliss");

  setupFileMenu();
  setupEditMenu();
  setupViewMenu();
  setupHelpMenu();

  el.btn.addEventListener("click", onRoll);
  el.mute.addEventListener("click", toggleMute);

  if (list.length === 0) {
    el.label.textContent       = "FUERA DE TEMPORADA";
    el.missionText.textContent = "Vuelve en verano ☀️";
    el.btn.disabled            = true;
    setStatus("No season list available.");
    return;
  }

  const last    = Number(localStorage.getItem(K_LAST) || 0);
  const elapsed = Date.now() - last;

  if (last && elapsed < COOLDOWN_MS) {
    const saved = localStorage.getItem(kResult());
    if (saved) {
      el.label.textContent = "PLAN ASIGNADO, ¡DISFRÚTALO!";
      el.missionText.textContent = saved;
      el.missionText.classList.add("result-active");
    }
    setStatus("Mission in progress. Stand by.");
    startCooldown(COOLDOWN_MS - elapsed);
  } else {
    setStatus("Nuevo plan disponible");
  }
}

function applySeasonUI() {
  const seasons = window.SEASONS || {};
  list = Array.isArray(seasons[season]) ? seasons[season] : [];
  const cfg = SEASON_CONFIG[season] || SEASON_CONFIG.summer;
  document.title             = cfg.title;
  el.titleText.textContent   = cfg.title;
  el.taskbarItem.textContent = cfg.label;
}

function setStatus(txt) { el.statusText.textContent = txt; }

// =====================================================
//  SISTEMA GENÉRICO DE DROPDOWNS
// =====================================================
function closeAllDropdowns() {
  document.querySelectorAll(".season-dropdown").forEach(d => d.hidden = true);
  document.querySelectorAll(".menu-item.open").forEach(m => m.classList.remove("open"));
}

document.addEventListener("click", closeAllDropdowns);

function setupMenu(menuId, dropdownId, onOpen, onItemClick) {
  const menu     = document.getElementById(menuId);
  const dropdown = document.getElementById(dropdownId);
  if (!menu || !dropdown) return;

  menu.addEventListener("click", (e) => {
    e.stopPropagation();
    if (dropdown.hidden) {
      closeAllDropdowns();
      if (onOpen) onOpen(dropdown);
      dropdown.hidden = false;
      menu.classList.add("open");
    } else {
      closeAllDropdowns();
    }
  });

  if (onItemClick) {
    dropdown.querySelectorAll(".drop-item").forEach(item => {
      item.addEventListener("click", (e) => {
        e.stopPropagation();
        closeAllDropdowns();
        onItemClick(item);
      });
    });
  }
}

// ---- File ----
function setupFileMenu() {
  setupMenu("menuFile", "fileDropdown", null, (item) => {
    const action = item.dataset.action;
    if (action === "properties") openProperties();
    else if (action === "clear") confirmClearHistory();
    else if (action === "close") openClose();
  });
}

// ---- Edit (estaciones) ----
function setupEditMenu() {
  setupMenu("menuEdit", "seasonDropdown",
    (dropdown) => {
      const override = localStorage.getItem(K_SEASON_OVERRIDE) || "auto";
      dropdown.querySelectorAll(".drop-item").forEach(item => {
        item.classList.toggle("active", item.dataset.season === override);
      });
    },
    (item) => {
      const chosen = item.dataset.season;
      if (!chosen) return;
      localStorage.setItem(K_SEASON_OVERRIDE, chosen);
      season = getEffectiveSeason();
      applySeasonUI();
      const defaultWp = SEASON_WALLPAPERS[season] || "bliss";
      localStorage.setItem(K_WALLPAPER, defaultWp);
      applyWallpaper(defaultWp);

      if (list.length === 0) {
        el.label.textContent       = "FUERA DE TEMPORADA";
        el.missionText.textContent = "Sin actividades para esta estación";
        el.missionText.classList.remove("result-active");
        el.btn.disabled = true;
        setStatus("No season list available.");
      } else {
        const last        = Number(localStorage.getItem(K_LAST) || 0);
        const elapsed     = Date.now() - last;
        const hasCooldown = last && elapsed < COOLDOWN_MS;
        const savedResult = localStorage.getItem(kResult());

        if (hasCooldown && savedResult) {
          el.btn.disabled = true;
          el.label.textContent = "PLAN ASIGNADO, ¡DISFRÚTALO!";
          el.missionText.textContent = savedResult;
          el.missionText.classList.add("result-active");
          setStatus("Time flies");
        } else if (hasCooldown && !savedResult) {
          el.btn.disabled = true;
          el.label.textContent = "ESPERANDO IDEAS";
          el.missionText.textContent = "Pulsa el botón para proponerte un nuevo plan";
          el.missionText.classList.remove("result-active");
          setStatus("Mission in progress. Stand by.");
        } else {
          el.btn.disabled = false;
          el.label.textContent = "ESPERANDO IDEAS";
          el.missionText.textContent = "Pulsa el botón para proponerte un nuevo plan";
          el.missionText.classList.remove("result-active");
          setStatus("Nuevo plan disponible");
        }
      }
    }
  );
}

// ---- View (fondos de escritorio) ----
function setupViewMenu() {
  setupMenu("menuView", "viewDropdown",
    (dropdown) => {
      const current = localStorage.getItem(K_WALLPAPER) || "bliss";
      dropdown.querySelectorAll(".drop-item").forEach(item => {
        item.classList.toggle("active", item.dataset.wallpaper === current);
      });
    },
    (item) => {
      const wp = item.dataset.wallpaper;
      if (!wp) return;
      localStorage.setItem(K_WALLPAPER, wp);
      applyWallpaper(wp);
    }
  );
}

// ---- Help ----
function setupHelpMenu() {
  setupMenu("menuHelp", "helpDropdown", null, (item) => {
    const action = item.dataset.action;
    if (action === "how")        openHowItWorks();
    else if (action === "about") openAbout();
  });
}

// =====================================================
//  MODALES WIN95
// =====================================================
function openModal({ icon, title, body, buttons }) {
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";

  const btnsHtml = buttons.map((b, i) =>
    `<button class="win-btn-dialog${b.primary ? " default-btn" : ""}" data-idx="${i}">${b.label}</button>`
  ).join("");

  overlay.innerHTML = `
    <div class="win win-modal">
      <div class="win-title">
        <span class="win-icon">${icon || "💾"}</span>
        <span class="win-title-text">${title}</span>
        <div class="win-btns">
          <button class="wbtn" tabindex="-1" aria-hidden="true">_</button>
          <button class="wbtn" tabindex="-1" aria-hidden="true">□</button>
          <button class="wbtn modal-close">✕</button>
        </div>
      </div>
      <div class="win-body modal-body">${body}</div>
      <div class="modal-footer">${btnsHtml}</div>
    </div>
  `;

  document.body.appendChild(overlay);

  overlay.querySelector(".modal-close").addEventListener("click", () => overlay.remove());

  overlay.querySelectorAll("[data-idx]").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = Number(btn.dataset.idx);
      overlay.remove();
      if (buttons[idx] && buttons[idx].action) buttons[idx].action();
    });
  });

  overlay.addEventListener("mousedown", e => {
    if (e.target === overlay) overlay.remove();
  });
}

// ---- File modals ----
function openProperties() {
  const history    = JSON.parse(localStorage.getItem(kHistory()) || "[]");
  const done       = history.length;
  const total      = list.length;
  const remaining  = Math.max(0, total - done);
  const seasonName = SEASON_NAMES[season] || season;

  const firstUseRaw = localStorage.getItem(K_FIRST_USE);
  const firstUse    = firstUseRaw
    ? new Date(firstUseRaw).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" })
    : "—";

  openModal({
    icon: "🗂",
    title: "Propiedades",
    body: `
      <table class="props-table">
        <tr><td>Estación activa</td><td><b>${seasonName}</b></td></tr>
        <tr><td>Actividades vistas</td><td><b>${done} de ${total}</b></td></tr>
        <tr><td>Actividades restantes</td><td><b>${remaining}</b></td></tr>
        <tr><td>Primer uso</td><td><b>${firstUse}</b></td></tr>
      </table>
    `,
    buttons: [{ label: "OK", primary: true }]
  });
}

function confirmClearHistory() {
  const seasonName = SEASON_NAMES[season] || season;
  openModal({
    icon: "⚠️",
    title: "Borrar historial",
    body: `<p>¿Borrar el historial de <b>${seasonName}</b>?</p>
           <p>Las actividades volverán a estar disponibles desde el principio.</p>`,
    buttons: [
      { label: "Cancelar" },
      { label: "Borrar", primary: true, action: clearHistory }
    ]
  });
}

function clearHistory() {
  localStorage.removeItem(kHistory());
  setStatus("Historial borrado. ¡A empezar de nuevo!");
}

function openClose() {
  openModal({
    icon: "🖥",
    title: "Bucket List",
    body: `<p>¿Segura que quieres cerrar?</p>
           <p>Tus planes pendientes te esperarán aquí.</p>`,
    buttons: [
      { label: "No", primary: true },
      { label: "Sí, cerrar", action: () => window.close() }
    ]
  });
}

// ---- Help modals ----
function openHowItWorks() {
  openModal({
    icon: "❓",
    title: "Cómo funciona",
    body: `
      <p>① Pulsa <b>"Quiero un nuevo plan"</b> para recibir una actividad de temporada.</p>
      <p>② Espera <b>1 hora</b> antes de pedir otra: el plan es disfrutar el actual.</p>
      <p>③ Las actividades <b>no se repiten</b> hasta haberlas visto todas.</p>
      <p>④ Cambia de estación en <b>Edit</b> para ver la lista de cada temporada.</p>
      <p>⑤ Cambia el fondo de escritorio en <b>View</b>.</p>
    `,
    buttons: [{ label: "Entendido", primary: true }]
  });
}

function openAbout() {
  openModal({
    icon: "💾",
    title: "Sobre Bucket List",
    body: `
      <p style="text-align:center;"><b>Bucket List v2.0</b></p>
      <div class="modal-sep"></div>
      <p>Una app para proponerte planes de temporada, uno cada hora. Las actividades no se repiten hasta haberlas visto todas.</p>
      <div class="modal-sep"></div>
      <p style="text-align:center; color:var(--w-shadow);">Hecha con ❤️ en Garaje de Ideas</p>
    `,
    buttons: [{ label: "OK", primary: true }]
  });
}

// =====================================================
//  ANTI-REPETICIÓN (historial por estación)
// =====================================================
function pickMission() {
  let history  = JSON.parse(localStorage.getItem(kHistory()) || "[]");
  let available = list.filter(item => !history.includes(item));

  if (available.length === 0) {
    history   = [];
    available = [...list];
    setStatus("Ciclo completo. Reiniciando lista...");
  }

  const winner = available[Math.floor(Math.random() * available.length)];
  history.push(winner);
  localStorage.setItem(kHistory(), JSON.stringify(history));
  return winner;
}

// =====================================================
//  TIRADA
// =====================================================
function onRoll() {
  if (el.btn.disabled) return;
  el.btn.disabled = true;
  el.btnText.textContent   = "PROCESSING...";
  el.label.textContent     = "SEARCHING DATABASE";
  el.titleText.textContent = `${SEASON_CONFIG[season].title} — PROCESSING...`;
  el.missionText.classList.remove("result-active");
  setStatus("Buscando el plan perfecto para ti");

  const winner = pickMission();
  const start  = Date.now();

  function tick() {
    const progress = (Date.now() - start) / ROLL_MS;
    el.missionText.textContent = list[Math.floor(Math.random() * list.length)];
    playClick();
    if (progress >= 1) return finishRoll(winner);
    setTimeout(tick, 48 + progress * progress * 300);
  }
  tick();
}

function finishRoll(winner) {
  const cfg = SEASON_CONFIG[season];
  el.titleText.textContent = cfg.title;
  el.label.textContent     = "PLAN ASIGNADO, ¡DISFRÚTALO!";
  setStatus("Time flies");
  revealText(winner);
  msnNotify();

  if (!localStorage.getItem(K_FIRST_USE)) {
    localStorage.setItem(K_FIRST_USE, new Date().toISOString());
  }
  localStorage.setItem(K_LAST, String(Date.now()));
  localStorage.setItem(kResult(), winner);
  startCooldown(COOLDOWN_MS);
}

function revealText(text) {
  el.missionText.classList.add("result-active");
  const chars = text.split("");
  let frame = 0;
  const total = 22;
  const anim = setInterval(() => {
    const revealed = Math.floor((frame / total) * chars.length);
    el.missionText.textContent = chars.map((c, i) => {
      if (i < revealed || c === " ") return c;
      return SCRAMBLE[Math.floor(Math.random() * SCRAMBLE.length)];
    }).join("");
    frame++;
    if (frame > total) {
      clearInterval(anim);
      el.missionText.textContent = text;
      el.btnText.textContent = "EN ESPERA...";
    }
  }, 45);
}

// =====================================================
//  TEMPORIZADOR 1H
// =====================================================
function startCooldown(remaining) {
  el.cooldown.hidden = false;
  el.btn.disabled    = true;
  const end = Date.now() + remaining;

  function update() {
    const left = end - Date.now();
    if (left <= 0) return endCooldown();
    const totalSec = Math.ceil(left / 1000);
    el.timer.textContent = `${String(Math.floor(totalSec / 60)).padStart(2,"0")}:${String(totalSec % 60).padStart(2,"0")}`;
    el.barFill.style.width = (left / COOLDOWN_MS * 100) + "%";
  }
  update();
  cdInterval = setInterval(update, 250);
}

function endCooldown() {
  clearInterval(cdInterval);
  el.btn.disabled          = false;
  el.btnText.textContent   = "QUIERO UN NUEVO PLAN";
  el.label.textContent     = "LISTA PARA OTRA";
  el.titleText.textContent = SEASON_CONFIG[season].title;
  el.cooldown.hidden       = true;
  setStatus("Nuevo plan disponible");
  windowsDing();
}

// =====================================================
//  MUTE
// =====================================================
function toggleMute() {
  muted = !muted;
  localStorage.setItem(K_MUTE, muted ? "1" : "0");
  updateMuteLabel();
  if (!muted) windowsClick();
}
function updateMuteLabel() {
  el.mute.textContent = muted ? "🔇" : "🔊";
}

init();
