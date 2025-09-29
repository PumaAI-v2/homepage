// Simple health check and analytics utilities
import config from '../config/index.js';

class AnalyticsService {
  constructor() {
    this.enabled = config.features.enableAnalytics && config.analytics.googleAnalyticsId;
    this.initialized = false;
  }

  init() {
    if (!this.enabled || this.initialized) return;
    
    try {
      // Google Analytics 4
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${config.analytics.googleAnalyticsId}`;
      document.head.appendChild(script);

      window.dataLayer = window.dataLayer || [];
      function gtag() { window.dataLayer.push(arguments); }
      window.gtag = gtag;
      gtag('js', new Date());
      gtag('config', config.analytics.googleAnalyticsId);

      this.initialized = true;
    } catch (error) {
      console.error('Analytics initialization failed:', error);
    }
  }

  trackEvent(eventName, parameters = {}) {
    if (!this.enabled || !this.initialized) return;
    
    try {
      window.gtag('event', eventName, {
        app_name: config.app.name,
        app_version: config.app.version,
        ...parameters
      });
    } catch (error) {
      console.error('Event tracking failed:', error);
    }
  }

  trackPageView(pagePath) {
    if (!this.enabled || !this.initialized) return;
    
    try {
      window.gtag('config', config.analytics.googleAnalyticsId, {
        page_path: pagePath
      });
    } catch (error) {
      console.error('Page view tracking failed:', error);
    }
  }
}

class HealthCheckService {
  static async checkServices() {
    const checks = {
      openai: false,
      analytics: false,
      environment: config.app.environment,
      version: config.app.version,
      timestamp: new Date().toISOString()
    };

    // Check OpenAI service
    try {
      checks.openai = !!config.openai.apiKey && config.features.enableOpenAI;
    } catch {
      checks.openai = false;
    }

    // Check Analytics
    try {
      checks.analytics = !!config.analytics.googleAnalyticsId && config.features.enableAnalytics;
    } catch {
      checks.analytics = false;
    }

    return checks;
  }

  static logHealthStatus() {
    this.checkServices().then(status => {
      console.log(`🏥 PumaAI Health Check:`, status);
      
      if (status.environment === 'production') {
        console.log('🚀 Running in production mode');
      } else {
        console.log('🔧 Running in development mode');
      }
      
      if (!status.openai) {
        console.warn('⚠️ OpenAI service not configured - running in demo mode');
      }
      
      if (!status.analytics) {
        console.log('📊 Analytics disabled');
      }
    });
  }
}

export const analytics = new AnalyticsService();
export { HealthCheckService };
export default { analytics, HealthCheckService };