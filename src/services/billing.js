// Billing and Credits Management Service
import config from '../config/index.js';

class BillingService {
  constructor() {
    this.stripePublicKey = config.stripe?.publicKey || '';
    this.apiUrl = config.billing?.apiUrl || '/api/billing';
  }

  // Credit packages available for purchase
  getCreditPackages() {
    return [
      {
        id: 'starter',
        name: 'Starter Pack',
        credits: 1000,
        price: 5.00,
        description: '1,000 credits - Perfect for trying out PumaAI',
        popular: false,
        costPerCredit: 0.005
      },
      {
        id: 'professional',
        name: 'Professional',
        credits: 5000,
        price: 20.00,
        description: '5,000 credits - Great for regular users',
        popular: true,
        costPerCredit: 0.004,
        savings: '20% savings'
      },
      {
        id: 'business',
        name: 'Business',
        credits: 15000,
        price: 50.00,
        description: '15,000 credits - Best for power users',
        popular: false,
        costPerCredit: 0.0033,
        savings: '33% savings'
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        credits: 50000,
        price: 150.00,
        description: '50,000 credits - Great for teams',
        popular: false,
        costPerCredit: 0.003,
        savings: '40% savings'
      },
      {
        id: 'mega',
        name: 'Mega Enterprise',
        credits: 1000000,
        price: 2500.00,
        description: '1,000,000 credits - Ultimate package for large organizations',
        popular: false,
        costPerCredit: 0.0025,
        savings: '50% savings',
        badge: 'Best Value'
      }
    ];
  }

  // Credit costs per AI model
  getModelCosts() {
    return {
      'gpt-3.5-turbo': {
        name: 'GPT-3.5 Turbo',
        creditsPerMessage: 1,
        description: 'Fast and efficient - 1 credit per message'
      },
      'gpt-4': {
        name: 'GPT-4',
        creditsPerMessage: 5,
        description: 'Most capable model - 5 credits per message'
      },
      'gpt-4-turbo': {
        name: 'GPT-4 Turbo',
        creditsPerMessage: 3,
        description: 'Balanced performance - 3 credits per message'
      }
    };
  }

  // Check if user has enough credits for a chat
  canAffordMessage(userCredits, model = 'gpt-3.5-turbo') {
    const modelCosts = this.getModelCosts();
    const cost = modelCosts[model]?.creditsPerMessage || 1;
    return userCredits >= cost;
  }

  // Calculate credits needed for a message
  getMessageCost(model = 'gpt-3.5-turbo') {
    const modelCosts = this.getModelCosts();
    return modelCosts[model]?.creditsPerMessage || 1;
  }

  // Initialize Stripe checkout
  async createCheckoutSession(packageId, userId) {
    const packages = this.getCreditPackages();
    const selectedPackage = packages.find(p => p.id === packageId);
    
    if (!selectedPackage) {
      throw new Error('Invalid package selected');
    }

    try {
      const response = await fetch(`${this.apiUrl}/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          packageId,
          userId,
          amount: selectedPackage.price * 100, // Stripe expects cents
          credits: selectedPackage.credits
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const session = await response.json();
      return session;
    } catch (error) {
      console.error('Checkout session creation failed:', error);
      // For demo purposes, return mock session
      return this.createMockCheckoutSession(selectedPackage);
    }
  }

  // Mock checkout for demo (replace with real Stripe integration)
  createMockCheckoutSession(package_) {
    return {
      url: '#billing-demo',
      sessionId: 'mock_session_' + Date.now(),
      package: package_,
      message: 'Demo mode - credits will be added automatically'
    };
  }

  getAuthToken() {
    // Get auth token from localStorage or context
    return localStorage.getItem('auth_token') || '';
  }

  // Process successful payment
  async handlePaymentSuccess(sessionId, userId) {
    try {
      const response = await fetch(`${this.apiUrl}/payment-success`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          sessionId,
          userId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to process payment');
      }

      return await response.json();
    } catch (error) {
      console.error('Payment processing failed:', error);
      throw error;
    }
  }
}

export default new BillingService();