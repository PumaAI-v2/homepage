import React from 'react'

export default function Hero() {
  const goExample = (e) => {
    e.preventDefault()
    window.location.href = 'https://example.com'
  }

  return (
    <section className="hero" role="region" aria-label="PumaAI v2 hero">
      <div className="hero-inner">
        <p className="eyebrow">The biggest update yet.</p>

        <h1 className="title">
          PumaAI <span className="v2">v2 is here</span>
        </h1>

        <p className="subtitle">
          Your intelligent companion, built to think fast, adapt smart, and assist seamlessly.
        </p>

        <div className="hero-actions">
          <button className="primary" onClick={goExample}>Learn more</button>
          <a className="secondary" href="#play" onClick={(e)=>e.preventDefault()}>Try the demo</a>
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