/**
 * responsive.ts - UTILITIES FOR RESPONSIVE DESIGN
 * 
 * Helpers, constants, and utilities for building responsive
 * mobile-first experiences across all device sizes.
 */

// ============================================================================
// BREAKPOINTS
// ============================================================================

/**
 * Tailwind breakpoints (Tailwind v4.0 defaults)
 */
export const BREAKPOINTS = {
  xs: 320,   // Extra small devices (very small phones)
  sm: 640,   // Small devices (tablets and large phones)
  md: 768,   // Medium devices (tablets)
  lg: 1024,  // Large devices (laptops)
  xl: 1280,  // Extra large devices (desktops)
  '2xl': 1536, // 2X Extra large devices (large desktops)
} as const;

/**
 * Device categories based on width
 */
export const DEVICE_SIZES = {
  MOBILE_SMALL: { min: 320, max: 374 },    // iPhone SE, small Android
  MOBILE_STANDARD: { min: 375, max: 428 }, // iPhone 12/13/14, Pixel
  MOBILE_LARGE: { min: 429, max: 767 },    // iPhone Pro Max, large Android
  TABLET: { min: 768, max: 1023 },         // iPad, Android tablets
  DESKTOP: { min: 1024, max: Infinity },   // Laptops, monitors
} as const;

// ============================================================================
// TOUCH TARGETS
// ============================================================================

/**
 * Minimum touch target sizes (following Apple/Google guidelines)
 */
export const TOUCH_TARGET = {
  MIN_SIZE: 44,      // Minimum 44x44px (Apple guideline)
  RECOMMENDED: 48,   // Recommended 48x48px (Material Design)
  COMFORTABLE: 56,   // Comfortable 56x56px for primary actions
} as const;

/**
 * Touch target size classes for Tailwind
 */
export const TOUCH_CLASSES = {
  minimum: 'min-w-[44px] min-h-[44px]',
  recommended: 'min-w-[48px] min-h-[48px]',
  comfortable: 'min-w-[56px] min-h-[56px]',
} as const;

// ============================================================================
// SPACING
// ============================================================================

/**
 * Responsive spacing scale
 * Usage: gap-${SPACING.responsive.gap}
 */
export const SPACING = {
  responsive: {
    gap: '3 sm:gap-4 md:gap-6',           // Gap between elements
    padding: 'p-3 sm:p-4 md:p-6',         // Padding inside containers
    paddingX: 'px-3 sm:px-4 md:px-6',     // Horizontal padding
    paddingY: 'py-3 sm:py-4 md:py-6',     // Vertical padding
    margin: 'm-3 sm:m-4 md:m-6',          // Margin
    space: 'space-y-3 sm:space-y-4 md:space-y-6', // Vertical space between children
  },
  compact: {
    gap: '2 sm:gap-3 md:gap-4',
    padding: 'p-2 sm:p-3 md:p-4',
    paddingX: 'px-2 sm:px-3 md:px-4',
    paddingY: 'py-2 sm:py-3 md:py-4',
    space: 'space-y-2 sm:space-y-3 md:space-y-4',
  },
  comfortable: {
    gap: '4 sm:gap-5 md:gap-8',
    padding: 'p-4 sm:p-5 md:p-8',
    paddingX: 'px-4 sm:px-5 md:px-8',
    paddingY: 'py-4 sm:py-5 md:py-8',
    space: 'space-y-4 sm:space-y-5 md:space-y-8',
  },
} as const;

// ============================================================================
// COMPONENT SIZES
// ============================================================================

/**
 * Input/Button height classes
 */
export const COMPONENT_HEIGHTS = {
  input: {
    small: 'h-10 sm:h-11',      // 40-44px
    medium: 'h-12 sm:h-14',     // 48-56px (recommended)
    large: 'h-14 sm:h-16',      // 56-64px
  },
  button: {
    small: 'h-10 sm:h-11',
    medium: 'h-12 sm:h-14',
    large: 'h-14 sm:h-16',
  },
  icon: {
    small: 'w-4 h-4 sm:w-5 sm:h-5',      // 16-20px
    medium: 'w-5 h-5 sm:w-6 sm:h-6',     // 20-24px
    large: 'w-6 h-6 sm:w-7 sm:h-7',      // 24-28px
    xlarge: 'w-8 h-8 sm:w-10 sm:h-10',   // 32-40px
  },
} as const;

// ============================================================================
// GRID LAYOUTS
// ============================================================================

/**
 * Common responsive grid patterns
 */
export const GRID_LAYOUTS = {
  cards: {
    auto: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    twoColumn: 'grid grid-cols-1 sm:grid-cols-2',
    threeColumn: 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
    fourColumn: 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4',
  },
  stats: {
    two: 'grid grid-cols-2 gap-3 sm:gap-4',
    three: 'grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4',
    four: 'grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4',
  },
} as const;

// ============================================================================
// DEVICE DETECTION
// ============================================================================

