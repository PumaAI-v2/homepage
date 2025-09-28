import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useCredits } from '../../contexts/CreditsContext'
import OpenAIService from '../../services/openai'
import BillingService from '../../services/billing'

const STORAGE_KEY = 'puma_ai_chats'
const ACTIVE_CHAT_KEY = 'puma_ai_active_chat'
const DEFAULT_MODEL_KEY = 'puma_ai_default_model'
const PREFERENCES_KEY = 'puma_settings_preferences'
const PROMPTS_KEY = 'puma_prompt_library'

const defaultPreferences = {
  autoSaveChats: true,
  emailSummaries: false,
  soundEffects: true,
  rememberModel: true,
  experimentalFeatures: false
}

const modelCatalog = BillingService.getModelCosts()

const toneVariants = [
  {
    id: 'concise',
    label: 'Concise',
    description: 'Trim to essentials',
    instruction:
      'Rewrite the assistant response so it is approximately 30% shorter while preserving all key facts. Use crisp bullet points where it improves clarity.'
  },
  {
    id: 'friendly',
    label: 'Warmer',
    description: 'Soften tone',
    instruction:
      'Rewrite the assistant response in a warm, encouraging, and supportive tone while keeping all original information intact.'
  },
  {
    id: 'executive',
    label: 'Executive',
    description: 'C-suite recap',
    instruction:
      'Rewrite the assistant response as a brief executive summary with numbered next steps and clear ownership for each action.'
  }
]

const quickPrompts = [
  {
    id: 'roadmap',
    emoji: '🧭',
    headline: 'Ship a roadmap',
    prompt:
      'We need a six-week roadmap for a SaaS launch. Outline milestones, responsible roles, and the AI assist each sprint.'
  },
  {
    id: 'brief',
    emoji: '📝',
    headline: 'Polish a brief',
    prompt:
      'Transform these bullet notes into a concise product brief with positioning, target users, and success metrics.'
  },
  {
    id: 'analysis',
    emoji: '🔍',
    headline: 'Analyse feedback',
    prompt:
      'Review this customer transcript and surface the top 5 friction points with recommended fixes ranked by impact.'
  },
  {
    id: 'debug',
    emoji: '🛠️',
    headline: 'Debug an issue',
    prompt:
      'We are seeing degraded performance in our inference pipeline. Diagnose likely causes and suggest mitigations.'
  },
  {
    id: 'retro',
    emoji: '🧾',
    headline: 'Retro recap',
    prompt:
      'Turn this sprint retro into a punchy recap with wins, blockers, and two focus bets for next week.'
  },
  {
    id: 'email',
    emoji: '✉️',
    headline: 'Write the email',
    prompt:
      'Draft a launch email for our beta waitlist. Highlight the new value props and include a compelling CTA.'
  }
]

const proTips = [
  {
    icon: '✨',
    text: 'Use <command> + / to ask PumaAI for alternative phrasings or stress tests on any reply.'
  },
  {
    icon: '🧠',
    text: 'Save strong prompts as snippets in Settings → Prompt Library to share with your team.'
  },
  {
    icon: '📎',
    text: 'Attach context (links, bullet notes) before asking for a summary to get tailored answers.'
  },
  {
    icon: '🕒',
    text: 'Enable auto-save to capture the best chats for later review and knowledge base entries.'
  },
  {
    icon: '⭐',
    text: 'Pin your go-to threads and filter to them instantly from the sidebar.'
  },
  {
    icon: '⇧',
    text: 'Shift-click any quick prompt to run it instantly. A regular click just stages it in the composer.'
  }
]

const createWelcomeChat = (userName) => {
  const createdAt = new Date().toISOString()
  return {
    id: `chat-${Date.now()}`,
    title: 'Getting started',
    createdAt,
    lastActivity: createdAt,
    pinned: false,
    messages: [
      {
        id: `msg-${Date.now()}`,
        type: 'bot',
        content: `Welcome${userName ? `, ${userName}` : ''}! I can help brainstorm, summarise research, write copy, and code review. Let me know what you need.`,
        timestamp: createdAt
      }
    ]
  }
}

const createFreshChat = (userName) => {
  const createdAt = new Date().toISOString()
  return {
    id: `chat-${Date.now()}`,
    title: 'New brainstorm',
    createdAt,
    lastActivity: createdAt,
    pinned: false,
    messages: []
  }
}

