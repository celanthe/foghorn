import content from '../../content/en.json'
import './RitualAnalytics.css'

/**
 * Aggregate rituals into research-useful metrics.
 * All computation is pure — no side effects.
 */
function aggregate(rituals) {
  if (!rituals.length) return null

  const now        = new Date()
  const thisMonth  = rituals.filter(r => {
    const d = new Date(r.timestamp)
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
  })

  const withIntensity = rituals.filter(r => r.intensity != null)
  const avgIntensity  = withIntensity.length
    ? (withIntensity.reduce((s, r) => s + r.intensity, 0) / withIntensity.length).toFixed(1)
    : null

  // Loss type breakdown
  const lossTypeCounts = {}
  for (const r of rituals) {
    if (r.lossType) lossTypeCounts[r.lossType] = (lossTypeCounts[r.lossType] || 0) + 1
  }

  // Monthly frequency — last 6 months
  const months = []
  for (let i = 5; i >= 0; i--) {
    const d     = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const label = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    const count = rituals.filter(r => {
      const rd = new Date(r.timestamp)
      return rd.getFullYear() === d.getFullYear() && rd.getMonth() === d.getMonth()
    }).length
    months.push({ label, count })
  }

  // Last 10 intensities (for trend)
  const recentIntensity = rituals
    .filter(r => r.intensity != null)
    .slice(0, 10)
    .map(r => ({ intensity: r.intensity, timestamp: r.timestamp }))

  return { total: rituals.length, thisMonth: thisMonth.length, avgIntensity, lossTypeCounts, months, recentIntensity }
}

const LOSS_TYPE_ORDER = ['person', 'relationship', 'self', 'place', 'multiple']

export default function RitualAnalytics({ rituals }) {
  const data = aggregate(rituals)

  if (!data) {
    return <div className="ritual-analytics__empty">{content.analytics.noData}</div>
  }

  const maxMonthCount = Math.max(...data.months.map(m => m.count), 1)

  return (
    <div className="ritual-analytics">

      {/* Summary row */}
      <div className="ritual-analytics__summary">
        <div className="ritual-analytics__stat">
          <span className="ritual-analytics__stat-value">{data.total}</span>
          <span className="ritual-analytics__stat-label">{content.analytics.totalRituals}</span>
        </div>
        <div className="ritual-analytics__stat">
          <span className="ritual-analytics__stat-value">{data.thisMonth}</span>
          <span className="ritual-analytics__stat-label">{content.analytics.thisMonth}</span>
        </div>
        <div className="ritual-analytics__stat">
          <span className="ritual-analytics__stat-value">
            {data.avgIntensity ?? content.analytics.noIntensity}
          </span>
          <span className="ritual-analytics__stat-label">{content.analytics.avgIntensity}</span>
        </div>
      </div>

      {/* Monthly frequency */}
      <div className="ritual-analytics__section">
        <h3 className="ritual-analytics__section-title">{content.analytics.monthlyFrequency}</h3>
        <div className="ritual-analytics__months">
          {data.months.map(({ label, count }) => (
            <div key={label} className="ritual-analytics__month">
              <div className="ritual-analytics__bar-wrap">
                <div
                  className="ritual-analytics__bar"
                  style={{ height: `${Math.max((count / maxMonthCount) * 48, count > 0 ? 4 : 0)}px` }}
                  aria-label={`${count} rituals`}
                />
              </div>
              <span className="ritual-analytics__month-count">{count}</span>
              <span className="ritual-analytics__month-label">{label.split(' ')[0]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Loss type breakdown */}
      {Object.keys(data.lossTypeCounts).length > 0 && (
        <div className="ritual-analytics__section">
          <h3 className="ritual-analytics__section-title">{content.analytics.lossBreakdown}</h3>
          <div className="ritual-analytics__loss-types">
            {LOSS_TYPE_ORDER
              .filter(k => data.lossTypeCounts[k])
              .map(key => (
                <div key={key} className="ritual-analytics__loss-row">
                  <span className="ritual-analytics__loss-label">
                    {content.ritual.lossTypes[key]}
                  </span>
                  <span className="ritual-analytics__loss-count">
                    {data.lossTypeCounts[key]}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Recent intensity */}
      {data.recentIntensity.length > 0 && (
        <div className="ritual-analytics__section">
          <h3 className="ritual-analytics__section-title">{content.analytics.recentIntensity}</h3>
          <div className="ritual-analytics__intensity-row" aria-label="Recent grief intensity readings">
            {data.recentIntensity.map(({ intensity, timestamp }) => (
              <div
                key={timestamp}
                className="ritual-analytics__intensity-dot"
                style={{ opacity: 0.3 + (intensity / 10) * 0.7 }}
                title={`${intensity}/10 — ${new Date(timestamp).toLocaleDateString()}`}
                aria-label={`${intensity} out of 10`}
              >
                {intensity}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
