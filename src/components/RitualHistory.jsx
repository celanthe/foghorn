import { useState, useEffect } from 'react'
import { getAllRituals, exportRituals, exportRitualsCSV, deleteRitual } from '../services/storage/ritual-storage'
import { formatRitual } from '../../core/domain/ritual'
import RitualAnalytics from './RitualAnalytics'
import content from '../../content/en.json'
import './RitualHistory.css'

function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return null
  if (seconds < 60) return `${seconds}s`
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return s > 0 ? `${m}m ${s}s` : `${m}m`
}

export default function RitualHistory({ onClose }) {
  const [rituals, setRituals]       = useState([])
  const [loading, setLoading]       = useState(true)
  const [exporting, setExporting]   = useState(false)
  const [exportingCSV, setExportingCSV] = useState(false)
  const [tab, setTab]               = useState('history')

  useEffect(() => {
    getAllRituals()
      .then(all => setRituals(all))
      .finally(() => setLoading(false))
  }, [])

  async function handleExport() {
    try {
      setExporting(true)
      const json = await exportRituals()
      const blob = new Blob([json], { type: 'application/json' })
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `foghorn-rituals-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setExporting(false)
    }
  }

  async function handleExportCSV() {
    try {
      setExportingCSV(true)
      const csv  = await exportRitualsCSV()
      const blob = new Blob([csv], { type: 'text/csv' })
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `foghorn-rituals-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setExportingCSV(false)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm(content.history.deleteConfirm)) return
    await deleteRitual(id)
    setRituals(prev => prev.filter(r => r.id !== id))
  }

  return (
    <div className="ritual-history">
      <div className="ritual-history__header">
        <div className="ritual-history__tabs">
          <button
            className={`ritual-history__tab${tab === 'history' ? ' ritual-history__tab--active' : ''}`}
            onClick={() => setTab('history')}
          >
            {content.history.tabHistory}
          </button>
          <button
            className={`ritual-history__tab${tab === 'stats' ? ' ritual-history__tab--active' : ''}`}
            onClick={() => setTab('stats')}
          >
            {content.history.tabStats}
          </button>
        </div>
        <div className="ritual-history__header-actions">
          <button
            className="ritual-history__export"
            onClick={handleExportCSV}
            disabled={exportingCSV || !rituals.length}
            title="Export as CSV for analysis"
          >
            {exportingCSV ? '...' : 'CSV'}
          </button>
          <button
            className="ritual-history__export"
            onClick={handleExport}
            disabled={exporting || !rituals.length}
            title="Export as JSON backup"
          >
            {exporting ? '...' : 'JSON'}
          </button>
          <button
            className="ritual-history__close"
            onClick={onClose}
            aria-label={content.ritual.historyClose}
          >
            ×
          </button>
        </div>
      </div>

      {loading ? (
        <div className="ritual-history__loading" aria-live="polite">...</div>
      ) : tab === 'stats' ? (
        <RitualAnalytics rituals={rituals} />
      ) : rituals.length === 0 ? (
        <div className="ritual-history__empty">{content.history.empty}</div>
      ) : (
        <ol className="ritual-history__list">
          {rituals.map(ritual => {
            const formatted = formatRitual(ritual)
            const duration  = formatDuration(ritual.duration)

            return (
              <li key={ritual.id} className="ritual-history__item">
                <div className="ritual-history__item-main">
                  <div className="ritual-history__date">
                    <span className="ritual-history__day">{formatted.displayDate}</span>
                    <span className="ritual-history__time">{formatted.displayTime}</span>
                  </div>
                  <div className="ritual-history__weather">
                    {ritual.weather.condition} · {ritual.weather.temp}°F · {ritual.weather.location}
                  </div>
                  {ritual.notes && (
                    <div className="ritual-history__notes">{ritual.notes}</div>
                  )}
                  <div className="ritual-history__tags">
                    {ritual.intensity && (
                      <span className="ritual-history__tag">
                        {content.history.intensityLabel} {ritual.intensity}/10
                      </span>
                    )}
                    {ritual.lossType && (
                      <span className="ritual-history__tag">
                        {content.ritual.lossTypes[ritual.lossType]}
                      </span>
                    )}
                    {duration && (
                      <span className="ritual-history__tag">{duration}</span>
                    )}
                    {ritual.phase && (
                      <span className="ritual-history__tag ritual-history__tag--phase">
                        {content.phases[ritual.phase]}
                      </span>
                    )}
                    {ritual.foghornPlayed && (
                      <span className="ritual-history__tag ritual-history__tag--foghorn">
                        {content.history.foghornNote}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  className="ritual-history__delete"
                  onClick={() => handleDelete(ritual.id)}
                  aria-label={content.history.deleteAriaLabel}
                >
                  ×
                </button>
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}
