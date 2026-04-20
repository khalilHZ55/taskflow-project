// ═══════════════════════════════════════════════════════════════
// PROJECT MARS — src/api/client.js
// Capa de red: todas las peticiones HTTP al backend en un único
// módulo. El resto del frontend no sabe nada de fetch ni URLs.
// ═══════════════════════════════════════════════════════════════

const API_BASE = window.location.hostname === "localhost"
  ? "http://localhost:3000/api/v1/tasks"
  : "https://taskflow-api-brown.vercel.app/";

/**
 * Wrapper interno que centraliza el manejo de errores HTTP.
 * - Si el servidor responde con un código de error, lanza un Error
 *   con el mensaje devuelto por la API (o un texto genérico).
 * - Si la red falla antes de llegar al servidor, propaga el error
 *   de red tal cual (ej. "Failed to fetch").
 *
 * @param {string} url
 * @param {RequestInit} options
 * @returns {Promise<any|null>} – null cuando la respuesta es 204 No Content
 */
async function request(url, options = {}) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  // 204 No Content: éxito sin cuerpo (ej. DELETE)
  if (response.status === 204) return null;

  const data = await response.json();

  if (!response.ok) {
    // El servidor devuelve { error: "..." }; usamos ese mensaje si existe
    const message = data?.error ?? `Error ${response.status}`;
    throw new Error(message);
  }

  return data;
}

// ─────────────────────────────────────────────
// MÉTODOS PÚBLICOS DE LA API
// ─────────────────────────────────────────────

/**
 * GET /api/v1/tasks
 * Devuelve el array completo de tareas desde el servidor.
 * @returns {Promise<Task[]>}
 */
export async function fetchAllTasks() {
  return request(API_BASE);
}

/**
 * POST /api/v1/tasks
 * Crea una nueva tarea en el servidor.
 * @param {{ text: string, priority: string, location: string, deadline?: number }} taskData
 * @returns {Promise<Task>} – la tarea creada con su id asignado por el servidor
 */
export async function createTask(taskData) {
  return request(API_BASE, {
    method: "POST",
    body: JSON.stringify(taskData),
  });
}

/**
 * DELETE /api/v1/tasks/:id
 * Elimina una tarea por su id.
 * @param {string} id
 * @returns {Promise<null>}
 */
export async function deleteTask(id) {
  return request(`${API_BASE}/${id}`, { method: "DELETE" });
}

/**
 * PATCH /api/v1/tasks/:id
 * Actualiza campos parciales de una tarea (completed, text, etc.).
 * @param {string} id
 * @param {Partial<Task>} changes
 * @returns {Promise<Task>}
 */
export async function updateTask(id, changes) {
  return request(`${API_BASE}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(changes),
  });
}