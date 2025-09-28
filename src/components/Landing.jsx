import React from 'react'
import { Link } from 'react-router-dom'
import TopTabs from './TopTabs'
import Hero from './Hero'
import Footer from './Footer'

export default function Landing() {
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