import React from 'react'
import logoSrc from '../assets/logo.png'

export default function Footer(){
  return (
    <footer className="site-footer">
      <div className="footer-left">
        <img src={logoSrc} alt="PumaAI" className="mini-logo" />
        <div className="copy">© PumaAI • kerrigan says hi</div>
      </div>
      <div className="footer-right">
        <div className="note">made with ❤️ by silas</div>
      </div>
    </footer>
  )
}