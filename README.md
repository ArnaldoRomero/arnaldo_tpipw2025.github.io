 Club Guaraní – Single Page Application (SPA)

Este proyecto es una página web dinámica de una sola página (SPA) desarrollada únicamente con HTML, CSS y JavaScript. El sitio presenta información institucional del Club Guaraní, una galería multimedia, beneficios para los socios y un sistema interactivo de registro con un Quiz final.

---

 ✅ Estructura general del sitio

La navegación se realiza mediante hash-routing (`home`, `historia`, `ubicacion`, etc.), lo que permite cambiar de sección sin recargar la página.
Todas las secciones comparten la identidad visual del club: colores mostaza y negro, diseño responsivo y un encabezado fijo con el logo.

---

 ✅ Contenido de las secciones

 1. Inicio

Muestra una imagen principal del equipo y la barra de navegación. Es el punto de entrada a la SPA.

 2. Historia

Describe los orígenes, logros y rivalidades del Club Guaraní.
Incluye un área editable para agregar información adicional.

 3. Ubicación

Contiene un mapa de Google Maps incrustado y la dirección completa de la sede del club.

 4. Galería de Fotos

Galería responsiva con miniaturas.
Al hacer clic en una imagen, se abre un lightbox con navegación anterior/siguiente y cierre por teclado o clic.

 5. Beneficios

Lista clara y ordenada de los beneficios disponibles para los socios dentro del predio.

 6. Socios (Registro + Quiz)

Incluye:

 Formulario de registro con validaciones
 Selección de membresía
 Intereses del socio
 Mensajes de error y confirmación

Al completar el registro exitosamente, se desbloquea un Quiz interactivo de 5 preguntas relacionado con el club.
El Quiz:

 Muestra una sola pregunta a la vez
 Lleva el puntaje
 Entrega un premio según respuestas correctas
 Presenta el resultado final al usuario

---

 ✅ Sobre el código EmailJS

El proyecto originalmente integraba EmailJS para enviar correos automáticos.
En esta versión para GitHub, la conexión, claves y templates fueron eliminados por motivos de seguridad.

Si se desea reactivar EmailJS:

1. Crear una cuenta en EmailJS
2. Configurar un Service ID y templates
3. Restaurar las líneas `emailjs.init()` y `emailjs.send()`
4. Agregar nuevamente las claves desde variables de entorno o configuración privada

Reemplazar los campos "AQUI VA EL CODIGO EMAILJS"

---

 ✅ Tecnologías utilizadas

 HTML5 (estructura semántica)
 CSS3 (diseño responsivo, variables, grid, flexbox)
 JavaScript puro (SPA + validaciones + galerías + quiz)
