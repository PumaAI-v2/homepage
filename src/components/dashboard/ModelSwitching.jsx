import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useCredits } from '../../contexts/CreditsContext'

export default function ModelSwitching() {
  const { user, logout } = useAuth()
  const { credits } = useCredits()
  const [selectedModel, setSelectedModel] = useState('gpt-4')
  const [modelSettings, setModelSettings] = useState({
    temperature: 0.7,
    maxTokens: 2048,
    topP: 1.0,
    frequencyPenalty: 0,
    presencePenalty: 0
  })

  const models = [
    {
      id: 'gpt-4',
      name: 'GPT-4',
      description: 'Most capable model, best for complex reasoning',
      costPerToken: 0.03,
      maxTokens: 8192,
      strengths: ['Complex reasoning', 'Code generation', 'Analysis'],
      speed: 'Slower',
      quality: 'Highest'
    },
    {
      id: 'gpt-4-turbo',
      name: 'GPT-4 Turbo',
      description: 'Faster GPT-4 with larger context window',
      costPerToken: 0.02,
      maxTokens: 128000,
      strengths: ['Large documents', 'Fast processing', 'Latest knowledge'],
      speed: 'Fast',
      quality: 'Highest'
    },
    {
      id: 'gpt-3.5-turbo',
      name: 'GPT-3.5 Turbo',
      description: 'Balanced performance and cost',
      costPerToken: 0.002,
      maxTokens: 4096,
      strengths: ['General tasks', 'Cost effective', 'Good speed'],
      speed: 'Very Fast',
      quality: 'High'
    },
    {
      id: 'claude-3-opus',
      name: 'Claude 3 Opus',
      description: 'Excellent for creative and analytical tasks',
      costPerToken: 0.015,
      maxTokens: 200000,
      strengths: ['Creative writing', 'Analysis', 'Large context'],
      speed: 'Medium',
      quality: 'Highest'
    },
    {
      id: 'claude-3-sonnet',
      name: 'Claude 3 Sonnet',
      description: 'Balanced Claude model for everyday use',
      costPerToken: 0.003,
      maxTokens: 200000,
      strengths: ['General use', 'Good balance', 'Reliable'],
      speed: 'Fast',
      quality: 'High'
    }
  ]

  const handleModelSelect = (modelId) => {
    setSelectedModel(modelId)
    // In a real app, this would save to backend
    localStorage.setItem('selectedModel', modelId)
  }

  const handleSettingChange = (setting, value) => {
    setModelSettings(prev => ({
      ...prev,
      [setting]: parseFloat(value)
    }))
  }

  const selectedModelData = models.find(m => m.id === selectedModel)

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
          <h1 className="page-title">🔄 Model Switching</h1>
          <p className="page-subtitle">Choose and configure your AI models</p>
        </div>

        <div className="models-container">
          {/* Current Model Status */}
          <div className="current-model-card">
            <div className="current-model-header">
              <h3>Currently Selected Model</h3>
              <div className="model-status active">Active</div>
            </div>
            <div className="current-model-info">
              <div className="model-icon">🤖</div>
              <div className="model-details">
                <h4>{selectedModelData?.name}</h4>
                <p>{selectedModelData?.description}</p>
                <div className="model-metrics">
                  <span className="metric">Speed: {selectedModelData?.speed}</span>
                  <span className="metric">Quality: {selectedModelData?.quality}</span>
                  <span className="metric">Cost: ${selectedModelData?.costPerToken}/1k tokens</span>
                </div>
              </div>
            </div>
          </div>

          {/* Model Selection Grid */}
          <div className="models-section">
            <h3>Available Models</h3>
            <div className="models-grid">
              {models.map((model) => (
                <div 
                  key={model.id} 
                  className={`model-card ${selectedModel === model.id ? 'selected' : ''}`}
                  onClick={() => handleModelSelect(model.id)}
                >
                  <div className="model-card-header">
                    <h4>{model.name}</h4>
                    {selectedModel === model.id && <div className="selected-indicator">✓</div>}
                  </div>
                  <p className="model-description">{model.description}</p>
                  
                  <div className="model-specs">
                    <div className="spec-item">
                      <span className="spec-label">Max Tokens:</span>
                      <span className="spec-value">{model.maxTokens.toLocaleString()}</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Cost per 1K:</span>
                      <span className="spec-value">${model.costPerToken}</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Speed:</span>
                      <span className="spec-value">{model.speed}</span>
                    </div>
                  </div>

                  <div className="model-strengths">
                    <strong>Best for:</strong>
                    <div className="strengths-tags">
                      {model.strengths.map((strength, index) => (
                        <span key={index} className="strength-tag">{strength}</span>
                      ))}
                    </div>
                  </div>

                  <button 
                    className={`select-model-btn ${selectedModel === model.id ? 'selected' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleModelSelect(model.id)
                    }}
                  >
                    {selectedModel === model.id ? 'Selected' : 'Select Model'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Model Settings */}
          <div className="settings-section">
            <h3>Model Parameters</h3>
            <div className="settings-grid">
              <div className="setting-card">
                <label htmlFor="temperature">Temperature</label>
                <div className="setting-control">
                  <input
                    type="range"
                    id="temperature"
                    min="0"
                    max="2"
                    step="0.1"
                    value={modelSettings.temperature}
                    onChange={(e) => handleSettingChange('temperature', e.target.value)}
                  />
                  <span className="setting-value">{modelSettings.temperature}</span>
                </div>
                <p className="setting-description">Controls randomness. Higher values make output more random.</p>
              </div>

              <div className="setting-card">
                <label htmlFor="maxTokens">Max Tokens</label>
                <div className="setting-control">
                  <input
                    type="range"
                    id="maxTokens"
                    min="100"
                    max={selectedModelData?.maxTokens || 4096}
                    step="100"
                    value={modelSettings.maxTokens}
                    onChange={(e) => handleSettingChange('maxTokens', e.target.value)}
                  />
                  <span className="setting-value">{modelSettings.maxTokens}</span>
                </div>
                <p className="setting-description">Maximum number of tokens in the response.</p>
              </div>

              <div className="setting-card">
                <label htmlFor="topP">Top P</label>
                <div className="setting-control">
                  <input
                    type="range"
                    id="topP"
                    min="0"
                    max="1"
                    step="0.1"
                    value={modelSettings.topP}
                    onChange={(e) => handleSettingChange('topP', e.target.value)}
                  />
                  <span className="setting-value">{modelSettings.topP}</span>
                </div>
                <p className="setting-description">Controls diversity via nucleus sampling.</p>
              </div>

              <div className="setting-card">
                <label htmlFor="frequencyPenalty">Frequency Penalty</label>
                <div className="setting-control">
                  <input
                    type="range"
                    id="frequencyPenalty"
                    min="-2"
                    max="2"
                    step="0.1"
                    value={modelSettings.frequencyPenalty}
                    onChange={(e) => handleSettingChange('frequencyPenalty', e.target.value)}
                  />
                  <span className="setting-value">{modelSettings.frequencyPenalty}</span>
                </div>
                <p className="setting-description">Penalizes frequent tokens to reduce repetition.</p>
              </div>
            </div>

            <div className="settings-actions">
              <button className="save-settings-btn">
                💾 Save Settings
              </button>
              <button className="reset-settings-btn">
                🔄 Reset to Defaults
              </button>
            </div>
          </div>

          {/* Cost Calculator */}
          <div className="cost-calculator">
            <h3>Cost Estimate</h3>
            <div className="calculator-content">
              <div className="cost-breakdown">
                <div className="cost-item">
                  <span>Selected Model:</span>
                  <span>{selectedModelData?.name}</span>
                </div>
                <div className="cost-item">
                  <span>Cost per 1K tokens:</span>
                  <span>${selectedModelData?.costPerToken}</span>
                </div>
                <div className="cost-item">
                  <span>Max tokens per request:</span>
                  <span>{modelSettings.maxTokens}</span>
                </div>
                <div className="cost-item total">
                  <span>Estimated cost per request:</span>
                  <span>${((selectedModelData?.costPerToken || 0) * (modelSettings.maxTokens / 1000)).toFixed(4)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}