import React from 'react'
import Hero from './components/Hero.jsx'
import CanvasReader from './components/CanvasReader.jsx'

export default function App() {
  return (
    <div>
      <Hero />
      <div id="mainApp">
        <CanvasReader />
      </div>
    </div>
  )
}

