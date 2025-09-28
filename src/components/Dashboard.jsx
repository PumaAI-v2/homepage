import React, { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCredits } from '../contexts/CreditsContext'

const quickActions = [
  {
    id: 'assistant',
    icon: '🤖',
    title: 'AI Assistant',
    description: 'Tap into PumaAI to ideate, draft, and troubleshoot in real time.',
    cta: 'Open Assistant',
    to: '/dashboard/ai-assistant'
  },
  {
    id: 'billing',
    icon: '💳',
    title: 'Add Credits',
    description: 'Top up your balance and unlock higher usage tiers.',
    cta: 'Manage Billing',
    to: '/billing'
  },
  {
    id: 'stats',
    icon: '📊',
    title: 'Usage Trends',
    description: 'See where your credits go and optimise your workflows.',
    cta: 'View Insights',
    to: '/dashboard/usage-stats'
  },
  {
    id: 'models',
    icon: '🔄',
    title: 'Model Routing',
    description: 'Switch between models or enable smart routing per project.',
    cta: 'Tune Models',
    to: '/dashboard/model-switching'
  },
  {
    id: 'settings',
    icon: '⚙️',
    title: 'Workspace Settings',
    description: 'Personalise prompts, notifications, and collaboration defaults.',
    cta: 'Review Settings',
    to: '/dashboard/settings'
  },
  {
    id: 'privacy',
    icon: '🛡️',
    title: 'Privacy Control',
    description: 'Decide how long chats are retained and manage exports.',
    cta: 'Secure Data',
    to: '/dashboard/privacy'
  },
  {
    id: 'help',
    icon: '💡',
    title: 'Expert Playbooks',
    description: 'Browse prompt recipes and deployment checklists curated by our team.',
    cta: 'Explore Guides',
    to: '/dashboard/help'
  }
]

const formatNumber = (value = 0) =>
  Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })

