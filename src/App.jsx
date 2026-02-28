import { useState, useEffect } from 'react'
import './App.css'
import { getCurrentWeather, getUserLocation } from './services/weather'
import { playFoghorn, loadFoghorn } from './services/foghorn'
import { createRitual } from '../core/domain/ritual'
import { saveRitual, getRitualCount } from './services/storage/ritual-storage'
import content from '../content/en.json'

function App() {
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [playing, setPlaying] = useState(false)
  const [location, setLocation] = useState(null)
  const [ritualCount, setRitualCount] = useState(0)
  const [recordingRitual, setRecordingRitual] = useState(false)
  const [foghornPlayed, setFoghornPlayed] = useState(false)

  // Load weather and ritual count on mount
  useEffect(() => {
    async function loadWeather() {
      try {
        setLoading(true)
        setError(null)

        // Get user location (or fall back to default)
        const loc = await getUserLocation()
        setLocation(loc)

        // Get current weather
        const weatherData = await getCurrentWeather(loc.lat, loc.lon)
        setWeather(weatherData)

        // Load ritual count
        const count = await getRitualCount()
        setRitualCount(count)

        // TODO: Load foghorn audio file
        // await loadFoghorn('/path/to/foghorn.mp3')

      } catch (err) {
        if (import.meta.env.DEV) {
          console.error('[App] Failed to load weather:', err)
        }
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadWeather()
  }, [])

  async function handlePlayFoghorn() {
    try {
      setPlaying(true)
      await playFoghorn()
      setFoghornPlayed(true)
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('[App] Failed to play foghorn:', err)
      }
      setError('Could not play foghorn sound')
    } finally {
      setPlaying(false)
    }
  }

  // Record ritual (save to local IndexedDB only)
  async function handleRecordRitual() {
    if (!weather) return

    try {
      setRecordingRitual(true)

      // Create ritual record (no personal data, just weather + timestamp)
      const ritual = createRitual(weather, foghornPlayed)

      // Save locally (never transmitted externally)
      await saveRitual(ritual)

      // Update count
      const count = await getRitualCount()
      setRitualCount(count)

      // Reset foghorn played state
      setFoghornPlayed(false)

      // Show success briefly
      setTimeout(() => setRecordingRitual(false), 1000)
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('[App] Failed to record ritual:', err)
      }
      setError(content.ritual.error)
      setRecordingRitual(false)
    }
  }

  // Refresh weather
  async function handleRefresh() {
    if (!location) return

    try {
      setLoading(true)
      const weatherData = await getCurrentWeather(location.lat, location.lon)
      setWeather(weatherData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading && !weather) {
    return (
      <div className="app">
        <div className="loading">Loading weather...</div>
      </div>
    )
  }

  if (error && !weather) {
    return (
      <div className="app">
        <div className="error">
          <p>Error: {error}</p>
          <p className="hint">Make sure to add your OpenWeatherMap API key to .env</p>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="header">
        <h1 className="title">Foghorn</h1>
        <button
          className="refresh-button"
          onClick={handleRefresh}
          disabled={loading}
        >
          ↻
        </button>
      </header>

      {weather && (
        <main className="main">
          {/* Weather Display */}
          <div className="weather">
            <div className="weather-icon">
              {weather.condition === 'Fog' || weather.condition === 'Mist' ? '🌫️' :
               weather.condition === 'Rain' || weather.condition === 'Drizzle' ? '🌧️' :
               weather.condition === 'Snow' ? '🌨️' :
               weather.condition === 'Clouds' ? '☁️' :
               '☀️'}
            </div>

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

          {/* Foghorn Trigger Indicator */}
          {weather.shouldPlayFoghorn && (
            <div className="foghorn-trigger">
              ⚠️ Foghorn weather detected
            </div>
          )}

          {/* Play Foghorn Button */}
          <button
            className="play-button"
            onClick={handlePlayFoghorn}
            disabled={playing}
          >
            <span className="play-icon">🔊</span>
            <span className="play-text">
              {playing ? content.foghorn.playing : content.foghorn.playButton}
            </span>
          </button>

          {/* Record Ritual Button */}
          <button
            className="record-button"
            onClick={handleRecordRitual}
            disabled={recordingRitual}
          >
            <span className="record-icon">📝</span>
            <span className="record-text">
              {recordingRitual ? content.ritual.recording : content.ritual.recordButton}
            </span>
          </button>

          {/* Ritual Count */}
          {ritualCount > 0 && (
            <div className="ritual-count">
              {content.ritual.count.replace('{count}', ritualCount)}
            </div>
          )}

          {/* Historical Match (Placeholder) */}
          <div className="historical-section">
            <div className="historical-label">Similar to:</div>
            <div className="historical-info">
              Historical matching coming soon...
            </div>
          </div>

          {/* Wind & Humidity */}
          <div className="details">
            <div className="detail-item">
              <span className="detail-label">Wind</span>
              <span className="detail-value">
                {weather.wind.speed} mph {weather.wind.direction}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Humidity</span>
              <span className="detail-value">{weather.humidity}%</span>
            </div>
          </div>
        </main>
      )}

      {error && weather && (
        <div className="error-banner">{error}</div>
      )}
    </div>
  )
}

export default App
