/**
 * Color Utilities
 * 
 * Helper functions for color manipulation and conversion
 */

/**
 * Converts a hex color to a pastel background color with low opacity
 * Perfect for emoji/icon backgrounds that need subtle coloring
 * 
 * @param color - Hex color string (e.g., '#10b981')
 * @param opacity - Opacity value (default: 0.12 for 12%)
 * @returns rgba string or original color if not hex
 * 
 * @example
 * getPastelBackground('#10b981') // 'rgba(16, 185, 129, 0.12)'
 * getPastelBackground('#ef4444', 0.15) // 'rgba(239, 68, 68, 0.15)'
 */
export function getPastelBackground(color: string | undefined, opacity: number = 0.12): string {
  if (!color) return 'rgba(107, 114, 128, 0.12)'; // gray-500 default
  
  // Si es un color hex, convertir a rgba con opacity
  if (color.startsWith('#')) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  
  // Si ya tiene alpha o es otro formato, retornar as-is
  return color;
}

/**
 * Converts a hex color to rgba with custom opacity
 * 
 * @param color - Hex color string
 * @param opacity - Opacity value (0-1)
 * @returns rgba string
 */
export function hexToRgba(color: string, opacity: number = 1): string {
  if (!color.startsWith('#')) return color;
  
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}
