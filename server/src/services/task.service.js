let tasks = [];

function obtenerTodas() {
  return tasks;
}

function crearTarea(data) {
  const id = crypto.randomUUID();
  const task = {
    id,
    text:     data.text,
    priority: data.priority ?? null,
    location: data.location ?? null,
    deadline: data.deadline ?? null,
    completed: data.completed ?? false,
    createdAt: Date.now(),
  };
  tasks.push(task);
  return task;
}

/**
 * Actualiza campos parciales de una tarea (PATCH semántico).
 * Solo permite mutar: text, completed, priority, location, deadline.
 * @param {string} id
 * @param {object} changes
 * @returns {object} – la tarea actualizada
 */
function actualizarTarea(id, changes) {
  const task = tasks.find(t => t.id === id);
  if (!task) throw new Error("NOT_FOUND");

  const ALLOWED = ["text", "completed", "priority", "location", "deadline"];
  for (const key of ALLOWED) {
    if (key in changes) task[key] = changes[key];
  }

  return task;
}

function eliminarTarea(id) {
  const idx = tasks.findIndex(t => t.id === id);
  if (idx === -1) throw new Error("NOT_FOUND");
  tasks.splice(idx, 1);
}

module.exports = {
  obtenerTodas,
  crearTarea,
  actualizarTarea,
  eliminarTarea,
};