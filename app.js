// ===== ESTADO Y REFERENCIAS =====
const elements = {
  form: document.getElementById("task-form"),
  input: document.getElementById("task-input"),
  priorityInput: document.getElementById("priority-input"),
  taskList: document.getElementById("task-list"),
  searchInput: document.getElementById("search-input"),
  priorityFilter: document.getElementById("priority-filter"),
  statusFilter: document.getElementById("status-filter"),
  counter: document.getElementById("task-counter"),
  toggleBtn: document.getElementById("dark-toggle")
};

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

// ===== PERSISTENCIA Y CONTADOR =====
const saveTasks = () => localStorage.setItem("tasks", JSON.stringify(tasks));

const updateCounter = () => {
  const pending = tasks.filter(t => !t.completed).length;
  elements.counter.textContent = `${pending} tareas pendientes`;
};

// ===== LÓGICA DE TAREAS =====
const sortTasks = () => {
  const order = { alta: 0, media: 1, baja: 2 };
  tasks.sort((a, b) => order[a.priority] - order[b.priority]);
};

function createTaskElement(task, index) {
  const article = document.createElement("article");
  article.className = `p-6 mb-4 flex items-center gap-6 bg-white dark:bg-zinc-800 rounded-xl shadow-md border border-zinc-200 dark:border-zinc-700 transition-all ${task.completed ? 'opacity-50' : ''}`;
  
  // Colores de prioridad (Badge)
  const colors = { 
    alta: "bg-red-500", 
    media: "bg-yellow-500", 
    baja: "bg-green-500" 
  };

  article.innerHTML = `
    <input type="checkbox" ${task.completed ? 'checked' : ''} class="w-6 h-6 cursor-pointer">
    <span class="font-bold flex-1 text-2xl dark:text-white ${task.completed ? 'line-through opacity-70' : ''}">
      ${task.text}
    </span>
    <span class="${colors[task.priority]} px-4 py-1 rounded-full text-sm font-black text-white uppercase shadow-sm">
      ${task.priority}
    </span>
    <button class="text-3xl hover:scale-110 transition-transform">🗑</button>
  `;

  // Eventos
  article.querySelector('input').onchange = () => {
    task.completed = !task.completed;
    saveTasks(); renderTasks();
  };

  article.querySelector('button').onclick = () => {
    article.classList.add("opacity-0", "scale-95");
    setTimeout(() => { tasks.splice(index, 1); saveTasks(); renderTasks(); }, 200);
  };

  return article;
}

function renderTasks() {
  const textF = elements.searchInput.value.toLowerCase();
  const prioF = elements.priorityFilter.value;
  const statF = elements.statusFilter.value;

  elements.taskList.innerHTML = "";
  sortTasks();

  tasks.forEach((task, index) => {
    const matchText = task.text.toLowerCase().includes(textF);
    const matchPrio = prioF === "todas" || task.priority === prioF;
    const matchStat = statF === "todas" || 
                     (statF === "completadas" && task.completed) || 
                     (statF === "pendientes" && !task.completed);

    if (matchText && matchPrio && matchStat) {
      elements.taskList.appendChild(createTaskElement(task, index));
    }
  });
  updateCounter();
}

// ===== EVENTOS GENERALES =====
elements.form.onsubmit = (e) => {
  e.preventDefault();
  const text = elements.input.value.trim();
  if (!text) return;
  tasks.push({ text, priority: elements.priorityInput.value, completed: false });
  elements.input.value = "";
  saveTasks(); renderTasks();
};

[elements.searchInput, elements.priorityFilter, elements.statusFilter].forEach(el => 
  el.addEventListener("input", renderTasks)
);

// ===== MODO OSCURO =====
const setTheme = (isDark) => {
  document.documentElement.classList.toggle("dark", isDark);
  elements.toggleBtn.textContent = isDark ? "☀️" : "🌙";
  localStorage.setItem("theme", isDark ? "dark" : "light");
};

elements.toggleBtn.onclick = () => setTheme(!document.documentElement.classList.contains("dark"));

// Inicialización
if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
  setTheme(true);
}
renderTasks();