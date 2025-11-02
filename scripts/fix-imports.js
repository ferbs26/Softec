const fs = require('fs');
const path = require('path');

// Directorio de rutas
const routesDir = path.join(__dirname, '../routes');

// Archivos a actualizar
const routeFiles = [
  'aula.routes.js',
  'computadora.routes.js',
  'historial-cambio.routes.js',
  'reporte.routes.js',
  'repuesto.routes.js'
];

// Patrón de búsqueda y reemplazo
const replacements = [
  {
    search: /const \{ authJwt \} = require\(["']\.\.\/middleware["']\);/g,
    replace: 'const authJwt = require("../middleware/authJwt");'
  },
  {
    search: /const \{ verifySignUp \} = require\(["']\.\.\/middleware["']\);/g,
    replace: 'const verifySignUp = require("../middleware/verifySignUp");'
  }
];

// Función para actualizar un archivo
function updateFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;

    replacements.forEach(({ search, replace }) => {
      if (search.test(content)) {
        content = content.replace(search, replace);
        updated = true;
      }
    });

    if (updated) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ ${path.basename(filePath)} actualizado correctamente`);
    } else {
      console.log(`ℹ️  No se requirieron cambios en ${path.basename(filePath)}`);
    }
  } catch (error) {
    console.error(`❌ Error al actualizar ${filePath}:`, error.message);
  }
}

// Procesar todos los archivos de rutas
routeFiles.forEach(file => {
  const filePath = path.join(routesDir, file);
  if (fs.existsSync(filePath)) {
    updateFile(filePath);
  } else {
    console.log(`⚠️  El archivo ${file} no existe`);
  }
});

console.log('\n✅ Proceso de actualización de importaciones completado');
