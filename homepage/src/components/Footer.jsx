import React from 'react'
import logoSrc from '../assets/logo.png'

export default function Footer(){
  return (
    <footer className="site-footer">
      <div className="footer-left">
        <img src={logoSrc} alt="PumaAI" className="mini-logo" />
        <div className="copy">PumaAI · v2</div>
      </div>
      <div className="footer-right">
        <div className="note">Crafted with pop energy — Sabrina + Tate vibes, but all PumaAI.</div>
      </div>
    </footer>
  )
}