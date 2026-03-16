/**
 * 🌍 Script Ejecutable de Auto-Traducción
 * 
 * Ejecuta este archivo para traducir automáticamente
 * todas las keys de i18n desde ES a EN y PT
 */

import { runAutoTranslation } from './utils/auto-translate';

console.log('🚀 Iniciando traducción automática...\n');

runAutoTranslation()
  .then(({ results, files }) => {
    console.log('\n✅ Traducción completada!\n');
    
    // Mostrar archivos generados
    if (files?.en) {
      console.log('='.repeat(80));
      console.log('🇬🇧 ARCHIVO: en.ts');
      console.log('='.repeat(80));
      console.log(files.en);
      console.log('\n');
    }
    
    if (files?.pt) {
      console.log('='.repeat(80));
      console.log('🇧🇷 ARCHIVO: pt.ts');
      console.log('='.repeat(80));
      console.log(files.pt);
      console.log('\n');
    }
    
    console.log('='.repeat(80));
    console.log('✨ COPIA EL CONTENIDO DE ARRIBA A LOS ARCHIVOS:');
    console.log('   • /i18n/locales/en.ts');
    console.log('   • /i18n/locales/pt.ts');
    console.log('='.repeat(80));
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
