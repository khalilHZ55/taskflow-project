const express = require("express");
const cors = require("cors");

const { port } = require("./config/env");
const taskRoutes = require("./routes/task.routes");

const app = express();

app.use(cors({
  origin: [
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "https://taskflow-project-taupe.vercel.app",  // ← dominio de tu frontend en Vercel
  ]
}));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/v1/tasks", taskRoutes);

// Middleware global de errores (debe ir al final)
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  const message = err instanceof Error ? err.message : "";

  if (message === "NOT_FOUND") {
    return res.status(404).json({ error: "NOT_FOUND" });
  }

  console.error(err);
  return res.status(500).json({ error: "Error interno del servidor" });
});

app.listen(port, () => {
  console.log(`[server] listening on http://localhost:${port}`);
});

module.exports = app;