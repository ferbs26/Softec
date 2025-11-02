const fs = require('fs');
const path = require('path');

// Ruta al archivo de la base de datos SQLite
const dbPath = path.join(__dirname, '..', 'database.sqlite');

// Eliminar el archivo de la base de datos si existe
if (fs.existsSync(dbPath)) {
  console.log('Eliminando base de datos existente...');
  fs.unlinkSync(dbPath);
  console.log('Base de datos eliminada con éxito.');
} else {
  console.log('No se encontró una base de datos existente.');
}

console.log('Por favor, inicia el servidor para crear una nueva base de datos con la estructura correcta.');
