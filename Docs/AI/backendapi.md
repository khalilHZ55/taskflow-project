# Herramientas del ecosistema backend

## Axios

**Qué es**: Librería JavaScript para realizar peticiones HTTP, disponible tanto en el navegador como en Node.js. Es una alternativa a la API nativa `fetch`.

**Por qué se usa**:
- Transforma automáticamente el body a JSON y parsea la respuesta, sin necesidad de llamar `.json()` manualmente.
- Interceptores: permiten añadir cabeceras de autenticación o manejar errores de forma centralizada en un único punto, sin repetir lógica en cada llamada.
- Cancela peticiones en vuelo (útil para búsquedas con debounce).
- Los errores HTTP (4xx, 5xx) lanzan excepciones por defecto, mientras que `fetch` requiere comprobar `response.ok` manualmente.
- Mejor soporte para entornos Node.js (sin necesidad de polyfills).

**Ejemplo básico**:
```javascript
import axios from "axios";

const { data } = await axios.get("http://localhost:3000/api/v1/tasks");
// data ya es el array de tareas, sin .json()

await axios.post("http://localhost:3000/api/v1/tasks", {
  text: "Nueva tarea",
  priority: "alta"
});
```

---

## Postman

**Qué es**: Aplicación de escritorio (y web) para diseñar, probar y documentar APIs REST. Permite enviar peticiones HTTP arbitrarias sin necesidad de escribir código.

**Por qué se usa**:
- Pruebas manuales de endpoints durante el desarrollo, antes de conectar el frontend.
- Colecciones: agrupa todas las peticiones de un proyecto y las comparte con el equipo.
- Variables de entorno: cambia la URL base de `localhost:3000` a producción con un clic.
- Tests automáticos: escribe assertions en JavaScript que verifican el código de respuesta, el formato del JSON o los tiempos de respuesta.
- Documentación viva: genera documentación navegable a partir de las colecciones.

**Flujo típico en este proyecto**:
1. `GET /api/v1/tasks` → verificar que devuelve `[]` inicialmente.
2. `POST /api/v1/tasks` con body vacío → verificar que responde `400 INVALID_TEXT`.
3. `DELETE /api/v1/tasks/id-que-no-existe` → verificar que responde `404 NOT_FOUND`.

---

## Sentry

**Qué es**: Plataforma de monitorización de errores en tiempo real para aplicaciones web, móviles y servidores.

**Por qué se usa**:
- En producción, los errores no aparecen en ninguna consola a la que tengas acceso. Sentry los captura automáticamente, los agrupa por tipo y envía alertas.
- Stack traces completos con el contexto exacto: versión del código, usuario afectado, navegador, petición que causó el error.
- Seguimiento de rendimiento: detecta qué endpoints son lentos o cuándo aumenta la tasa de errores tras un despliegue.
- Integración con Express en dos líneas:

```javascript
const Sentry = require("@sentry/node");
Sentry.init({ dsn: process.env.SENTRY_DSN });

// Debe registrarse antes que los demás middlewares
app.use(Sentry.Handlers.requestHandler());

// Debe registrarse antes del middleware de errores propio
app.use(Sentry.Handlers.errorHandler());
```

- Sin Sentry (o herramienta equivalente), los errores en producción son invisibles hasta que un usuario los reporta.

---

## Swagger / OpenAPI

**Qué es**: Especificación estándar (OpenAPI) para describir APIs REST de forma legible tanto por humanos como por máquinas. Swagger es el conjunto de herramientas más popular para generar, visualizar y trabajar con esa especificación.

**Por qué se usa**:
- **Documentación interactiva**: Swagger UI genera una interfaz web donde cualquier miembro del equipo puede ver todos los endpoints, los parámetros esperados y probarlos directamente desde el navegador, sin Postman.
- **Contrato**: el fichero `openapi.yaml` actúa como contrato entre el equipo de backend y el de frontend. Ambos acuerdan la forma de los datos antes de escribir una sola línea de código.
- **Generación de clientes**: herramientas como `openapi-generator` pueden generar automáticamente el código del cliente HTTP en cualquier lenguaje a partir de la especificación.
- **Validación automática**: librerías como `express-openapi-validator` rechazan peticiones que no cumplen el esquema definido, sin escribir validaciones manuales.

**Ejemplo mínimo** (`openapi.yaml`):
```yaml
openapi: "3.0.3"
info:
  title: TaskFlow API
  version: "1.0.0"
paths:
  /api/v1/tasks:
    get:
      summary: Devuelve todas las tareas
      responses:
        "200":
          description: Array de tareas
    post:
      summary: Crea una tarea
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [text]
              properties:
                text:
                  type: string
                priority:
                  type: string
                  enum: [alta, media, baja]
      responses:
        "201":
          description: Tarea creada
        "400":
          description: Datos inválidos
```