# AI Comparison

## Objetivo
En este documento comparo diferentes asistentes de inteligencia artificial utilizados durante el desarrollo del proyecto TaskFlow.

## Herramientas analizadas
- ChatGPT
- Claude
- Cursor AI

## Qué se evaluará
- Calidad del código generado
- Capacidad para explicar conceptos
- Utilidad para depuración
- Velocidad de iteración en el desarrollo



- 1 - Le pedí a Cloud AI y Chat GPT que me explicaran que es un event loop, DOM, hoisting,

    - Ambos tardaron aproximdamente el mismo tiempo, unos 5s.
    - Sus explicaciones fueron parecidas, con los mismos ejemplos practicamente, misma estructura aunque Chat GPT tiene un mejor orden tradujo algunos tecnicismos, la profundidad de las explicaciones es la misma.
    - Los códigos de ejemplo son prácticamente iguales.





- 2 - Les di el siguiente código:

---------------------------------------------------
    function calcularTotal(productos) {
  let total = 0;

  for (let i = 0; i <= productos.length; i++) {
    let item = prodctos[i];
    total += item.precio;
  }

  const descuento = 0.10;
  if (total > 100) {
    descuento = 0.20;
    total = total - (total * descuento);
  }

  return resultado;
}

const carrito = [
  { nombre: "Teclado", precio: 50 },
  { nombre: "Mouse", precio: 30 }
];

console.log("El total con descuento es: " + calcularTotal(carrito));

---------------------------------------------------------------

- Estos son los errores:
    - Error de Referencia (Typo): Dentro del bucle for, escribí prodctos[i] en lugar de productos[i]. Esto hará que el código falle inmediatamente.

    - Error de Lógica (Fuera de rango): En la condición del bucle puse i <= productos.length. Como los índices empiezan en 0, esto intentará acceder a un elemento que no existe al final,      devolviendo undefined.

    - Error de Sintaxis (Constantes): Intenté reasignar el valor de descuento (descuento = 0.20), pero la variable está declarada como const. Debería ser let.

    - Error de Referencia (Variable no definida): La función intenta retornar resultado, pero esa variable nunca se declaró; la variable que contiene el valor es total.

    - Error de Atributo (Potencial): Si el bucle llega al índice fuera de rango (el punto 2), intentará leer item.precio sobre algo que es undefined, rompiendo el programa.


- El código de Chat GPT y Claude AI solucionan los problemas de la misma manera, tardando lo mismo y sus explicaciones son prácticamente iguales, sin embargo la intención del código es aplicar un descuento general del 10% a todas las compras y un descuento del 20% si la compra supera 100€, con el código proporcionado aunque lo arreglen solo se puede aplicar el descuento del 20%
pero Claude AI se ha dado cuenta de eso y sacó    total = total - (total * descuento);       fuera del        if (total > 100) {}     haciendo que el descuento del 10% se pueda aplicar, yo en ningún momento les indique la intención del código.






- 3 - Les he pedido que me generen 3 funciones usando este promt:

    "Actúa como un tutor de programación que explica las cosas de forma sencilla. Necesito que escribas 3 funciones de JavaScript para gestionar una lista de tareas.

Los datos: Un array de objetos llamado tareas. Cada objeto es: { id: 1, texto: "Comprar pan", completada: false }.

Describe e implementa estas 3 funciones:

Función  (Contar): Crea una función  básica para contar cuántas tareas hay en total en el array y devuelva ese número con un mensaje simple.

Función (Filtrar): Crea una función que devuelva un nuevo array que solo contenga las tareas que ya están completadas (completada: true). Usa un método sencillo.

Función (Cambiar estado): Crea una función que reciba un id y busque esa tarea en la lista para cambiar su estado de completada: false a true. Si no encuentra la tarea, debe mostrar un aviso en la consola.

Por favor, explica para qué sirve cada función como si se lo explicaras a alguien que está aprendiendo hoy mismo."

    - El tiempo de respuesta es el mimso unos 15s.
    - Las IAs me han proporcionado códigos funcionalas
            - Chat GPT: Ha sido más explicativo y ha ido paso a paso, su forma de hacer el código ha sido más basica para enseñar las bases según decia el prompt, perfecta para enseñar. 

            -Claude AI: Sus explicaciones son más concisas y técnicas, ha usado métodos y funciones que se usarian en la realidad, un poco complejo para alguien que ha empezado hoy como dice el promt, pero ha sido más "profesional"

            - Mientras Chat GPT se ciñe a lo que se le pide (Perfecto si sabes lo que haces), Claude AI intenta abarcar un poco más entendindo el contexto y usando métodos más profesionales.

