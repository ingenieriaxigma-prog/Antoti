/**
 * OpenAI Helper Functions
 * 
 * Utility functions for calling OpenAI API with retry logic and error handling
 */

/**
 * Call OpenAI Chat Completions API with automatic retry on gateway errors
 * 
 * @param apiKey - OpenAI API key
 * @param messages - Chat messages
 * @param model - Model to use (default: gpt-4o)
 * @param maxTokens - Max tokens in response
 * @param temperature - Temperature for response randomness
 * @param maxRetries - Maximum retry attempts (default: 3)
 * @returns Parsed JSON response
 */
export async function callOpenAIChatCompletion(
  apiKey: string,
  messages: any[],
  model = 'gpt-4o',
  maxTokens = 2000,
  temperature = 0.7,
  maxRetries = 3
): Promise<any> {
  const url = 'https://api.openai.com/v1/chat/completions';
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🤖 OpenAI API call (attempt ${attempt}/${maxRetries})...`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 90000); // 90 second timeout
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          max_tokens: maxTokens,
          temperature,
        }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        console.log(`✅ OpenAI API success on attempt ${attempt}`);
        return await response.json();
      }
      
      // Handle gateway errors with retry
      if (response.status === 502 || response.status === 503 || response.status === 504) {
        const errorText = await response.text();
        console.warn(`⚠️ Gateway error ${response.status} on attempt ${attempt}/${maxRetries}`);
        console.warn(`   Response:`, errorText.substring(0, 200));
        
        if (attempt < maxRetries) {
          const delayMs = Math.min(2000 * attempt + Math.random() * 1000, 8000);
          console.log(`   🔄 Retrying in ${Math.round(delayMs)}ms...`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
          continue;
        }
        
        throw new Error(extractOpenAIErrorMessage(errorText));
      }
      
      // For other errors, throw immediately
      const errorText = await response.text();
      throw new Error(extractOpenAIErrorMessage(errorText));
      
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.error(`⏱️ Timeout on attempt ${attempt}/${maxRetries}`);
        
        if (attempt < maxRetries) {
          const delayMs = Math.min(2000 * attempt, 8000);
          console.log(`   🔄 Retrying in ${delayMs}ms...`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
          continue;
        }
        
        throw new Error('La solicitud tardó demasiado. Por favor intenta con una imagen más pequeña.');
      }
      
      console.error(`❌ Error on attempt ${attempt}/${maxRetries}:`, error);
      
      if (attempt < maxRetries) {
        const delayMs = Math.min(2000 * attempt, 8000);
        console.log(`   🔄 Retrying in ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        continue;
      }
      
      throw error;
    }
  }
  
  throw new Error(`OpenAI API falló después de ${maxRetries} intentos`);
}

/**
 * Call OpenAI API with automatic retry on gateway errors (502, 503, 504)
 * 
 * @param url - OpenAI API endpoint URL
 * @param options - Fetch options
 * @param maxRetries - Maximum number of retry attempts (default: 3)
 * @param timeoutMs - Request timeout in milliseconds (default: 60000)
 * @returns Response from OpenAI API
 */
export async function callOpenAIWithRetry(
  url: string,
  options: RequestInit,
  maxRetries = 3,
  timeoutMs = 60000 // 60 seconds
): Promise<Response> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🤖 OpenAI API call attempt ${attempt}/${maxRetries}...`);
      
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      // If successful, return immediately
      if (response.ok) {
        console.log(`✅ OpenAI API call successful on attempt ${attempt}`);
        return response;
      }
      
      // If 502 Bad Gateway, 503 Service Unavailable, or 504 Gateway Timeout, retry
      if (response.status === 502 || response.status === 503 || response.status === 504) {
        const errorText = await response.text();
        console.warn(`⚠️ OpenAI API returned ${response.status} (Gateway Error) on attempt ${attempt}/${maxRetries}`);
        console.warn(`   Error details:`, errorText.substring(0, 200));
        
        if (attempt < maxRetries) {
          // Exponential backoff with jitter
          const baseDelay = 1000 * Math.pow(2, attempt); // 2s, 4s, 8s
          const jitter = Math.random() * 500; // Add 0-500ms randomness
          const delayMs = Math.min(baseDelay + jitter, 10000); // Max 10s
          
          console.log(`   🔄 Retrying in ${Math.round(delayMs)}ms...`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
          continue;
        }
      }
      
      // For other errors (4xx, etc), don't retry
      return response;
      
    } catch (error) {
      // Handle timeout or network errors
      if (error instanceof Error && error.name === 'AbortError') {
        console.error(`⏱️ OpenAI API timeout (${timeoutMs}ms) on attempt ${attempt}/${maxRetries}`);
      } else {
        console.error(`❌ OpenAI API network error on attempt ${attempt}/${maxRetries}:`, error);
      }
      
      if (attempt < maxRetries) {
        const baseDelay = 1000 * Math.pow(2, attempt);
        const jitter = Math.random() * 500;
        const delayMs = Math.min(baseDelay + jitter, 10000);
        
        console.log(`   🔄 Retrying in ${Math.round(delayMs)}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        continue;
      }
      
      throw error;
    }
  }
  
  throw new Error(`OpenAI API failed after ${maxRetries} attempts`);
}

/**
 * Extract friendly error message from OpenAI API error
 */
export function extractOpenAIErrorMessage(errorText: string): string {
  // Check if it's a Cloudflare error page
  if (errorText.includes('502 Bad Gateway') || errorText.includes('cloudflare')) {
    return 'El servicio de OpenAI está temporalmente no disponible (Error 502). Por favor intenta nuevamente en unos momentos.';
  }
  
  if (errorText.includes('503 Service Unavailable')) {
    return 'El servicio de OpenAI está sobrecargado (Error 503). Por favor intenta nuevamente en unos momentos.';
  }
  
  if (errorText.includes('504 Gateway Timeout')) {
    return 'El servicio de OpenAI tardó demasiado en responder (Error 504). Por favor intenta nuevamente.';
  }
  
  // Try to parse JSON error
  try {
    const errorJson = JSON.parse(errorText);
    if (errorJson.error && errorJson.error.message) {
      return errorJson.error.message;
    }
  } catch {
    // Not JSON, continue
  }
  
  // Default error
  return 'Error al conectar con el servicio de IA. Por favor intenta nuevamente.';
}