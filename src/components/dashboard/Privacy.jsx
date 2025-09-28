import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useCredits } from '../../contexts/CreditsContext'

export default function Privacy() {
  const { user, logout } = useAuth()
  const { credits } = useCredits()
  const [privacySettings, setPrivacySettings] = useState({
    dataRetention: '90days',
    shareAnalytics: true,
    personalizedRecommendations: true,
    marketingEmails: false,
    securityNotifications: true,
    thirdPartyIntegrations: false,
    conversationHistory: true,
    automaticDeletion: true
  })

  const handleSettingChange = (setting) => {
    setPrivacySettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }))
  }

  const handleDataRetentionChange = (value) => {
    setPrivacySettings(prev => ({
      ...prev,
      dataRetention: value
    }))
  }

  const exportData = () => {
    // In a real app, this would trigger data export
    alert('Your data export will be sent to your email address within 24 hours.')
  }

  const deleteAllData = () => {
    if (window.confirm('Are you sure you want to delete all your data? This action cannot be undone.')) {
      alert('Data deletion request submitted. Your data will be permanently deleted within 30 days.')
    }
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
          <h1 className="page-title">🔒 Privacy & Security</h1>
          <p className="page-subtitle">Manage your data privacy and security settings</p>
        </div>

        <div className="privacy-container">
          {/* Privacy Overview */}
          <div className="privacy-overview">
            <div className="privacy-card highlight">
              <div className="privacy-icon">🛡️</div>
              <div className="privacy-content">
                <h3>Your Privacy Matters</h3>
                <p>We take your privacy seriously. Your conversations and data are encrypted and stored securely. You have full control over your data.</p>
              </div>
            </div>
          </div>

          {/* Data Management */}
          <div className="section">
            <h3>Data Management</h3>
            <div className="settings-group">
              <div className="setting-item">
                <div className="setting-info">
                  <label>Data Retention Period</label>
                  <p>How long should we keep your conversation history?</p>
                </div>
                <div className="setting-control">
                  <select 
                    value={privacySettings.dataRetention}
                    onChange={(e) => handleDataRetentionChange(e.target.value)}
                  >
                    <option value="30days">30 Days</option>
                    <option value="90days">90 Days</option>
                    <option value="1year">1 Year</option>
                    <option value="indefinite">Keep Indefinitely</option>
                  </select>
                </div>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <label>Conversation History</label>
                  <p>Save your conversations for future reference</p>
                </div>
                <div className="setting-control">
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={privacySettings.conversationHistory}
                      onChange={() => handleSettingChange('conversationHistory')}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <label>Automatic Deletion</label>
                  <p>Automatically delete old conversations based on retention period</p>
                </div>
                <div className="setting-control">
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={privacySettings.automaticDeletion}
                      onChange={() => handleSettingChange('automaticDeletion')}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Privacy Preferences */}
          <div className="section">
            <h3>Privacy Preferences</h3>
            <div className="settings-group">
              <div className="setting-item">
                <div className="setting-info">
                  <label>Share Anonymous Analytics</label>
                  <p>Help us improve by sharing anonymous usage statistics</p>
                </div>
                <div className="setting-control">
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={privacySettings.shareAnalytics}
                      onChange={() => handleSettingChange('shareAnalytics')}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <label>Personalized Recommendations</label>
                  <p>Get model and feature suggestions based on your usage</p>
                </div>
                <div className="setting-control">
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={privacySettings.personalizedRecommendations}
                      onChange={() => handleSettingChange('personalizedRecommendations')}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <label>Third-party Integrations</label>
                  <p>Allow third-party services to access your PumaAI data</p>
                </div>
                <div className="setting-control">
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={privacySettings.thirdPartyIntegrations}
                      onChange={() => handleSettingChange('thirdPartyIntegrations')}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Communication Preferences */}
          <div className="section">
            <h3>Communication Preferences</h3>
            <div className="settings-group">
              <div className="setting-item">
                <div className="setting-info">
                  <label>Marketing Emails</label>
                  <p>Receive updates about new features and promotions</p>
                </div>
                <div className="setting-control">
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={privacySettings.marketingEmails}
                      onChange={() => handleSettingChange('marketingEmails')}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <label>Security Notifications</label>
                  <p>Get notified about important security updates</p>
                </div>
                <div className="setting-control">
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={privacySettings.securityNotifications}
                      onChange={() => handleSettingChange('securityNotifications')}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Security Information */}
          <div className="section">
            <h3>Security Information</h3>
            <div className="security-grid">
              <div className="security-card">
                <div className="security-icon">🔐</div>
                <h4>End-to-End Encryption</h4>
                <p>All your conversations are encrypted using industry-standard encryption protocols.</p>
              </div>
              <div className="security-card">
                <div className="security-icon">🏢</div>
                <h4>SOC 2 Compliant</h4>
                <p>Our infrastructure meets the highest security standards and is regularly audited.</p>
              </div>
              <div className="security-card">
                <div className="security-icon">🌍</div>
                <h4>GDPR Compliant</h4>
                <p>We fully comply with GDPR and other international privacy regulations.</p>
              </div>
              <div className="security-card">
                <div className="security-icon">🔍</div>
                <h4>Zero Knowledge</h4>
                <p>We cannot read your encrypted conversations even if we wanted to.</p>
              </div>
            </div>
          </div>

          {/* Data Actions */}
          <div className="section">
            <h3>Data Actions</h3>
            <div className="data-actions">
              <div className="action-card">
                <div className="action-info">
                  <h4>Export Your Data</h4>
                  <p>Download a copy of all your data in a portable format</p>
                </div>
                <button className="action-btn export" onClick={exportData}>
                  📥 Export Data
                </button>
              </div>

              <div className="action-card">
                <div className="action-info">
                  <h4>Delete All Data</h4>
                  <p>Permanently delete all your data from our servers</p>
                </div>
                <button className="action-btn delete" onClick={deleteAllData}>
                  🗑️ Delete All Data
                </button>
              </div>
            </div>
          </div>

          {/* Privacy Policy Link */}
          <div className="policy-section">
            <div className="policy-links">
              <a href="#" className="policy-link">📋 Privacy Policy</a>
              <a href="#" className="policy-link">📜 Terms of Service</a>
              <a href="#" className="policy-link">🍪 Cookie Policy</a>
            </div>
            <p className="policy-text">
              Last updated: December 2024. We may update these settings and policies from time to time. 
              We'll notify you of any significant changes.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}