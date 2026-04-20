// ═══════════════════════════════════════════════════════════════
// PROJECT MARS — app.js  (Fase D: conectado al backend)
// LocalStorage eliminado. Toda la persistencia vive en el servidor.
// Gestión de tres estados de red: carga · éxito · error.
// ═══════════════════════════════════════════════════════════════

import { fetchAllTasks, createTask, deleteTask, updateTask } from "./src/api/client.js";

// ─────────────────────────────────────────────
// 1. REFERENCIAS DOM
// ─────────────────────────────────────────────

const DOM = {
  form:           document.getElementById("task-form"),
  taskInput:      document.getElementById("task-input"),
  priorityInput:  document.getElementById("priority-input"),
  locationInput:  document.getElementById("location-input"),
  deadlineType:   document.getElementById("deadline-type"),
  customDays:     document.getElementById("custom-days"),
  taskList:       document.getElementById("task-list"),
  searchInput:    document.getElementById("search-input"),
  priorityFilter: document.getElementById("priority-filter"),
  statusFilter:   document.getElementById("status-filter"),
  locationFilter: document.getElementById("location-filter"),
  counter:        document.getElementById("task-counter"),
  statTotal:      document.getElementById("stat-total"),
  statCompleted:  document.getElementById("stat-completed"),
  statPending:    document.getElementById("stat-pending"),
  statExpired:    document.getElementById("stat-expired"),
  darkToggle:     document.getElementById("dark-toggle"),
  completeAllBtn: document.getElementById("complete-all"),
  clearDoneBtn:   document.getElementById("clear-completed"),
  loadMissionBtn: document.getElementById("load-mission"),
  speedMode:      document.getElementById("speed-mode"),
};

// ─────────────────────────────────────────────
// 2. ESTADO EN MEMORIA  (sin LocalStorage)
// ─────────────────────────────────────────────

// El estado vive sólo en RAM durante la sesión.
// La fuente de verdad es el servidor Express.
const state = {
  byId:   Object.create(null),   // O(1) lookup
  allIds: [],                    // orden de inserción
};

// ─────────────────────────────────────────────
// 3. GESTIÓN DE ESTADOS DE RED
// Tres estados: "idle" · "loading" · "error"
// ─────────────────────────────────────────────

/**
 * Muestra un overlay de carga sobre la lista de tareas.
 */
function showLoading() {
  DOM.taskList.innerHTML = `
    <div id="net-loading" class="flex flex-col items-center justify-center py-16 gap-4 text-orange-500">
      <svg class="animate-spin w-10 h-10" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-dasharray="60" stroke-dashoffset="20"/>
      </svg>
      <p class="font-orbitron text-lg tracking-widest">Conectando con Marte…</p>
    </div>`;
}

/**
 * Muestra un banner de error no bloqueante en la parte superior de la lista.
 * @param {string} message
 */
function showNetworkError(message) {
  // Elimina banners anteriores para no apilarlos
  document.getElementById("net-error-banner")?.remove();

  const banner = document.createElement("div");
  banner.id = "net-error-banner";
  banner.className = [
    "flex items-center gap-3 px-4 py-3 mb-4 rounded-xl border",
    "bg-red-50 dark:bg-red-950 border-red-300 dark:border-red-700",
    "text-red-700 dark:text-red-300 text-sm font-semibold",
    "animate-pulse",
  ].join(" ");
  banner.innerHTML = `
    <span class="text-xl">⚠️</span>
    <span>${message}</span>
    <button class="ml-auto text-red-400 hover:text-red-600 text-lg leading-none" onclick="this.parentElement.remove()">✕</button>`;

  DOM.taskList.prepend(banner);
}

/**
 * Desactiva / activa todos los controles del formulario mientras
 * se espera una respuesta del servidor.
 * @param {boolean} disabled
 */
