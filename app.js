// ===== referencias DOM =====
const form = document.getElementById("task-form");
const input = document.getElementById("task-input");
const priorityInput = document.getElementById("priority-input");
const taskList = document.getElementById("task-list");
const searchInput = document.getElementById("search-input");
const priorityFilter = document.getElementById("priority-filter");
const counter = document.getElementById("task-counter");
const filterCompletedBtn = document.getElementById("filter-completed");
const statusFilter = document.getElementById("status-filter");


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

// ===== badge =====
function getBadgeClass(priority) {
  if (priority === "alta") return "badge high";
  if (priority === "media") return "badge medium";
  return "badge low";
}

// ===== ordenar por prioridad =====
function sortTasks() {
  const order = { alta: 0, media: 1, baja: 2 };
  tasks.sort((a, b) => order[a.priority] - order[b.priority]);
}

// ===== crear tarea =====
function createTaskElement(task, index) {
  const article = document.createElement("article");
  article.className = "task-card";
  if (task.completed) article.classList.add("completed");

  // checkbox completar
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "task-check";
  checkbox.checked = task.completed;

  checkbox.addEventListener("change", () => {
    task.completed = checkbox.checked;
    saveTasks();
    renderTasks();
  });

  // título
  const title = document.createElement("span");
  title.className = "task-title";
  title.textContent = task.text;

  // selector prioridad
  const select = document.createElement("select");
  select.innerHTML = `
    <option value="alta">Alta</option>
    <option value="media">Media</option>
    <option value="baja">Baja</option>
  `;
  select.value = task.priority;

  const badge = document.createElement("span");
  badge.className = getBadgeClass(task.priority);
  badge.textContent = task.priority;

  select.addEventListener("change", (e) => {
    task.priority = e.target.value;
    badge.className = getBadgeClass(task.priority);
    badge.textContent = task.priority;
    sortTasks();
    saveTasks();
    renderTasks();
  });

  // borrar con animación
  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "🗑";
  deleteBtn.style.cursor = "pointer";

  deleteBtn.addEventListener("click", () => {
    article.classList.add("removing");
    setTimeout(() => {
      tasks.splice(index, 1);
      saveTasks();
      renderTasks();
    }, 200);
  });

  article.append(checkbox, title, select, badge, deleteBtn);
  return article;
}


function renderTasks() {
  const textFilter = searchInput.value || "";
  const prioFilter = priorityFilter?.value || "todas";

  taskList.innerHTML = "";

  sortTasks();

tasks.forEach((task, index) => {
  const matchText = task.text
    .toLowerCase()
    .includes(textFilter.toLowerCase());

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

filterCompletedBtn?.addEventListener("click", () => {
  showCompletedOnly = !showCompletedOnly;
  renderTasks();
});