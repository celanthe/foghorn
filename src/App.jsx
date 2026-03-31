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
import Onboarding, { loadOnboarding } from './components/Onboarding'
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

const LOCATION_CONSENT_KEY = 'foghorn_location_consent'

function App() {
  const [onboardingComplete, setOnboardingComplete] = useState(() => loadOnboarding() !== null)
  const [locationConsent, setLocationConsent]    = useState(() => localStorage.getItem(LOCATION_CONSENT_KEY))
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

  function handleLocationConsent(granted) {
    const value = granted ? 'granted' : 'denied'
    localStorage.setItem(LOCATION_CONSENT_KEY, value)
    setLocationConsent(value)
  }

  useEffect(() => {
    async function loadWeather() {
      try {
        setLoading(true)
        setError(null)

        const currentSettings = loadSettings()
        setSettings(currentSettings)

        // If no location override and no consent yet, wait for consent
        if (!currentSettings.locationOverride && !locationConsent) {
          setLoading(false)
          return
        }

        let loc
        if (currentSettings.locationOverride) {
          loc = { ...currentSettings.locationOverride, usingDefault: false }
        } else if (locationConsent === 'granted') {
          loc = await getUserLocation()
        } else {
          // Consent denied — use default location
          const defaultLat = parseFloat(import.meta.env.VITE_DEFAULT_LAT)
          const defaultLon = parseFloat(import.meta.env.VITE_DEFAULT_LON)
          loc = { lat: defaultLat, lon: defaultLon, usingDefault: true }
        }
        setLocation(loc)
        if (loc.usingDefault) setUsingDefault(true)

        const weatherData = await getCurrentWeather(loc.lat, loc.lon)

        // Apply user's trigger settings
        const { foghornTriggers } = currentSettings
        const shouldPlay = Object.entries(TRIGGER_CONDITION_MAP)
          .some(([key, conditions]) => foghornTriggers[key] && conditions.includes(weatherData.condition))
        weatherData.shouldPlayFoghorn = shouldPlay

        setWeather(weatherData)

      } catch (err) {
        if (import.meta.env.DEV) {
          console.error('[App] Failed to load weather:', err)
        }
        setError(import.meta.env.DEV ? err.message : content.weather.errorHint)
      } finally {
        // Always load ritual counts, even if weather failed
        try {
          const count = await getRitualCount()
          setRitualCount(count)

          const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
          const todayEnd   = new Date(); todayEnd.setHours(23, 59, 59, 999)
          const todayRituals = await getRitualsByDateRange(todayStart, todayEnd)
          setTodayCount(todayRituals.length)
        } catch (e) {
          if (import.meta.env.DEV) console.error('[App] Failed to load ritual counts:', e)
        }
        setLoading(false)
      }
    }

    loadWeather()
  }, [locationConsent])

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
    try {
      setRecordingRitual(true)

      const weatherContext = weather || null
      const ritual = createRitual(weatherContext, foghornPlayed, intensity, lossType, duration, notes, currentPhase)
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
      setTimeout(() => setRitualSaved(false), 5000)

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
      setError(import.meta.env.DEV ? err.message : content.weather.errorHint)
    } finally {
      setLoading(false)
    }
  }

  if (!onboardingComplete) {
    return (
      <div className="app">
        <Onboarding onComplete={() => setOnboardingComplete(true)} />
      </div>
    )
  }

  if (!locationConsent && !loadSettings().locationOverride) {
    return (
      <div className="app">
        <div className="location-consent">
          <h1 className="location-consent__title">{content.app.title}</h1>
          <p className="location-consent__prompt">{content.locationConsent.prompt}</p>
          <div className="location-consent__actions">
            <button
              className="location-consent__accept"
              onClick={() => handleLocationConsent(true)}
            >
              {content.locationConsent.accept}
            </button>
            <button
              className="location-consent__deny"
              onClick={() => handleLocationConsent(false)}
            >
              {content.locationConsent.deny}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (loading && !weather) {
    return (
      <div className="app">
        <div className="loading">
          <h1 className="loading__title">{content.app.title}</h1>
          <p className="loading__text">{content.weather.loading}</p>
        </div>
      </div>
    )
  }

  /* Weather errors are now shown inline — ritual UI stays accessible */

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
      <a href="#main-content" className="skip-link">Skip to content</a>
      <header className="header">
        <div className="header-title-group">
          <h1 className="title">{content.app.title}</h1>
          <p className="tagline">{content.app.tagline}</p>
        </div>
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
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </button>
          <button
            className="refresh-button"
            onClick={handleRefresh}
            disabled={loading}
            aria-label={content.weather.refresh}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="23 4 23 10 17 10"/>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
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

      {!showingHistory && !showingSettings && !showingNotes && (
        <main className="main" id="main-content">

          {/* Weather Display */}
          {weather ? (
            <div className="weather">
              <div className="weather-icon" aria-hidden="true">{weatherEmoji}</div>
              <div className="weather-info">
                <div className="weather-location">{weather.location}</div>
                <div className="weather-condition">{weather.condition}</div>
                <div className="weather-description">{weather.description}</div>
              </div>
              <div className="weather-temp">
                <div className="temp-value">{weather.temp}{content.weather.tempUnit}</div>
                <div className="temp-feels">{content.weather.feelsLikeShort} {weather.feelsLike}°</div>
              </div>
            </div>
          ) : loading ? (
            <div className="weather weather--loading">
              <p>{content.weather.loading}</p>
            </div>
          ) : error ? (
            <div className="weather weather--error">
              <p>{content.weather.unavailable}</p>
              <p className="hint">{content.weather.errorHint}</p>
            </div>
          ) : null}

          {/* Default location notice (Athalia: surface the fallback) */}
          {usingDefaultLocation && (
            <div className="location-note">{content.weather.defaultLocation}</div>
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

          {todayCount === 0 && !capturingRitual && !ritualSaved && (
            <p className="ritual-prompt">{content.ritual.firstRitual}</p>
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
          {weather && weather.shouldPlayFoghorn && (
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
            {playing ? (
              <svg className="play-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <rect x="6" y="6" width="12" height="12" rx="2"/>
              </svg>
            ) : (
              <svg className="play-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
              </svg>
            )}
            <span className="play-text" aria-live="polite">
              {playing ? content.foghorn.playing : content.foghorn.playButton}
            </span>
          </button>

          {/* Record Ritual — opens capture panel or shows success */}
          {ritualSaved ? (
            <button
              className="ritual-saved"
              aria-live="polite"
              onClick={() => setRitualSaved(false)}
            >
              ✓ {content.ritual.recorded}
            </button>
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
              <svg className="record-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 20h9"/>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
              </svg>
              <span className="record-text">{content.ritual.recordButton}</span>
            </button>
          )}

          {/* Historical Match — between buttons and details (Kilara) */}
          {weather && <HistoricalMatch weather={weather} />}

          {/* Wind & Humidity */}
          {weather && (
            <div className="details">
              <div className="detail-item">
                <span className="detail-label">{content.weather.wind}</span>
                <span className="detail-value">
                  {weather.wind.speed} {content.weather.windUnit} {weather.wind.direction}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">{content.weather.humidity}</span>
                <span className="detail-value">{weather.humidity}%</span>
              </div>
            </div>
          )}

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
