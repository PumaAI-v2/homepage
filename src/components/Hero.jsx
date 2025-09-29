import React from 'react'
import { Link } from 'react-router-dom'

export default function Hero() {
  return (
    <section className="hero" role="region" aria-label="PumaAI hero">
      <div className="hero-inner">
        <p className="eyebrow">The biggest update yet.</p>

        <h1 className="title">
          PumaAI <span className="v2">v2 is here</span>
        </h1>

        <p className="subtitle">
          Your intelligent companion, built to think fast, adapt smart, and assist seamlessly.
        </p>

        <div className="hero-actions">
          <Link to="/register" className="primary">Get Started</Link>
          <Link to="/login" className="secondary">Sign In</Link>
        </div>

        <div className="feature-cards" aria-hidden>
          <div className="card">Your information stays private<span className="dot" /></div>
          <div className="card">Built with the latest models<span className="dot" /></div>
          <div className="card">Switch between different LLMS with ease<span className="dot" /></div>
        </div>
      </div>
    </section>
  )
}