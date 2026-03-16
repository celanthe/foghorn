import { useState, useEffect } from 'react'
import './App.css'
import { getCurrentWeather, getUserLocation } from './services/weather'
import { playFoghorn } from './services/foghorn'
import { createRitual } from '../core/domain/ritual'
import { saveRitual, getRitualCount, getRitualsByDateRange } from './services/storage/ritual-storage'
import HistoricalMatch from './components/HistoricalMatch'
import RitualCapture from './components/RitualCapture'
import RitualHistory from './components/RitualHistory'
import Settings, { loadSettings } from './components/Settings'
import QuarterlyCheckIn from './components/QuarterlyCheckIn'
import FieldNotes from './components/FieldNotes'
import content from '../content/en.json'

const TRIGGER_CONDITION_MAP = {
  fog:   ['Mist', 'Fog', 'Haze'],
  rain:  ['Rain', 'Drizzle'],
  sleet: ['Sleet'],
  snow:  ['Snow'],
}

function isCheckinDue() {
  const last = localStorage.getItem('foghorn_last_checkin')
  if (!last) return true
  const daysSince = (Date.now() - new Date(last).getTime()) / (1000 * 60 * 60 * 24)
  return daysSince >= 90
}

function App() {
  const [weather, setWeather]                   = useState(null)
  const [loading, setLoading]                   = useState(true)
  const [error, setError]                       = useState(null)
  const [playing, setPlaying]                   = useState(false)
  const [location, setLocation]                 = useState(null)
  const [usingDefaultLocation, setUsingDefault] = useState(false)
  const [ritualCount, setRitualCount]           = useState(0)
  const [todayCount, setTodayCount]             = useState(0)
  const [foghornPlayed, setFoghornPlayed]       = useState(false)
  const [capturingRitual, setCapturingRitual]   = useState(false)
  const [recordingRitual, setRecordingRitual]   = useState(false)
  const [ritualSaved, setRitualSaved]           = useState(false)
  const [showingHistory, setShowingHistory]     = useState(false)
  const [showingNotes, setShowingNotes]         = useState(false)
  const [showingSettings, setShowingSettings]   = useState(false)
  const [showingCheckin, setShowingCheckin]     = useState(false)
  const [checkinNoticeDismissed, setCheckinNoticeDismissed] = useState(false)
  const [settings, setSettings]                 = useState(() => loadSettings())
  const [currentPhase, setCurrentPhase]         = useState(() => localStorage.getItem('foghorn_phase') || null)

  useEffect(() => {
    async function loadWeather() {
      try {
        setLoading(true)
        setError(null)

        const currentSettings = loadSettings()
        setSettings(currentSettings)

        const loc = currentSettings.locationOverride
          ? { ...currentSettings.locationOverride, usingDefault: false }
          : await getUserLocation()
        setLocation(loc)
        if (loc.usingDefault) setUsingDefault(true)

        const weatherData = await getCurrentWeather(loc.lat, loc.lon)

        // Apply user's trigger settings
        const { foghornTriggers } = currentSettings
        const shouldPlay = Object.entries(TRIGGER_CONDITION_MAP)
          .some(([key, conditions]) => foghornTriggers[key] && conditions.includes(weatherData.condition))
        weatherData.shouldPlayFoghorn = shouldPlay

        setWeather(weatherData)

        const count = await getRitualCount()
        setRitualCount(count)

        const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
        const todayEnd   = new Date(); todayEnd.setHours(23, 59, 59, 999)
        const todayRituals = await getRitualsByDateRange(todayStart, todayEnd)
        setTodayCount(todayRituals.length)


      } catch (err) {
        if (import.meta.env.DEV) {
          console.error('[App] Failed to load weather:', err)
        }
        setError(import.meta.env.DEV ? err.message : 'Unable to load weather. Try again in a moment.')
      } finally {
        setLoading(false)
      }
    }

    loadWeather()
  }, [])

  async function handlePlayFoghorn() {
    try {
      setPlaying(true)
      await playFoghorn('/audio/foghorn.mp3')
      setFoghornPlayed(true)
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('[App] Failed to play foghorn:', err)
      }
      setError(content.foghorn.error)
    } finally {
      setPlaying(false)
    }
  }

  function handleOpenCapture() {
    setCapturingRitual(true)
  }

  function handleCancelCapture() {
    setCapturingRitual(false)
  }

  function handlePhaseChange(phase) {
    setCurrentPhase(phase || null)
    if (phase) localStorage.setItem('foghorn_phase', phase)
    else localStorage.removeItem('foghorn_phase')
  }

  async function handleSaveRitual({ intensity, lossType, duration, notes }) {
    if (!weather) return

    try {
      setRecordingRitual(true)

      const ritual = createRitual(weather, foghornPlayed, intensity, lossType, duration, notes, currentPhase)
      await saveRitual(ritual)

      const count = await getRitualCount()
      setRitualCount(count)

      const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
      const todayEnd   = new Date(); todayEnd.setHours(23, 59, 59, 999)
      const todayRituals = await getRitualsByDateRange(todayStart, todayEnd)
      setTodayCount(todayRituals.length)

      setFoghornPlayed(false)
      setCapturingRitual(false)
      setRitualSaved(true)
      setTimeout(() => setRitualSaved(false), 2500)

    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('[App] Failed to record ritual:', err)
      }
      setError(content.ritual.error)
    } finally {
      setRecordingRitual(false)
    }
  }

  async function handleRefresh() {
    if (!location) return
    try {
      setLoading(true)
      const currentSettings = loadSettings()
      setSettings(currentSettings)
      const refreshLoc = currentSettings.locationOverride || location
      const weatherData = await getCurrentWeather(refreshLoc.lat, refreshLoc.lon)
      const { foghornTriggers } = currentSettings
      const shouldPlay = Object.entries(TRIGGER_CONDITION_MAP)
        .some(([key, conditions]) => foghornTriggers[key] && conditions.includes(weatherData.condition))
      weatherData.shouldPlayFoghorn = shouldPlay
      setWeather(weatherData)
    } catch (err) {
      setError(import.meta.env.DEV ? err.message : 'Unable to refresh weather.')
    } finally {
      setLoading(false)
    }
  }

  if (loading && !weather) {
    return (
      <div className="app">
        <div className="loading">{content.weather.loading}</div>
      </div>
    )
  }

  if (error && !weather) {
    return (
      <div className="app">
        <div className="error">
          <p>{error}</p>
          <p className="hint">{content.weather.errorHint}</p>
        </div>
      </div>
    )
  }

  const weatherEmoji = weather ? (
    weather.condition === 'Fog' || weather.condition === 'Mist' || weather.condition === 'Haze' ? '🌫️' :
    weather.condition === 'Rain' || weather.condition === 'Drizzle' ? '🌧️' :
    weather.condition === 'Snow' || weather.condition === 'Sleet' ? '🌨️' :
    weather.condition === 'Clouds' ? '☁️' :
    weather.condition === 'Thunderstorm' ? '⛈️' :
    '☀️'
  ) : null

  return (
    <div className="app">
      <header className="header">
        <h1 className="title">Foghorn</h1>
        <div className="header-actions">
          <button
            className="header-button"
            onClick={() => { setShowingHistory(h => !h); setShowingNotes(false); setShowingSettings(false) }}
            aria-label={content.ritual.historyToggle}
          >
            {content.ritual.historyToggle}
          </button>
          <button
            className="header-button"
            onClick={() => { setShowingNotes(n => !n); setShowingHistory(false); setShowingSettings(false) }}
            aria-label={content.fieldNotes.title}
          >
            {content.fieldNotes.title}
          </button>
          <button
            className="header-button"
            onClick={() => { setShowingSettings(s => !s); setShowingHistory(false); setShowingNotes(false) }}
            aria-label={content.settings.title}
          >
            ⚙
          </button>
          <button
            className="refresh-button"
            onClick={handleRefresh}
            disabled={loading}
            aria-label={content.weather.refresh}
          >
            ↻
          </button>
        </div>
      </header>

      {showingCheckin && (
        <QuarterlyCheckIn
          onComplete={() => { setShowingCheckin(false); setCheckinNoticeDismissed(true) }}
          onSkip={() => setShowingCheckin(false)}
        />
      )}

      {showingHistory && (
        <RitualHistory onClose={() => setShowingHistory(false)} onRitualAdded={async () => {
          const count = await getRitualCount()
          setRitualCount(count)
        }} />
      )}

      {showingNotes && (
        <FieldNotes onClose={() => setShowingNotes(false)} />
      )}

      {showingSettings && (
        <Settings
          onClose={() => setShowingSettings(false)}
          onSave={newSettings => {
            setSettings(newSettings)
            setShowingSettings(false)
            handleRefresh()
          }}
          onCheckIn={() => { setShowingSettings(false); setShowingCheckin(true) }}
        />
      )}

      {weather && !showingHistory && !showingSettings && !showingNotes && (
        <main className="main">

          {/* Weather Display */}
          <div className="weather">
            <div className="weather-icon" aria-hidden="true">{weatherEmoji}</div>
            <div className="weather-info">
              <div className="weather-location">{weather.location}</div>
              <div className="weather-condition">{weather.condition}</div>
              <div className="weather-description">{weather.description}</div>
            </div>
            <div className="weather-temp">
              <div className="temp-value">{weather.temp}°F</div>
              <div className="temp-feels">Feels like {weather.feelsLike}°</div>
            </div>
          </div>

          {/* Default location notice (Athalia: surface the fallback) */}
          {usingDefaultLocation && (
            <div className="location-note">Using default location</div>
          )}

          {/* Ritual Count — today + total */}
          {ritualCount > 0 && (
            <div className="ritual-count">
              {todayCount > 0
                ? `${content.ritual.todayCount.replace('{count}', todayCount)} · ${content.ritual.count.replace('{count}', ritualCount)}`
                : content.ritual.count.replace('{count}', ritualCount)
              }
            </div>
          )}

          {/* Quarterly check-in notice — surfaces gently when overdue */}
          {isCheckinDue() && !checkinNoticeDismissed && (
            <div className="checkin-notice">
              <span>{content.checkin.notice}</span>
              <button className="checkin-notice__begin" onClick={() => setShowingCheckin(true)}>
                {content.checkin.begin}
              </button>
              <button className="checkin-notice__dismiss" onClick={() => setCheckinNoticeDismissed(true)} aria-label="Dismiss">
                ×
              </button>
            </div>
          )}

          {/* Phase — self-reported only, never shown as progress */}
          <div className="phase-selector">
            <label className="phase-selector__label" htmlFor="phase-select">
              {content.phase.label}
            </label>
            <select
              id="phase-select"
              className="phase-selector__select"
              value={currentPhase || ''}
              onChange={e => handlePhaseChange(e.target.value)}
            >
              <option value="">{content.phase.unset}</option>
              <option value="active">{content.phases.active}</option>
              <option value="processing">{content.phases.processing}</option>
              <option value="integration">{content.phases.integration}</option>
              <option value="memorial">{content.phases.memorial}</option>
            </select>
          </div>

          {/* Foghorn Trigger — gentle, no alarm emoji (Kilara) */}
          {weather.shouldPlayFoghorn && (
            <div className="foghorn-trigger">
              {content.foghorn.trigger}
            </div>
          )}

          {/* Play Foghorn Button */}
          <button
            className="play-button"
            onClick={handlePlayFoghorn}
            disabled={playing}
          >
            <span className="play-icon" aria-hidden="true">🔊</span>
            <span className="play-text">
              {playing ? content.foghorn.playing : content.foghorn.playButton}
            </span>
          </button>

          {/* Record Ritual — opens capture panel or shows success */}
          {ritualSaved ? (
            <div className="ritual-saved" aria-live="polite">
              ✓ {content.ritual.recorded}
            </div>
          ) : capturingRitual ? (
            <RitualCapture
              onSave={handleSaveRitual}
              onCancel={handleCancelCapture}
              saving={recordingRitual}
            />
          ) : (
            <button
              className="record-button"
              onClick={handleOpenCapture}
            >
              <span className="record-icon" aria-hidden="true">📝</span>
              <span className="record-text">{content.ritual.recordButton}</span>
            </button>
          )}

          {/* Historical Match — between buttons and details (Kilara) */}
          <HistoricalMatch weather={weather} />

          {/* Wind & Humidity */}
          <div className="details">
            <div className="detail-item">
              <span className="detail-label">{content.weather.wind}</span>
              <span className="detail-value">
                {weather.wind.speed} mph {weather.wind.direction}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">{content.weather.humidity}</span>
              <span className="detail-value">{weather.humidity}%</span>
            </div>
          </div>

        </main>
      )}

      {error && weather && (
        <div className="error-banner">{error}</div>
      )}

      <footer className="attribution">
        <span>{content.attribution.foghorn} </span>
        <a
          href={content.attribution.foghornUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="attribution__link"
        >
          {content.attribution.foghornOrg}
        </a>
        <span> · </span>
        <a
          href={content.attribution.donateUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="attribution__link"
        >
          {content.attribution.donate}
        </a>
      </footer>
    </div>
  )
}

export default App
