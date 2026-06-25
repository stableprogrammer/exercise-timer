import { useEffect, useRef, useState, useCallback } from 'react'
import { Play, Pause, RotateCcw, SlidersHorizontal, Dumbbell } from 'lucide-react'
import './App.css'

function FlipDigit({ value }: { value: string }) {
  const [anim, setAnim] = useState(false)
  const prevRef = useRef(value)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (prevRef.current === value) return
    prevRef.current = value
    setAnim(false)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setAnim(true)
        timerRef.current = setTimeout(() => setAnim(false), 600)
      })
    })
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [value])

  return (
    <div className="digit">
      <div className={`digit-top${anim ? ' flip' : ''}`}>
        <span>{value}</span>
      </div>
      <div className={`digit-bottom${anim ? ' flip' : ''}`}>
        <span>{value}</span>
      </div>
      <div className="digit-line" />
    </div>
  )
}

function DigitPair({ val }: { val: string }) {
  return (
    <div className="pair">
      <FlipDigit value={val[0]} />
      <FlipDigit value={val[1]} />
    </div>
  )
}

function SettingsOverlay({
  setMin, setSec, onSetMin, onSetSec, onClose,
}: {
  setMin: number; setSec: number
  onSetMin: (v: number) => void; onSetSec: (v: number) => void
  onClose: () => void
}) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="settings-panel" onClick={e => e.stopPropagation()}>
        <p className="settings-title">Set Duration</p>
        <div className="settings-row">
          <label>
            <span>Min</span>
            <input type="number" min={0} max={99} value={setMin}
              onChange={e => onSetMin(Math.max(0, Math.min(99, +e.target.value)))} />
          </label>
          <label>
            <span>Sec</span>
            <input type="number" min={0} max={59} value={setSec}
              onChange={e => onSetSec(Math.max(0, Math.min(59, +e.target.value)))} />
          </label>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [totalSecs, setTotalSecs] = useState(10 * 60)
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(false)
  const [setMin, setSetMin] = useState(10)
  const [setSec, setSetSec] = useState(0)
  const [showSettings, setShowSettings] = useState(false)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const secsRef = useRef(totalSecs)
  secsRef.current = totalSecs

  const stop = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = null
    setRunning(false)
  }, [])

  const tick = useCallback(() => {
    const next = secsRef.current - 1
    if (next <= 0) {
      setTotalSecs(0)
      stop()
      setDone(true)
      return
    }
    setTotalSecs(next)
  }, [stop])

  const start = useCallback(() => {
    if (running) return
    setDone(false)
    setRunning(true)
    intervalRef.current = setInterval(tick, 1000)
  }, [running, tick])

  const pause = useCallback(() => stop(), [stop])

  const reset = useCallback(() => {
    stop()
    setDone(false)
    setTotalSecs(setMin * 60 + setSec)
  }, [stop, setMin, setSec])

  const handleSetMin = useCallback((v: number) => {
    setSetMin(v)
    if (!running) setTotalSecs(v * 60 + setSec)
  }, [running, setSec])

  const handleSetSec = useCallback((v: number) => {
    setSetSec(v)
    if (!running) setTotalSecs(setMin * 60 + v)
  }, [running, setMin])

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

  const m = Math.floor(totalSecs / 60)
  const s = totalSecs % 60
  const minStr = String(m).padStart(2, '0')
  const secStr = String(s).padStart(2, '0')

  return (
    <div className="app">
      <button className="corner top-left" title="Exercise Timer">
        <Dumbbell size={24} />
      </button>
      <button className="corner top-right" title="Settings"
        onClick={() => { if (!running) setShowSettings(v => !v) }}>
        <SlidersHorizontal size={24} />
      </button>
      <button className="corner bottom-left" title="Reset" onClick={reset}>
        <RotateCcw size={24} />
      </button>
      <button className="corner bottom-right" title={running ? 'Pause' : 'Start'}
        onClick={running ? pause : start}>
        {running ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
      </button>

      <div className="clock">
        <DigitPair val={minStr} />
        <div className="sep">
          <span className="dot" />
          <span className="dot" />
        </div>
        <DigitPair val={secStr} />
      </div>

      {done && <div className="done-badge">Done!</div>}

      {showSettings && (
        <SettingsOverlay
          setMin={setMin} setSec={setSec}
          onSetMin={handleSetMin} onSetSec={handleSetSec}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  )
}
