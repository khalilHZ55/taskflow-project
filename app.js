// ── 1. REFERENCIAS DOM ──────────────────────────────────────

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
};

// ── 2. ESTADO ────────────────────────────────────────────────

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

// ── 3. PERSISTENCIA ──────────────────────────────────────────

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// ── 4. UTILIDADES ────────────────────────────────────────────

/** Devuelve true si la tarea ha superado su fecha límite */
function isExpired(task) {
  return task.deadline ? new Date(task.deadline) < new Date() : false;
}

/** Calcula días restantes redondeando hacia abajo (días de calendario completos) */
function daysRemaining(task) {
  if (!task.deadline) return null;
  const now      = new Date();
  const deadline = new Date(task.deadline);
  // Comparamos solo la parte de fecha (sin hora)
  const todayMidnight    = new Date(now.getFullYear(),      now.getMonth(),      now.getDate());
  const deadlineMidnight = new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate());
  return Math.round((deadlineMidnight - todayMidnight) / (1000 * 60 * 60 * 24));
}

/**
 * Calcula la fecha límite según el selector.
 * "mañana" → medianoche del día siguiente (00:00:00 del día D+1),
 * es decir que la tarea vence justo cuando arranca ese día.
 *8/
function calculateDeadline() {
  const type = DOM.deadlineType.value;
  const daysMap = { tomorrow: 1, week: 7 };
  const days = daysMap[type] ?? (Number(DOM.customDays.value) || 1);

  // Medianoche del día actual + N días = 00:00:00 del día objetivo
  const deadline = new Date();
  deadline.setHours(0, 0, 0, 0);
  deadline.setDate(deadline.getDate() + days);
  // NO añadimos horas → queda en 00:00:00 del día D+N
  // La tarea vence en cuanto empieza ese día
  return deadline.toISOString();
}


/** Fincion de 1 minuto  ariba ----------------- */
function calculateDeadline() {
  const type = DOM.deadlineType.value;
  const daysMap = { tomorrow: 1, week: 7 };
  const days = daysMap[type] ?? (Number(DOM.customDays.value) || 1);

  const deadline = new Date();
  deadline.setTime(deadline.getTime() + days * 60 * 1000); // 1 día = 1 minuto
  return deadline.toISOString();
}

/** */




/** Construye un deadline de medianoche para las misiones (mañana a las 00:00) *8/
function tomorrowMidnight() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 1);
  return d.toISOString();
}
/** */

/** Funcion de 1 minuto  arriba ---------------------------- */
function tomorrowMidnight() {
  const d = new Date();
  d.setTime(d.getTime() + 60 * 1000); // 1 minuto
  return d.toISOString();
}
/* */


/** Ordena las tareas por prioridad (alta → media → baja) */
function sortByPriority(list) {
  const order = { alta: 0, media: 1, baja: 2 };
  return [...list].sort((a, b) => order[a.priority] - order[b.priority]);
}

/** Filtra las tareas según los controles activos */
function getFilteredTasks() {
  const text     = DOM.searchInput.value.toLowerCase();
  const priority = DOM.priorityFilter.value;
  const status   = DOM.statusFilter.value;
  const location = DOM.locationFilter.value;

  return tasks.filter(task => {
    const expired = isExpired(task);

    const matchText     = task.text.toLowerCase().includes(text);
    const matchPriority = priority === "todas" || task.priority === priority;
    const matchLocation = location === "todas" || task.location === location;
    const matchStatus   =
      status === "todas"      ||
      (status === "completadas" &&  task.completed) ||
      (status === "pendientes"  && !task.completed && !expired) ||
      (status === "vencidas"    &&  expired && !task.completed);

    return matchText && matchPriority && matchLocation && matchStatus;
  });
}

// ── 5. RENDERIZADO ───────────────────────────────────────────

