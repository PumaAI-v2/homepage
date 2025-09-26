import React from 'react'
import TopTabs from './components/TopTabs'
import Hero from './components/Hero'
import Footer from './components/Footer'

export default function App() {
  return (
    <div className="app">
      <div className="page-wrap">
        <TopTabs />
        <main className="container">
          <Hero />
        </main>
      </div>
      <Footer />
      <div className="bg-accents">
        <div className="accent a1" />
        <div className="accent a2" />
      </div>
    </div>
  )
}