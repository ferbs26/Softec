SOFTEC


Integrantes
Juan Manuel Ruiz
Fernando Barrera
Renato Castañeda
Lucas Badii
Nombre del proyecto 
Softec 21

Justificación 
En el colegio hay muchas computadoras, pero no existe un sistema que permita saber cuántas hay, dónde están, en qué estado se encuentran o qué problemas tienen. Esto complica mucho el trabajo del técnico y hace que varios problemas no se lleguen a reparar porque no quedan registrados.
Con este proyecto queremos solucionar eso, creando una página web que permita tener toda esa información ordenada en un solo lugar. Así se mejora el control, se ahorra tiempo y se pueden resolver los problemas técnicos de forma más rápida y eficiente.

Breve descripción 
El proyecto consiste en una página web que va a servir para registrar todas las computadoras del colegio, su ubicación, su estado y cualquier problema que tengan.
Los alumnos, docentes o preceptores van a poder reportar fallas de forma simple, y el técnico va a tener un panel donde podrá ver todos esos reportes, gestionarlos y marcarlos como resueltos.
Además, el sistema va a guardar un historial de los problemas de cada equipo, lo que ayuda a hacer un seguimiento del mantenimiento a lo largo del tiempo.





Actividades a realizar
Cronograma mensual
Julio:
Hicimos el análisis de lo que va a tener el sistema


Diseñamos las secciones principales de la página


Definimos cómo va a estar armada la base de datos


Creamos la base de datos en MySQL


Empezamos con el backend usando Node.js y Express


Hicimos la conexión entre el backend y la base de datos


Empezamos a trabajar en el frontend con HTML, CSS y JavaScript


Agosto:
Programamos la vista donde se registran computadoras y se reportan fallas


Realizamos las vistas: uno para usuarios comunes y otro para el técnico


Implementamos el login con roles diferenciados


Testeamos las funciones básicas del software 


Septiembre:
Agregamos el historial de fallas por computadora


Optimizamos la UI para mayor agilidad


Hicimos pruebas completas con distintos casos


Arreglamos errores que encontramos


Hicimos pruebas con usuarios reales del colegio




Funciones del perfil profesional 
El técnico en computación puede trabajar tanto con el desarrollo de programas y aplicaciones como también con el mantenimiento y la configuración de computadoras y redes.
Por un lado, puede diseñar, programar, probar y mantener sistemas informáticos, ya sea para escritorio o web, ayudando al usuario a usarlos de forma eficiente. También está capacitado para documentar todo el proceso y adaptar los sistemas a diferentes necesidades.
Por otro lado, puede instalar y mantener equipos, redes, impresoras y otros componentes, detectando problemas tanto de hardware como de software, y resolviéndolos. Además, puede administrar redes, asegurarse de que funcionen bien y que los datos estén protegidos.
Estas tareas las puede realizar en relación de dependencia o por cuenta propia, y siempre cumpliendo con normas de seguridad y buscando un buen rendimiento del sistema.


Competencias y capacidades del perfil que ponen en juego en ese proyecto 
En este proyecto se aplican varias capacidades propias del técnico en computación. Por ejemplo:
Diseñamos y programamos una aplicación web, lo que implica usar HTML, CSS, JavaScript y Node.js, cumpliendo con requerimientos funcionales y técnicos.


Creamos y gestionamos una base de datos, lo cual es parte del manejo de información y organización de sistemas.


Usamos conocimientos de instalación y configuración de servidores (como XAMPP o MySQL Server).


Aplicamos la lógica de programación y estructuras de datos para que el sistema funcione bien.


Hacemos pruebas y mantenemos el sistema, asegurándonos de que cumpla con los objetivos del proyecto.


También documentamos lo que hacemos y pensamos en el usuario final, para que la web sea fácil de usar.


Finalmente, trabajamos en equipo, organizando tareas y resolviendo problemas en conjunto, como se haría en un ambiente de trabajo real.

Descripción del Proyecto:
Actualmente, en el colegio no existe un sistema centralizado ni eficiente para registrar, ubicar y reportar problemas en las computadoras. Esto genera una falta de control sobre el inventario, pérdida de tiempo para el técnico, dificultades para priorizar reparaciones, y muchos problemas técnicos que no se reportan o se olvidan. Además, no hay una forma de llevar un historial de fallas por equipo, lo que complica la organización del mantenimiento.
Para dar solución a esta problemática, nuestro proyecto consiste en desarrollar una página web que permita registrar y gestionar todas las computadoras del colegio. La idea principal es que cualquier persona (como un alumno, un docente o un técnico) pueda ver qué computadoras hay, dónde están ubicadas y, si tienen algún problema, poder registrarlo en el sistema. Así, la persona encargada del mantenimiento podrá acceder a todos los reportes en un solo lugar y contar con una lista organizada de los problemas que debe solucionar.

