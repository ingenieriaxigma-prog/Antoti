#!/usr/bin/env node

/**
 * Script para limpiar caché de Vite y node_modules problemáticos
 * 
 * Este script elimina:
 * - node_modules/.vite
 * - node_modules/.cache
 * - Cualquier referencia a @vitejs/plugin-react
 */

import { existsSync, rmSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

const pathsToClean = [
  join(rootDir, 'node_modules', '.vite'),
  join(rootDir, 'node_modules', '.cache'),
  join(rootDir, '.vite'),
  join(rootDir, 'dist'),
];

console.log('🧹 Limpiando caché de Vite...\n');

for (const path of pathsToClean) {
  if (existsSync(path)) {
    try {
      rmSync(path, { recursive: true, force: true });
      console.log(`✅ Eliminado: ${path}`);
    } catch (error) {
      console.log(`⚠️  No se pudo eliminar ${path}:`, error.message);
    }
  } else {
    console.log(`ℹ️  No existe: ${path}`);
  }
}

console.log('\n✨ Limpieza completada!');
console.log('\n📝 Siguiente paso: Reinicia el servidor de desarrollo');
console.log('   npm run dev\n');