function setFormBusy(disabled) {
  [
    DOM.form.querySelector("button[type=submit]"),
    DOM.completeAllBtn,
    DOM.clearDoneBtn,
    DOM.loadMissionBtn,
  ].forEach(btn => {
    if (!btn) return;
    btn.disabled = disabled;
    btn.style.opacity = disabled ? "0.5" : "";
    btn.style.cursor  = disabled ? "wait"  : "";
  });
}

// ─────────────────────────────────────────────
// 4. SINCRONIZACIÓN INICIAL
// Carga todas las tareas del servidor al arrancar.
// ─────────────────────────────────────────────

async function loadTasksFromServer() {
  showLoading();
  try {
    const tasks = await fetchAllTasks();

    // Reconstruye el estado en memoria desde el array del servidor
    state.byId  = Object.create(null);
    state.allIds = [];
    for (const task of tasks) {
      state.byId[task.id] = task;
      state.allIds.push(task.id);
    }
    renderTasks();
  } catch (err) {
    DOM.taskList.innerHTML = "";
    showNetworkError(
      `No se pudo conectar con el servidor: ${err.message}. ` +
      "Asegúrate de que el backend está corriendo en localhost:3000."
    );
    updateStats();
  }
}

// ─────────────────────────────────────────────
// 5. MODO DE VELOCIDAD
// ─────────────────────────────────────────────

function msPerDay() {
  const map = { real: 86_400_000, fast: 60_000, turbo: 10_000 };
  return map[DOM.speedMode?.value] ?? 86_400_000;
}

// ─────────────────────────────────────────────
// 6. UTILIDADES DE FECHA
// ─────────────────────────────────────────────

function calculateDeadline(days) {
  return Date.now() + days * msPerDay();
}

function missionDeadline() {
  return calculateDeadline(1);
}

function isExpired(task) {
  return task.deadline ? task.deadline < Date.now() : false;
}

function isExpiringSoon(task) {
  if (!task.deadline || task.completed) return false;
  const msLeft = task.deadline - Date.now();
  return msLeft > 0 && msLeft <= 86_400_000;
}

function remainingLabel(task) {
  if (!task.deadline) return null;
  const ms   = task.deadline - Date.now();
  const mode = DOM.speedMode?.value ?? "real";

  if (mode === "real") {
    const today    = new Date(); today.setHours(0, 0, 0, 0);
    const deadline = new Date(task.deadline); deadline.setHours(0, 0, 0, 0);
    const days     = Math.round((deadline - today) / 86_400_000);
    if (days < 0)   return { text: "⛔ Vencida",   expired: true  };
    if (days === 0) return { text: "⏱ Vence hoy", expired: false };
    return { text: `⏱ ${days} día${days !== 1 ? "s" : ""}`, expired: false };
  }

  if (ms <= 0) return { text: "⛔ Vencida", expired: true };
  const secs = Math.ceil(ms / 1000);
  if (secs < 60) return { text: `⏱ ${secs}s`, expired: false };
  return { text: `⏱ ${Math.ceil(secs / 60)}m`, expired: false };
}

// ─────────────────────────────────────────────
// 7. SELECTORES Y ORDENACIÓN
// ─────────────────────────────────────────────

const PRIORITY_ORDER = { alta: 0, media: 1, baja: 2 };

function selectVisibleIds() {
  const text     = DOM.searchInput.value.toLowerCase();
  const priority = DOM.priorityFilter.value;
  const status   = DOM.statusFilter.value;
  const location = DOM.locationFilter.value;

  return state.allIds.filter(id => {
    const t       = state.byId[id];
    const expired = isExpired(t);
    return (
      t.text.toLowerCase().includes(text) &&
      (priority === "todas" || t.priority === priority) &&
      (location === "todas" || t.location === location) &&
      (status   === "todas"       ||
       (status === "completadas"  &&  t.completed)           ||
       (status === "pendientes"   && !t.completed && !expired) ||
       (status === "vencidas"     &&  expired     && !t.completed))
    );
  });
}

