/**
 * 🌍 Auto-Translation Script with GPT-4
 * 
 * Este script traduce automáticamente todas las keys de i18n
 * desde Español (base) a Inglés y Portugués usando GPT-4
 * 
 * Uso: node scripts/translate-i18n.js
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ✅ OPENAI_API_KEY ya está disponible como variable de entorno
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error('❌ Error: OPENAI_API_KEY no está configurada');
  console.log('💡 La key debería estar disponible en las variables de entorno');
  process.exit(1);
}

// Función para extraer el objeto de traducciones del archivo .ts
function extractTranslationsFromFile(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  
  // Buscar el export default { ... }
  const match = content.match(/export default\s*({[\s\S]*});?\s*$/m);
  if (!match) {
    throw new Error(`No se pudo extraer el objeto de traducciones de ${filePath}`);
  }
  
  // Convertir el objeto TypeScript a JSON válido
  // Esto es un hack simple - en producción usarías un parser de TS
  let jsonString = match[1]
    .replace(/(\w+):/g, '"$1":') // Agregar comillas a las keys
    .replace(/'/g, '"') // Reemplazar comillas simples por dobles
    .replace(/,(\s*[}\]])/g, '$1'); // Remover comas trailing
  
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    console.error('❌ Error parseando el archivo:', e.message);
    console.log('Contenido extraído:', jsonString.substring(0, 500));
    throw e;
  }
}

// Función para llamar a GPT-4 y traducir
async function translateWithGPT4(sourceText, targetLanguage) {
  const languageNames = {
    en: 'English',
    pt: 'Portuguese (Brazilian)',
  };

  const prompt = `You are a professional translator specializing in financial mobile applications.

TASK: Translate the following JSON object from Spanish to ${languageNames[targetLanguage]}.

IMPORTANT RULES:
1. Maintain ALL keys exactly as they are (do not translate keys, only values)
2. Keep the exact same JSON structure
3. Use natural, native ${languageNames[targetLanguage]} for financial apps
4. Maintain technical terms appropriately (e.g., "PIN", "CSV", "API")
5. Keep placeholders like {amount}, {name}, etc. unchanged
6. Maintain the tone: professional but friendly
7. Return ONLY the translated JSON, no explanations

SOURCE (Spanish):
${JSON.stringify(sourceText, null, 2)}

Translate to ${languageNames[targetLanguage]}:`;

  console.log(`📡 Llamando a GPT-4 para traducir a ${languageNames[targetLanguage]}...`);

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a professional translator for financial mobile applications. You maintain JSON structure perfectly and translate naturally.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3, // Más determinístico
      max_tokens: 8000,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
  }

  const data = await response.json();
  const translatedText = data.choices[0].message.content;

  // Extraer el JSON del response (GPT-4 a veces agrega markdown)
  const jsonMatch = translatedText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No se pudo extraer JSON de la respuesta de GPT-4');
  }

  return JSON.parse(jsonMatch[0]);
}

// Función para convertir objeto JS a formato TypeScript
function objectToTypeScript(obj, indent = 0) {
  const spaces = '  '.repeat(indent);
  let result = '{\n';

  const entries = Object.entries(obj);
  entries.forEach(([key, value], index) => {
    const isLast = index === entries.length - 1;
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      result += `${spaces}  ${key}: ${objectToTypeScript(value, indent + 1)}${isLast ? '' : ','}\n`;
    } else if (typeof value === 'string') {
      // Escapar comillas y caracteres especiales
      const escapedValue = value
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/\n/g, '\\n');
      result += `${spaces}  ${key}: "${escapedValue}"${isLast ? '' : ','}\n`;
    } else {
      result += `${spaces}  ${key}: ${JSON.stringify(value)}${isLast ? '' : ','}\n`;
    }
  });

  result += `${spaces}}`;
  return result;
}

// Función principal
async function main() {
  console.log('🌍 Iniciando auto-traducción con GPT-4...\n');

  // 1. Leer archivo de español (base)
  console.log('📖 Leyendo archivo base (español)...');
  const esPath = join(__dirname, '../i18n/locales/es.ts');
  
  let esTranslations;
  try {
    // En lugar de parsear, vamos a leer el contenido directamente
    const esContent = readFileSync(esPath, 'utf-8');
    
    // Extraer solo el objeto, ignorando imports y tipos
    const objectMatch = esContent.match(/export default\s*(\{[\s\S]*\});?\s*$/m);
    if (!objectMatch) {
      throw new Error('No se pudo encontrar el export default');
    }
    
    // Evaluar el objeto de manera segura
    // Nota: En producción, usarías un parser de TypeScript real
    esTranslations = eval(`(${objectMatch[1]})`);
    
    console.log('✅ Archivo español cargado correctamente');
    console.log(`   Total de secciones: ${Object.keys(esTranslations).length}`);
  } catch (e) {
    console.error('❌ Error leyendo archivo español:', e.message);
    process.exit(1);
  }

  // 2. Traducir a Inglés
  console.log('\n🇬🇧 Traduciendo a INGLÉS...');
  let enTranslations;
  try {
    enTranslations = await translateWithGPT4(esTranslations, 'en');
    console.log('✅ Traducción a inglés completada');
  } catch (e) {
    console.error('❌ Error traduciendo a inglés:', e.message);
    process.exit(1);
  }

  // 3. Traducir a Portugués
  console.log('\n🇧🇷 Traduciendo a PORTUGUÉS...');
  let ptTranslations;
  try {
    ptTranslations = await translateWithGPT4(esTranslations, 'pt');
    console.log('✅ Traducción a portugués completada');
  } catch (e) {
    console.error('❌ Error traduciendo a portugués:', e.message);
    process.exit(1);
  }

  // 4. Generar archivos .ts
  console.log('\n📝 Generando archivos TypeScript...');

  const enPath = join(__dirname, '../i18n/locales/en.ts');
  const ptPath = join(__dirname, '../i18n/locales/pt.ts');

  const enFileContent = `/**
 * 🇬🇧 English Translations
 * Auto-generated by translate-i18n.js
 * Base: Spanish (es.ts)
 * Generated: ${new Date().toISOString()}
 */

