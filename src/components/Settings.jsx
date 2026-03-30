import { useState } from 'react'
import content from '../../content/en.json'
import './Settings.css'

const Q_SHORT = [
  content.checkin.q1short,
  content.checkin.q2short,
  content.checkin.q3short,
  content.checkin.q4short,
  content.checkin.q5short,
]

const STORAGE_KEY = 'foghorn_settings'

export function loadSettings() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || defaultSettings()
  } catch {
    return defaultSettings()
  }
}

export function defaultSettings() {
  return {
    locationOverride: null,
    foghornTriggers: { fog: true, rain: true, sleet: true, snow: true },
  }
}

/**
 * Settings panel
 * @param {function} onClose           - Close the panel
 * @param {function} onSave            - Called with settings object when saved
 * @param {function} onCheckIn         - Trigger quarterly check-in
 */
export default function Settings({ onClose, onSave, onCheckIn }) {
  const initial                             = loadSettings()
  const [latInput, setLatInput]             = useState(initial.locationOverride?.lat?.toString() ?? '')
  const [lonInput, setLonInput]             = useState(initial.locationOverride?.lon?.toString() ?? '')
  const [triggers, setTriggers]             = useState(initial.foghornTriggers)
  const [saveStatus, setSaveStatus]         = useState(null) // null | 'saved'

  const lastCheckin = localStorage.getItem('foghorn_last_checkin')
  const lastCheckinDisplay = lastCheckin
    ? new Date(lastCheckin).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : null

  const checkinHistory = (() => {
    try {
      return JSON.parse(localStorage.getItem('foghorn_checkins') || '[]').reverse()
    } catch { return [] }
  })()

  function toggleTrigger(key) {
    setTriggers(prev => ({ ...prev, [key]: !prev[key] }))
  }

  function handleClearLocation() {
    setLatInput('')
    setLonInput('')
  }

  function handleSave() {
    const lat = parseFloat(latInput)
    const lon = parseFloat(lonInput)
    const locationOverride = (!isNaN(lat) && !isNaN(lon) && latInput && lonInput)
      ? { lat, lon }
      : null

    const settings = { locationOverride, foghornTriggers: triggers }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    onSave(settings)
    setSaveStatus('saved')
    setTimeout(() => setSaveStatus(null), 2000)
  }

  return (
    <div className="settings">

      <div className="settings__header">
        <h2 className="settings__title">{content.settings.title}</h2>
        <button className="settings__close" onClick={onClose} aria-label="Close settings">×</button>
      </div>

      <div className="settings__body">

        {/* Foghorn triggers */}
        <section className="settings__section">
          <h3 className="settings__section-title">{content.settings.foghornTitle}</h3>
          <div className="settings__trigger-list">
            {[
              { key: 'fog',   label: content.settings.fog },
              { key: 'rain',  label: content.settings.rain },
              { key: 'sleet', label: content.settings.sleet },
              { key: 'snow',  label: content.settings.snow },
            ].map(({ key, label }) => (
              <label key={key} className="settings__trigger">
                <input
                  type="checkbox"
                  className="settings__checkbox"
                  checked={triggers[key]}
                  onChange={() => toggleTrigger(key)}
                />
                <span className="settings__trigger-label">{label}</span>
              </label>
            ))}
          </div>
        </section>

        {/* Location override */}
        <section className="settings__section">
          <h3 className="settings__section-title">{content.settings.locationTitle}</h3>
          <div className="settings__location-inputs">
            <input
              type="number"
              className="settings__input"
              value={latInput}
              onChange={e => setLatInput(e.target.value)}
              placeholder={content.settings.latPlaceholder}
              step="0.0001"
              aria-label="Latitude"
            />
            <input
              type="number"
              className="settings__input"
              value={lonInput}
              onChange={e => setLonInput(e.target.value)}
              placeholder={content.settings.lonPlaceholder}
              step="0.0001"
              aria-label="Longitude"
            />
          </div>
          {(latInput || lonInput) && (
            <button className="settings__text-btn" onClick={handleClearLocation}>
              {content.settings.clearLocation}
            </button>
          )}
        </section>

        {/* Quarterly check-in */}
        <section className="settings__section">
          <h3 className="settings__section-title">{content.settings.checkinTitle}</h3>
          <p className="settings__checkin-meta">
            {lastCheckinDisplay
              ? content.settings.lastCheckin.replace('{date}', lastCheckinDisplay)
              : content.settings.neverCheckin}
          </p>
          <button className="settings__checkin-btn" onClick={onCheckIn}>
            {content.settings.checkinButton}
          </button>
        </section>

        {/* Check-in history */}
        {checkinHistory.length > 0 && (
          <section className="settings__section">
            <h3 className="settings__section-title">{content.checkin.historyTitle}</h3>
            <div className="settings__checkin-history">
              {checkinHistory.map(entry => (
                <div key={entry.id} className="settings__checkin-entry">
                  <div className="settings__checkin-entry-date">
                    {new Date(entry.timestamp).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric'
                    })}
                  </div>
                  <div className="settings__checkin-scores">
                    {entry.scores.map((score, i) => (
                      <div key={i} className="settings__checkin-score">
                        <span className="settings__checkin-score-label">{Q_SHORT[i]}</span>
                        <span className="settings__checkin-score-value">{score}/5</span>
                      </div>
                    ))}
                  </div>
                  {entry.notes && (
                    <div className="settings__checkin-entry-notes">{entry.notes}</div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

      </div>

      <div className="settings__footer">
        <p className="settings__privacy">{content.settings.privacy}</p>
        <button className="settings__save" onClick={handleSave}>
          {saveStatus === 'saved' ? content.settings.saved : content.settings.save}
        </button>
      </div>

    </div>
  )
}
