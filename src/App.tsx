import { useEffect, useRef, useState, useCallback } from 'react'
import './App.css'

function FlipDigit({ value, animKey }: { value: string; animKey: number }) {
  return (
    <div className="digit">
      <div className="digit-top" key={`top-${animKey}`}>
        <span>{value}</span>
      </div>
      <div className="digit-bottom" key={`bot-${animKey}`}>
        <span>{value}</span>
      </div>
      <div className="digit-divider" />
    </div>
  )
}

function FlipPair({ twoDigit, animKey }: { twoDigit: string; animKey: number }) {
  return (
    <div className="segment-group">
      <FlipDigit value={twoDigit[0]} animKey={animKey * 10 + parseInt(twoDigit[0])} />
      <FlipDigit value={twoDigit[1]} animKey={animKey * 10 + parseInt(twoDigit[1])} />
    </div>
  )
}

export default function App() {
  const [totalSecs, setTotalSecs] = useState(10 * 60)
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(false)
  const [setMin, setSetMin] = useState(10)
  const [setSec, setSetSec] = useState(0)
  const [animKey, setAnimKey] = useState(0)

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
      setAnimKey(k => k + 1)
      stop()
      setDone(true)
      return
    }
    setTotalSecs(next)
    setAnimKey(k => k + 1)
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
    const t = setMin * 60 + setSec
    setTotalSecs(t)
    setAnimKey(k => k + 1)
  }, [stop, setMin, setSec])

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

  useEffect(() => {
    if (!running) {
      const t = setMin * 60 + setSec
      setTotalSecs(t)
      setAnimKey(k => k + 1)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setMin, setSec])

  const m = Math.floor(totalSecs / 60)
  const s = totalSecs % 60
  const minStr = String(m).padStart(2, '0')
  const secStr = String(s).padStart(2, '0')

  return (
    <div className="app">
      <div className="label">{done ? 'Done!' : running ? 'Countdown' : 'Exercise Timer'}</div>

      <div className="clock">
        <FlipPair twoDigit={minStr} animKey={animKey} />
        <div className="separator">
          <span className="dot" />
          <span className="dot" />
        </div>
        <FlipPair twoDigit={secStr} animKey={animKey} />
      </div>

      <div className="set-time">
        <label>Min
          <input
            type="number" min={0} max={99} value={setMin}
            onChange={e => setSetMin(Math.max(0, Math.min(99, +e.target.value)))}
            disabled={running}
          />
        </label>
        <label>Sec
          <input
            type="number" min={0} max={59} value={setSec}
            onChange={e => setSetSec(Math.max(0, Math.min(59, +e.target.value)))}
            disabled={running}
          />
        </label>
      </div>

      <div className="controls">
        <button onClick={reset}>Reset</button>
        {running
          ? <button className="primary" onClick={pause}>Pause</button>
          : <button className="primary" onClick={start}>Start</button>
        }
      </div>
    </div>
  )
}
