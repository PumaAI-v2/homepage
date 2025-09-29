import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useCredits } from '../../contexts/CreditsContext'

export default function UsageStats() {
  const { user, logout } = useAuth()
  const { credits } = useCredits()
  const [stats] = useState({
    totalRequests: 1247,
    successfulRequests: 1189,
    failedRequests: 58,
    averageResponseTime: 1.2,
    creditsUsed: 2850,
    favoriteModel: 'GPT-4',
    totalTokens: 45280,
    monthlyUsage: [
      { month: 'Jan', requests: 180, credits: 420 },
      { month: 'Feb', requests: 220, credits: 520 },
      { month: 'Mar', requests: 195, credits: 465 },
      { month: 'Apr', requests: 260, credits: 615 },
      { month: 'May', requests: 240, credits: 580 },
      { month: 'Jun', requests: 152, credits: 250 }
    ]
  })

  const [selectedPeriod, setSelectedPeriod] = useState('6months')

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
          <h1 className="page-title">📊 Usage Statistics</h1>
          <p className="page-subtitle">Monitor your API usage and performance metrics</p>
        </div>

        <div className="stats-container">
          {/* Overview Cards */}
          <div className="stats-grid">
            <div className="stat-card primary-stat">
              <div className="stat-icon">🎯</div>
              <div className="stat-content">
                <h3>Total Requests</h3>
                <div className="stat-number">{stats.totalRequests.toLocaleString()}</div>
                <span className="stat-change positive">+12% from last month</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <h3>Success Rate</h3>
                <div className="stat-number">{((stats.successfulRequests / stats.totalRequests) * 100).toFixed(1)}%</div>
                <span className="stat-change positive">+2.3% improvement</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">⚡</div>
              <div className="stat-content">
                <h3>Avg Response Time</h3>
                <div className="stat-number">{stats.averageResponseTime}s</div>
                <span className="stat-change positive">-0.3s faster</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">💎</div>
              <div className="stat-content">
                <h3>Credits Used</h3>
                <div className="stat-number">{stats.creditsUsed.toLocaleString()}</div>
                <span className="stat-change neutral">This month</span>
              </div>
            </div>
          </div>

          {/* Usage Chart */}
          <div className="chart-section">
            <div className="chart-header">
              <h3>Usage Trends</h3>
              <div className="period-selector">
                <button 
                  className={selectedPeriod === '30days' ? 'active' : ''}
                  onClick={() => setSelectedPeriod('30days')}
                >
                  30 Days
                </button>
                <button 
                  className={selectedPeriod === '6months' ? 'active' : ''}
                  onClick={() => setSelectedPeriod('6months')}
                >
                  6 Months
                </button>
                <button 
                  className={selectedPeriod === '1year' ? 'active' : ''}
                  onClick={() => setSelectedPeriod('1year')}
                >
                  1 Year
                </button>
              </div>
            </div>

            <div className="chart-container">
              <div className="chart-placeholder">
                <div className="chart-bars">
                  {stats.monthlyUsage.map((month) => (
                    <div key={month.month} className="chart-bar-group">
                      <div className="chart-bar-label">{month.month}</div>
                      <div className="chart-bars-container">
                        <div 
                          className="chart-bar requests" 
                          style={{ height: `${(month.requests / 300) * 100}%` }}
                          title={`${month.requests} requests`}
                        ></div>
                        <div 
                          className="chart-bar credits" 
                          style={{ height: `${(month.credits / 700) * 100}%` }}
                          title={`${month.credits} credits`}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="chart-legend">
                  <div className="legend-item">
                    <div className="legend-color requests"></div>
                    <span>Requests</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color credits"></div>
                    <span>Credits Used</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div className="breakdown-section">
            <div className="breakdown-grid">
              <div className="breakdown-card">
                <h3>Model Usage</h3>
                <div className="usage-list">
                  <div className="usage-item">
                    <span className="model-name">GPT-4</span>
                    <div className="usage-bar">
                      <div className="usage-fill" style={{width: '65%'}}></div>
                    </div>
                    <span className="usage-percent">65%</span>
                  </div>
                  <div className="usage-item">
                    <span className="model-name">GPT-3.5 Turbo</span>
                    <div className="usage-bar">
                      <div className="usage-fill" style={{width: '25%'}}></div>
                    </div>
                    <span className="usage-percent">25%</span>
                  </div>
                  <div className="usage-item">
                    <span className="model-name">Claude 3</span>
                    <div className="usage-bar">
                      <div className="usage-fill" style={{width: '10%'}}></div>
                    </div>
                    <span className="usage-percent">10%</span>
                  </div>
                </div>
              </div>

              <div className="breakdown-card">
                <h3>Response Times</h3>
                <div className="metrics-list">
                  <div className="metric-item">
                    <span className="metric-label">Fastest</span>
                    <span className="metric-value">0.2s</span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">Average</span>
                    <span className="metric-value">{stats.averageResponseTime}s</span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">Slowest</span>
                    <span className="metric-value">8.5s</span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">95th Percentile</span>
                    <span className="metric-value">3.2s</span>
                  </div>
                </div>
              </div>

              <div className="breakdown-card">
                <h3>Error Analysis</h3>
                <div className="error-stats">
                  <div className="error-item">
                    <span className="error-type">Rate Limit</span>
                    <span className="error-count">32</span>
                  </div>
                  <div className="error-item">
                    <span className="error-type">Timeout</span>
                    <span className="error-count">15</span>
                  </div>
                  <div className="error-item">
                    <span className="error-type">Invalid Request</span>
                    <span className="error-count">8</span>
                  </div>
                  <div className="error-item">
                    <span className="error-type">Other</span>
                    <span className="error-count">3</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}