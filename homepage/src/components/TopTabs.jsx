import React from 'react'
import logoSrc from '../assets/logo.png'

const TABS = [
  { label: '', isLogo: true, href: 'https://example.com' },
  { label: 'Home', href: 'https://example.com' },
  { label: 'Contact', href: 'https://example.com' },
  { label: 'Book a demo', href: 'https://example.com' }
]

export default function TopTabs() {
  const handleNav = (href) => (e) => {
    e.preventDefault()
    // open in same tab (explicit)
    window.location.href = href
  }

  return (
    <nav className="top-tabs" aria-label="main navigation">
      <div className="tabs-left">
        {TABS.map((t, i) =>
          t.isLogo ? (
            <a key={i} href={t.href} onClick={handleNav(t.href)} className="tab logo">
              <img src={logoSrc} alt="logo" />
            </a>
          ) : (
            <a key={i} href={t.href} onClick={handleNav(t.href)} className="tab">
              {t.label}
            </a>
          )
        )}
      </div>

      <div className="tabs-right">
        <button className="ghost">Log in</button>
        <text>  </text>
        
        <button className="ghost">Sign up</button>
      </div>
    </nav>
  )
}