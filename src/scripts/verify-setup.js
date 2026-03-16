#!/usr/bin/env node

/**
 * Script de Verificación Pre-Descarga
 * 
 * Verifica que todos los archivos necesarios existen antes de descargar
 * el proyecto desde Figma Make.
 * 
 * Ejecutar: node scripts/verify-setup.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Colores para terminal
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  title: (msg) => console.log(`\n${colors.bold}${colors.blue}${msg}${colors.reset}`),
};

// Archivos críticos que DEBEN existir
const criticalFiles = [
  'package.json',
  'vite.config.ts',
  'tsconfig.json',
  'vitest.config.ts',
  'index.html',
  '.gitignore',
  '.env.example',
  'SETUP_LOCAL.md',
  'README.md',
  'ARCHITECTURE.md',
];

// Carpetas críticas que DEBEN existir
const criticalDirs = [
  'features',
  'components',
  'contexts',
  'hooks',
  'utils',
  'services',
  'sql-migrations',
  'tests',
  'docs',
  'supabase/functions/server',
];

// Migraciones SQL que DEBEN existir
const sqlMigrations = [
  'sql-migrations/01-crear-tablas.sql',
  'sql-migrations/02-agregar-indices-VERIFICADO.sql',
  'sql-migrations/03-implementar-rls-VERIFICADO.sql',
  'sql-migrations/04-funciones-utilidades-VERIFICADO.sql',
  'sql-migrations/05-tablas-chat.sql',
  'sql-migrations/07-tablas-dispositivos-invitaciones-notificaciones.sql',
  'sql-migrations/07-budgets-month-year-SAFE.sql',
  'sql-migrations/README.md',
];

// Verificar si un archivo existe
function fileExists(filePath) {
  const fullPath = path.join(rootDir, filePath);
  return fs.existsSync(fullPath);
}

// Verificar si una carpeta existe
function dirExists(dirPath) {
  const fullPath = path.join(rootDir, dirPath);
  return fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory();
}

// Contar archivos en una carpeta
function countFiles(dirPath) {
  try {
    const fullPath = path.join(rootDir, dirPath);
    const files = fs.readdirSync(fullPath, { recursive: true });
    return files.filter(file => {
      const filePath = path.join(fullPath, file);
      return fs.statSync(filePath).isFile();
    }).length;
  } catch (error) {
    return 0;
  }
}

// Verificar package.json
function verifyPackageJson() {
  log.title('📦 VERIFICANDO DEPENDENCIAS');
  
  if (!fileExists('package.json')) {
    log.error('package.json NO encontrado');
    return false;
  }
  
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8')
  );
  
  const requiredDeps = ['react', 'react-dom', 'motion', 'lucide-react', 'recharts'];
  const requiredDevDeps = ['vite', 'typescript', 'vitest', 'tailwindcss'];
  
  let allFound = true;
  
  requiredDeps.forEach(dep => {
    if (packageJson.dependencies && packageJson.dependencies[dep]) {
      log.success(`Dependencia: ${dep}`);
    } else {
      log.error(`Dependencia faltante: ${dep}`);
      allFound = false;
    }
  });
  
  requiredDevDeps.forEach(dep => {
    if (packageJson.devDependencies && packageJson.devDependencies[dep]) {
      log.success(`Dev dependency: ${dep}`);
    } else {
      log.error(`Dev dependency faltante: ${dep}`);
      allFound = false;
    }
  });
  
  return allFound;
}

// Verificar archivos críticos
function verifyCriticalFiles() {
  log.title('📄 VERIFICANDO ARCHIVOS CRÍTICOS');
  
  let allFound = true;
  
  criticalFiles.forEach(file => {
    if (fileExists(file)) {
      log.success(file);
    } else {
      log.error(`${file} NO encontrado`);
      allFound = false;
    }
  });
  
  return allFound;
}

// Verificar carpetas críticas
function verifyCriticalDirs() {
  log.title('📁 VERIFICANDO ESTRUCTURA DE CARPETAS');
  
  let allFound = true;
  
  criticalDirs.forEach(dir => {
    if (dirExists(dir)) {
      const fileCount = countFiles(dir);
      log.success(`${dir}/ (${fileCount} archivos)`);
    } else {
      log.error(`${dir}/ NO encontrada`);
      allFound = false;
    }
  });
  
  return allFound;
}

// Verificar migraciones SQL
function verifySqlMigrations() {
  log.title('🗄️  VERIFICANDO MIGRACIONES SQL');
  
  let allFound = true;
  
  sqlMigrations.forEach(file => {
    if (fileExists(file)) {
      log.success(file);
    } else {
      log.error(`${file} NO encontrado`);
      allFound = false;
    }
  });
  
  return allFound;
}

// Verificar archivos de configuración de VS Code
function verifyVSCodeConfig() {
  log.title('⚙️  VERIFICANDO CONFIGURACIÓN DE VS CODE');
  
  const vscodeFiles = [
    '.vscode/extensions.json',
    '.vscode/settings.json.example',
  ];
  
  let allFound = true;
  
  vscodeFiles.forEach(file => {
    if (fileExists(file)) {
      log.success(file);
    } else {
      log.warning(`${file} NO encontrado (opcional)`);
    }
  });
  
  return allFound;
}

// Verificar documentación
function verifyDocumentation() {
  log.title('📚 VERIFICANDO DOCUMENTACIÓN');
  
  const docs = [
    'README.md',
    'SETUP_LOCAL.md',
    'ARCHITECTURE.md',
    'CHECKLIST_PRE_DESCARGA.md',
    'docs/USER_GUIDE.md',
    'docs/DEVELOPER_GUIDE.md',
    'docs/FAQ.md',
  ];
  
  let foundCount = 0;
  
  docs.forEach(doc => {
    if (fileExists(doc)) {
      log.success(doc);
      foundCount++;
    } else {
      log.warning(`${doc} NO encontrado`);
    }
  });
  
  return foundCount >= 5; // Al menos 5 documentos deben existir
}

// Resumen final
function printSummary(results) {
  log.title('📊 RESUMEN DE VERIFICACIÓN');
  
  const total = Object.keys(results).length;
  const passed = Object.values(results).filter(r => r === true).length;
  const failed = total - passed;
  
  console.log(`\nTotal de verificaciones: ${total}`);
  console.log(`${colors.green}Pasadas: ${passed}${colors.reset}`);
  console.log(`${colors.red}Fallidas: ${failed}${colors.reset}`);
  
  if (failed === 0) {
    log.title('🎉 ¡PROYECTO LISTO PARA DESCARGAR!');
    console.log(`
${colors.green}${colors.bold}✅ Todas las verificaciones pasaron exitosamente${colors.reset}

El proyecto está 100% listo para descargar y trabajar en VS Code.

${colors.bold}Próximos pasos:${colors.reset}
1. Descarga el proyecto desde Figma Make
2. Abre SETUP_LOCAL.md
3. Sigue los pasos de instalación
4. ¡Empieza a desarrollar!

${colors.blue}Documentación importante:${colors.reset}
- SETUP_LOCAL.md - Guía de instalación paso a paso
- README.md - Documentación principal
- CHECKLIST_PRE_DESCARGA.md - Checklist completo
    `);
  } else {
    log.title('⚠️  HAY PROBLEMAS QUE RESOLVER');
    console.log(`
${colors.yellow}Algunas verificaciones fallaron.${colors.reset}

Por favor, revisa los errores arriba y asegúrate de que todos
los archivos críticos existen antes de descargar el proyecto.
    `);
  }
}

// Ejecutar todas las verificaciones
async function main() {
  console.log(`
${colors.bold}${colors.blue}
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║     VERIFICACIÓN PRE-DESCARGA - OTI FINANZAS         ║
║     v3.1.0                                            ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
${colors.reset}
  `);
  
  const results = {
    packageJson: verifyPackageJson(),
    criticalFiles: verifyCriticalFiles(),
    criticalDirs: verifyCriticalDirs(),
    sqlMigrations: verifySqlMigrations(),
    vscodeConfig: verifyVSCodeConfig(),
    documentation: verifyDocumentation(),
  };
  
  printSummary(results);
  
  // Exit code para CI/CD
  const allPassed = Object.values(results).every(r => r === true);
  process.exit(allPassed ? 0 : 1);
}

// Ejecutar
main().catch(error => {
  log.error(`Error durante verificación: ${error.message}`);
  process.exit(1);
});
