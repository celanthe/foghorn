import { useState, useEffect } from 'react'
import './App.css'
import { getCurrentWeather, getUserLocation } from './services/weather'
import { playFoghorn } from './services/foghorn'
import { createRitual } from '../core/domain/ritual'
import { saveRitual, getRitualCount } from './services/storage/ritual-storage'
import HistoricalMatch from './components/HistoricalMatch'
import RitualCapture from './components/RitualCapture'
import content from '../content/en.json'

function App() {
  const [weather, setWeather]                   = useState(null)
  const [loading, setLoading]                   = useState(true)
  const [error, setError]                       = useState(null)
  const [playing, setPlaying]                   = useState(false)
  const [location, setLocation]                 = useState(null)
  const [usingDefaultLocation, setUsingDefault] = useState(false)
  const [ritualCount, setRitualCount]           = useState(0)
  const [foghornPlayed, setFoghornPlayed]       = useState(false)
  const [capturingRitual, setCapturingRitual]   = useState(false)
  const [recordingRitual, setRecordingRitual]   = useState(false)
  const [ritualSaved, setRitualSaved]           = useState(false)

  useEffect(() => {
    async function loadWeather() {
      try {
        setLoading(true)
        setError(null)

        const loc = await getUserLocation()
        setLocation(loc)
        if (loc.usingDefault) setUsingDefault(true)

        const weatherData = await getCurrentWeather(loc.lat, loc.lon)
        setWeather(weatherData)

        const count = await getRitualCount()
        setRitualCount(count)


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

  async function handleSaveRitual({ intensity, lossType }) {
    if (!weather) return

    try {
      setRecordingRitual(true)

      const ritual = createRitual(weather, foghornPlayed, intensity, lossType)
      await saveRitual(ritual)

      const count = await getRitualCount()
      setRitualCount(count)

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
      const weatherData = await getCurrentWeather(location.lat, location.lon)
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
        <button
          className="refresh-button"
          onClick={handleRefresh}
          disabled={loading}
          aria-label={content.weather.refresh}
        >
          ↻
        </button>
      </header>

      {weather && (
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

          {/* Ritual Count — grounding anchor before action (Kilara) */}
          {ritualCount > 0 && (
            <div className="ritual-count">
              {content.ritual.count.replace('{count}', ritualCount)}
            </div>
          )}

          {/* Foghorn Trigger — gentle, no alarm emoji (Kilara) */}
          {weather.shouldPlayFoghorn && (
            <div className="foghorn-trigger">
              Foghorn weather
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
