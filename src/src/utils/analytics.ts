/**
 * =====================================================
 * ANALYTICS SYSTEM
 * =====================================================
 * 
 * Event tracking and analytics for Oti
 * 
 * Features:
 * - Custom event tracking
 * - User journey tracking
 * - Error tracking
 * - Performance monitoring
 * - Privacy-friendly (no PII)
 * 
 * To use Google Analytics or Mixpanel:
 * 1. Uncomment the relevant section
 * 2. Add your tracking ID to environment variables
 * 3. Deploy
 * 
 * =====================================================
 */

// =====================================================
// TYPES
// =====================================================

export interface AnalyticsEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
  metadata?: Record<string, any>;
}

export interface UserProperties {
  userId?: string;
  plan?: 'free' | 'premium';
  language?: string;
  theme?: 'light' | 'dark';
  [key: string]: any;
}

// =====================================================
// CONFIGURATION
// =====================================================

const ANALYTICS_ENABLED = true;
const DEBUG_MODE = import.meta.env.DEV;

// Google Analytics ID (optional)
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || '';

// Mixpanel Token (optional)
const MIXPANEL_TOKEN = import.meta.env.VITE_MIXPANEL_TOKEN || '';

// =====================================================
// ANALYTICS SERVICE
// =====================================================

class AnalyticsService {
  private initialized = false;
  private queue: AnalyticsEvent[] = [];
  private userProperties: UserProperties = {};

  /**
   * Initialize analytics
   */
  init() {
    if (this.initialized) {
      console.warn('[Analytics] Already initialized');
      return;
    }

    console.log('[Analytics] Initializing...');

    // Initialize Google Analytics (optional)
    if (GA_MEASUREMENT_ID) {
      this.initGoogleAnalytics();
    }

    // Initialize Mixpanel (optional)
    if (MIXPANEL_TOKEN) {
      this.initMixpanel();
    }

    // Process queued events
    this.processQueue();

    this.initialized = true;
    console.log('[Analytics] ✅ Initialized');
  }

  /**
   * Track custom event
   */
  track(event: AnalyticsEvent) {
    if (!ANALYTICS_ENABLED) return;

    if (DEBUG_MODE) {
      console.log('[Analytics] Event:', event);
    }

    if (!this.initialized) {
      // Queue event until initialization
      this.queue.push(event);
      return;
    }

    // Send to Google Analytics
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', event.action, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
        ...event.metadata
      });
    }

    // Send to Mixpanel
    if (typeof window.mixpanel !== 'undefined') {
      window.mixpanel.track(`${event.category}: ${event.action}`, {
        label: event.label,
        value: event.value,
        ...event.metadata
      });
    }

    // Custom backend tracking (optional)
    this.sendToBackend(event);
  }

  /**
   * Set user properties
   */
  setUserProperties(properties: UserProperties) {
    this.userProperties = { ...this.userProperties, ...properties };

    if (DEBUG_MODE) {
      console.log('[Analytics] User properties:', this.userProperties);
    }

    // Send to Google Analytics
    if (typeof window.gtag !== 'undefined') {
      window.gtag('set', 'user_properties', properties);
    }

    // Send to Mixpanel
    if (typeof window.mixpanel !== 'undefined') {
      window.mixpanel.people.set(properties);
    }
  }

  /**
   * Identify user (after login)
   */
  identify(userId: string, properties?: UserProperties) {
    if (DEBUG_MODE) {
      console.log('[Analytics] Identify:', userId, properties);
    }

    this.setUserProperties({ userId, ...properties });

    // Send to Google Analytics
    if (typeof window.gtag !== 'undefined') {
      window.gtag('config', GA_MEASUREMENT_ID, {
        user_id: userId
      });
    }

    // Send to Mixpanel
    if (typeof window.mixpanel !== 'undefined') {
      window.mixpanel.identify(userId);
    }
  }

  /**
   * Track page view
   */
  pageView(path: string, title?: string) {
    this.track({
      category: 'Navigation',
      action: 'Page View',
      label: path,
      metadata: { title }
    });

    // Send to Google Analytics
    if (typeof window.gtag !== 'undefined') {
      window.gtag('config', GA_MEASUREMENT_ID, {
        page_path: path,
        page_title: title
      });
    }
  }

  /**
   * Track error
   */
  trackError(error: Error, context?: string) {
    this.track({
      category: 'Error',
      action: error.name || 'Unknown Error',
      label: error.message,
      metadata: {
        context,
        stack: error.stack
      }
    });
  }

  /**
   * Track timing (performance)
   */
  trackTiming(category: string, variable: string, value: number, label?: string) {
    this.track({
      category,
      action: 'Timing',
      label: `${variable}${label ? `: ${label}` : ''}`,
      value
    });

    // Send to Google Analytics
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', 'timing_complete', {
        name: variable,
        value: value,
        event_category: category,
        event_label: label
      });
    }
  }

  // =====================================================
  // PRIVATE METHODS
  // =====================================================

  private initGoogleAnalytics() {
    // Load GA script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    window.gtag = function() {
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', GA_MEASUREMENT_ID, {
      send_page_view: false // We'll handle page views manually
    });

    console.log('[Analytics] Google Analytics initialized');
  }

  private initMixpanel() {
    // Load Mixpanel script
    const script = document.createElement('script');
    script.src = 'https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js';
    script.onload = () => {
      window.mixpanel.init(MIXPANEL_TOKEN, {
        debug: DEBUG_MODE,
        track_pageview: false // We'll handle page views manually
      });
      console.log('[Analytics] Mixpanel initialized');
    };
    document.head.appendChild(script);
  }

  private processQueue() {
    while (this.queue.length > 0) {
      const event = this.queue.shift();
      if (event) {
        this.track(event);
      }
    }
  }

  private async sendToBackend(event: AnalyticsEvent) {
    // Optional: Send events to your own backend for custom analytics
    // This is privacy-friendly and gives you full control
    
    try {
      // Uncomment to enable custom backend tracking:
      /*
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event,
          timestamp: new Date().toISOString(),
          userProperties: this.userProperties
        })
      });
      */
    } catch (error) {
      console.error('[Analytics] Failed to send to backend:', error);
    }
  }
}

