# Prompt Engineering

## Objetivo
Este documento describe las técnicas de prompt engineering utilizadas para obtener mejores resultados al trabajar con asistentes de inteligencia artificial.

## Qué se analizará
- Cómo estructurar prompts efectivos
- Iteración sobre prompts
- Ejemplos de prompts utilizados para mejorar el proyecto TaskFlow


Estos son ejemplos de prompts utilizados durante el desarrollo del proyecto Project Mars aplicando técnicas de prompt engineering.

1-Actúa como un desarrollador frontend senior especializado en JavaScript y Tailwind. Analiza mi función renderTasks() y sugiere mejoras de rendimiento y legibilidad sin cambiar su comportamiento.

    Por qué funciona bien

    Asignar un rol hace que la IA:

      priorice buenas prácticas
      sugiera refactorizaciones reales
      evite soluciones básicas

    En este caso la ia ha reducido la complejidad del algoridmo de O(n^2) a o(n).

2-Actúa como arquitecto frontend. Estoy desarrollando una app llamada Project Mars para gestionar tareas de una misión espacial. Sugiere cómo organizar mejor el estado de las tareas en JavaScript.

    Por qué funciona bien

    El contexto:

    mejora la coherencia de las respuestas
    permite soluciones adaptadas al proyecto
    evita respuestas genéricas

    La IA me ha dado consejos para evitar problemas de escalabilidad del proyecto.



3-Genera otra tarea similar para una misión en Marte manteniendo el mismo formato.

{
text: "Revisar oxígeno",
priority: "alta",
location: "interior",
completed: false,
deadline: "2026-05-10"
}

  Por qué funciona bien

  Few-shot prompting:

  enseña el formato esperado
  reduce errores
  mantiene consistencia en estructuras JSON

  La IA se ciñe a lo que se le ha pedido y obtengo un resultado satisfactirio.
  

4- Refactoriza la función createTaskElement() sin cambiar su comportamiento y sin usar librerías externas.

  Por qué funciona bien

  Las restricciones:

  evitan cambios peligrosos
  mantienen compatibilidad
  generan código seguro

  Consigue hacer cambios clave en proyectos reales.

5- Explica paso a paso cómo funciona el sistema de filtros en mi aplicación Project Mars.

  Por qué funciona bien

  El razonamiento paso a paso:

  mejora comprensión del código
  ayuda a detectar errores
  facilita documentación técnica

  Muy útil para aprendizaje.

  La IA procede a explicar el código, paso a paso y función por función.


6-Simula posibles errores que podrían aparecer en el sistema de deadlines de Project Mars y propone soluciones.

  Por qué funciona bien

  Este prompt:

  detecta edge cases
  mejora robustez
  previene bugs reales

  Es muy útil antes de producción.


7-Genera documentación en formato Markdown explicando la función calculateDeadline().
  Por qué funciona bien

  Controlar el formato:

  facilita integración en docs/
  evita reformatear manualmente
  acelera documentación

  Detalla la función y su funcionamiento con todo lujo de detalles.

8-Añade una alerta visual parpadeante en rojo claro cuando falten menos de 24 horas para que expire una tarea en Project Mars.

  Por qué funciona bien

  Incluye:

  contexto
  objetivo claro
  comportamiento esperado

  Resultado: código directamente usable sin tocar código por parte del programador.


9-Sugiere cómo separar la lógica de renderizado y almacenamiento en módulos distintos en mi aplicación JavaScript.

  Por qué funciona bien

  Permite:

  mejorar escalabilidad
  aplicar buenas prácticas
  preparar el proyecto para crecimiento futuro


10-Refactoriza un funciones para mejorar el rendimiento, orden y compresion del código sin cambiar la funconalidad del proyecto.

  Por qué funciona bien

  Las exigencias:

  evita problemas en el proyecto
  cambia el código para lograr objetivos claros
  mejora el proyecto

  La ia consigue refactorizar el código incluso añadiendo nuevas funcionalidades.