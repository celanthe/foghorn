import { useState, useRef, useEffect } from 'react'
import content from '../../content/en.json'
import './RitualCapture.css'

const INTENSITY_LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

const LOSS_TYPES = [
  { key: 'person',       label: content.ritual.lossTypes.person },
  { key: 'relationship', label: content.ritual.lossTypes.relationship },
  { key: 'self',         label: content.ritual.lossTypes.self },
  { key: 'place',        label: content.ritual.lossTypes.place },
  { key: 'multiple',     label: content.ritual.lossTypes.multiple },
]

/**
 * RitualCapture — inline capture panel for intensity + loss type
 * Both fields are optional. User can save with neither selected.
 *
 * @param {function} onSave   - Called with { intensity, lossType }
 * @param {function} onCancel - Called with no args
 * @param {boolean}  saving   - True while save is in progress
 */
export default function RitualCapture({ onSave, onCancel, saving }) {
  const [intensity, setIntensity] = useState(null)
  const [lossType, setLossType]   = useState(null)
  const [notes, setNotes]         = useState('')
  const startTimeRef              = useRef(Date.now())

  useEffect(() => {
    startTimeRef.current = Date.now()
  }, [])

  function handleSave() {
    const duration = Math.round((Date.now() - startTimeRef.current) / 1000)
    onSave({ intensity, lossType, duration, notes: notes.trim() || null })
  }

  return (
    <div className="ritual-capture">
      <div className="ritual-capture__section">
        <p className="ritual-capture__prompt">{content.ritual.intensityPrompt}</p>
        <div className="ritual-capture__intensity" role="group" aria-label="Grief intensity">
          {INTENSITY_LEVELS.map(n => (
            <button
              key={n}
              className={`ritual-capture__dot${intensity === n ? ' ritual-capture__dot--selected' : ''}`}
              onClick={() => setIntensity(intensity === n ? null : n)}
              aria-pressed={intensity === n}
              aria-label={`${n} out of 10`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <div className="ritual-capture__section">
        <p className="ritual-capture__prompt">{content.ritual.lossTypePrompt}</p>
        <div className="ritual-capture__loss-types" role="group" aria-label="What's on your mind">
          {LOSS_TYPES.map(({ key, label }) => (
            <button
              key={key}
              className={`ritual-capture__loss-btn${lossType === key ? ' ritual-capture__loss-btn--selected' : ''}`}
              onClick={() => setLossType(lossType === key ? null : key)}
              aria-pressed={lossType === key}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="ritual-capture__section">
        <textarea
          className="ritual-capture__notes"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder={content.memory.prompt}
          maxLength={500}
          rows={3}
          aria-label={content.memory.prompt}
        />
      </div>

      <div className="ritual-capture__actions">
        <button
          className="ritual-capture__save"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? content.ritual.recording : content.ritual.recordButton}
        </button>
        <button
          className="ritual-capture__cancel"
          onClick={onCancel}
          disabled={saving}
        >
          {content.ritual.cancelCapture}
        </button>
      </div>
    </div>
  )
}
