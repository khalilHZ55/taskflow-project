// ===== referencias DOM =====
const form = document.getElementById("task-form");
const input = document.getElementById("task-input");
const priorityInput = document.getElementById("priority-input");
const taskList = document.getElementById("task-list");
const searchInput = document.getElementById("search-input");
const priorityFilter = document.getElementById("priority-filter");
const counter = document.getElementById("task-counter");
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


function sortTasks() {
  const order = { alta: 0, media: 1, baja: 2 };
  tasks.sort((a, b) => order[a.priority] - order[b.priority]);
}

function createTaskElement(task, index) {
  const article = document.createElement("article");
  
  article.className = "task-card p-6 mb-4 flex items-center gap-6 bg-white dark:bg-zinc-800 rounded-xl shadow-md border border-zinc-200 dark:border-zinc-700";
  
  if (task.completed) article.classList.add("opacity-50");

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "w-6 h-6 cursor-pointer";
  checkbox.checked = task.completed;
  checkbox.addEventListener("change", () => {
    task.completed = checkbox.checked;
    saveTasks();
    renderTasks();
  });

  const title = document.createElement("span");
  title.className = `task-title font-bold flex-1 text-2xl dark:text-orange-700 ${task.completed ? 'line-through' : ''}`;
  title.textContent = task.text;

  
  const badge = document.createElement("span");
  let priorityClasses = "";

  
  switch (task.priority) {
    case "alta":
      priorityClasses = "bg-red-500 text-white shadow-red-200";
      break;
    case "media":
      priorityClasses = "bg-yellow-500 text-white shadow-yellow-200";
      break;
    case "baja":
      priorityClasses = "bg-green-500 text-white shadow-green-200";
      break;
    default:
      priorityClasses = "bg-zinc-500 text-white";
  }

  
  badge.className = `${priorityClasses} px-4 py-1 rounded-full text-sm font-black uppercase tracking-wider shadow-sm`;
  badge.textContent = task.priority;

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "🗑";
  deleteBtn.className = "text-3xl hover:scale-110 transition-transform active:scale-90";
  deleteBtn.addEventListener("click", () => {
    article.classList.add("opacity-0", "scale-95");
    setTimeout(() => {
      tasks.splice(index, 1);
      saveTasks();
      renderTasks();
    }, 200);
  });

  
  article.append(checkbox, title, badge, deleteBtn);
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