const normaliseChat = (chat) => {
  if (!chat) return null
  const safeMessages = Array.isArray(chat.messages)
    ? chat.messages.map((message) => ({
        ...message,
        id: message.id || `msg-${crypto.randomUUID?.() || Date.now()}`,
        timestamp: message.timestamp || new Date().toISOString()
      }))
    : []

  const lastActivity =
    chat.lastActivity ||
    safeMessages[safeMessages.length - 1]?.timestamp ||
    chat.createdAt ||
    new Date().toISOString()

  return {
    id: chat.id || `chat-${crypto.randomUUID?.() || Date.now()}`,
    title: chat.title || 'Conversation',
    createdAt: chat.createdAt || lastActivity,
    lastActivity,
    pinned: Boolean(chat.pinned),
    messages: safeMessages
  }
}

const loadChats = (userName) => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed) && parsed.length) {
        const mapped = parsed.map(normaliseChat).filter(Boolean)
        if (mapped.length) return mapped
      }
    }
  } catch (error) {
    console.warn('Failed to parse stored chats', error)
  }
  return [createWelcomeChat(userName)]
}

const formatTime = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const formatRelativeTime = (timestamp) => {
  if (!timestamp) return ''
  const diff = Date.now() - new Date(timestamp).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes} min${minutes === 1 ? '' : 's'} ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hr${hours === 1 ? '' : 's'} ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`
  return new Date(timestamp).toLocaleDateString()
}

export default function AIAssistant() {
  const { user, logout } = useAuth()
  const {
    credits,
    canAffordMessage,
    getMessageCost,
    useCredits
  } = useCredits()

  const userName = user?.name || 'there'
  const initialChatsRef = useRef(null)
  if (!initialChatsRef.current && typeof window !== 'undefined') {
    initialChatsRef.current = loadChats(userName)
  }

  const [chats, setChats] = useState(initialChatsRef.current || [createWelcomeChat(userName)])
  const [activeChatId, setActiveChatId] = useState(() => {
    if (typeof window === 'undefined') return chats[0]?.id
    return localStorage.getItem(ACTIVE_CHAT_KEY) || chats[0]?.id
  })
  const [selectedModel, setSelectedModel] = useState(() => {
    if (typeof window === 'undefined') return 'gpt-3.5-turbo'
    return localStorage.getItem(DEFAULT_MODEL_KEY) || 'gpt-3.5-turbo'
  })
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [autoScroll, setAutoScroll] = useState(true)
  const [errorState, setErrorState] = useState(null)
  const messagesEndRef = useRef(null)

  const activeChat = useMemo(() => {
    return chats.find((chat) => chat.id === activeChatId) || chats[0]
  }, [chats, activeChatId])

  const messageCost = getMessageCost(selectedModel)
  const estimatedMessagesRemaining = messageCost ? Math.floor(credits / messageCost) : credits

  useEffect(() => {
    if (!chats.length) {
      const fallback = createWelcomeChat(userName)
      setChats([fallback])
      setActiveChatId(fallback.id)
    }
  }, [chats.length, userName])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(chats))
    }
  }, [chats])

  useEffect(() => {
    if (activeChatId && typeof window !== 'undefined') {
      localStorage.setItem(ACTIVE_CHAT_KEY, activeChatId)
    }
  }, [activeChatId])
  const [preferences, setPreferences] = useState(defaultPreferences)
  const [promptLibrary, setPromptLibrary] = useState([])
  const [chatFilter, setChatFilter] = useState('')
  const [showPinnedOnly, setShowPinnedOnly] = useState(false)
  const [isSummarizing, setIsSummarizing] = useState(false)
  const [regeneratingMessageId, setRegeneratingMessageId] = useState(null)
  const [rewritingMessageId, setRewritingMessageId] = useState(null)
  const [clipboardNotice, setClipboardNotice] = useState(null)

  const inputRef = useRef(null)
  const audioContextRef = useRef(null)
  useEffect(() => {
    if (typeof window !== 'undefined') {
    return chats.find((chat) => chat.id === activeChatId) || chats[0]
  }, [chats, activeChatId])

  const messageCost = useMemo(() => getMessageCost(selectedModel), [selectedModel, getMessageCost])
  const estimatedMessagesRemaining = messageCost ? Math.floor(credits / Math.max(messageCost, 1)) : credits

  const pinnedCount = useMemo(() => chats.filter((chat) => chat.pinned).length, [chats])

  const filteredChats = useMemo(() => {
    const searchTerm = chatFilter.trim().toLowerCase()
    const candidate = showPinnedOnly ? chats.filter((chat) => chat.pinned) : chats

    const searched = !searchTerm
      ? candidate
      : candidate.filter((chat) => {
          const inTitle = chat.title.toLowerCase().includes(searchTerm)
          const inMessages = chat.messages?.some((message) =>
            message.content?.toLowerCase().includes(searchTerm)
          )
          return inTitle || inMessages
        })

    return [...searched].sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
      return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
    })
  }, [chats, chatFilter, showPinnedOnly])

  const savedPromptChips = useMemo(() => promptLibrary.slice(0, 6), [promptLibrary])

  const latestAssistantMessage = useMemo(() => {
    if (!activeChat?.messages?.length) return null
    for (let index = activeChat.messages.length - 1; index >= 0; index -= 1) {
      const message = activeChat.messages[index]
      if (message.type === 'bot') return message
    }
    return null
  }, [activeChat])
    if (autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [activeChat?.messages, isTyping, autoScroll])

  const handleModelChange = (event) => {
    setSelectedModel(event.target.value)
  }

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const storedPreferences = localStorage.getItem(PREFERENCES_KEY)
      if (storedPreferences) {
        const parsed = JSON.parse(storedPreferences)
        setPreferences((prev) => ({ ...prev, ...parsed }))
      }
    } catch (error) {
      console.warn('Failed to parse stored preferences', error)
    }

    try {
      const storedPrompts = localStorage.getItem(PROMPTS_KEY)
      if (storedPrompts) {
        const parsed = JSON.parse(storedPrompts)
        if (Array.isArray(parsed)) {
          setPromptLibrary(parsed)
        }
      }
    } catch (error) {
      console.warn('Failed to parse prompt library', error)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const handleStorage = (event) => {
      if (event.key === PREFERENCES_KEY && event.newValue) {
        try {
          const next = JSON.parse(event.newValue)
          setPreferences((prev) => ({ ...prev, ...next }))
        } catch (error) {
          console.warn('Failed to sync preferences', error)
        }
      }
      if (event.key === PROMPTS_KEY) {
        try {
          const parsed = event.newValue ? JSON.parse(event.newValue) : []
          if (Array.isArray(parsed)) setPromptLibrary(parsed)
        } catch (error) {
          console.warn('Failed to sync prompt library', error)
        }
      }
    }

    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const handleCreateChat = () => {
    if (typeof window === 'undefined') return
    if (preferences.autoSaveChats) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(chats))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [chats, preferences.autoSaveChats])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (preferences.autoSaveChats && activeChatId) {
      localStorage.setItem(ACTIVE_CHAT_KEY, activeChatId)
    } else if (!preferences.autoSaveChats) {
      localStorage.removeItem(ACTIVE_CHAT_KEY)
    }
  }, [activeChatId, preferences.autoSaveChats])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (preferences.rememberModel) {
      localStorage.setItem(DEFAULT_MODEL_KEY, selectedModel)
    } else {
      localStorage.removeItem(DEFAULT_MODEL_KEY)
    }
  }, [selectedModel, preferences.rememberModel])

  const handleDeleteChat = (chatId) => {
    if (chats.length === 1) {
      alert('Keep at least one conversation so you always have history to reference.')
      return
    }

  useEffect(() => {
    if (!clipboardNotice) return
    const timeout = setTimeout(() => setClipboardNotice(null), 2400)
    return () => clearTimeout(timeout)
  }, [clipboardNotice])

  const playNotification = useCallback(() => {
    if (!preferences.soundEffects) return
    try {
      let context = audioContextRef.current
      if (!context) {
        context = new (window.AudioContext || window.webkitAudioContext)()
        audioContextRef.current = context
      }
      if (context.state === 'suspended') {
        context.resume()
      }
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      oscillator.type = 'triangle'
      oscillator.frequency.setValueAtTime(880, context.currentTime)
      gain.gain.setValueAtTime(0.08, context.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.25)
      oscillator.connect(gain)
      gain.connect(context.destination)
      oscillator.start()
      oscillator.stop(context.currentTime + 0.25)
    } catch (error) {
      console.warn('Notification sound failed', error)
    }
  }, [preferences.soundEffects])

  const copyToClipboard = useCallback(async (text, successMessage) => {
    if (typeof navigator === 'undefined' || !navigator?.clipboard) {
      setErrorState('Clipboard unavailable. Please copy manually.')
      return
    }
    try {
      await navigator.clipboard.writeText(text)
      if (successMessage) setClipboardNotice(successMessage)
    } catch (error) {
      console.warn('Clipboard copy failed', error)
      setErrorState('Copy failed. Please try again or copy manually.')
    }
  }, [])
    const filtered = chats.filter((chat) => chat.id !== chatId)
    setChats(filtered)
    if (activeChatId === chatId && filtered.length) {
      setActiveChatId(filtered[0].id)
    }
  }
    const newChat = createFreshChat(userName)
    setChats((prev) => [newChat, ...prev])
    event?.preventDefault()
    setInputMessage('')
    setErrorState(null)
    const content = (cannedPrompt ?? inputMessage).trim()
    if (!content) return

    if (!activeChat) {
      return
    }

    if (!canAffordMessage(selectedModel)) {
      setErrorState(
        `You need ${messageCost} credit${messageCost === 1 ? '' : 's'} to send this message. Visit billing to top up your balance.`
      )
      return
    }

  const handleTogglePin = (chatId) => {
    setChats((prev) =>
      prev.map((item) =>
        item.id === chatId
          ? {
              ...item,
              pinned: !item.pinned,
              lastActivity: item.lastActivity || new Date().toISOString()
            }
          : item
      )
    )
  }

    const timestamp = new Date().toISOString()
    const userMessage = {
      id: `msg-${Date.now()}`,
      type: 'user',
      content,
      timestamp
    }
    if (activeChatId === chatId) {
      const fallback = filtered[0]
      setActiveChatId(fallback?.id)
      prev.map((chat) =>
        chat.id === activeChat.id
          ? {
  const handleSendMessage = async (event, cannedPrompt = null) => {
              messages: [...chat.messages, userMessage],
              lastActivity: timestamp
            }
          : chat
      )
    )

    setInputMessage('')
    setIsTyping(true)
    setErrorState(null)

    try {
      const history = activeChat.messages
        .filter((message) => message.type !== 'system')
        .slice(-10)
        .map((message) => ({
          sender: message.type === 'user' ? 'user' : 'assistant',
          content: message.content
        }))

      const aiResponseContent = await OpenAIService.sendMessage(content, history)

      try {
        useCredits(
          messageCost,
          `AI Assistant - ${modelCatalog[selectedModel]?.name || selectedModel}`
        )
      } catch (creditError) {
        console.warn('Unable to deduct credits:', creditError)
        setErrorState('Response ready, but credit deduction failed. Please review your balance.')
      }

      const replyTimestamp = new Date().toISOString()
      const aiMessage = {
        id: `msg-${Date.now() + 1}`,
        type: 'bot',
        content: aiResponseContent,
        timestamp: replyTimestamp
      }

      setChats((prev) =>
        prev.map((chat) =>
          chat.id === activeChat.id
            ? {
                ...chat,
                messages: [...chat.messages, aiMessage],
                lastActivity: replyTimestamp
              }
            : chat
        )
      )
    } catch (error) {
      const aiResponseContent = await OpenAIService.sendMessage(content, history, {
        model: selectedModel,
        intent: 'reply'
      })
      const failureTimestamp = new Date().toISOString()
      const errorMessage = {
        id: `msg-${Date.now() + 2}`,
        type: 'system',
        content:
          "We couldn’t reach the model. Try again in a few moments or switch models if the issue persists.",
        timestamp: failureTimestamp
      }

      setChats((prev) =>
        prev.map((chat) =>
          chat.id === activeChat.id
            ? {
                ...chat,
                messages: [...chat.messages, errorMessage],
                lastActivity: failureTimestamp
              }
            : chat
        )
      )
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      handleSendMessage(event)
    }
  }
      playNotification()

  const handleToggleScroll = () => setAutoScroll((prev) => !prev)

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

      <main className="ai-assistant-layout">

  const handleQuickPrompt = (event, prompt) => {
    if (event.shiftKey) {
      handleSendMessage(event, prompt)
      return
    }
    setInputMessage((prev) => (prev ? `${prev}\n\n${prompt}` : prompt))
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const handleApplySavedPrompt = (prompt) => {
    setInputMessage((prev) => (prev ? `${prev}\n\n${prompt.body}` : prompt.body))
    setTimeout(() => inputRef.current?.focus(), 0)
    setClipboardNotice(`Loaded “${prompt.title}” into the composer`)
  }

  const handleSummarizeChat = async () => {
    if (!activeChat?.messages?.length || isSummarizing) return
    if (!canAffordMessage(selectedModel)) {
      setErrorState(
        `You need ${messageCost} credit${messageCost === 1 ? '' : 's'} to generate a summary. Visit billing to top up your balance.`
      )
      return
    }

    setIsSummarizing(true)
    setErrorState(null)

    const transcript = activeChat.messages
      .filter((message) => message.type !== 'system')
      .map((message) => `${message.type === 'user' ? 'User' : 'Assistant'}: ${message.content}`)
      .join('\n')

    const summaryPrompt = `Summarise the following PumaAI conversation into key decisions, blockers, and next steps. Provide bullet points with short, actionable statements and keep it under 180 words.\n\n${transcript}`

    try {
      const summary = await OpenAIService.sendMessage(summaryPrompt, [], {
        model: selectedModel,
        temperature: 0.3,
        intent: 'summary'
      })

      try {
        useCredits(
          messageCost,
          `AI Assistant Summary - ${modelCatalog[selectedModel]?.name || selectedModel}`
        )
      } catch (creditError) {
        console.warn('Unable to deduct credits for summary:', creditError)
      }

      const timestamp = new Date().toISOString()
      const summaryMessage = {
        id: `msg-${Date.now()}-summary`,
        type: 'bot',
        content: summary,
        timestamp,
        flavor: 'summary'
      }

      setChats((prev) =>
        prev.map((chat) =>
          chat.id === activeChat.id
            ? {
                ...chat,
                messages: [...chat.messages, summaryMessage],
                lastActivity: timestamp
              }
            : chat
        )
      )
      playNotification()
      setClipboardNotice('Summary added to the thread')
    } catch (error) {
      console.error('Summary generation failed', error)
      setErrorState('Summary generation failed. Try again shortly or switch models.')
    } finally {
      setIsSummarizing(false)
    }
  }

  const handleExportChat = async () => {
    if (!activeChat) return
    const exportText = activeChat.messages
      .map((message) => `${message.type === 'user' ? 'User' : 'Assistant'} (${formatTime(message.timestamp)}):\n${message.content}\n`)
      .join('\n')
    await copyToClipboard(exportText, 'Transcript copied to clipboard')
  }

  const handleCopyMessage = async (message) => {
    await copyToClipboard(message.content, 'Message copied to clipboard')
  }

  const handleResendPrompt = (message) => {
    setInputMessage(message.content)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const handleRegenerateResponse = async (messageId) => {
    if (!activeChat) return
    const messageIndex = activeChat.messages.findIndex((message) => message.id === messageId)
    if (messageIndex === -1) return
    const lastUserMessage = [...activeChat.messages].slice(0, messageIndex + 1)
      .reverse()
      .find((message) => message.type === 'user')

    if (!lastUserMessage) {
      setErrorState('No user prompt available to regenerate this reply.')
      return
    }

    if (!canAffordMessage(selectedModel)) {
      setErrorState(
        `You need ${messageCost} credit${messageCost === 1 ? '' : 's'} to regenerate this reply.`
      )
      return
    }

    setRegeneratingMessageId(messageId)
    setErrorState(null)

    const history = activeChat.messages
      .slice(0, messageIndex)
      .filter((message) => message.type !== 'system')
      .map((message) => ({
        sender: message.type === 'user' ? 'user' : 'assistant',
        content: message.content
      }))

    try {
      const regenerated = await OpenAIService.sendMessage(lastUserMessage.content, history, {
        model: selectedModel,
        intent: 'regenerate'
      })

      try {
        useCredits(
          messageCost,
          `AI Assistant Regenerate - ${modelCatalog[selectedModel]?.name || selectedModel}`
        )
      } catch (creditError) {
        console.warn('Unable to deduct credits for regenerate:', creditError)
      }

      const timestamp = new Date().toISOString()
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === activeChat.id
            ? {
                ...chat,
                messages: chat.messages.map((message) =>
                  message.id === messageId
                    ? {
                        ...message,
                        content: regenerated,
                        regeneratedAt: timestamp
                      }
                    : message
                ),
                lastActivity: timestamp
              }
            : chat
        )
      )
      setClipboardNotice('Response refreshed')
      playNotification()
    } catch (error) {
      console.error('Regenerate failed', error)
      setErrorState('Unable to regenerate right now. Please try again in a moment.')
    } finally {
      setRegeneratingMessageId(null)
    }
  }

  const handleRewriteMessage = async (message, tone) => {
    if (!activeChat || rewritingMessageId) return
    if (!canAffordMessage(selectedModel)) {
      setErrorState(
        `You need ${messageCost} credit${messageCost === 1 ? '' : 's'} to create a rewrite.`
      )
      return
    }

    setRewritingMessageId(message.id)
    setErrorState(null)

    const rewritePrompt = `${tone.instruction}\n\nAssistant response:\n${message.content}`

    try {
      const rewritten = await OpenAIService.sendMessage(rewritePrompt, [], {
        model: selectedModel,
        temperature: 0.6,
        intent: 'rewrite'
      })

      try {
        useCredits(
          messageCost,
          `AI Assistant Rewrite (${tone.label}) - ${modelCatalog[selectedModel]?.name || selectedModel}`
        )
      } catch (creditError) {
        console.warn('Unable to deduct credits for rewrite:', creditError)
      }

      const timestamp = new Date().toISOString()
      const rewriteMessage = {
        id: `msg-${Date.now()}-${tone.id}`,
        type: 'bot',
        content: rewritten,
        timestamp,
        flavor: 'rewrite',
        tone: tone.label
      }

      setChats((prev) =>
        prev.map((chat) =>
          chat.id === activeChat.id
            ? {
                ...chat,
                messages: [...chat.messages, rewriteMessage],
                lastActivity: timestamp
              }
            : chat
        )
      )
      setClipboardNotice(`Created ${tone.label.toLowerCase()} rewrite`)
      playNotification()
    } catch (error) {
      console.error('Rewrite failed', error)
      setErrorState('Unable to create that rewrite right now. Try again shortly.')
    } finally {
      setRewritingMessageId(null)
    }
  }

  const assistantConfigured = useMemo(() => OpenAIService.isConfigured(), [])

  const renderMessageContent = (content) =>
    content.split('\n').map((line, index) => (
      <p key={`${content.slice(0, 12)}-${index}`}>{line}</p>
    ))
        <div className="page-header">
          <Link to="/dashboard" className="back-btn">
            ← Back to Dashboard
          </Link>
          <div>
            <h1 className="page-title">🤖 AI Assistant</h1>
            <p className="page-subtitle">
              Co-create strategy, copy, and code alongside PumaAI. Each reply adapts to your context and tone.
            </p>
          </div>
        </div>

        <div className="chat-layout">
          <aside className="chat-sidebar glass-panel">
            <div className="sidebar-header">
              <div>
                <h3>Conversations</h3>
                <p className="sidebar-subtitle">Switch between threads or spin up a fresh brief.</p>
              </div>
              <button onClick={handleCreateChat} className="new-chat-btn" title="Start a new conversation">
                ➕
              </button>
            </div>

            <div className="chat-list">
              {chats.map((chat) => (
                <button
                  key={chat.id}
                  type="button"
                  onClick={() => setActiveChatId(chat.id)}
                  className={`chat-item ${chat.id === activeChatId ? 'active' : ''}`}
                >
                  <div className="chat-info">
                    <div className="chat-title">{chat.title}</div>

              {clipboardNotice && <div className="clipboard-toast glass-panel">{clipboardNotice}</div>}
                    <div className="chat-preview">
                      {chat.messages[chat.messages.length - 1]?.content.slice(0, 60) || 'Empty conversation'}
                    </div>
                    <div className="chat-time">{formatTime(chat.lastActivity)}</div>
                  </div>
                  <div className="chat-actions">
                      <p className="sidebar-subtitle">
                        Switch threads, pin favourites, or spin up a fresh brief.
                      </p>
                      type="button"
                    <button onClick={handleCreateChat} className="new-chat-btn" title="Start a new conversation">
                      onClick={(event) => {
                        event.stopPropagation()
                        handleRenameChat(chat.id)

                  <div className="sidebar-tools">
                    <div className="sidebar-search">
                      <input
                        type="search"
                        placeholder="Search chats or content"
                        value={chatFilter}
                        onChange={(event) => setChatFilter(event.target.value)}
                      />
                      {chatFilter && (
                        <button
                          type="button"
                          className="ghost-action"
                          onClick={() => setChatFilter('')}
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <div className="sidebar-filters">
                      <button
                        type="button"
                        className={`pin-filter ${showPinnedOnly ? 'active' : ''}`}
                        onClick={() => setShowPinnedOnly((prev) => !prev)}
                      >
                        ⭐ Pinned ({pinnedCount})
                      </button>
                      <span className="sidebar-count">
                        {filteredChats.length} thread{filteredChats.length === 1 ? '' : 's'}
                      </span>
                    </div>
                  </div>
                      }}
                      title="Rename chat"
                    {filteredChats.length === 0 && (
                      <div className="chat-empty">
                        <p>No conversations match that search.</p>
                        <button type="button" onClick={handleCreateChat} className="ghost-action">
                          Start a fresh chat
                        </button>
                      </div>
                    )}

                    {filteredChats.map((chat) => (
                      <div
                        key={chat.id}
                        className={`chat-item ${chat.id === activeChatId ? 'active' : ''} ${chat.pinned ? 'pinned' : ''}`}
                        role="button"
                        tabIndex={0}
                        onClick={() => setActiveChatId(chat.id)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') setActiveChatId(chat.id)
                        }}
                      >
                        <div className="chat-info">
                          <div className="chat-title">
                            {chat.title}
                            {chat.pinned && <span className="chat-chip">Pinned</span>}
                          </div>
                          <div className="chat-preview">
                            {chat.messages[chat.messages.length - 1]?.content.slice(0, 80) || 'Empty conversation'}
                          </div>
                          <div className="chat-meta">
                            <span>{chat.messages.length} message{chat.messages.length === 1 ? '' : 's'}</span>
                            <span>•</span>
                            <span>{formatRelativeTime(chat.lastActivity)}</span>
                          </div>
                        </div>
                        <div className="chat-actions">
                          <button
                            type="button"
                            className={`chat-action-btn pin ${chat.pinned ? 'active' : ''}`}
                            onClick={(event) => {
                              event.stopPropagation()
                              handleTogglePin(chat.id)
                            }}
                            title={chat.pinned ? 'Unpin thread' : 'Pin thread'}
                          >
                            ⭐
                          </button>
                          <button
                            type="button"
                            className="chat-action-btn"
                            onClick={(event) => {
                              event.stopPropagation()
                              handleRenameChat(chat.id)
                            }}
                            title="Rename chat"
                          >
                            ✏️
                          </button>
                          <button
                            type="button"
                            className="chat-action-btn delete"
                            onClick={(event) => {
                              event.stopPropagation()
                              handleDeleteChat(chat.id)
                            }}
                            title="Delete chat"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  <span className="session-value">{estimatedMessagesRemaining >= 0 ? estimatedMessagesRemaining : 0}</span>

                  <div className="sidebar-prompts">
                    <div className="sidebar-prompts-header">
                      Saved prompts
                      <span className="sidebar-count">{promptLibrary.length}</span>
                    </div>
                    <div className="prompt-chips">
                      {savedPromptChips.length === 0 && (
                        <p className="settings-helper">
                          No saved prompts yet. Build your library from Settings → Workspace settings.
                        </p>
                      )}
                      {savedPromptChips.map((prompt) => (
                        <button
                          key={prompt.id}
                          type="button"
                          className="prompt-chip"
                          onClick={() => handleApplySavedPrompt(prompt)}
                        >
                          <span>{prompt.title}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <button type="button" className={`session-toggle ${autoScroll ? 'active' : ''}`} onClick={handleToggleScroll}>
                  {autoScroll ? 'Auto-scroll on' : 'Auto-scroll off'}
                </button>
              </div>
            </div>

            <div className="chat-container">
              <div className="chat-messages">
                {activeChat?.messages.map((message) => (
                  <div key={message.id} className={`message ${message.type}`}>
                    <div className="message-avatar" aria-hidden="true">
                      {message.type === 'user' ? '👤' : message.type === 'bot' ? '🤖' : '⚠️'}
                      {!assistantConfigured && <span className="model-warning">Demo responses active</span>}
                    </div>
                    <div className="message-body">
                      <div className="message-content">{message.content}</div>
                      <div className="message-meta">{formatTime(message.timestamp)}</div>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="message bot typing">
                    <div className="message-avatar">🤖</div>
                    <div className="message-body">
                      <div>
                        <span className="session-label">Last reply</span>
                        <span className="session-value">{latestAssistantMessage ? formatRelativeTime(latestAssistantMessage.timestamp) : '—'}</span>
                      </div>
                      <div className="typing-indicator">
                        <span />
                        <span />
                        <span />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
                        <div
                          key={message.id}
                          className={`message ${message.type} ${message.flavor ? `message-${message.flavor}` : ''}`}
                        >

              {errorState && <div className="chat-error">{errorState}</div>}

              <form onSubmit={handleSendMessage} className="chat-input">
                            <div className="message-content">{renderMessageContent(message.content)}</div>
                            <div className="message-meta">
                              <span>{formatTime(message.timestamp)}</span>
                              {message.flavor === 'summary' && <span className="message-tag">Summary</span>}
                              {message.flavor === 'rewrite' && message.tone && (
                                <span className="message-tag">{message.tone}</span>
                              )}
                              {message.regeneratedAt && <span className="message-tag">Refreshed</span>}
                            </div>
                            <div className="message-actions">
                              <button type="button" onClick={() => handleCopyMessage(message)} className="ghost-action">
                                Copy
                              </button>
                              {message.type === 'user' && (
                                <button
                                  type="button"
                                  className="ghost-action"
                                  onClick={() => handleResendPrompt(message)}
                                >
                                  Edit
                                </button>
                              )}
                              {message.type === 'bot' && !message.flavor && (
                                <button
                                  type="button"
                                  className="ghost-action"
                                  onClick={() => handleRegenerateResponse(message.id)}
                                  disabled={regeneratingMessageId === message.id}
                                >
                                  {regeneratingMessageId === message.id ? 'Regenerating…' : 'Regenerate'}
                                </button>
                              )}
                              {message.type === 'bot' && preferences.experimentalFeatures && !message.flavor && (
                                <details className="message-rewrite" open={rewritingMessageId === message.id}>
                                  <summary>Rewrite</summary>
                                  {toneVariants.map((tone) => (
                                    <button
                                      key={tone.id}
                                      type="button"
                                      onClick={() => handleRewriteMessage(message, tone)}
                                      disabled={rewritingMessageId === message.id}
                                    >
                                      {tone.label}
                                    </button>
                                  ))}
                                </details>
                              )}
                            </div>
                  onChange={(event) => setInputMessage(event.target.value)}
                  onKeyDown={handleKeyDown}
                  className="message-input"
                  placeholder="Ask for a plan, a refactor, or a killer headline…"
                  rows={2}
                  ref={inputRef}
                />
                <button type="submit" className="send-btn" disabled={!inputMessage.trim() || isTyping}>
                  Send
                </button>
              </form>
            </div>
          </section>

          <aside className="assistant-insights glass-panel">
            <h3>Session insights</h3>
            <div className="insight-widget">
              <div>
                <span className="session-label">Active thread</span>
                <p className="insight-value">{activeChat?.title || 'New conversation'}</p>
              </div>
              <div>
                <span className="session-label">Messages in thread</span>
                <p className="insight-value">{activeChat?.messages.length || 0}</p>
              </div>
              <div>
                <span className="session-label">Last updated</span>
                <p className="insight-value">{activeChat?.lastActivity ? formatRelativeTime(activeChat.lastActivity) : '—'}</p>
              </div>
            </div>

            <div className="insight-actions">
              <button type="button" onClick={handleSummarizeChat} disabled={isSummarizing || isTyping}>
                {isSummarizing ? 'Summarising…' : 'Summarise thread'}
              </button>
              <button type="button" onClick={handleExportChat}>
                Copy transcript
              </button>
            </div>

            <div className="assistant-tips">
              <h4>Boost quality</h4>
              <ul>
                {proTips.map((tip) => (
                  <li key={tip.text}>
                    <span className="tip-icon">{tip.icon}</span>
                    {tip.text}
                  </li>
                ))}
              </ul>
            </div>

            <div className="assistant-meta">
              <h4>Model snapshot</h4>
              <p>{modelCatalog[selectedModel]?.description}</p>
              <Link to="/dashboard/model-switching" className="ghost-action">
                Configure routing
              </Link>
            </div>

            {preferences.experimentalFeatures && (
              <div className="assistant-labs">
                <h4>Labs enabled</h4>
                <p className="labs-hint">You opted into experimental tooling. Expect new controls to appear here.</p>
                <ul>
                  <li>✨ Rewrites with tone presets</li>
                  <li>📌 Advanced pin filtering</li>
                  <li>📤 Transcript export shortcuts</li>
                </ul>
              </div>
            )}
          </aside>
        </div>

        <section className="quick-actions">
          <h3>Jumpstart your prompt</h3>
          <div className="action-grid">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt.id}
                type="button"
                className="action-card"
                onClick={(event) => handleQuickPrompt(event, prompt.prompt)}
              >
                <div className="action-icon">{prompt.emoji}</div>
                <h4>{prompt.headline}</h4>
                <p>{prompt.prompt.slice(0, 110)}{prompt.prompt.length > 110 ? '…' : ''}</p>
                <span className="action-hint">Click to stage • Shift-click to send</span>
              </button>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}