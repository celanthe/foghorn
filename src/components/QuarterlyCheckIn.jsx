import { useState } from 'react'
import content from '../../content/en.json'
import './QuarterlyCheckIn.css'

const QUESTIONS = [
  content.checkin.q1,
  content.checkin.q2,
  content.checkin.q3,
  content.checkin.q4,
  content.checkin.q5,
]

const SCALE = [1, 2, 3, 4, 5]

/**
 * QuarterlyCheckIn — adapted self-report instrument for ambiguous loss research.
 * Not a clinical tool. Consistent responses over time are what matter.
 *
 * @param {function} onComplete - Called with { scores, notes, timestamp }
 * @param {function} onSkip     - Called with no args
 */
export default function QuarterlyCheckIn({ onComplete, onSkip }) {
  const [scores, setScores] = useState([null, null, null, null, null])
  const [notes, setNotes]   = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved]   = useState(false)

  const allAnswered = scores.every(s => s !== null)

  function setScore(questionIndex, value) {
    setScores(prev => prev.map((s, i) => i === questionIndex ? value : s))
  }

  async function handleSave() {
    if (!allAnswered) return
    setSaving(true)
    const result = {
      id: `checkin_${Date.now()}`,
      timestamp: new Date().toISOString(),
      scores,
      notes: notes.trim() || null,
    }
    try {
      const existing = JSON.parse(localStorage.getItem('foghorn_checkins') || '[]')
      existing.push(result)
      localStorage.setItem('foghorn_checkins', JSON.stringify(existing))
      localStorage.setItem('foghorn_last_checkin', result.timestamp)
      setSaved(true)
      setTimeout(() => onComplete(result), 1200)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="quarterly-checkin" role="dialog" aria-labelledby="checkin-title">
      <div className="quarterly-checkin__backdrop" onClick={onSkip} aria-hidden="true" />
      <div className="quarterly-checkin__panel">
        <h2 className="quarterly-checkin__title" id="checkin-title">
          {content.checkin.title}
        </h2>
        <p className="quarterly-checkin__subtitle">{content.checkin.subtitle}</p>

        {saved ? (
          <div className="quarterly-checkin__saved" aria-live="polite">
            {content.checkin.saved}
          </div>
        ) : (
          <>
            <div className="quarterly-checkin__questions">
              {QUESTIONS.map((q, qi) => (
                <div key={qi} className="quarterly-checkin__question">
                  <p className="quarterly-checkin__q-text">{q}</p>
                  <div className="quarterly-checkin__scale" role="group" aria-label={q}>
                    <span className="quarterly-checkin__scale-label">{content.checkin.scale1}</span>
                    {SCALE.map(val => (
                      <button
                        key={val}
                        className={`quarterly-checkin__dot${scores[qi] === val ? ' quarterly-checkin__dot--selected' : ''}`}
                        onClick={() => setScore(qi, val)}
                        aria-pressed={scores[qi] === val}
                        aria-label={`${val} out of 5`}
                      >
                        {val}
                      </button>
                    ))}
                    <span className="quarterly-checkin__scale-label">{content.checkin.scale5}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="quarterly-checkin__notes-section">
              <textarea
                className="quarterly-checkin__notes"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder={content.checkin.notesPrompt}
                maxLength={1000}
                rows={3}
                aria-label={content.checkin.notesPrompt}
              />
            </div>

            <div className="quarterly-checkin__actions">
              <button
                className="quarterly-checkin__save"
                onClick={handleSave}
                disabled={!allAnswered || saving}
              >
                {saving ? '...' : content.checkin.save}
              </button>
              <button className="quarterly-checkin__skip" onClick={onSkip}>
                {content.checkin.skip}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
