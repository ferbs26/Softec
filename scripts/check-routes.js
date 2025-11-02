const fs = require('fs');
const path = require('path');

// Directorios
const routesDir = path.join(__dirname, '../routes');
const controllersDir = path.join(__dirname, '../controllers');

// Obtener todos los controladores disponibles
const getAvailableControllers = () => {
  const controllerFiles = fs.readdirSync(controllersDir)
    .filter(file => file.endsWith('.controller.js'));
  
  const controllers = {};
  
  controllerFiles.forEach(file => {
    const controllerName = file.replace('.controller.js', '');
    const controllerPath = path.join(controllersDir, file);
    const controller = require(controllerPath);
    
    controllers[controllerName] = {
      path: controllerPath,
      methods: Object.keys(controller)
    };
  });
  
  return controllers;
};

// Verificar las rutas
const checkRoutes = () => {
  const controllers = getAvailableControllers();
  const routeFiles = fs.readdirSync(routesDir)
    .filter(file => file.endsWith('.routes.js'));
  
  console.log('\n🔍 Verificando rutas y controladores...\n');
  
  routeFiles.forEach(file => {
    const routePath = path.join(routesDir, file);
    const routeContent = fs.readFileSync(routePath, 'utf8');
    const routeName = file.replace('.routes.js', '');
    
    console.log(`📁 ${file}:`);
    
    // Verificar si existe el controlador correspondiente
    if (!controllers[routeName]) {
      console.log(`   ❌ No se encontró el controlador para ${routeName}`);
      return;
    }
    
    // Obtener todos los métodos del controlador
    const availableMethods = controllers[routeName].methods;
    
    // Buscar usos de controladores en el archivo de rutas
    const controllerUsages = routeContent.match(/controller\.(\w+)/g) || [];
    const usedMethods = [...new Set(controllerUsages.map(match => match.split('.')[1]))];
    
    // Verificar cada método utilizado
    usedMethods.forEach(method => {
      if (availableMethods.includes(method)) {
        console.log(`   ✅ ${method}()`);
      } else {
        console.log(`   ❌ ${method}() - Método no encontrado en el controlador`);
      }
    });
    
    console.log('');
  });
  
  console.log('✅ Verificación completada\n');
};

// Ejecutar la verificación
checkRoutes();