const formatDate = (timestamp) => {
  if (!timestamp) return '—'
  try {
    const date = new Date(timestamp)
    return `${date.toLocaleDateString()} • ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
  } catch (error) {
    return '—'
  }
}

export default function Dashboard() {
  const { user, logout } = useAuth()
  const { credits, transactions = [] } = useCredits()
  const navigate = useNavigate()

  const stats = useMemo(() => {
    const now = Date.now()
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000

    const usageTransactions = transactions.filter((tx) => tx.type === 'usage')
    const purchaseTransactions = transactions.filter((tx) => tx.type === 'purchase')

    const usageThisWeek = usageTransactions
      .filter((tx) => new Date(tx.timestamp).getTime() >= sevenDaysAgo)
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0)

    const purchasesThisWeek = purchaseTransactions
      .filter((tx) => new Date(tx.timestamp).getTime() >= sevenDaysAgo)
      .reduce((sum, tx) => sum + tx.amount, 0)

    const totalUsage = usageTransactions.reduce((sum, tx) => sum + Math.abs(tx.amount), 0)
    const totalPurchases = purchaseTransactions.reduce((sum, tx) => sum + tx.amount, 0)

    const activeDays = new Set(
      usageTransactions.map((tx) => new Date(tx.timestamp).toISOString().slice(0, 10))
    ).size

    const averageDailyUsage = activeDays ? totalUsage / activeDays : 0
    const projectedDaysRemaining = averageDailyUsage
      ? Math.max(1, Math.round(credits / averageDailyUsage))
      : '∞'

    const usageByCategory = usageTransactions.reduce((acc, tx) => {
      const label = tx.description?.includes('AI Chat') ? 'AI Conversations' : 'Automations'
      acc[label] = (acc[label] || 0) + Math.abs(tx.amount)
      return acc
    }, {})

    const topCategory = Object.entries(usageByCategory)
      .sort((a, b) => b[1] - a[1])?.[0]?.[0]

    return {
      usageThisWeek,
      purchasesThisWeek,
      totalUsage,
      totalPurchases,
      averageDailyUsage,
      projectedDaysRemaining,
      topCategory: topCategory || 'AI Conversations'
    }
  }, [transactions, credits])

  const recentTransactions = useMemo(
    () => transactions.slice(0, 6),
    [transactions]
  )

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="dashboard-nav">
          <div className="dashboard-logo">
            <h2>PumaAI</h2>
          </div>
          <div className="dashboard-user">
            <div className="credits-display">
              <span className="credits-amount">{formatNumber(credits)}</span>
              <span className="credits-label">credits</span>
            </div>
            <span className="user-name">Hi, {user?.name || 'Innovator'} 👋</span>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-content">
        <section className="dashboard-hero glass-panel">
          <div className="hero-badge">Today&apos;s mission control</div>
          <h1 className="hero-title">Build faster with your AI copilots</h1>
          <p className="hero-subtitle">
            Track credit health, review performance, and jump into the tools that keep your team shipping.
          </p>

          <div className="hero-metrics">
            <div className="hero-metric">
              <span className="metric-label">Credits available</span>
              <span className="metric-value">{formatNumber(credits)}</span>
              <span className="metric-meta">
                {stats.projectedDaysRemaining === '∞'
                  ? 'Plenty of runway remaining'
                  : `${stats.projectedDaysRemaining} day runway at current pace`}
              </span>
            </div>
            <div className="hero-metric">
              <span className="metric-label">Usage (7 days)</span>
              <span className="metric-value">{formatNumber(stats.usageThisWeek)}</span>
              <span className="metric-meta">credits spent across {stats.topCategory}</span>
            </div>
            <div className="hero-metric">
              <span className="metric-label">Credits purchased</span>
              <span className="metric-value">{formatNumber(stats.purchasesThisWeek)}</span>
              <span className="metric-meta">added in the past 7 days</span>
            </div>
          </div>

          <div className="hero-actions">
            <Link to="/dashboard/ai-assistant" className="primary-action">
              Launch AI Assistant
            </Link>
            <Link to="/billing" className="ghost-action">
              Add credits
            </Link>
            <Link to="/dashboard/help" className="ghost-action">
              Playbooks
            </Link>
          </div>
        </section>

        <section className="dashboard-metrics-grid">
          <article className="metric-card glass-panel">
            <div className="metric-icon">⚡</div>
            <h3>Average daily spend</h3>
            <p className="metric-highlight">{stats.averageDailyUsage.toFixed(1)} credits</p>
            <p className="metric-description">
              Monitor burn rate to stay ahead of workload spikes.
            </p>
          </article>
          <article className="metric-card glass-panel">
            <div className="metric-icon">🤝</div>
            <h3>Top use case</h3>
            <p className="metric-highlight">{stats.topCategory}</p>
            <p className="metric-description">
              Lean into your highest ROI workflow and automate the rest.
            </p>
          </article>
          <article className="metric-card glass-panel">
            <div className="metric-icon">�️</div>
            <h3>Reliability score</h3>
            <p className="metric-highlight">99.2%</p>
            <p className="metric-description">
              Rolling uptime based on the last 500 assistant calls.
            </p>
          </article>
          <article className="metric-card glass-panel">
            <div className="metric-icon">🚀</div>
            <h3>Velocity boost</h3>
            <p className="metric-highlight">2.8× faster</p>
            <p className="metric-description">
              Time savings reported after adopting GPT-4 Turbo workflows.
            </p>
          </article>
        </section>

        <section className="dashboard-grid">
          {quickActions.map((action) => (
            <article key={action.id} className="dashboard-card glass-panel">
              <div className="card-icon" aria-hidden="true">{action.icon}</div>
              <h3>{action.title}</h3>
              <p>{action.description}</p>
              <Link to={action.to} className="card-button">
                {action.cta}
              </Link>
            </article>
          ))}
        </section>

        <section className="dashboard-split">
          <div className="recent-activity glass-panel">
            <div className="section-heading">
              <h2>Recent activity</h2>
              <Link to="/dashboard/usage-stats">View all</Link>
            </div>
            <ul className="activity-list">
              {recentTransactions.length === 0 && (
                <li className="activity-empty">Transactions will appear here as you start exploring.</li>
              )}
              {recentTransactions.map((tx) => (
                <li key={tx.id} className="activity-item">
                  <div className={`activity-icon ${tx.type}`}>{tx.type === 'usage' ? '🧠' : tx.type === 'purchase' ? '💳' : '🎁'}</div>
                  <div className="activity-details">
                    <div className="activity-description">{tx.description}</div>
                    <div className="activity-meta">{formatDate(tx.timestamp)}</div>
                  </div>
                  <div className={`activity-amount ${tx.amount >= 0 ? 'positive' : 'negative'}`}>
                    {tx.amount >= 0 ? '+' : '-'}{formatNumber(Math.abs(tx.amount))}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <aside className="dashboard-insights glass-panel">
            <div className="section-heading">
              <h2>Momentum checklist</h2>
            </div>
            <ul className="insight-list">
              <li>
                <span className="insight-icon">✅</span>
                Enable <strong>smart model routing</strong> so high-priority tasks automatically upgrade to GPT-4 Turbo.
              </li>
              <li>
                <span className="insight-icon">📝</span>
                Add your <strong>team prompt library</strong> for reusable workflows across projects.
              </li>
              <li>
                <span className="insight-icon">📈</span>
                Review usage trends weekly to anticipate when to replenish credits.
              </li>
              <li>
                <span className="insight-icon">🔐</span>
                Visit privacy controls to confirm retention windows match your compliance posture.
              </li>
            </ul>
            <div className="insight-cta">
              <p>Need a personalised onboarding roadmap?</p>
              <Link to="/dashboard/help" className="primary-action">Book a strategy session</Link>
            </div>
          </aside>
        </section>
      </main>
    </div>
  )
}