import config from '../config/index.js';

class OpenAIService {
  constructor() {
    this.apiKey = config.openai.apiKey;
    this.apiUrl = config.openai.apiUrl;
    this.enabled = config.features.enableOpenAI && this.apiKey;
  }

  async sendMessage(message, conversationHistory = [], options = {}) {
    const {
      model = 'gpt-3.5-turbo',
      temperature = 0.7,
      maxTokens = 1000,
      systemPrompt = 'You are PumaAI, an intelligent AI assistant. Be helpful, concise, and friendly. You excel at thinking fast, adapting smart, and assisting seamlessly.'
    } = options;

    if (!this.enabled) {
      // Fallback to mock responses when API key is not configured
      return this.getMockResponse(message, { conversationHistory, intent: options.intent });
    }

    try {
      const messages = [
        {
          role: 'system',
          content: systemPrompt
        },
        ...conversationHistory.map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.content
        })),
        {
          role: 'user',
          content: message
        }
      ];

      const response = await fetch(`${this.apiUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model,
          messages,
          max_tokens: maxTokens,
          temperature
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || 'I apologize, but I encountered an error processing your request.';
    } catch (error) {
      console.error('OpenAI API Error:', error);
      return this.getMockResponse(message, { conversationHistory, intent: options.intent });
    }
  }

  getMockResponse(message, context = {}) {
    const mockResponses = [
      "Thanks for your message! I'm currently running in demo mode. To enable full AI capabilities, please configure your OpenAI API key in the environment settings.",
      "I'd love to help you with that! This is a demo response since the OpenAI API isn't configured yet. Please add your API key to unlock full functionality.",
      "Great question! I'm operating in demo mode right now. For real AI responses, please set up your OpenAI API key in the configuration.",
      "I appreciate your input! Currently showing demo responses. Configure your OpenAI API key to enable full AI assistance.",
      "Interesting! I'm in demonstration mode at the moment. Add your OpenAI API key to experience the full power of PumaAI."
    ];

    // Simple keyword-based mock responses
    const lowerMessage = message.toLowerCase();
    
    if (context.intent === 'summary' || lowerMessage.includes('summary')) {
      return 'Demo summary: The conversation covered key goals, highlighted blockers, and ended with next steps to action.';
    }

    if (context.intent === 'rewrite') {
      return 'Demo rewrite: Adjust the tone of this response once real AI access is enabled.';
    }

    if (context.intent === 'regenerate') {
      return 'Demo regenerate: Configure OpenAI to receive an updated answer here.';
    }

    if (lowerMessage.includes('help') || lowerMessage.includes('how')) {
      return "I'd be happy to help! Currently running in demo mode. Configure your OpenAI API key to unlock full AI assistance capabilities.";
    }
    
    if (lowerMessage.includes('what') || lowerMessage.includes('explain')) {
      return "That's a great question! I'm currently in demo mode. For detailed explanations and real AI responses, please configure your OpenAI API key.";
    }
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return "Hello! Welcome to PumaAI. I'm currently running in demo mode. Add your OpenAI API key to experience full AI capabilities!";
    }

    return mockResponses[Math.floor(Math.random() * mockResponses.length)];
  }

  isConfigured() {
    return this.enabled;
  }
}

export default new OpenAIService();