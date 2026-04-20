# Taskflow Project
# Project Mars — TaskFlow

Gestor de tareas temático con frontend vanilla JS y backend REST en Node.js + Express.

---

## Estructura del proyecto

```
taskflow/
├── index.html          ← UI principal
├── app.js              ← Lógica del frontend (consume la API REST)
├── src/
│   └── api/
│       └── client.js   ← Capa de red: toda comunicación con el servidor
│
└── server/
    ├── .env            ← Variables de entorno (no commitear)
    ├── .gitignore
    ├── package.json
    └── src/
        ├── index.js                    ← Entrada: Express + middlewares globales
        ├── config/
        │   └── env.js                  ← Carga y valida variables de entorno
        ├── routes/
        │   └── task.routes.js          ← Enrutamiento HTTP → controlador
        ├── controllers/
        │   └── task.controller.js      ← Validación de frontera + formato de respuesta
        └── services/
            └── task.service.js         ← Lógica de negocio pura (sin Express)
```

---

## Cómo arrancar

### Backend

```bash
cd server
npm install
# Crea el archivo .env con:  PORT=3000
npm run dev
```

El servidor escucha en `http://localhost:3000`.  
Endpoint de salud: `GET /health` → `{ "ok": true }`

### Frontend

Abre `index.html` en un servidor local (Live Server, Vite, etc.).  
El frontend llama automáticamente a `http://localhost:3000/api/v1/tasks` al cargar.

---

## API REST

Base URL: `/api/v1/tasks`

| Método   | Ruta        | Descripción                        | Código éxito |
|----------|-------------|------------------------------------|--------------|
| `GET`    | `/`         | Devuelve todas las tareas          | `200`        |
| `POST`   | `/`         | Crea una nueva tarea               | `201`        |
| `PATCH`  | `/:id`      | Actualiza campos de una tarea      | `200`        |
| `DELETE` | `/:id`      | Elimina una tarea                  | `204`        |

### Ejemplos

**Crear tarea**
```http
POST /api/v1/tasks
Content-Type: application/json

{
  "text": "Revisar niveles de oxígeno",
  "priority": "alta",
  "location": "interior",
  "deadline": 1714000000000
}
```

**Marcar como completada**
```http
PATCH /api/v1/tasks/abc-123
Content-Type: application/json

{ "completed": true }
```

**Borrar tarea**
```http
DELETE /api/v1/tasks/abc-123
```

### Errores

| Código | `error`                    | Causa                                |
|--------|----------------------------|--------------------------------------|
| `400`  | `INVALID_TEXT`             | Texto vacío o tipo incorrecto        |
| `400`  | `INVALID_COMPLETED`        | `completed` no es booleano           |
| `404`  | `NOT_FOUND`                | ID no existe                         |
| `500`  | `Error interno del servidor` | Cualquier fallo no controlado      |

---

## Arquitectura por capas

### 1. Enrutamiento (`task.routes.js`)
Capa "tonta". Su única responsabilidad es mapear un verbo HTTP + ruta al método de controlador correspondiente. No contiene ninguna lógica.

### 2. Controladores (`task.controller.js`)
Director de orquesta. Extrae datos de `req.body` y `req.params`, aplica **validación defensiva** en la frontera de red (cualquier dato enviado por el cliente se considera no confiable), llama al servicio con datos limpios y formatea la respuesta HTTP con el código semántico correcto.

### 3. Servicios (`task.service.js`)
Corazón intelectual. Lógica de negocio pura: no importa Express, no conoce `req` ni `res`. Opera sobre un array en memoria como persistencia temporal. Al ser funciones JavaScript ordinarias, son directamente testables sin levantar ningún servidor.

### Middlewares registrados en `index.js`

```
Petición entrante
       │
       ▼
  cors()            → Cabeceras CORS para permitir fetch desde el navegador
       │
       ▼
  express.json()    → Parsea el body crudo (Buffer) a req.body (objeto JS)
       │
       ▼
  /api/v1/tasks     → Router de tareas
       │
       ▼
  errorHandler      → Middleware global de 4 parámetros: mapea errores a
                       códigos HTTP (404 / 500) sin filtrar trazas al cliente
```

---

## Gestión de estados de red (frontend)

El frontend gestiona tres estados para cada operación:

- **Carga** (`showLoading`): spinner animado mientras se espera la respuesta inicial del servidor.
- **Éxito**: renderiza las tarjetas y actualiza estadísticas.
- **Error** (`showNetworkError`): banner rojo no bloqueante con el mensaje del servidor. Cierre manual con ✕. No interrumpe el resto de la UI.

Las operaciones de toggle y edición usan **optimistic updates**: la UI se actualiza de inmediato y hace rollback automático si el servidor rechaza la operación.

---

## Variables de entorno

| Variable | Descripción              | Ejemplo |
|----------|--------------------------|---------|
| `PORT`   | Puerto del servidor HTTP | `3000`  |

El módulo `src/config/env.js` verifica la existencia de todas las variables obligatorias al arrancar. Si alguna falta, el proceso se niega a iniciar con un mensaje claro.

---

## Scripts disponibles

```bash
npm run dev    # Inicia con nodemon (recarga automática al guardar)
```