function sortedByPriority(ids) {
  return [...ids].sort(
    (a, b) =>
      PRIORITY_ORDER[state.byId[a].priority] -
      PRIORITY_ORDER[state.byId[b].priority]
  );
}

// ─────────────────────────────────────────────
// 8. CRUD ASÍNCRONO
// Cada operación: 1) llama al servidor, 2) actualiza estado local,
// 3) re-renderiza. En caso de error de red muestra el banner.
// ─────────────────────────────────────────────

async function addTask(data) {
  setFormBusy(true);
  try {
    const created = await createTask(data);
    // El servidor asigna el id; enriquecemos con campos de UI-only
    const task = {
      ...created,
      completed: data.completed ?? false,
      deadline:  data.deadline  ?? null,
    };
    state.byId[task.id] = task;
    state.allIds.push(task.id);
    renderTasks();
  } catch (err) {
    showNetworkError(`No se pudo crear la tarea: ${err.message}`);
  } finally {
    setFormBusy(false);
  }
}

async function removeTask(id) {
  try {
    await deleteTask(id);
    delete state.byId[id];
    const i = state.allIds.indexOf(id);
    if (i !== -1) state.allIds.splice(i, 1);
    renderTasks();
  } catch (err) {
    showNetworkError(`No se pudo eliminar la tarea: ${err.message}`);
  }
}

async function toggleTask(id) {
  const task    = state.byId[id];
  const newVal  = !task.completed;

  // Optimistic update: actualiza la UI de inmediato
  task.completed = newVal;
  renderTasks();

  try {
    await updateTask(id, { completed: newVal });
  } catch (err) {
    // Rollback si el servidor falla
    task.completed = !newVal;
    renderTasks();
    showNetworkError(`No se pudo actualizar la tarea: ${err.message}`);
  }
}

async function editTask(id, newText) {
  const trimmed = newText.trim();
  if (!trimmed) return;

  const old = state.byId[id].text;
  state.byId[id].text = trimmed; // optimistic
  renderTasks();

  try {
    await updateTask(id, { text: trimmed });
  } catch (err) {
    state.byId[id].text = old; // rollback
    renderTasks();
    showNetworkError(`No se pudo editar la tarea: ${err.message}`);
  }
}

// ─────────────────────────────────────────────
// 9. RENDER
// ─────────────────────────────────────────────

const PRIORITY_COLORS = { alta: "bg-red-500", media: "bg-yellow-500", baja: "bg-green-500" };

function createTaskElement(id) {
  const task    = state.byId[id];
  const expired = isExpired(task);
  const locked  = expired && !task.completed;
  const soon    = !locked && isExpiringSoon(task);
  const rem     = remainingLabel(task);

  const article = document.createElement("article");
  article.className = [
    "p-4 mb-4 flex items-start gap-3 rounded-xl shadow-md border transition-colors duration-700",
    locked
      ? "bg-red-100 dark:bg-red-950 border-red-400 dark:border-red-700"
      : task.completed
        ? "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 opacity-50"
        : `bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 ${soon ? "blink-expiring" : ""}`,
  ].join(" ");

  // Checkbox
  const checkbox = document.createElement("input");
  Object.assign(checkbox, {
    type:      "checkbox",
    checked:   task.completed,
    disabled:  locked,
    className: `w-5 h-5 mt-1 flex-shrink-0 ${locked ? "cursor-not-allowed opacity-40" : "cursor-pointer"}`,
  });
  if (!locked) checkbox.addEventListener("change", () => toggleTask(id));

  // Cuerpo
  const body  = document.createElement("div");
  body.className = "flex-1 min-w-0 flex flex-col gap-1";

  const title = document.createElement("span");
  title.className = [
    "font-bold text-base sm:text-lg break-words leading-snug",
    task.completed ? "line-through"                   : "",
    locked         ? "text-red-700 dark:text-red-300" : "",
  ].join(" ");
  title.textContent = task.text;

  const meta = document.createElement("div");
  meta.className = "flex flex-wrap items-center gap-1.5 mt-1";

  const badge = document.createElement("span");
  badge.className   = `${PRIORITY_COLORS[task.priority] ?? "bg-zinc-400"} text-white px-2 py-0.5 rounded-full text-xs font-bold`;
  badge.textContent = task.priority;

  const locBadge = document.createElement("span");
  locBadge.className   = "bg-blue-500 text-white px-2 py-0.5 rounded-full text-xs font-bold";
  locBadge.textContent = task.location === "interior" ? "Interior" : "Exterior";

  meta.append(badge, locBadge);

  if (rem) {
    const deadlineLabel = document.createElement("span");
    deadlineLabel.className   = `text-xs font-bold ${rem.expired ? "text-red-600 dark:text-red-400" : "text-purple-500"}`;
    deadlineLabel.textContent = rem.text;
    meta.append(deadlineLabel);
  }

  body.append(title, meta);

  // Acciones
  const actions = document.createElement("div");
  actions.className = "flex flex-col items-center gap-1 flex-shrink-0";

  if (!locked) {
    const editBtn = document.createElement("button");
    editBtn.textContent = "✏️";
    editBtn.className   = "text-lg hover:scale-110 transition";
    editBtn.addEventListener("click", () => startInlineEdit(id, title));
    actions.append(editBtn);
  }

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "🗑";
  deleteBtn.className   = "text-lg hover:scale-110 transition";
  deleteBtn.addEventListener("click", () => removeTask(id));
  actions.append(deleteBtn);

  article.append(checkbox, body, actions);
  return article;
}