/** Genera el elemento <article> de una tarea */
function createTaskElement(task, index) {
  const expired = isExpired(task);
  const locked  = expired && !task.completed; // vencida sin completar → bloqueada

  // Contenedor: fondo rojo si está vencida y no completada
  const article = document.createElement("article");
  article.className = [
    "p-4 mb-4 flex items-start gap-3",
    "rounded-xl shadow-md border transition-colors duration-700",
    locked
      ? "bg-red-100 dark:bg-red-950 border-red-400 dark:border-red-700"
      : task.completed
        ? "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 opacity-50"
        : "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700",
  ].join(" ");

  // Checkbox — deshabilitado si está vencida
  const checkbox = Object.assign(document.createElement("input"), {
    type:      "checkbox",
    className: `w-5 h-5 mt-1 flex-shrink-0 ${locked ? "cursor-not-allowed opacity-40" : "cursor-pointer"}`,
    checked:   task.completed,
    disabled:  locked,
  });
  if (!locked) {
    checkbox.addEventListener("change", () => {
      task.completed = checkbox.checked;
      saveTasks();
      renderTasks();
    });
  }

  // Cuerpo central
  const body = document.createElement("div");
  body.className = "flex-1 min-w-0 flex flex-col gap-1";

  const title = document.createElement("span");
  title.className = [
    "font-bold text-base sm:text-lg break-words leading-snug",
    task.completed ? "line-through" : "",
    locked ? "text-red-700 dark:text-red-300" : "",
  ].join(" ");
  title.textContent = task.text;

  // Fila de badges
  const meta = document.createElement("div");
  meta.className = "flex flex-wrap items-center gap-1.5 mt-1";

  const priorityColors = { alta: "bg-red-500", media: "bg-yellow-500", baja: "bg-green-500" };
  const badge = document.createElement("span");
  badge.className = `${priorityColors[task.priority] ?? "bg-zinc-400"} text-white px-2 py-0.5 rounded-full text-xs font-bold`;
  badge.textContent = task.priority;

  const locationBadge = document.createElement("span");
  locationBadge.className = "bg-blue-500 text-white px-2 py-0.5 rounded-full text-xs font-bold";
  locationBadge.textContent = task.location === "interior" ? "Interior" : "Exterior";

  const deadlineLabel = document.createElement("span");
  const remaining = daysRemaining(task);
  if (remaining !== null) {
    deadlineLabel.className = `text-xs font-bold ${locked ? "text-red-600 dark:text-red-400" : "text-purple-500"}`;
    if (locked) {
      deadlineLabel.textContent = "⛔ Vencida";
    } else if (remaining === 0) {
      deadlineLabel.textContent = "⏱ Vence hoy";
    } else {
      deadlineLabel.textContent = `⏱ ${remaining} día${remaining !== 1 ? "s" : ""}`;
    }
  }

  meta.append(badge, locationBadge, deadlineLabel);
  body.append(title, meta);

  // Botones — editar bloqueado si vencida
  const actions = document.createElement("div");
  actions.className = "flex flex-col items-center gap-1 flex-shrink-0";

  if (!locked) {
    const editBtn = document.createElement("button");
    editBtn.textContent = "✏️";
    editBtn.className = "text-lg hover:scale-110 transition";
    editBtn.addEventListener("click", () => startInlineEdit(task, title));
    actions.append(editBtn);
  }

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "🗑";
  deleteBtn.className = "text-lg hover:scale-110 transition";
  deleteBtn.addEventListener("click", () => {
    tasks.splice(index, 1);
    saveTasks();
    renderTasks();
  });

  actions.append(deleteBtn);
  article.append(checkbox, body, actions);
  return article;
}

/** Convierte el título de una tarea en un <input> editable in-place */
function startInlineEdit(task, titleEl) {
  const input = Object.assign(document.createElement("input"), {
    type:      "text",
    value:     task.text,
    className: "flex-1 p-1 border rounded bg-white dark:bg-zinc-700 transition-colors duration-700",
  });

  const commit = () => {
    const newText = input.value.trim();
    if (newText) task.text = newText;
    saveTasks();
    renderTasks();
  };

  input.addEventListener("blur", commit);
  input.addEventListener("keydown", e => e.key === "Enter" && commit());
  titleEl.replaceWith(input);
  input.focus();
}

/** Actualiza el contador y las estadísticas */
function updateStats() {
  const total     = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const expired   = tasks.filter(t => isExpired(t) && !t.completed).length;
  const pending   = total - completed;

  DOM.counter.textContent       = `${pending} tareas pendientes`;
  DOM.statTotal.textContent     = total;
  DOM.statCompleted.textContent = completed;
  DOM.statPending.textContent   = pending;
  DOM.statExpired.textContent   = expired;
}

/** Renderiza la lista completa según los filtros activos */
function renderTasks() {
  DOM.taskList.innerHTML = "";

  const visible = sortByPriority(getFilteredTasks());

  visible.forEach(task => {
    const index = tasks.indexOf(task);
    DOM.taskList.appendChild(createTaskElement(task, index));
  });

  updateStats();
}

// ── 6. EVENTOS ───────────────────────────────────────────────

// — Tema oscuro —
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

// — Mostrar/ocultar input de días personalizados —
DOM.deadlineType.addEventListener("change", () => {
  DOM.customDays.classList.toggle("hidden", DOM.deadlineType.value !== "custom");
});

// — Añadir tarea —
DOM.form.addEventListener("submit", e => {
  e.preventDefault();
  const text = DOM.taskInput.value.trim();
  if (!text) return;

  tasks.push({
    text,
    priority:  DOM.priorityInput.value,
    location:  DOM.locationInput.value,
    completed: false,
    deadline:  calculateDeadline(),
  });

  saveTasks();
  renderTasks();
  DOM.taskInput.value = "";
});

// — Filtros y buscador —
DOM.priorityFilter.addEventListener("change", renderTasks);
DOM.statusFilter.addEventListener("change", renderTasks);
DOM.locationFilter.addEventListener("change", renderTasks);
DOM.searchInput.addEventListener("input", renderTasks);

// — Completar todas (omite las vencidas) —
DOM.completeAllBtn.addEventListener("click", () => {
  tasks.forEach(t => {
    if (!isExpired(t)) t.completed = true;
  });
  saveTasks();
  renderTasks();
});

// — Borrar completadas —
DOM.clearDoneBtn.addEventListener("click", () => {
  tasks = tasks.filter(t => !t.completed);
  saveTasks();
  renderTasks();
});

// — Cargar misiones diarias —
DOM.loadMissionBtn.addEventListener("click", () => {
  const deadline = tomorrowMidnight();

  const missions = [
    { text: "Revisar niveles de oxígeno",           priority: "alta",  location: "interior" },
    { text: "Inspeccionar paneles solares",          priority: "baja",  location: "exterior" },
    { text: "Analizar muestras del suelo marciano",  priority: "media", location: "exterior" },
    { text: "Actualizar sistema de navegación",      priority: "media", location: "interior" },
    { text: "Verificar comunicaciones con Tierra",   priority: "alta",  location: "interior" },
  ].map(m => ({ ...m, completed: false, deadline }));

  tasks.push(...missions);
  saveTasks();
  renderTasks();
});

// ── INIT ─────────────────────────────────────────────────────
initTheme();
renderTasks();
