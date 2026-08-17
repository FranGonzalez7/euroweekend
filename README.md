# Euroweekend

Aplicación web para organizar un fin de semana de juegos de mesa entre amigos.

## Por qué existe esto

Cada cierto tiempo organizamos un finde completo de juegos de mesa: varios días, mucha gente, muchos juegos y muchas partidas que cuadrar. Coordinarlo todo por el grupo de WhatsApp era un caos: quién viene, qué juegos trae cada uno, a qué quiere jugar cada persona, cómo repartimos las partidas por franjas horarias, quién compra la comida...

Así que decidí hacer una pequeña app web para centralizarlo todo. La construí paso a paso en colaboración con Claude (el asistente de IA de Anthropic), que me fue guiando durante el desarrollo: desde la estructura inicial con HTML, CSS y JavaScript puro, pasando por la migración a Firebase para tener datos compartidos en tiempo real, hasta los detalles finales de diseño responsive para móvil.

## Qué hace

La app se organiza en cuatro secciones accesibles desde una barra de navegación (fija abajo en móvil, arriba en escritorio):

**Jugadores**
Registro de participantes del finde. Cada jugador puede además proponer un juego que le gustaría jugar.

**Ludoteca**
Catálogo de juegos disponibles: cada uno añade los juegos que va a traer. Incluye un sistema de votaciones por categorías (según número de jugadores y duración) para decidir a qué se juega. Los juegos se ordenan automáticamente por votos.

**Partidas**
El corazón de la app. Partidas organizadas por franjas horarias (viernes tarde, sábado mañana, etc.) con huecos limitados representados visualmente como asientos en una mesa. Cada jugador se apunta al hueco que quiera, con una restricción: solo una partida por franja. Hay un botón de dado que rellena los huecos libres con jugadores aleatorios. Cuando una partida se completa, se resalta en verde.

**Comida**
Sugerencias de comida por categorías (desayuno, almuerzo, cena, aperitivos y bebida), votación para decidir qué días hacemos barbacoa, y un registro de compras con precios para ajustar cuentas al final del finde.

## Capturas

*(pendiente de añadir)*

| Escritorio | Móvil |
|---|---|
| | |

## Tecnología

- **Frontend**: HTML, CSS y JavaScript vanilla, sin frameworks
- **Base de datos**: Firebase Firestore, con sincronización en tiempo real entre todos los dispositivos
- **Diseño**: responsive, pensado principalmente para uso en móvil

No hay backend propio: el frontend habla directamente con Firestore, y cualquier cambio que haga un usuario se refleja al instante en el resto de dispositivos conectados.

## Estructura del proyecto

```
euroweekend/
├── index.html      # Estructura y secciones de la app
├── style.css       # Estilos y diseño responsive
├── app.js          # Lógica, renderizado y conexión con Firestore
├── icons/          # Iconos de la barra de navegación
└── img/            # Imágenes de los modales de ayuda
```

## Cómo usarla

1. Clona el repositorio
2. Crea un proyecto en Firebase con Firestore y sustituye la configuración de `firebaseConfig` en `app.js` por la tuya
3. Abre `index.html` en el navegador, o despliega la carpeta en cualquier hosting estático (Netlify, GitHub Pages...)

## Notas de desarrollo

El proyecto empezó con `localStorage` como almacenamiento, pero al necesitar que todos los amigos vieran los mismos datos desde sus casas, migramos a Firestore. Por el camino aprendí algunas lecciones interesantes, como que Firestore no guarda valores `null` dentro de arrays (lo que nos obligó a usar strings vacíos para los huecos libres de las partidas), o la importancia de proteger el estado contra sobreescrituras accidentales cuando llega un snapshot vacío.

Desarrollado con la ayuda de Claude, de Anthropic, en sesiones de pair programming a lo largo de varias semanas.