function startInlineEdit(id, titleEl) {
  const input = document.createElement("input");
  Object.assign(input, {
    type:      "text",
    value:     state.byId[id].text,
    className: "flex-1 p-1 border rounded bg-white dark:bg-zinc-700 transition-colors duration-700",
  });
  const commit = () => editTask(id, input.value);
  input.addEventListener("blur",    commit);
  input.addEventListener("keydown", e => e.key === "Enter" && commit());
  titleEl.replaceWith(input);
  input.focus();
}

function renderTasks() {
  // Elimina sólo el banner de carga (spinner), no el de errores
  document.getElementById("net-loading")?.remove();

  const visibleIds = sortedByPriority(selectVisibleIds());
  const frag = document.createDocumentFragment();
  for (const id of visibleIds) frag.appendChild(createTaskElement(id));

  // Conserva el banner de error si existe; reemplaza sólo las tarjetas
  const errorBanner = document.getElementById("net-error-banner");
  DOM.taskList.replaceChildren(frag);
  if (errorBanner) DOM.taskList.prepend(errorBanner);

  updateStats();
}

// ─────────────────────────────────────────────
// 10. ESTADÍSTICAS
// ─────────────────────────────────────────────

function updateStats() {
  let total = 0, completed = 0, expired = 0;
  for (const id of state.allIds) {
    const t = state.byId[id];
    total++;
    if (t.completed)       completed++;
    else if (isExpired(t)) expired++;
  }
  const pending = total - completed;
  DOM.counter.textContent       = `${pending} tareas pendientes`;
  DOM.statTotal.textContent     = total;
  DOM.statCompleted.textContent = completed;
  DOM.statPending.textContent   = pending;
  DOM.statExpired.textContent   = expired;
}

// ─────────────────────────────────────────────
// 11. TEMA OSCURO
// (El tema sí puede persistir en localStorage: no son datos de negocio)
// ─────────────────────────────────────────────

function initTheme() {
  if (localStorage.getItem("theme") === "dark") {
    document.documentElement.classList.add("dark");
    DOM.darkToggle.textContent = "🌙";
  }
}

DOM.darkToggle.addEventListener("click", () => {
  const isDark = document.documentElement.classList.toggle("dark");
  DOM.darkToggle.textContent = isDark ? "🌙" : "☀️";
  localStorage.setItem("theme", isDark ? "dark" : "light");
});

// ─────────────────────────────────────────────
// 12. EVENTOS
// ─────────────────────────────────────────────

