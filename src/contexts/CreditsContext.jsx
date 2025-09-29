import React, { createContext, useContext, useState, useEffect } from 'react';
import config from '../config/index.js';
import BillingService from '../services/billing.js';

const CreditsContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useCredits = () => {
  const context = useContext(CreditsContext);
  if (!context) {
    throw new Error('useCredits must be used within a CreditsProvider');
  }
  return context;
};

export const CreditsProvider = ({ children }) => {
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);

  // Initialize user credits
  useEffect(() => {
    initializeCredits();
  }, []);

  const initializeCredits = () => {
    try {
      // For demo purposes, use localStorage
      const savedCredits = localStorage.getItem('user_credits');
      const savedTransactions = localStorage.getItem('user_transactions');
      
      if (savedCredits) {
        setCredits(parseInt(savedCredits));
      } else {
        // Give new users free credits
        const freeCredits = config.billing.freeCredits;
        setCredits(freeCredits);
        localStorage.setItem('user_credits', freeCredits.toString());
        
        // Add welcome transaction
        const welcomeTransaction = {
          id: 'welcome_' + Date.now(),
          type: 'bonus',
          amount: freeCredits,
          description: 'Welcome bonus - Free credits!',
          timestamp: new Date().toISOString(),
          status: 'completed'
        };
        
        setTransactions([welcomeTransaction]);
        localStorage.setItem('user_transactions', JSON.stringify([welcomeTransaction]));
      }
      
      if (savedTransactions) {
        setTransactions(JSON.parse(savedTransactions));
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to initialize credits:', error);
      setCredits(config.billing.freeCredits);
      setLoading(false);
    }
  };

  const addCredits = (amount, description = 'Credits purchased') => {
    const newCredits = credits + amount;
    setCredits(newCredits);
    localStorage.setItem('user_credits', newCredits.toString());
    
    const transaction = {
      id: 'purchase_' + Date.now(),
      type: 'purchase',
      amount: amount,
      description: description,
      timestamp: new Date().toISOString(),
      status: 'completed'
    };
    
    const newTransactions = [transaction, ...transactions];
    setTransactions(newTransactions);
    localStorage.setItem('user_transactions', JSON.stringify(newTransactions));
    
    return newCredits;
  };

  const useCredits = (amount, description = 'AI Chat Message') => {
    if (credits < amount) {
      throw new Error('Insufficient credits');
    }
    
    const newCredits = credits - amount;
    setCredits(newCredits);
    localStorage.setItem('user_credits', newCredits.toString());
    
    const transaction = {
      id: 'usage_' + Date.now(),
      type: 'usage',
      amount: -amount,
      description: description,
      timestamp: new Date().toISOString(),
      status: 'completed'
    };
    
    const newTransactions = [transaction, ...transactions];
    setTransactions(newTransactions);
    localStorage.setItem('user_transactions', JSON.stringify(newTransactions));
    
    return newCredits;
  };

  const canAffordMessage = (model = 'gpt-3.5-turbo') => {
    const cost = BillingService.getMessageCost(model);
    return credits >= cost;
  };

  const getMessageCost = (model = 'gpt-3.5-turbo') => {
    return BillingService.getMessageCost(model);
  };

  const purchaseCredits = async (packageId) => {
    try {
      const packages = BillingService.getCreditPackages();
      const selectedPackage = packages.find(p => p.id === packageId);
      
      if (!selectedPackage) {
        throw new Error('Invalid package selected');
      }

      // For demo purposes, simulate successful purchase
      const newCredits = addCredits(
        selectedPackage.credits,
        `Purchased ${selectedPackage.name} - ${selectedPackage.credits} credits`
      );

      // In production, this would integrate with Stripe
      return {
        success: true,
        credits: newCredits,
        package: selectedPackage
      };
    } catch (error) {
      console.error('Purchase failed:', error);
      throw error;
    }
  };

  const value = {
    credits,
    loading,
    transactions,
    addCredits,
    useCredits,
    canAffordMessage,
    getMessageCost,
    purchaseCredits,
    initializeCredits
  };

  return (
    <CreditsContext.Provider value={value}>
      {children}
    </CreditsContext.Provider>
  );
};