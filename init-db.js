const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);
const fs = require('fs');
const path = require('path');

// Configuración de colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgBlack: '\x1b[40m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m',
};

// Función para imprimir mensajes con formato
const log = {
  info: (msg) => console.log(`${colors.cyan}[INFO]${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}[ÉXITO]${colors.reset} ${msg}`),
  error: (msg) => console.error(`${colors.red}[ERROR]${colors.reset} ${msg}`),
  warning: (msg) => console.warn(`${colors.yellow}[ADVERTENCIA]${colors.reset} ${msg}`)
};

// Función para ejecutar comandos en la terminal
async function runCommand(command, description) {
  try {
    log.info(`Ejecutando: ${description}...`);
    const { stdout, stderr } = await execAsync(command);
    
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
    
    log.success(`${description} completado con éxito`);
    return true;
  } catch (error) {
    log.error(`Error al ejecutar: ${description}`);
    console.error(error.stderr || error.message);
    return false;
  }
}

// Función principal
async function initializeDatabase() {
  log.info('Iniciando configuración de la base de datos...');
  
  // 1. Instalar dependencias si no existen
  if (!fs.existsSync('node_modules')) {
    log.info('Instalando dependencias...');
    const success = await runCommand('npm install', 'Instalación de dependencias');
    if (!success) return;
  }
  
  // 2. Crear base de datos si no existe
  log.info('Verificando base de datos...');
  const config = require('./config/config.json');
  const dbConfig = config.development;
  
  // Comando para crear la base de datos si no existe
  const createDbCommand = `mysql -u ${dbConfig.username} ${dbConfig.password ? `-p${dbConfig.password}` : ''} -e "CREATE DATABASE IF NOT EXISTS ${dbConfig.database} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"`;
  
  const dbCreated = await runCommand(createDbCommand, 'Creación de la base de datos');
  if (!dbCreated) return;
  
  // 3. Ejecutar migraciones
  const migrationsRun = await runCommand('npx sequelize-cli db:migrate', 'Ejecutando migraciones');
  if (!migrationsRun) return;
  
  // 4. Verificar si ya existen datos de prueba
  const User = require('./models').usuarios;
  const adminExists = await User.findOne({ where: { email: 'admin@softec.edu.ar' } });
  
  if (!adminExists) {
    // 5. Crear usuario administrador por defecto
    log.info('Creando usuario administrador por defecto...');
    
    const adminUser = {
      nombre: 'Administrador',
      apellido: 'del Sistema',
      email: 'admin@softec.edu.ar',
      password: 'Admin123!', // Contraseña temporal, se debe cambiar en el primer inicio de sesión
      tipo: 'tecnico',
      activo: true
    };
    
    try {
      // Hashear la contraseña
      const bcrypt = require('bcryptjs');
      adminUser.password = bcrypt.hashSync(adminUser.password, 8);
      
      // Crear el usuario administrador
      const createdUser = await User.create(adminUser);
      
      // Asignar rol de administrador
      const Role = require('./models').roles;
      const adminRole = await Role.findOne({ where: { nombre: 'admin' } });
      
      if (adminRole) {
        await createdUser.addRole(adminRole);
        log.success('Usuario administrador creado con éxito');
        log.warning(`\n${colors.yellow}=== CREDENCIALES DE ACCESO ===`);
        log.warning(`Email: ${colors.bright}admin@softec.edu.ar${colors.reset}`);
        log.warning(`Contraseña: ${colors.bright}Admin123!${colors.reset}`);
        log.warning('===================================');
        log.warning(`${colors.red}IMPORTANTE: Cambia la contraseña en tu primer inicio de sesión.${colors.reset}\n`);
      } else {
        log.error('No se encontró el rol de administrador');
      }
    } catch (error) {
      log.error('Error al crear el usuario administrador:');
      console.error(error);
    }
  } else {
    log.success('La base de datos ya está configurada con un usuario administrador');
  }
  
  log.success('¡Configuración de la base de datos completada con éxito!');
  log.info('Puedes iniciar el servidor con: npm start');
}

// Ejecutar la inicialización
initializeDatabase().catch(error => {
  log.error('Error durante la inicialización:');
  console.error(error);
  process.exit(1);
});