DOM.deadlineType.addEventListener("change", () => {
  DOM.customDays.classList.toggle("hidden", DOM.deadlineType.value !== "custom");
});

DOM.form.addEventListener("submit", async e => {
  e.preventDefault();
  const text = DOM.taskInput.value.trim();
  if (!text) return;

  const daysMap = { tomorrow: 1, week: 7 };
  const days    = daysMap[DOM.deadlineType.value] ?? (Number(DOM.customDays.value) || 1);

  await addTask({
    text,
    priority:  DOM.priorityInput.value,
    location:  DOM.locationInput.value,
    completed: false,
    deadline:  calculateDeadline(days),
  });

  DOM.taskInput.value = "";
});

DOM.priorityFilter.addEventListener("change", renderTasks);
DOM.statusFilter.addEventListener("change",   renderTasks);
DOM.locationFilter.addEventListener("change", renderTasks);
DOM.searchInput.addEventListener("input",     renderTasks);

DOM.completeAllBtn.addEventListener("click", async () => {
  setFormBusy(true);
  const pending = state.allIds.filter(id => {
    const t = state.byId[id];
    return !t.completed && !isExpired(t);
  });

  // Optimistic: marca todas en UI
  for (const id of pending) state.byId[id].completed = true;
  renderTasks();

  // Lanza PATCHes en paralelo y recoge errores
  const results = await Promise.allSettled(
    pending.map(id => updateTask(id, { completed: true }))
  );

  // Rollback de las que fallaron
  results.forEach((result, i) => {
    if (result.status === "rejected") {
      state.byId[pending[i]].completed = false;
    }
  });

  const failed = results.filter(r => r.status === "rejected").length;
  if (failed) showNetworkError(`${failed} tarea(s) no se pudieron completar en el servidor.`);

  renderTasks();
  setFormBusy(false);
});

DOM.clearDoneBtn.addEventListener("click", async () => {
  const completed = state.allIds.filter(id => state.byId[id].completed);
  setFormBusy(true);

  const results = await Promise.allSettled(
    completed.map(id => deleteTask(id))
  );

  // Solo elimina del estado local las que el servidor confirmó
  results.forEach((result, i) => {
    if (result.status === "fulfilled") {
      delete state.byId[completed[i]];
      const idx = state.allIds.indexOf(completed[i]);
      if (idx !== -1) state.allIds.splice(idx, 1);
    }
  });

  const failed = results.filter(r => r.status === "rejected").length;
  if (failed) showNetworkError(`${failed} tarea(s) completadas no se pudieron eliminar del servidor.`);

  renderTasks();
  setFormBusy(false);
});

DOM.loadMissionBtn.addEventListener("click", async () => {
  const deadline = missionDeadline();
  const missions = [
    { text: "Revisar niveles de oxígeno",           priority: "alta",  location: "interior" },
    { text: "Inspeccionar paneles solares",         priority: "baja",  location: "exterior" },
    { text: "Analizar muestras del suelo marciano", priority: "media", location: "exterior" },
    { text: "Actualizar sistema de navegación",     priority: "media", location: "interior" },
    { text: "Verificar comunicaciones con Tierra",  priority: "alta",  location: "interior" },
    { text: "Verificar niveles de radiación",       priority: "alta",  location: "exterior" },
  ];
  for (const m of missions) {
    await addTask({ ...m, completed: false, deadline });
  }
});

// ─────────────────────────────────────────────
// 13. REFRESCO AUTOMÁTICO
// ─────────────────────────────────────────────

let _refreshInterval = null;

function startAutoRefresh() {
  clearInterval(_refreshInterval);
  const interval = (DOM.speedMode?.value === "real") ? 60_000 : 1_000;
  _refreshInterval = setInterval(renderTasks, interval);
}

DOM.speedMode?.addEventListener("change", startAutoRefresh);

// ─────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────

initTheme();
loadTasksFromServer();   // ← carga inicial desde el servidor
startAutoRefresh();