import { useState, useEffect, useRef } from 'react'
import { findHistoricalMatch } from '../services/historical'
import { formatMatch } from '../../core/domain/historical-match'
import './HistoricalMatch.css'

/**
 * HistoricalMatch
 * Finds a Falmouth, MA day from 1985-2003 that echoes today's conditions.
 * Renders nothing if no match exists or while loading (grief-aware: no placeholders).
 */
export default function HistoricalMatch({ weather }) {
  const [match, setMatch] = useState(undefined) // undefined = pending, null = not found
  const prevCondition = useRef(null)
  const prevTemp = useRef(null)

  useEffect(() => {
    if (!weather) return

    // Only re-fetch if weather meaningfully changed
    const conditionChanged = weather.condition !== prevCondition.current
    const tempChanged = Math.abs(weather.temp - (prevTemp.current ?? 0)) > 3
    if (!conditionChanged && !tempChanged && match !== undefined) return

    prevCondition.current = weather.condition
    prevTemp.current = weather.temp

    setMatch(undefined) // reset to pending

    findHistoricalMatch(weather).then(result => {
      setMatch(result ?? null)
    })
  }, [weather?.condition, weather?.temp])

  const formatted = formatMatch(match ?? null)

  // Still searching — render nothing (don't flash "loading" in a grief app)
  if (match === undefined) return null

  // No match found — render nothing (Kilara: "say nothing")
  if (!formatted) return null

  return (
    <div className="historical-match">
      <span className="historical-match__label">Echoes of</span>
      <span className="historical-match__headline">{formatted.headline}</span>
      <span className="historical-match__description">{formatted.description}</span>
    </div>
  )
}
