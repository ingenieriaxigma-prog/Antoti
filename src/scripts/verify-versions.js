#!/usr/bin/env node

/**
 * Verify Versions Script
 * Verifica y muestra las versiones reales instaladas de Vite y React Plugin
 */

import { readFileSync } from 'fs';
import { resolve, join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');

console.log('\n' + '='.repeat(70));
console.log('🔍 VERIFICACIÓN DE VERSIONES INSTALADAS');
console.log('='.repeat(70) + '\n');

// Función para leer versión del package.json de un paquete instalado
function getInstalledVersion(packageName) {
  try {
    const packageJsonPath = join(rootDir, 'node_modules', packageName, 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    return packageJson.version;
  } catch (error) {
    return 'NO INSTALADO';
  }
}

// Verificar versión de Node
console.log('📦 Versión de Node.js:');
console.log(`   ${process.version}\n`);

// Verificar Vite
const viteVersion = getInstalledVersion('vite');
console.log('⚡ Vite:');
console.log(`   Instalado: ${viteVersion}`);
console.log(`   Esperado:  5.1.0`);
if (viteVersion === '5.1.0') {
  console.log('   Estado: ✅ CORRECTO\n');
} else if (viteVersion.startsWith('6.')) {
  console.log('   Estado: ❌ ERROR - Se instaló Vite 6 en lugar de Vite 5\n');
  console.error('⚠️  ADVERTENCIA: Vite 6 detectado. Esto causará el error "./internal"');
} else {
  console.log(`   Estado: ⚠️  ADVERTENCIA - Versión inesperada\n`);
}

// Verificar @vitejs/plugin-react
const pluginVersion = getInstalledVersion('@vitejs/plugin-react');
console.log('⚛️  @vitejs/plugin-react:');
console.log(`   Instalado: ${pluginVersion}`);
console.log(`   Esperado:  4.2.1`);
if (pluginVersion === '4.2.1') {
  console.log('   Estado: ✅ CORRECTO\n');
} else if (pluginVersion.startsWith('6.')) {
  console.log('   Estado: ❌ ERROR - Se instaló versión 6 incompatible\n');
  console.error('⚠️  ADVERTENCIA: Plugin React 6 detectado. Incompatible con Vite 5');
} else {
  console.log(`   Estado: ⚠️  ADVERTENCIA - Versión inesperada\n`);
}

// Verificar TypeScript
const tsVersion = getInstalledVersion('typescript');
console.log('📘 TypeScript:');
console.log(`   Instalado: ${tsVersion}`);
console.log(`   Esperado:  5.3.3`);
console.log(`   Estado: ${tsVersion === '5.3.3' ? '✅ CORRECTO' : '⚠️  Diferente pero posiblemente OK'}\n`);

// Verificar Vitest
const vitestVersion = getInstalledVersion('vitest');
console.log('🧪 Vitest:');
console.log(`   Instalado: ${vitestVersion}`);
console.log(`   Esperado:  1.3.1`);
console.log(`   Estado: ${vitestVersion === '1.3.1' ? '✅ CORRECTO' : '⚠️  Diferente'}\n`);

// Verificar React
const reactVersion = getInstalledVersion('react');
console.log('⚛️  React:');
console.log(`   Instalado: ${reactVersion}`);
console.log(`   Esperado:  18.3.1`);
console.log(`   Estado: ${reactVersion === '18.3.1' ? '✅ CORRECTO' : '⚠️  Diferente'}\n`);

console.log('='.repeat(70));

// Resultado final
const viteOk = viteVersion === '5.1.0';
const pluginOk = pluginVersion === '4.2.1';

if (viteOk && pluginOk) {
  console.log('✅ TODAS LAS VERSIONES CRÍTICAS SON CORRECTAS');
  console.log('✅ El proyecto debería funcionar sin el error "./internal"');
} else {
  console.log('❌ ERROR: VERSIONES INCORRECTAS DETECTADAS');
  console.log('❌ El proyecto probablemente tendrá el error "./internal"');
  console.log('\n💡 Solución sugerida:');
  console.log('   1. Eliminar node_modules y cache');
  console.log('   2. Ejecutar: npm run deep-clean');
  console.log('   3. Reiniciar el entorno');
}

console.log('='.repeat(70) + '\n');
