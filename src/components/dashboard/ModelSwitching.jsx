import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useCredits } from '../../contexts/CreditsContext'

export default function ModelSwitching() {
  const { user, logout } = useAuth()
  const { credits } = useCredits()
  
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
          <p className="page-subtitle">Switch between AI models</p>
        </div>

        <div style={{ padding: '20px', color: 'white' }}>
          <h3>Model Switching Page</h3>
          <p>Model Switching component is working!</p>
        </div>
      </main>
    </div>
  )
}