Justificación de porque elegimos desarrollar una aplicación web:
Se decidió desarrollar una aplicación web debido a las ventajas que ofrece frente a otras alternativas como aplicaciones de escritorio o móviles. Una solución web permite que cualquier usuario del colegio (alumnos, docentes, técnicos) pueda acceder al sistema desde cualquier dispositivo con conexión a internet y navegador, sin necesidad de instalar programas adicionales.

Además, al tratarse de un sistema centralizado, las actualizaciones y el mantenimiento se realizan directamente en el servidor, lo cual simplifica su administración. Esto resulta especialmente beneficioso en un entorno escolar, donde se utilizan distintos equipos y no siempre se cuenta con personal técnico disponible para instalar o actualizar software de manera individual.

También se consideró la escalabilidad del proyecto: una aplicación web facilita la incorporación de nuevas funcionalidades a futuro, como estadísticas, notificaciones o paneles adicionales, sin afectar la experiencia del usuario.


Objetivos Específicos:
Mejorar el control del inventario del colegio mediante la digitalización del registro de computadoras con identificadores únicos, para facilitar su seguimiento y mantenimiento.


Optimizar la gestión de equipos a través de la identificación clara de su ubicación, lo cual agiliza el acceso del técnico a los equipos con problemas.


Facilitar la comunicación de fallas técnicas mediante un sistema accesible de reporte digital, para que los problemas puedan ser atendidos con mayor rapidez.


Centralizar la recepción y visualización de problemas técnicos en un panel exclusivo para el técnico, con el fin de priorizar reparaciones y mejorar la eficiencia del mantenimiento.


Registrar y actualizar el estado de cada reparación mediante un sistema que indique cuándo un problema ha sido resuelto, para llevar un historial completo de intervenciones y evitar redundancias.
Funcionalidades del Software (Página Web):

Requerimiento Funcional
Justificación
Registrar computadoras con sus datos (número de serie, aula, tipo, estado)
Permite llevar un inventario organizado de todos los equipos del colegio.
Reporte de problemas técnicos a través de un formulario
Facilita que cualquier usuario pueda informar fallas rápidamente sin intermediarios.
Panel exclusivo para el técnico (administrador)
Brinda al responsable del mantenimiento una vista completa y organizada de todos los reportes.
Historial de problemas por equipo
Permite analizar el comportamiento de cada computadora y detectar equipos que fallan frecuentemente.
Roles de usuario diferenciados (usuario común y administrador)
Mejora la seguridad y organización del sistema, otorgando permisos según el perfil del usuario.
Marcar problemas como resueltos desde el panel del técnico
Permite cerrar el ciclo de mantenimiento y actualizar el estado de cada equipo.
Visualización del estado y ubicación de los equipos
Brinda transparencia y claridad a cualquier usuario sobre dónde están los equipos y su condición.



Requerimiento No Funcional
Justificación
Usabilidad: interfaz clara, simple y accesible
El sistema será utilizado por alumnos, docentes y técnicos, por lo que debe ser intuitivo.
Disponibilidad: acceso desde cualquier dispositivo con navegador
Asegura que los reportes puedan hacerse fácilmente desde cualquier computadora o celular.
Seguridad: gestión de roles y autenticación de usuarios
Protege la información y restringe funciones según el tipo de usuario.
Escalabilidad: posibilidad de agregar más funciones a futuro
El sistema podrá evolucionar (por ejemplo, agregar estadísticas o notificaciones).
Rendimiento: debe funcionar de forma fluida con múltiples usuarios
Asegura una buena experiencia incluso si varios usuarios acceden al sistema simultáneamente.
Mantenibilidad: código organizado y documentado
Facilita que futuros alumnos o técnicos puedan


Tecnologías que vamos a usar:
Frontend : HTML, CSS, JavaScript.


Backend (lógica y base de datos): Node.js / Express, y una base de datos como MySQL.


Hosting: La idea es usar un servidor local como XAMP o MYSQL server.



Ventajas del Proyecto:
Ahorra tiempo al técnico.


Evita que los problemas pasen desapercibidos.


Mejora la organización del mantenimiento.


Permite llevar un registro histórico de cada equipo.

Etapas del Desarrollo (futuro GANTT):
Planificación del sistema (organizar qué funciones tendrá).


Diseño del sitio web (cómo se verá cada sección).


Creación de la base de datos (estructura y conexión).


Desarrollo del código (backend y frontend).


Pruebas (ver si funciona correctamente).
