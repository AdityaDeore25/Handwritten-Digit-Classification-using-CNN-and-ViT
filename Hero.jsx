import React from 'react'

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-inner">
        <h1 className="hero-title">AI Currency Reader</h1>
        <p className="hero-subtitle">Read handwritten amounts instantly, hear them in your language, and view confidence insights.</p>
        <div className="hero-badges">
          <span className="hero-badge">Vision Transformer</span>
          <span className="hero-badge">Multilingual TTS</span>
          <span className="hero-badge">Realtime Stats</span>
        </div>
        <a href="#mainApp" className="btn cta-btn">Get Started</a>
      </div>
    </section>
  )
}

