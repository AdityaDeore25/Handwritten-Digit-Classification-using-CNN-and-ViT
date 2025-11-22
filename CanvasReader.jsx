import React, { useEffect, useRef, useState } from 'react'

const API_BASE = 'http://127.0.0.1:5000'

export default function CanvasReader() {
  const canvasRef = useRef(null)
  const ctxRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [numDigits, setNumDigits] = useState(3)
  const [language, setLanguage] = useState('English')
  const [message, setMessage] = useState('')
  const [confidence, setConfidence] = useState('')
  const [loading, setLoading] = useState(false)
  const [amountText, setAmountText] = useState('')

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctxRef.current = ctx
    const resize = () => {
      const parent = canvas.parentElement
      canvas.width = parent.clientWidth
      canvas.height = 220
      ctx.fillStyle = 'black'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      drawGuides()
    }
    window.addEventListener('resize', resize)
    resize()
    return () => window.removeEventListener('resize', resize)
  }, [numDigits])

  const drawGuides = () => {
    const ctx = ctxRef.current
    const canvas = canvasRef.current
    ctx.strokeStyle = 'rgba(255,255,255,0.2)'
    ctx.lineWidth = 1
    const w = canvas.width / numDigits
    for (let i = 1; i < numDigits; i++) {
      ctx.beginPath()
      ctx.moveTo(i * w, 0)
      ctx.lineTo(i * w, canvas.height)
      ctx.stroke()
    }
  }

  const start = (e) => {
    setIsDrawing(true)
    const { offsetX, offsetY } = getPos(e)
    ctxRef.current.beginPath()
    ctxRef.current.moveTo(offsetX, offsetY)
  }

  const move = (e) => {
    if (!isDrawing) return
    const { offsetX, offsetY } = getPos(e)
    const ctx = ctxRef.current
    ctx.strokeStyle = 'white'
    ctx.lineWidth = 24
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.lineTo(offsetX, offsetY)
    ctx.stroke()
  }

  const end = () => {
    setIsDrawing(false)
    drawGuides()
  }

  const getPos = (e) => {
    if (e.touches && e.touches.length) {
      const rect = canvasRef.current.getBoundingClientRect()
      return { offsetX: e.touches[0].clientX - rect.left, offsetY: e.touches[0].clientY - rect.top }
    }
    return e
  }

  const clear = () => {
    const ctx = ctxRef.current
    const canvas = canvasRef.current
    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    drawGuides()
    setMessage('')
    setConfidence('')
    setAmountText('')
  }

  const readAmount = async () => {
    setLoading(true)
    setMessage('')
    setConfidence('')
    try {
      const imageData = canvasRef.current.toDataURL('image/png')
      const res = await fetch(`${API_BASE}/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageData, num_digits: numDigits, language })
      })
      const data = await res.json()
      if (data.success) {
        setMessage(data.amount_text || `Recognized Amount: ${data.amount}`)
        if (data.confidence_scores?.length) {
          const avg = data.confidence_scores.reduce((a, b) => a + b, 0) / data.confidence_scores.length
          setConfidence(`Confidence: ${(avg * 100).toFixed(1)}%`)
        }
        setAmountText(data.amount_text || '')
      } else {
        setMessage(data.message || 'Could not recognize digits')
      }
    } catch (e) {
      setMessage(`Error: ${e.message}`)
    } finally {
      setLoading(false)
    }
  }

  const speak = () => {
    if (!amountText) return
    const audio = new Audio(`${API_BASE}/speak?text=${encodeURIComponent(amountText)}&language=${encodeURIComponent(language)}`)
    audio.play().catch(() => {})
  }

  return (
    <div className="card-like">
      <div className="header">
        <h2>Try it</h2>
        <p>Draw digits, choose digits count and language, then read.</p>
      </div>
      <div className="canvas-wrap">
        <canvas
          ref={canvasRef}
          onMouseDown={start}
          onMouseMove={move}
          onMouseUp={end}
          onMouseLeave={end}
          onTouchStart={start}
          onTouchMove={move}
          onTouchEnd={end}
        />
      </div>
      <div className="controls-row">
        <label>Digits: {numDigits}
          <input type="range" min="1" max="5" value={numDigits} onChange={(e) => setNumDigits(parseInt(e.target.value))} />
        </label>
        <select value={language} onChange={(e) => setLanguage(e.target.value)}>
          {['English','Hindi','Marathi','Spanish','French','German','Japanese','Chinese'].map(l => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>
      <div className="buttons-row">
        <button className="btn primary" onClick={readAmount} disabled={loading}>{loading ? 'Reading…' : 'Read Amount'}</button>
        <button className="btn" onClick={clear}>Clear</button>
        <button className="btn" onClick={speak} disabled={!amountText}>Play</button>
      </div>
      <div className="result">
        <div className="msg">{message}</div>
        <div className="conf">{confidence}</div>
      </div>
    </div>
  )
}

