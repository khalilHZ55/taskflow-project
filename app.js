// ===== referencias DOM =====
const form = document.getElementById("task-form");
const input = document.getElementById("task-input");
const priorityInput = document.getElementById("priority-input");
const taskList = document.getElementById("task-list");
const searchInput = document.getElementById("search-input");
const priorityFilter = document.getElementById("priority-filter");
const counter = document.getElementById("task-counter");
const statusFilter = document.getElementById("status-filter");
const completeAllBtn = document.getElementById("complete-all");
const clearCompletedBtn = document.getElementById("clear-completed");
const statTotal = document.getElementById("stat-total");
const statCompleted = document.getElementById("stat-completed");
const statPending = document.getElementById("stat-pending");

// ===== estado =====
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

// ===== guardar =====
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// ===== contador =====
function updateCounter() {
  const pending = tasks.filter(t => !t.completed).length;
  counter.textContent = `${pending} tareas pendientes`;
}

function updateStats() {

  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const pending = total - completed;

  statTotal.textContent = total;
  statCompleted.textContent = completed;
  statPending.textContent = pending;

}

// ===== badge =====
function getBadgeClass(priority) {
  if (priority === "alta") return "badge high";
  if (priority === "media") return "badge medium";
  return "badge low";
}


function sortTasks() {
  const order = { alta: 0, media: 1, baja: 2 };
  tasks.sort((a, b) => order[a.priority] - order[b.priority]);
}

function createTaskElement(task, index) {

  const article = document.createElement("article");

  article.className =
  "p-4 mb-4 flex items-center gap-4 bg-white dark:bg-zinc-800 rounded-xl shadow-md border border-zinc-200 dark:border-zinc-700";

  if (task.completed) article.classList.add("opacity-50");

  // checkbox
  const checkbox = document.createElement("input");

  checkbox.type = "checkbox";
  checkbox.className = "w-5 h-5 cursor-pointer";
  checkbox.checked = task.completed;

  checkbox.addEventListener("change", () => {

    task.completed = checkbox.checked;

    saveTasks();
    renderTasks();

  });

  // titulo
  const title = document.createElement("span");

  title.className =
  `flex-1 font-bold text-xl break-all ${task.completed ? "line-through" : ""}`;

  title.textContent = task.text;

  // prioridad
  const badge = document.createElement("span");

  let priorityClasses = "";

  switch (task.priority) {

    case "alta":
      priorityClasses = "bg-red-500 text-white";
      break;

    case "media":
      priorityClasses = "bg-yellow-500 text-white";
      break;

    case "baja":
      priorityClasses = "bg-green-500 text-white";
      break;

  }

  badge.className =
  `${priorityClasses} px-3 py-1 rounded-full text-xs font-bold`;

  badge.textContent = task.priority;

  // botón editar
  const editBtn = document.createElement("button");

  editBtn.textContent = "✏️";

  editBtn.className =
  "text-xl hover:scale-110 transition";

  editBtn.addEventListener("click", () => {

    const inputEdit = document.createElement("input");

    inputEdit.type = "text";
    inputEdit.value = task.text;

    inputEdit.className =
    "flex-1 p-1 border rounded bg-white dark:bg-zinc-700";

    title.replaceWith(inputEdit);

    inputEdit.focus();

    inputEdit.addEventListener("blur", saveEdit);

    inputEdit.addEventListener("keydown", (e) => {

      if (e.key === "Enter") saveEdit();

    });

    function saveEdit() {

      task.text = inputEdit.value.trim() || task.text;

      saveTasks();
      renderTasks();

    }

  });

  // botón borrar
  const deleteBtn = document.createElement("button");

  deleteBtn.textContent = "🗑";

  deleteBtn.className =
  "text-xl hover:scale-110 transition";

  deleteBtn.addEventListener("click", () => {

    tasks.splice(index, 1);

    saveTasks();
    renderTasks();

  });

  article.append(
    checkbox,
    title,
    badge,
    editBtn,
    deleteBtn
  );

  return article;
}

function renderTasks() {
  const textFilter = searchInput.value || "";
  const prioFilter = priorityFilter?.value || "todas";

  taskList.innerHTML = "";

  sortTasks();

tasks.forEach((task, index) => {
  const matchText = (task.text || "").toLowerCase().includes(textFilter.toLowerCase());

  const matchPriority =
    prioFilter === "todas" || task.priority === prioFilter;

  
  const matchStatus =
    statusFilter.value === "todas" ||
    (statusFilter.value === "completadas" && task.completed) ||
    (statusFilter.value === "pendientes" && !task.completed);

  if (!matchText || !matchPriority || !matchStatus) return;

  taskList.appendChild(createTaskElement(task, index));
});

  updateCounter();
updateStats();
  
}


form.addEventListener("submit", (e) => {
  e.preventDefault();

  const text = input.value.trim();
  if (!text) return;

  tasks.push({
    text,
    priority: priorityInput.value,
    completed: false,
  });

  saveTasks();
  renderTasks();
  input.value = "";
});

// ===== filtros =====
searchInput.addEventListener("input", renderTasks);
priorityFilter?.addEventListener("change", renderTasks);
statusFilter?.addEventListener("change", renderTasks);
// ===== init =====
renderTasks();
updateCounter();


const toggleBtn = document.getElementById("dark-toggle");
const root = document.documentElement;

// comprobar si ya estaba activado antes
if (localStorage.getItem("theme") === "dark") {
  root.classList.add("dark");
  toggleBtn.textContent = "🌙";
}

toggleBtn.addEventListener("click", () => {
  root.classList.toggle("dark");

  if (root.classList.contains("dark")) {
    toggleBtn.textContent = "🌙";
    localStorage.setItem("theme", "dark");
  } else {
    toggleBtn.textContent = "☀️";
    localStorage.setItem("theme", "light");
  }
});


//Completar todas
completeAllBtn.addEventListener("click", () => {
  tasks.forEach(task => {
    task.completed = true;
  });

  saveTasks();
  renderTasks();
});

//Borrar completadas

clearCompletedBtn.addEventListener("click", () => {
  tasks = tasks.filter(task => !task.completed);

  saveTasks();
  renderTasks();
});