// Environment configuration
export const config = {
  // API Configuration
  openai: {
    apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
    apiUrl: import.meta.env.VITE_OPENAI_API_URL || 'https://api.openai.com/v1',
  },
  
  // App Configuration
  app: {
    name: import.meta.env.VITE_APP_NAME || 'PumaAI',
    version: import.meta.env.VITE_APP_VERSION || '2.0.0',
    environment: import.meta.env.VITE_ENVIRONMENT || 'development',
  },
  
  // Auth Configuration (for future implementation)
  auth: {
    apiUrl: import.meta.env.VITE_AUTH_API_URL || '',
    jwtSecret: import.meta.env.VITE_JWT_SECRET || '',
  },
  
  // Billing Configuration
  billing: {
    apiUrl: import.meta.env.VITE_BILLING_API_URL || '/api/billing',
    freeCredits: parseInt(import.meta.env.VITE_FREE_CREDITS) || 10,
  },
  
  // Stripe Configuration
  stripe: {
    publicKey: import.meta.env.VITE_STRIPE_PUBLIC_KEY || '',
  },
  
  // Analytics
  analytics: {
    googleAnalyticsId: import.meta.env.VITE_GOOGLE_ANALYTICS_ID || '',
  },
  
  // Feature Flags
  features: {
    enableRealAuth: import.meta.env.VITE_ENABLE_REAL_AUTH === 'true',
    enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    enableOpenAI: import.meta.env.VITE_ENABLE_OPENAI === 'true',
    enableBilling: import.meta.env.VITE_ENABLE_BILLING === 'true',
  }
};

export default config;