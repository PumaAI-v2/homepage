import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useCredits } from '../../contexts/CreditsContext'

export default function Help() {
  const { user, logout } = useAuth()
  const { credits } = useCredits()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [expandedFaq, setExpandedFaq] = useState(null)

  const categories = [
    { id: 'all', name: 'All Topics', icon: '📚' },
    { id: 'getting-started', name: 'Getting Started', icon: '🚀' },
    { id: 'models', name: 'AI Models', icon: '🤖' },
    { id: 'billing', name: 'Billing', icon: '💳' },
    { id: 'api', name: 'API Usage', icon: '⚙️' },
    { id: 'troubleshooting', name: 'Troubleshooting', icon: '🔧' }
  ]

  const faqs = [
    {
      id: 1,
      category: 'getting-started',
      question: 'How do I get started with PumaAI?',
      answer: 'Simply sign up for an account, choose your subscription plan, and start chatting with our AI models. You can access the AI Assistant from your dashboard or use our API endpoints.'
    },
    {
      id: 2,
      category: 'models',
      question: 'Which AI model should I choose?',
      answer: 'GPT-4 is best for complex reasoning tasks, GPT-3.5 Turbo for general use with faster responses, and Claude 3 for creative writing and analysis. Check the Model Switching page for detailed comparisons.'
    },
    {
      id: 3,
      category: 'billing',
      question: 'How does credit billing work?',
      answer: 'Credits are consumed based on token usage. Different models have different credit costs per token. You can view your usage in the Usage Statistics page and manage your subscription in Billing.'
    },
    {
      id: 4,
      category: 'api',
      question: 'How do I use the PumaAI API?',
      answer: 'Get your API key from the Settings page, then make HTTP requests to our endpoints. Check our API documentation for detailed integration guides and code examples.'
    },
    {
      id: 5,
      category: 'troubleshooting',
      question: 'Why are my API requests failing?',
      answer: 'Common issues include invalid API keys, exceeded rate limits, or insufficient credits. Check your API key, ensure you have enough credits, and verify your request format.'
    },
    {
      id: 6,
      category: 'models',
      question: 'What is the difference between model parameters?',
      answer: 'Temperature controls randomness (0-2), Max Tokens limits response length, Top P controls diversity, and penalties reduce repetition. Adjust these in Model Switching for different use cases.'
    },
    {
      id: 7,
      category: 'billing',
      question: 'Can I get a refund for unused credits?',
      answer: 'Credits are non-refundable but do not expire. You can use them anytime, and we offer flexible subscription plans to match your usage patterns.'
    },
    {
      id: 8,
      category: 'getting-started',
      question: 'Is there a free trial available?',
      answer: 'Yes! New users get 1,000 free credits to try our services. No credit card required for the trial period.'
    }
  ]

  const tutorials = [
    {
      id: 1,
      title: 'Getting Started with PumaAI',
      description: 'A complete guide to setting up your account and making your first API call',
      duration: '5 min',
      difficulty: 'Beginner',
      icon: '🎯'
    },
    {
      id: 2,
      title: 'Optimizing Model Parameters',
      description: 'Learn how to tune model settings for better results',
      duration: '8 min',
      difficulty: 'Intermediate',
      icon: '⚙️'
    },
    {
      id: 3,
      title: 'Building with the API',
      description: 'Integration examples and best practices for developers',
      duration: '12 min',
      difficulty: 'Advanced',
      icon: '💻'
    },
    {
      id: 4,
      title: 'Managing Credits and Billing',
      description: 'Understanding usage patterns and optimizing costs',
      duration: '6 min',
      difficulty: 'Beginner',
      icon: '💰'
    }
  ]

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const toggleFaq = (faqId) => {
    setExpandedFaq(expandedFaq === faqId ? null : faqId)
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="dashboard-nav">
          <div className="dashboard-logo">
            <Link to="/dashboard">
              <h2>PumaAI</h2>
            </Link>
          </div>
          <div className="dashboard-user">
            <div className="credits-display">
              <span className="credits-amount">{credits?.toLocaleString() || '0'}</span>
              <span className="credits-label">credits</span>
            </div>
            <span>Welcome, {user?.name || 'User'}!</span>
            <button onClick={logout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-content">
        <div className="page-header">
          <Link to="/dashboard" className="back-btn">← Back to Dashboard</Link>
          <h1 className="page-title">❓ Help & Support</h1>
          <p className="page-subtitle">Find answers and get support for PumaAI</p>
        </div>

        <div className="help-container">
          {/* Quick Actions */}
          <div className="quick-actions">
            <div className="action-card">
              <div className="action-icon">💬</div>
              <h3>Contact Support</h3>
              <p>Get direct help from our support team</p>
              <button className="action-button">Start Chat</button>
            </div>
            <div className="action-card">
              <div className="action-icon">📖</div>
              <h3>API Documentation</h3>
              <p>Complete API reference and guides</p>
              <button className="action-button">View Docs</button>
            </div>
            <div className="action-card">
              <div className="action-icon">🎥</div>
              <h3>Video Tutorials</h3>
              <p>Learn with step-by-step videos</p>
              <button className="action-button">Watch Now</button>
            </div>
          </div>

          {/* Search and Categories */}
          <div className="help-search-section">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search for help topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="search-btn">🔍</button>
            </div>

            <div className="category-filters">
              {categories.map(category => (
                <button
                  key={category.id}
                  className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <span className="category-icon">{category.icon}</span>
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Tutorials Section */}
          <div className="tutorials-section">
            <h3>Tutorials & Guides</h3>
            <div className="tutorials-grid">
              {tutorials.map(tutorial => (
                <div key={tutorial.id} className="tutorial-card">
                  <div className="tutorial-icon">{tutorial.icon}</div>
                  <div className="tutorial-content">
                    <h4>{tutorial.title}</h4>
                    <p>{tutorial.description}</p>
                    <div className="tutorial-meta">
                      <span className="duration">{tutorial.duration}</span>
                      <span className="difficulty">{tutorial.difficulty}</span>
                    </div>
                  </div>
                  <button className="tutorial-btn">Start →</button>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ Section */}
          <div className="faq-section">
            <h3>Frequently Asked Questions</h3>
            <div className="faq-list">
              {filteredFaqs.map(faq => (
                <div key={faq.id} className="faq-item">
                  <div 
                    className="faq-question"
                    onClick={() => toggleFaq(faq.id)}
                  >
                    <span>{faq.question}</span>
                    <span className={`faq-toggle ${expandedFaq === faq.id ? 'expanded' : ''}`}>
                      {expandedFaq === faq.id ? '−' : '+'}
                    </span>
                  </div>
                  {expandedFaq === faq.id && (
                    <div className="faq-answer">
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Status Section */}
          <div className="status-section">
            <h3>System Status</h3>
            <div className="status-grid">
              <div className="status-item">
                <div className="status-indicator online"></div>
                <div className="status-info">
                  <span className="status-service">API Service</span>
                  <span className="status-text">Operational</span>
                </div>
              </div>
              <div className="status-item">
                <div className="status-indicator online"></div>
                <div className="status-info">
                  <span className="status-service">GPT-4 Models</span>
                  <span className="status-text">Operational</span>
                </div>
              </div>
              <div className="status-item">
                <div className="status-indicator online"></div>
                <div className="status-info">
                  <span className="status-service">Dashboard</span>
                  <span className="status-text">Operational</span>
                </div>
              </div>
              <div className="status-item">
                <div className="status-indicator warning"></div>
                <div className="status-info">
                  <span className="status-service">Claude Models</span>
                  <span className="status-text">Degraded Performance</span>
                </div>
              </div>
            </div>
            <a href="#" className="status-link">View Full Status Page →</a>
          </div>

          {/* Contact Section */}
          <div className="contact-section">
            <h3>Still Need Help?</h3>
            <div className="contact-options">
              <div className="contact-option">
                <div className="contact-icon">📧</div>
                <div className="contact-info">
                  <h4>Email Support</h4>
                  <p>Get help via email within 24 hours</p>
                  <a href="mailto:support@pumaai.com">support@pumaai.com</a>
                </div>
              </div>
              <div className="contact-option">
                <div className="contact-icon">💬</div>
                <div className="contact-info">
                  <h4>Live Chat</h4>
                  <p>Chat with our support team in real-time</p>
                  <button className="contact-btn">Start Chat</button>
                </div>
              </div>
              <div className="contact-option">
                <div className="contact-icon">🐛</div>
                <div className="contact-info">
                  <h4>Report Bug</h4>
                  <p>Found an issue? Let us know</p>
                  <button className="contact-btn">Report Issue</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}