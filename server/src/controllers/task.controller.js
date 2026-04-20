const taskService = require("../services/task.service");

function getAll(_req, res) {
  const tasks = taskService.obtenerTodas();
  res.json(tasks);
}

function create(req, res) {
  const body = req.body ?? {};

  if (typeof body.text !== "string" || body.text.trim().length === 0) {
    return res.status(400).json({ error: "INVALID_TEXT" });
  }
  if (body.priority != null && typeof body.priority !== "string") {
    return res.status(400).json({ error: "INVALID_PRIORITY" });
  }
  if (body.location != null && typeof body.location !== "string") {
    return res.status(400).json({ error: "INVALID_LOCATION" });
  }

  const created = taskService.crearTarea({
    text:      body.text.trim(),
    priority:  body.priority,
    location:  body.location,
    deadline:  body.deadline  ?? null,
    completed: body.completed ?? false,
  });

  return res.status(201).json(created);
}

/**
 * PATCH /api/v1/tasks/:id
 * Aplica cambios parciales sobre una tarea existente.
 */
function patch(req, res, next) {
  const { id } = req.params ?? {};
  if (typeof id !== "string" || id.trim().length === 0) {
    return res.status(400).json({ error: "INVALID_ID" });
  }

  const body    = req.body ?? {};
  const changes = {};

  // Validar y recoger sólo los campos presentes en el body
  if ("text" in body) {
    if (typeof body.text !== "string" || body.text.trim().length === 0) {
      return res.status(400).json({ error: "INVALID_TEXT" });
    }
    changes.text = body.text.trim();
  }

  if ("completed" in body) {
    if (typeof body.completed !== "boolean") {
      return res.status(400).json({ error: "INVALID_COMPLETED" });
    }
    changes.completed = body.completed;
  }

  if ("priority" in body) {
    if (typeof body.priority !== "string") {
      return res.status(400).json({ error: "INVALID_PRIORITY" });
    }
    changes.priority = body.priority;
  }

  if ("location" in body) {
    if (typeof body.location !== "string") {
      return res.status(400).json({ error: "INVALID_LOCATION" });
    }
    changes.location = body.location;
  }

  if ("deadline" in body) {
    if (body.deadline !== null && typeof body.deadline !== "number") {
      return res.status(400).json({ error: "INVALID_DEADLINE" });
    }
    changes.deadline = body.deadline;
  }

  try {
    const updated = taskService.actualizarTarea(id, changes);
    return res.json(updated);
  } catch (err) {
    return next(err);
  }
}

function remove(req, res, next) {
  const { id } = req.params ?? {};
  if (typeof id !== "string" || id.trim().length === 0) {
    return res.status(400).json({ error: "INVALID_ID" });
  }

  try {
    taskService.eliminarTarea(id);
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
}

module.exports = { getAll, create, patch, remove };