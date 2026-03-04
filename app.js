// ===== referencias DOM =====
const form = document.getElementById("task-form");
const input = document.getElementById("task-input");
const taskList = document.getElementById("task-list");
const searchInput = document.getElementById("search-input");

// ===== estado =====
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

// ===== guardar en localStorage =====
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// ===== crear elemento tarea =====
function createTaskElement(taskText, index) {
  const article = document.createElement("article");
  article.className = "task-card";

  const title = document.createElement("span");
  title.className = "task-title";
  title.textContent = taskText;

  const badge = document.createElement("span");
  badge.className = "badge medium";
  badge.textContent = "Media";

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "🗑";
  deleteBtn.style.cursor = "pointer";

  // eliminar tarea
  deleteBtn.addEventListener("click", () => {
    tasks.splice(index, 1);
    saveTasks();
    renderTasks();
  });

  article.appendChild(title);
  article.appendChild(badge);
  article.appendChild(deleteBtn);

  return article;
}

// ===== renderizar tareas =====
function renderTasks(filter = "") {
  taskList.innerHTML = "";

  tasks.forEach((task, index) => {
    if (!task.toLowerCase().includes(filter.toLowerCase())) return;
    const element = createTaskElement(task, index);
    taskList.appendChild(element);
  });
}

// ===== añadir tarea =====
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const text = input.value.trim();
  if (!text) return;

  tasks.push(text);
  saveTasks();
  renderTasks();

  input.value = "";
});

// ===== filtro (BONUS) =====
searchInput.addEventListener("input", (e) => {
  renderTasks(e.target.value);
});

// ===== cargar al iniciar =====
renderTasks();