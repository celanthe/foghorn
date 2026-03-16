import { useState } from 'react'
import { createRitual } from '../../core/domain/ritual'
import { saveRitual } from '../services/storage/ritual-storage'
import content from '../../content/en.json'
import './RetroRitualCapture.css'

const CONDITIONS = [
  'Fog', 'Mist', 'Haze', 'Rain', 'Drizzle', 'Sleet', 'Snow',
  'Clouds', 'Clear', 'Thunderstorm',
]

const INTENSITY_LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

const LOSS_TYPES = [
  { key: 'person',       label: content.ritual.lossTypes.person },
  { key: 'relationship', label: content.ritual.lossTypes.relationship },
  { key: 'self',         label: content.ritual.lossTypes.self },
  { key: 'place',        label: content.ritual.lossTypes.place },
  { key: 'multiple',     label: content.ritual.lossTypes.multiple },
]

const today = () => new Date().toISOString().split('T')[0]

/**
 * RetroRitualCapture — modal for entering past rituals with a custom date.
 * Saves directly to storage. Calls onSaved() on success, onCancel() to dismiss.
 */
export default function RetroRitualCapture({ onSaved, onCancel }) {
  const [date, setDate]               = useState(today())
  const [time, setTime]               = useState('09:00')
  const [condition, setCondition]     = useState('')
  const [temp, setTemp]               = useState('')
  const [foghornPlayed, setFoghorn]   = useState(false)
  const [intensity, setIntensity]     = useState(null)
  const [lossType, setLossType]       = useState(null)
  const [phase, setPhase]             = useState('')
  const [notes, setNotes]             = useState('')
  const [saving, setSaving]           = useState(false)
  const [saved, setSaved]             = useState(false)

  async function handleSave() {
    if (!date) return
    setSaving(true)
    try {
      const timestamp = new Date(`${date}T${time || '00:00'}`).toISOString()
      const weather = {
        condition:   condition || 'Unknown',
        description: condition?.toLowerCase() || '',
        temp:        temp ? parseInt(temp, 10) : null,
        feelsLike:   temp ? parseInt(temp, 10) : null,
        location:    'manual entry',
        wind:        { speed: null, direction: null },
      }
      const ritual = createRitual(
        weather, foghornPlayed, intensity, lossType || null,
        null, notes.trim() || null, phase || null, timestamp
      )
      await saveRitual(ritual)
      setSaved(true)
      setTimeout(() => onSaved(), 1000)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="retro-capture" role="dialog" aria-labelledby="retro-title">
      <div className="retro-capture__backdrop" onClick={onCancel} aria-hidden="true" />
      <div className="retro-capture__panel">
        <h3 className="retro-capture__title" id="retro-title">{content.retro.title}</h3>

        {saved ? (
          <div className="retro-capture__saved" aria-live="polite">{content.retro.saved}</div>
        ) : (
          <>
            <div className="retro-capture__row">
              <div className="retro-capture__field">
                <label className="retro-capture__label" htmlFor="retro-date">{content.retro.dateLabel}</label>
                <input
                  id="retro-date"
                  type="date"
                  className="retro-capture__input"
                  value={date}
                  max={today()}
                  onChange={e => setDate(e.target.value)}
                />
              </div>
              <div className="retro-capture__field">
                <label className="retro-capture__label" htmlFor="retro-time">{content.retro.timeLabel}</label>
                <input
                  id="retro-time"
                  type="time"
                  className="retro-capture__input"
                  value={time}
                  onChange={e => setTime(e.target.value)}
                />
              </div>
            </div>

            <div className="retro-capture__row">
              <div className="retro-capture__field">
                <label className="retro-capture__label" htmlFor="retro-condition">{content.retro.conditionLabel}</label>
                <select
                  id="retro-condition"
                  className="retro-capture__select"
                  value={condition}
                  onChange={e => setCondition(e.target.value)}
                >
                  <option value="">{content.retro.conditionPlaceholder}</option>
                  {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="retro-capture__field">
                <label className="retro-capture__label" htmlFor="retro-temp">{content.retro.tempLabel}</label>
                <input
                  id="retro-temp"
                  type="number"
                  className="retro-capture__input"
                  value={temp}
                  onChange={e => setTemp(e.target.value)}
                  placeholder="e.g. 45"
                />
              </div>
            </div>

            <label className="retro-capture__checkbox-row">
              <input
                type="checkbox"
                checked={foghornPlayed}
                onChange={e => setFoghorn(e.target.checked)}
                className="retro-capture__checkbox"
              />
              <span className="retro-capture__label">{content.retro.foghornLabel}</span>
            </label>

            <div className="retro-capture__section">
              <p className="retro-capture__prompt">{content.ritual.intensityPrompt}</p>
              <div className="retro-capture__intensity" role="group" aria-label="Grief intensity">
                {INTENSITY_LEVELS.map(n => (
                  <button
                    key={n}
                    className={`retro-capture__dot${intensity === n ? ' retro-capture__dot--selected' : ''}`}
                    onClick={() => setIntensity(intensity === n ? null : n)}
                    aria-pressed={intensity === n}
                    aria-label={`${n} out of 10`}
                  >{n}</button>
                ))}
              </div>
            </div>

            <div className="retro-capture__section">
              <p className="retro-capture__prompt">{content.ritual.lossTypePrompt}</p>
              <div className="retro-capture__loss-types" role="group">
                {LOSS_TYPES.map(({ key, label }) => (
                  <button
                    key={key}
                    className={`retro-capture__loss-btn${lossType === key ? ' retro-capture__loss-btn--selected' : ''}`}
                    onClick={() => setLossType(lossType === key ? null : key)}
                    aria-pressed={lossType === key}
                  >{label}</button>
                ))}
              </div>
            </div>

            <div className="retro-capture__section">
              <label className="retro-capture__label" htmlFor="retro-phase">{content.phase.label}</label>
              <select
                id="retro-phase"
                className="retro-capture__select"
                value={phase}
                onChange={e => setPhase(e.target.value)}
              >
                <option value="">{content.phase.unset}</option>
                <option value="active">{content.phases.active}</option>
                <option value="processing">{content.phases.processing}</option>
                <option value="integration">{content.phases.integration}</option>
                <option value="memorial">{content.phases.memorial}</option>
              </select>
            </div>

            <div className="retro-capture__section">
              <textarea
                className="retro-capture__notes"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder={content.memory.prompt}
                maxLength={500}
                rows={3}
                aria-label={content.memory.prompt}
              />
            </div>

            <div className="retro-capture__actions">
              <button
                className="retro-capture__save"
                onClick={handleSave}
                disabled={saving || !date}
              >
                {saving ? '...' : content.retro.save}
              </button>
              <button className="retro-capture__cancel" onClick={onCancel}>
                {content.retro.cancel}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