// =====================================================
// SINGLETON INSTANCE
// =====================================================

const analytics = new AnalyticsService();

// =====================================================
// CONVENIENCE FUNCTIONS
// =====================================================

/**
 * Initialize analytics
 */
export function initAnalytics() {
  analytics.init();
}

/**
 * Track event
 */
export function trackEvent(
  category: string,
  action: string,
  label?: string,
  value?: number,
  metadata?: Record<string, any>
) {
  analytics.track({ category, action, label, value, metadata });
}

/**
 * Track page view
 */
export function trackPageView(path: string, title?: string) {
  analytics.pageView(path, title);
}

/**
 * Identify user
 */
export function identifyUser(userId: string, properties?: UserProperties) {
  analytics.identify(userId, properties);
}

/**
 * Set user properties
 */
export function setUserProperties(properties: UserProperties) {
  analytics.setUserProperties(properties);
}

/**
 * Track error
 */
export function trackError(error: Error, context?: string) {
  analytics.trackError(error, context);
}

/**
 * Track timing
 */
export function trackTiming(category: string, variable: string, value: number, label?: string) {
  analytics.trackTiming(category, variable, value, label);
}

// =====================================================
// PREDEFINED EVENT TRACKERS
// =====================================================

/**
 * Auth events
 */
export const AuthEvents = {
  login: (method: 'email' | 'google' | 'facebook') =>
    trackEvent('Auth', 'Login', method),
  
  signup: (method: 'email' | 'google' | 'facebook') =>
    trackEvent('Auth', 'Sign Up', method),
  
  logout: () =>
    trackEvent('Auth', 'Logout'),
  
  passwordReset: () =>
    trackEvent('Auth', 'Password Reset')
};

/**
 * Transaction events
 */
export const TransactionEvents = {
  create: (type: 'income' | 'expense' | 'transfer') =>
    trackEvent('Transaction', 'Create', type),
  
  edit: (type: 'income' | 'expense' | 'transfer') =>
    trackEvent('Transaction', 'Edit', type),
  
  delete: () =>
    trackEvent('Transaction', 'Delete'),
  
  voiceInput: () =>
    trackEvent('Transaction', 'Voice Input'),
  
  batchImport: (count: number) =>
    trackEvent('Transaction', 'Batch Import', undefined, count)
};

/**
 * Budget events
 */
export const BudgetEvents = {
  create: () =>
    trackEvent('Budget', 'Create'),
  
  edit: () =>
    trackEvent('Budget', 'Edit'),
  
  delete: () =>
    trackEvent('Budget', 'Delete'),
  
  exceeded: () =>
    trackEvent('Budget', 'Exceeded')
};

/**
 * AI events
 */
export const AIEvents = {
  chatMessage: () =>
    trackEvent('AI', 'Chat Message'),
  
  advisor: (feature: string) =>
    trackEvent('AI', 'Advisor Used', feature),
  
  statementUpload: () =>
    trackEvent('AI', 'Statement Upload')
};

/**
 * Feature usage events
 */
export const FeatureEvents = {
  use: (feature: string) =>
    trackEvent('Feature', 'Used', feature),
  
  install: () =>
    trackEvent('Feature', 'PWA Install'),
  
  share: () =>
    trackEvent('Feature', 'Share'),
  
  export: (format: string) =>
    trackEvent('Feature', 'Export', format)
};

// =====================================================
// TYPE EXTENSIONS
// =====================================================

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
    mixpanel: any;
  }
}

export default analytics;
