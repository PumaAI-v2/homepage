import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useCredits } from '../../contexts/CreditsContext'
import BillingService from '../../services/billing'

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)

const formatCredits = (value) => Number(value || 0).toLocaleString()

export default function Billing() {
  const { user, logout } = useAuth()
  const { credits, transactions = [], purchaseCredits } = useCredits()

  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [status, setStatus] = useState(null)

  const packages = useMemo(() => BillingService.getCreditPackages(), [])

  const totals = useMemo(() => {
    const purchased = transactions
      .filter((tx) => tx.type === 'purchase')
      .reduce((sum, tx) => sum + tx.amount, 0)

    const spent = transactions
      .filter((tx) => tx.type === 'usage')
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0)

    const bonuses = transactions
      .filter((tx) => tx.type === 'bonus')
      .reduce((sum, tx) => sum + tx.amount, 0)

    return {
      purchased,
      spent,
      bonuses
    }
  }, [transactions])

  const handlePurchase = async (pkg) => {
    if (!pkg) return
    setStatus(null)
    setSelectedPackage(pkg.id)
    setIsProcessing(true)
    try {
      await purchaseCredits(pkg.id)
      setStatus({
        type: 'success',
        message: `Success! ${pkg.credits.toLocaleString()} credits were added to your balance.`
      })
    } catch (error) {
      setStatus({
        type: 'error',
        message: error?.message || 'We could not complete the purchase. Please try again.'
      })
    } finally {
      setIsProcessing(false)
      setSelectedPackage(null)
    }
  }

  const handleLogout = () => logout()

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
              <span className="credits-amount">{formatCredits(credits)}</span>
              <span className="credits-label">credits</span>
            </div>
            <span className="user-name">{user?.name || 'Innovator'}</span>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="billing-layout">
        <div className="billing-header">
          <h1>Level up your PumaAI runway</h1>
          <p>Select the plan that fits your workflow, track trends, and keep your team unblocked.</p>
        </div>

        <section className="credits-balance-card glass-panel">
          <div className="balance-content">
            <div className="balance-main">
              <span className="balance-label">Current balance</span>
              <span className="balance-amount">{formatCredits(credits)} credits</span>
              <span className="balance-status">
                {totals.spent === 0
                  ? 'Ready for liftoff — no credits consumed yet.'
                  : `${formatCredits(totals.spent)} credits used to date • ${formatCredits(
                      totals.purchased
                    )} credits purchased`}
              </span>
            </div>
            <div className="balance-icon">🚀</div>
          </div>
        </section>

        {status && (
          <div className={`purchase-status ${status.type}`}>
            <span>{status.message}</span>
          </div>
        )}

        <section className="billing-section">
          <div className="section-heading">
            <h2>Choose a credit pack</h2>
            <p>Scale from prototype to production with transparent pricing and automatic invoicing.</p>
          </div>

          <div className="packages-grid">
            {packages.map((pkg) => (
              <article
                key={pkg.id}
                className={`package-card ${pkg.popular ? 'popular' : ''} ${pkg.badge ? 'mega' : ''}`}
              >
                {pkg.badge && <span className="package-badge">{pkg.badge}</span>}
                {pkg.popular && <span className="package-badge popular">Most loved</span>}
                <h3>{pkg.name}</h3>
                <p className="package-price">{formatCurrency(pkg.price)}</p>
                <p className="package-credits">{pkg.credits.toLocaleString()} credits</p>
                <p className="package-description">{pkg.description}</p>
                <ul className="package-benefits">
                  <li>Effective rate {formatCurrency(pkg.costPerCredit)}</li>
                  <li>{pkg.savings || 'Standard pricing'}</li>
                  <li>Instant availability after purchase</li>
                </ul>
                <button
                  type="button"
                  className="purchase-btn"
                  disabled={isProcessing && selectedPackage === pkg.id}
                  onClick={() => handlePurchase(pkg)}
                >
                  {isProcessing && selectedPackage === pkg.id ? 'Processing…' : 'Purchase credits'}
                </button>
              </article>
            ))}
          </div>

          <div className="value-comparison">
            <div className="comparison-card">
              <h3>Compare the value</h3>
              <div className="value-grid">
                <div className="value-item">
                  <span className="value-number">{formatCredits(totals.purchased)}</span>
                  <span className="value-label">Credits acquired to date</span>
                </div>
                <div className="value-item">
                  <span className="value-number">{formatCredits(totals.spent)}</span>
                  <span className="value-label">Credits invested in automation</span>
                </div>
                <div className="value-item">
                  <span className="value-number">{formatCredits(totals.bonuses)}</span>
                  <span className="value-label">Bonus credits earned</span>
                </div>
              </div>
              <div className="savings-highlight">
                <p>Tip: Teams saving 40%+ combine the Business pack with automatic top-ups.</p>
                <p>
                  Unlock enterprise invoicing? <Link to="/dashboard/help">Talk to sales</Link>
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="billing-section">
          <div className="section-heading">
            <h2>Model costs at a glance</h2>
            <p>Every plan includes access to our optimised model routing with per-message credit pricing.</p>
          </div>
          <div className="model-costs">
            {Object.entries(BillingService.getModelCosts()).map(([key, model]) => (
              <article key={key} className="model-cost-card">
                <div className="model-info">
                  <h3>{model.name}</h3>
                  <p>{model.description}</p>
                </div>
                <div className="model-cost">
                  <span className="cost-amount">{model.creditsPerMessage}</span>
                  <span className="cost-unit">credits per message</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="billing-section">
          <div className="section-heading">
            <h2>Transaction history</h2>
            <p>Keep finance happy with a clear audit trail of usage, purchases, and bonuses.</p>
          </div>

          <div className="transactions-list">
            {transactions.length === 0 && (
              <div className="no-transactions">
                No activity yet. Your welcome credits are ready whenever you are.
              </div>
            )}
            {transactions.map((tx) => (
              <div key={tx.id} className="transaction-item">
                <div className="transaction-icon">
                  {tx.type === 'purchase' ? '💳' : tx.type === 'usage' ? '🧠' : '🎁'}
                </div>
                <div className="transaction-details">
                  <div className="transaction-description">{tx.description}</div>
                  <div className="transaction-date">
                    {new Date(tx.timestamp).toLocaleString()}
                  </div>
                </div>
                <div
                  className={`transaction-amount ${tx.amount >= 0 ? 'positive' : 'negative'}`}
                >
                  {tx.amount >= 0 ? '+' : '-'}{formatCredits(Math.abs(tx.amount))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="billing-section">
          <div className="section-heading">
            <h2>Optimise credit efficiency</h2>
            <p>Small playbook changes compound into serious savings over time.</p>
          </div>
          <div className="usage-tips">
            <article className="tip-card">
              <h3>Enable smart routing</h3>
              <p>Automatically promote high-impact prompts to GPT-4 Turbo while routine tasks stay on GPT-3.5.</p>
            </article>
            <article className="tip-card">
              <h3>Add guardrails</h3>
              <p>Set per-project credit limits to prevent runaway testing and keep experiments on budget.</p>
            </article>
            <article className="tip-card">
              <h3>Schedule top-ups</h3>
              <p>Enable auto top-ups so production flows never stall and invoices consolidate monthly.</p>
            </article>
          </div>
        </section>
      </main>
    </div>
  )
}