/**
 * Check if current viewport is mobile
 * @returns boolean
 */
export const isMobile = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < BREAKPOINTS.md;
};

/**
 * Check if current viewport is tablet
 * @returns boolean
 */
export const isTablet = (): boolean => {
  if (typeof window === 'undefined') return false;
  const width = window.innerWidth;
  return width >= DEVICE_SIZES.TABLET.min && width <= DEVICE_SIZES.TABLET.max;
};

/**
 * Check if current viewport is desktop
 * @returns boolean
 */
export const isDesktop = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= BREAKPOINTS.lg;
};

/**
 * Check if device is very small (iPhone SE, etc.)
 * @returns boolean
 */
export const isVerySmallDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < DEVICE_SIZES.MOBILE_STANDARD.min;
};

/**
 * Get current device category
 * @returns 'mobile-small' | 'mobile-standard' | 'mobile-large' | 'tablet' | 'desktop'
 */
export const getDeviceCategory = (): 'mobile-small' | 'mobile-standard' | 'mobile-large' | 'tablet' | 'desktop' => {
  if (typeof window === 'undefined') return 'desktop';
  
  const width = window.innerWidth;
  
  if (width < DEVICE_SIZES.MOBILE_STANDARD.min) return 'mobile-small';
  if (width < DEVICE_SIZES.MOBILE_LARGE.min) return 'mobile-standard';
  if (width < DEVICE_SIZES.TABLET.min) return 'mobile-large';
  if (width < DEVICE_SIZES.DESKTOP.min) return 'tablet';
  return 'desktop';
};

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hook to get current window width
 * Updates on resize
 */
export const useWindowWidth = (): number => {
  if (typeof window === 'undefined') return 1024; // Default to desktop SSR
  
  const [width, setWidth] = React.useState(window.innerWidth);
  
  React.useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return width;
};

// Note: Import React if using hooks
import React from 'react';

/**
 * Hook to check if viewport is mobile
 */
export const useIsMobile = (): boolean => {
  const width = useWindowWidth();
  return width < BREAKPOINTS.md;
};

/**
 * Hook to check if viewport is tablet
 */
export const useIsTablet = (): boolean => {
  const width = useWindowWidth();
  return width >= DEVICE_SIZES.TABLET.min && width <= DEVICE_SIZES.TABLET.max;
};

/**
 * Hook to get device category
 */
export const useDeviceCategory = () => {
  const width = useWindowWidth();
  
  if (width < DEVICE_SIZES.MOBILE_STANDARD.min) return 'mobile-small';
  if (width < DEVICE_SIZES.MOBILE_LARGE.min) return 'mobile-standard';
  if (width < DEVICE_SIZES.TABLET.min) return 'mobile-large';
  if (width < DEVICE_SIZES.DESKTOP.min) return 'tablet';
  return 'desktop';
};

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Get responsive class based on device size
 * @param classes Object with mobile/tablet/desktop classes
 * @returns Tailwind class string
 */
export const getResponsiveClass = (classes: {
  mobile?: string;
  tablet?: string;
  desktop?: string;
}): string => {
  const { mobile = '', tablet = '', desktop = '' } = classes;
  return `${mobile} ${tablet ? `md:${tablet}` : ''} ${desktop ? `lg:${desktop}` : ''}`.trim();
};

/**
 * Clamp number between min and max
 */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

/**
 * Get safe area insets for devices with notch
 * @returns { top, right, bottom, left }
 */
export const getSafeAreaInsets = () => {
  if (typeof window === 'undefined' || !CSS.supports('padding-top: env(safe-area-inset-top)')) {
    return { top: 0, right: 0, bottom: 0, left: 0 };
  }

  // This is a helper - actual values come from CSS env()
  return {
    top: 'env(safe-area-inset-top)',
    right: 'env(safe-area-inset-right)',
    bottom: 'env(safe-area-inset-bottom)',
    left: 'env(safe-area-inset-left)',
  };
};

// ============================================================================
// FORMAT HELPERS
// ============================================================================

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

/**
 * Get responsive truncate length based on device
 */
export const getResponsiveTruncateLength = (): number => {
  const category = getDeviceCategory();
  switch (category) {
    case 'mobile-small': return 15;
    case 'mobile-standard': return 20;
    case 'mobile-large': return 25;
    case 'tablet': return 40;
    case 'desktop': return 50;
    default: return 25;
  }
};

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  BREAKPOINTS,
  DEVICE_SIZES,
  TOUCH_TARGET,
  TOUCH_CLASSES,
  SPACING,
  COMPONENT_HEIGHTS,
  GRID_LAYOUTS,
  isMobile,
  isTablet,
  isDesktop,
  isVerySmallDevice,
  getDeviceCategory,
  useWindowWidth,
  useIsMobile,
  useIsTablet,
  useDeviceCategory,
  getResponsiveClass,
  clamp,
  getSafeAreaInsets,
  truncateText,
  getResponsiveTruncateLength,
};
