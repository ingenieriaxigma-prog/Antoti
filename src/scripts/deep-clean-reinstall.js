#!/usr/bin/env node

/**
 * Deep Clean & Reinstall Script
 * Limpia completamente el cache de Vite, node_modules y reinstala todo desde cero
 */

import { existsSync, rmSync } from 'fs';
import { execSync } from 'child_process';
import { resolve } from 'path';

const rootDir = resolve(process.cwd());

console.log('🧹 Iniciando limpieza profunda...\n');

// Función para eliminar directorios de forma segura
function safeRemove(path, description) {
  const fullPath = resolve(rootDir, path);
  if (existsSync(fullPath)) {
    console.log(`🗑️  Eliminando ${description}...`);
    try {
      rmSync(fullPath, { recursive: true, force: true });
      console.log(`✅ ${description} eliminado\n`);
    } catch (error) {
      console.log(`⚠️  No se pudo eliminar ${description}: ${error.message}\n`);
    }
  } else {
    console.log(`ℹ️  ${description} no existe, omitiendo...\n`);
  }
}

// Eliminar node_modules
safeRemove('node_modules', 'node_modules');

// Eliminar caches de Vite
safeRemove('node_modules/.vite', 'cache de Vite en node_modules');
safeRemove('.vite', 'directorio .vite');
safeRemove('dist', 'directorio dist');

// Eliminar package-lock.json si existe
const lockFile = resolve(rootDir, 'package-lock.json');
if (existsSync(lockFile)) {
  console.log('🗑️  Eliminando package-lock.json...');
  rmSync(lockFile, { force: true });
  console.log('✅ package-lock.json eliminado\n');
}

console.log('🎯 Limpieza completa terminada!\n');
console.log('📦 Ahora se instalarán las dependencias limpias...\n');

// Instalar dependencias
console.log('⏳ Instalando dependencias...\n');
try {
  execSync('npm install', { stdio: 'inherit', cwd: rootDir });
  console.log('\n✅ Dependencias instaladas correctamente!\n');
  console.log('🚀 Proyecto listo para ejecutar con: npm run dev\n');
} catch (error) {
  console.error('\n❌ Error instalando dependencias:', error.message);
  process.exit(1);
}
