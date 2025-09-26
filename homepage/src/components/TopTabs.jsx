import React from 'react'
import logoSrc from '../assets/logo.png' // -> put your logo at src/assets/logo.png
// If you want to use the provided absolute path in the container, replace the import line with:
// const logoSrc = '/mnt/data/IMG_0005.jpeg'

const TABS = [
  { label: '', isLogo: true, href: 'https://example.com' },
  { label: 'item 1', href: 'https://example.com' },
  { label: 'item 2', href: 'https://example.com' },
  { label: 'item 3', href: 'https://example.com' }
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
              <img src={logoSrc} alt="PumaAI logo" />
            </a>
          ) : (
            <a key={i} href={t.href} onClick={handleNav(t.href)} className="tab">
              {t.label}
            </a>
          )
        )}
      </div>

      <div className="tabs-right">
        <button className="ghost">Sign in</button>
      </div>
    </nav>
  )
}