/**
 * Fetch with Timeout Utility
 * 
 * Wrapper around fetch that adds timeout support and error handling
 */

interface FetchWithTimeoutOptions extends RequestInit {
  timeout?: number; // in milliseconds
}

/**
 * Fetch with automatic timeout
 * @param url - URL to fetch
 * @param options - Fetch options including optional timeout
 * @returns Promise<Response>
 * @throws Error if timeout is exceeded or fetch fails
 */
export async function fetchWithTimeout(
  url: string,
  options: FetchWithTimeoutOptions = {}
): Promise<Response> {
  const { timeout = 10000, ...fetchOptions } = options; // Default 10 second timeout

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);

    // Si es un error de abort, es un timeout
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeout}ms for ${url}`);
    }

    // Re-throw otros errores
    throw error;
  }
}

/**
 * Fetch with timeout and silent error handling
 * Returns null on error instead of throwing
 */
export async function fetchSilent(
  url: string,
  options: FetchWithTimeoutOptions = {}
): Promise<Response | null> {
  try {
    return await fetchWithTimeout(url, options);
  } catch (error) {
    // Log error silently in dev mode
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[fetchSilent] Failed to fetch ${url}:`, error);
    }
    return null;
  }
}