export default ${objectToTypeScript(enTranslations, 0)};
`;

  const ptFileContent = `/**
 * 🇧🇷 Portuguese (Brazilian) Translations  
 * Auto-generated by translate-i18n.js
 * Base: Spanish (es.ts)
 * Generated: ${new Date().toISOString()}
 */

export default ${objectToTypeScript(ptTranslations, 0)};
`;

  writeFileSync(enPath, enFileContent, 'utf-8');
  writeFileSync(ptPath, ptFileContent, 'utf-8');

  console.log('✅ Archivo en.ts generado');
  console.log('✅ Archivo pt.ts generado');

  // 5. Resumen
  console.log('\n' + '='.repeat(60));
  console.log('✨ AUTO-TRADUCCIÓN COMPLETADA ✨');
  console.log('='.repeat(60));
  console.log(`📊 Estadísticas:`);
  console.log(`   • Secciones traducidas: ${Object.keys(esTranslations).length}`);
  console.log(`   • Idiomas generados: Inglés (en), Portugués (pt)`);
  console.log(`   • Archivos actualizados:`);
  console.log(`     - /i18n/locales/en.ts`);
  console.log(`     - /i18n/locales/pt.ts`);
  console.log('\n💡 Próximos pasos:');
  console.log('   1. Revisa las traducciones generadas');
  console.log('   2. Ajusta manualmente si es necesario');
  console.log('   3. Prueba cambiando el idioma en la app');
  console.log('='.repeat(60));
}

// Ejecutar
main().catch((error) => {
  console.error('\n❌ Error fatal:', error);
  process.exit(1);
});
