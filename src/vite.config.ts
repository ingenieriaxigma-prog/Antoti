import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Verificar versiones instaladas
try {
  const vitePackagePath = resolve(process.cwd(), 'node_modules/vite/package.json');
  const vitePackage = JSON.parse(readFileSync(vitePackagePath, 'utf-8'));
  
  const pluginPackagePath = resolve(process.cwd(), 'node_modules/@vitejs/plugin-react/package.json');
  const pluginPackage = JSON.parse(readFileSync(pluginPackagePath, 'utf-8'));
  
  console.log('\n' + '='.repeat(70));
  console.log('🚀 Versiones del runtime de Vite:');
  console.log('='.repeat(70));
  console.log(`⚡ Vite: ${vitePackage.version} ${vitePackage.version === '5.1.0' ? '✅' : '❌ ESPERADO: 5.1.0'}`);
  console.log(`⚛️  @vitejs/plugin-react: ${pluginPackage.version} ${pluginPackage.version === '4.2.1' ? '✅' : '❌ ESPERADO: 4.2.1'}`);
  console.log(`📦 Node.js: ${process.version}`);
  console.log('='.repeat(70) + '\n');
  
  if (vitePackage.version.startsWith('6.') || pluginPackage.version.startsWith('6.')) {
    console.error('❌ ERROR: Versiones incompatibles detectadas!');
    console.error('❌ Vite 6 y plugin-react 6 causan el error "./internal"');
    console.error('💡 Ejecuta: npm run deep-clean\n');
  }
} catch (error) {
  console.log('⚠️  No se pudieron leer las versiones (node_modules no instalado aún)\n');
}

// Configuración estable: Vite 5.1.0 + @vitejs/plugin-react 4.2.1 (100% compatible)
export default defineConfig({
  plugins: [react()],
  
  // Alias para figma assets
  resolve: {
    alias: {
      'figma:asset': '/assets'
    }
  },
  
  // Configuración de build
  build: {
    outDir: 'dist',
    sourcemap: false,
    target: 'es2020',
    minify: 'esbuild',
  },
  
  // Servidor de desarrollo
  server: {
    port: 3000,
    host: true,
    strictPort: false,
  },
  
  // Optimización de dependencias
  optimizeDeps: {
    include: ['react', 'react-dom', 'react/jsx-runtime'],
  },
  
  clearScreen: false,
});