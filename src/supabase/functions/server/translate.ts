/**
 * Translation Service using OpenAI GPT-4
 * 
 * Server-side endpoint to translate i18n objects
 */

interface TranslationObject {
  [key: string]: string | TranslationObject;
}

export async function translateWithOpenAI(
  sourceText: TranslationObject,
  targetLanguage: 'en' | 'pt'
): Promise<TranslationObject> {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not configured on server');
  }

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
7. Return ONLY valid JSON, no markdown, no explanations
8. Ensure all strings are properly escaped

SOURCE (Spanish):
${JSON.stringify(sourceText, null, 2)}

Return the complete translated JSON object in ${languageNames[targetLanguage]}:`;

  console.log(`📡 Translating to ${languageNames[targetLanguage]} with GPT-4...`);

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a professional translator for financial mobile applications. You maintain JSON structure perfectly and translate naturally. Always return valid JSON only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 8000,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
  }

  const data = await response.json();
  const translatedText = data.choices[0].message.content;

  console.log('📥 Response received from GPT-4');

  // Extract JSON (GPT-4 sometimes adds markdown)
  let jsonText = translatedText.trim();
  
  // Remove markdown code blocks if they exist
  if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/^```(json)?\n/m, '').replace(/\n```$/m, '');
  }

  try {
    return JSON.parse(jsonText);
  } catch (e) {
    console.error('❌ Error parsing response:', e);
    console.error('Response received:', translatedText.substring(0, 500));
    throw new Error('Could not parse GPT-4 response');
  }
}