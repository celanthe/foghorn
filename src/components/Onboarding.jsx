import { useState } from 'react'
import content from '../../content/en.json'
import './Onboarding.css'

const ONBOARDING_KEY = 'foghorn_onboarding'
const TOTAL_STEPS = 3

const SEASONS = ['winter', 'spring', 'summer', 'fall']
const WEATHER_TYPES = ['rain', 'fog', 'snow', 'heat', 'cold', 'wind']

export function loadOnboarding() {
  try {
    return JSON.parse(localStorage.getItem(ONBOARDING_KEY))
  } catch {
    return null
  }
}

function toggleItem(list, item) {
  return list.includes(item)
    ? list.filter(i => i !== item)
    : [...list, item]
}

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [hardSeasons, setHardSeasons] = useState([])
  const [hardWeather, setHardWeather] = useState([])
  const [lovedSeasons, setLovedSeasons] = useState([])
  const [lovedWeather, setLovedWeather] = useState([])
  const [mode, setMode] = useState('ambient')
  const [companionInterval, setCompanionInterval] = useState('daily')

  const c = content.onboarding

  function handleNext() {
    if (step < TOTAL_STEPS - 1) {
      setStep(step + 1)
    }
  }

  function handleBack() {
    if (step > 0) {
      setStep(step - 1)
    }
  }

  function handleFinish() {
    const data = {
      name: name.trim(),
      weatherPreferences: {
        hardSeasons,
        hardWeather,
        lovedSeasons,
        lovedWeather,
      },
      mode,
      companionInterval: mode === 'companion' ? companionInterval : null,
      completedAt: new Date().toISOString(),
    }
    localStorage.setItem(ONBOARDING_KEY, JSON.stringify(data))
    onComplete(data)
  }

  const canProceed = step === 0 ? name.trim().length > 0 : true
  const isLastStep = step === TOTAL_STEPS - 1

  return (
    <div className="onboarding">
      <div className="onboarding__backdrop" />
      <div className="onboarding__panel">
        <h1 className="onboarding__title">{c.title}</h1>
        <p className="onboarding__subtitle">{c.subtitle}</p>
        <p className="onboarding__step">
          {c.stepOf.replace('{current}', step + 1).replace('{total}', TOTAL_STEPS)}
        </p>

        {/* Step 0: Name */}
        {step === 0 && (
          <div>
            <label className="onboarding__label" htmlFor="onboarding-name">
              {c.nameLabel}
            </label>
            <input
              id="onboarding-name"
              className="onboarding__input"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={c.namePlaceholder}
              autoFocus
            />
          </div>
        )}

        {/* Step 1: Weather preferences */}
        {step === 1 && (
          <div>
            <div className="onboarding__section">
              <p className="onboarding__section-label">{c.weatherHardLabel}</p>
              <div className="onboarding__pills" role="group" aria-label={c.weatherHardLabel}>
                {SEASONS.map(s => (
                  <button
                    key={s}
                    className={`onboarding__pill${hardSeasons.includes(s) ? ' onboarding__pill--selected' : ''}`}
                    onClick={() => setHardSeasons(toggleItem(hardSeasons, s))}
                    aria-pressed={hardSeasons.includes(s)}
                    type="button"
                  >
                    {c.seasons[s]}
                  </button>
                ))}
                {WEATHER_TYPES.map(w => (
                  <button
                    key={w}
                    className={`onboarding__pill${hardWeather.includes(w) ? ' onboarding__pill--selected' : ''}`}
                    onClick={() => setHardWeather(toggleItem(hardWeather, w))}
                    aria-pressed={hardWeather.includes(w)}
                    type="button"
                  >
                    {c.weatherTypes[w]}
                  </button>
                ))}
              </div>
            </div>

            <div className="onboarding__section">
              <p className="onboarding__section-label">{c.weatherLoveLabel}</p>
              <div className="onboarding__pills" role="group" aria-label={c.weatherLoveLabel}>
                {SEASONS.map(s => (
                  <button
                    key={s}
                    className={`onboarding__pill${lovedSeasons.includes(s) ? ' onboarding__pill--selected' : ''}`}
                    onClick={() => setLovedSeasons(toggleItem(lovedSeasons, s))}
                    aria-pressed={lovedSeasons.includes(s)}
                    type="button"
                  >
                    {c.seasons[s]}
                  </button>
                ))}
                {WEATHER_TYPES.map(w => (
                  <button
                    key={w}
                    className={`onboarding__pill${lovedWeather.includes(w) ? ' onboarding__pill--selected' : ''}`}
                    onClick={() => setLovedWeather(toggleItem(lovedWeather, w))}
                    aria-pressed={lovedWeather.includes(w)}
                    type="button"
                  >
                    {c.weatherTypes[w]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Mode selection */}
        {step === 2 && (
          <div>
            <div className="onboarding__cards">
              <button
                className={`onboarding__card${mode === 'ambient' ? ' onboarding__card--selected' : ''}`}
                onClick={() => setMode('ambient')}
                type="button"
                aria-pressed={mode === 'ambient'}
              >
                <div className="onboarding__card-title">{c.ambientTitle}</div>
                <div className="onboarding__card-desc">{c.ambientDesc}</div>
              </button>

              <button
                className={`onboarding__card${mode === 'companion' ? ' onboarding__card--selected' : ''}`}
                onClick={() => setMode('companion')}
                type="button"
                aria-pressed={mode === 'companion'}
              >
                <div className="onboarding__card-title">{c.companionTitle}</div>
                <div className="onboarding__card-desc">{c.companionDesc}</div>
              </button>
            </div>

            {mode === 'companion' && (
              <div className="onboarding__interval">
                <label className="onboarding__interval-label" htmlFor="onboarding-interval">
                  {c.intervalLabel}
                </label>
                <select
                  id="onboarding-interval"
                  className="onboarding__select"
                  value={companionInterval}
                  onChange={e => setCompanionInterval(e.target.value)}
                >
                  <option value="daily">{c.intervalOptions.daily}</option>
                  <option value="everyFewDays">{c.intervalOptions.everyFewDays}</option>
                  <option value="weekly">{c.intervalOptions.weekly}</option>
                </select>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="onboarding__actions">
          {step > 0 && (
            <button className="onboarding__back" onClick={handleBack} type="button">
              {c.back}
            </button>
          )}
          <button
            className="onboarding__next"
            onClick={isLastStep ? handleFinish : handleNext}
            disabled={!canProceed}
            type="button"
          >
            {isLastStep ? c.finish : c.next}
          </button>
        </div>
      </div>
    </div>
  )
}
