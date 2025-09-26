import React from 'react'

export default function Hero() {
  const goExample = (e) => {
    e.preventDefault()
    window.location.href = 'https://example.com'
  }

  return (
    <section className="hero" role="region" aria-label="PumaAI v2 hero">
      <div className="hero-inner">
        <p className="eyebrow">Introducing</p>

        <h1 className="title">
          PumaAI <span className="v2">v2 is here.</span>
        </h1>

        <p className="subtitle">
          A faster, sleeker, and more private AI layer — designed for creators and teams who move with pop-level precision.
        </p>

        <div className="hero-actions">
          <button className="primary" onClick={goExample}>Learn more</button>
          <a className="secondary" href="#play" onClick={(e)=>e.preventDefault()}>Try the demo</a>
        </div>

        <div className="feature-cards" aria-hidden>
          <div className="card">Low latency · <span className="dot" /></div>
          <div className="card">Private by design · <span className="dot" /></div>
          <div className="card">Seamless SDKs · <span className="dot" /></div>
        </div>
      </div>
    </section>
  )
}