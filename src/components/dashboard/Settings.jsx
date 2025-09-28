import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useCredits } from '../../contexts/CreditsContext'

const PREFERENCES_KEY = 'puma_settings_preferences'
const PROMPTS_KEY = 'puma_prompt_library'
const INTEGRATIONS_KEY = 'puma_settings_integrations'

const STORAGE_KEY = 'puma_ai_chats'
const ACTIVE_CHAT_KEY = 'puma_ai_active_chat'

const defaultPreferences = {
  autoSaveChats: true,
  emailSummaries: false,
  soundEffects: true,
  rememberModel: true,
  experimentalFeatures: false
}

const defaultIntegrations = {
  openai: '',
  slackWebhook: '',
  notionToken: ''
}

const getStoredValue = (key, fallback) => {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return { ...fallback, ...JSON.parse(raw) }
  } catch (error) {
    console.warn(`Failed to parse stored value for ${key}`, error)
    return fallback
  }
}

export default function Settings() {
  const { user, logout } = useAuth()
  const { credits, initializeCredits } = useCredits()

  const [preferences, setPreferences] = useState(() => getStoredValue(PREFERENCES_KEY, defaultPreferences))
  const [integrations, setIntegrations] = useState(() => getStoredValue(INTEGRATIONS_KEY, defaultIntegrations))
  const [promptLibrary, setPromptLibrary] = useState(() => {
    if (typeof window === 'undefined') return []
    try {
      const stored = localStorage.getItem(PROMPTS_KEY)
      const parsed = stored ? JSON.parse(stored) : []
      return Array.isArray(parsed) ? parsed : []
    } catch (error) {
      console.warn('Failed to parse prompt library', error)
      return []
    }
  })
  const [newPrompt, setNewPrompt] = useState({ title: '', body: '' })
  const [feedback, setFeedback] = useState(null)

  useEffect(() => {
    if (!feedback) return
    const timeout = setTimeout(() => setFeedback(null), 3000)
    return () => clearTimeout(timeout)
  }, [feedback])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences))
    }
  }, [preferences])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(INTEGRATIONS_KEY, JSON.stringify(integrations))
    }
  }, [integrations])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(PROMPTS_KEY, JSON.stringify(promptLibrary))
    }
  }, [promptLibrary])

  const togglePreference = (key) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key]
    }))
    setFeedback({ type: 'success', message: 'Preferences updated.' })
  }

  const handlePromptSubmit = (event) => {
    event.preventDefault()
    if (!newPrompt.title.trim() || !newPrompt.body.trim()) return
    const prompt = {
      id: `prompt-${Date.now()}`,
      title: newPrompt.title.trim(),
      body: newPrompt.body.trim()
    }
    setPromptLibrary((prev) => [prompt, ...prev])
    setNewPrompt({ title: '', body: '' })
    setFeedback({ type: 'success', message: 'Prompt saved to your library.' })
  }

  const handleRemovePrompt = (promptId) => {
    setPromptLibrary((prev) => prev.filter((prompt) => prompt.id !== promptId))
  }

  const handleCopyPrompt = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      setFeedback({ type: 'success', message: 'Prompt copied to clipboard.' })
    } catch (error) {
      console.warn('Clipboard copy failed', error)
      setFeedback({ type: 'error', message: 'Copy failed. Try selecting the text manually.' })
    }
  }

  const handleIntegrationChange = (key, value) => {
    setIntegrations((prev) => ({ ...prev, [key]: value }))
  }

  const handleResetWorkspace = () => {
    if (typeof window === 'undefined') return
    if (!window.confirm('Resetting will clear chats, preferences, and credits. Continue?')) return
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(ACTIVE_CHAT_KEY)
    localStorage.removeItem(PREFERENCES_KEY)
    localStorage.removeItem(PROMPTS_KEY)
    localStorage.removeItem(INTEGRATIONS_KEY)
    initializeCredits()
    setPreferences(defaultPreferences)
    setPromptLibrary([])
    setIntegrations(defaultIntegrations)
    setFeedback({ type: 'success', message: 'Workspace reset. Fresh start ready.' })
  }

  const promptCount = useMemo(() => promptLibrary.length, [promptLibrary])

  const preferenceList = [
    {
      key: 'autoSaveChats',
      label: 'Auto-save conversations',
      description: 'Log every assistant exchange to revisit insights and draft documentation later.'
    },
    {
      key: 'emailSummaries',
      label: 'Weekly recap email',
      description: 'Receive highlights of trending prompts, usage stats, and model recommendations.'
    },
    {
      key: 'soundEffects',
      label: 'Sound on assistant reply',
      description: 'Hear a subtle chime when a response is ready so you can stay heads-down.'
    },
    {
      key: 'rememberModel',
      label: 'Remember my last model choice',
      description: 'Automatically load the last-used model when you return to the assistant.'
    },
    {
      key: 'experimentalFeatures',
      label: 'Early access features',
      description: 'Preview experimental tooling before it ships to everyone.'
    }
  ]

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
            <span className="user-name">{user?.name || 'Innovator'}</span>
            <button onClick={logout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="settings-layout">
        <div className="page-header">
          <Link to="/dashboard" className="back-btn">
            ← Back to Dashboard
          </Link>
          <div>
            <h1 className="page-title">⚙️ Workspace settings</h1>
            <p className="page-subtitle">Tune PumaAI to your workflow, integrations, and knowledge base.</p>
          </div>
        </div>

        {feedback && (
          <div className={`feedback-banner ${feedback.type}`}>
            {feedback.message}
          </div>
        )}

        <section className="settings-grid">
          <article className="settings-card glass-panel">
            <h2>Account overview</h2>
            <div className="settings-meta">
              <div>
                <span className="settings-label">Name</span>
                <p className="settings-value">{user?.name || '—'}</p>
              </div>
              <div>
                <span className="settings-label">Email</span>
                <p className="settings-value">{user?.email || '—'}</p>
              </div>
              <div>
                <span className="settings-label">Credits</span>
                <p className="settings-value">{credits?.toLocaleString() || 0}</p>
              </div>
            </div>
            <p className="settings-helper">Invite teammates by sharing your prompts and playbooks below.</p>
          </article>

          <article className="settings-card glass-panel">
            <h2>Assistant preferences</h2>
            <ul className="toggle-list">
              {preferenceList.map((item) => (
                <li key={item.key} className="toggle-row">
                  <div>
                    <p className="toggle-title">{item.label}</p>
                    <p className="toggle-description">{item.description}</p>
                  </div>
                  <button
                    type="button"
                    className={`toggle ${preferences[item.key] ? 'active' : ''}`}
                    onClick={() => togglePreference(item.key)}
                  >
                    <span className="toggle-indicator" />
                  </button>
                </li>
              ))}
            </ul>
          </article>

          <article className="settings-card glass-panel">
            <h2>Prompt library</h2>
            <p className="settings-helper">
              Capture your best prompts, onboarding checklists, and QA scenarios. {promptCount} saved.
            </p>
            <form className="prompt-form" onSubmit={handlePromptSubmit}>
              <div className="form-field">
                <label htmlFor="prompt-title">Title</label>
                <input
                  id="prompt-title"
                  value={newPrompt.title}
                  onChange={(event) => setNewPrompt((prev) => ({ ...prev, title: event.target.value }))}
                  placeholder="e.g. Launch announcement brief"
                />
              </div>
              <div className="form-field">
                <label htmlFor="prompt-body">Prompt</label>
                <textarea
                  id="prompt-body"
                  rows={3}
                  value={newPrompt.body}
                  onChange={(event) => setNewPrompt((prev) => ({ ...prev, body: event.target.value }))}
                  placeholder="Add context, goals, and success criteria..."
                />
              </div>
              <button type="submit" className="primary-action" disabled={!newPrompt.title.trim() || !newPrompt.body.trim()}>
                Save prompt
              </button>
            </form>

            <div className="prompt-list">
              {promptLibrary.length === 0 && <p className="settings-helper">No prompts yet. Start by saving your go-to instructions.</p>}
              {promptLibrary.map((prompt) => (
                <div key={prompt.id} className="prompt-item">
                  <div>
                    <h4>{prompt.title}</h4>
                    <p>{prompt.body}</p>
                  </div>
                  <div className="prompt-actions">
                    <button
                      type="button"
                      className="ghost-action"
                      onClick={() => handleCopyPrompt(prompt.body)}
                    >
                      Copy
                    </button>
                    <button type="button" className="ghost-action" onClick={() => handleRemovePrompt(prompt.id)}>
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="settings-card glass-panel">
            <h2>Integrations</h2>
            <p className="settings-helper">Securely connect the tools you rely on every day.</p>
            <div className="integration-grid">
              <div className="form-field">
                <label htmlFor="openai-key">OpenAI API key</label>
                <input
                  id="openai-key"
                  value={integrations.openai}
                  onChange={(event) => handleIntegrationChange('openai', event.target.value)}
                  placeholder="sk-************************"
                />
              </div>
              <div className="form-field">
                <label htmlFor="slack-webhook">Slack webhook</label>
                <input
                  id="slack-webhook"
                  value={integrations.slackWebhook}
                  onChange={(event) => handleIntegrationChange('slackWebhook', event.target.value)}
                  placeholder="https://hooks.slack.com/..."
                />
              </div>
              <div className="form-field">
                <label htmlFor="notion-token">Notion token</label>
                <input
                  id="notion-token"
                  value={integrations.notionToken}
                  onChange={(event) => handleIntegrationChange('notionToken', event.target.value)}
                  placeholder="secret_xxxx"
                />
              </div>
            </div>
            <p className="settings-helper">
              Keys are stored locally for demo purposes. In production, connect to your secrets vault.
            </p>
          </article>
        </section>

        <section className="danger-zone glass-panel">
          <div>
            <h2>Danger zone</h2>
            <p>Need a clean slate? Resetting clears chats, preferences, and resets your demo credits.</p>
          </div>
          <button type="button" className="danger-btn" onClick={handleResetWorkspace}>
            Reset workspace
          </button>
        </section>
      </main>
    </div>
  )
}