/**
 * Historical weather matching algorithm
 * Pure business logic — no side effects, no API calls
 *
 * Scoring: condition (50%) + temperature (30%) + wind direction bonus (10%)
 * Goal: emotional resonance, not meteorological precision
 */

/**
 * Score a historical day against current weather
 * Returns 0 if no meaningful match, 0.5–1.0 for matches
 * @param {Object} current  - Current weather { condition, temp, wind: { direction } }
 * @param {Object} historical - Historical day { condition, tempAvg, windDirection }
 * @returns {number} Score 0–1
 */
export function scoreMatch(current, historical) {
  const conditionScore = scoreCondition(current.condition, historical.condition)
  if (conditionScore === 0) return 0 // Hard reject — wrong family entirely

  const tempScore = scoreTemperature(current.temp, historical.tempAvg)
  const windBonus = scoreWind(current.wind?.direction, historical.windDirection)

  return (conditionScore * 0.5) + (tempScore * 0.3) + (windBonus * 0.1)
}

/**
 * Score weather condition similarity
 * Same condition = 1.0, same family (fog/mist) = 0.85, adjacent = 0.6, different = 0
 * @param {string} current
 * @param {string} historical
 * @returns {number} 0–1
 */
export function scoreCondition(current, historical) {
  if (!current || !historical) return 0
  if (current === historical) return 1.0

  const families = {
    fog:   ['Fog', 'Mist', 'Haze'],
    rain:  ['Rain', 'Drizzle'],
    snow:  ['Snow', 'Sleet'],
    cloud: ['Clouds'],
    clear: ['Clear'],
  }

  // Same family
  for (const family of Object.values(families)) {
    if (family.includes(current) && family.includes(historical)) return 0.85
  }

  // Adjacent families (some resonance)
  const adjacent = {
    Fog:     ['Clouds', 'Mist', 'Haze'],
    Mist:    ['Clouds', 'Fog', 'Haze'],
    Clouds:  ['Fog', 'Mist'],
    Rain:    ['Sleet'],
    Drizzle: ['Sleet', 'Rain'],
    Snow:    ['Sleet'],
  }
  if (adjacent[current]?.includes(historical)) return 0.6

  return 0
}

/**
 * Score temperature similarity (in °F)
 * @param {number} current
 * @param {number} historical
 * @returns {number} 0–1
 */
export function scoreTemperature(current, historical) {
  if (current == null || historical == null) return 0
  const diff = Math.abs(current - historical)
  if (diff <= 5)  return 1.0
  if (diff <= 10) return 0.85
  if (diff <= 15) return 0.6
  if (diff <= 20) return 0.3
  return 0.1
}

/**
 * Score wind direction similarity (bonus, not critical)
 * @param {string} current    - e.g. 'NW'
 * @param {string} historical - e.g. 'NW'
 * @returns {number} 0–1
 */
export function scoreWind(current, historical) {
  if (!current || !historical) return 0
  if (current === historical) return 1.0

  const adjacent = {
    N:  ['NE', 'NW'], NE: ['N', 'E'],
    E:  ['NE', 'SE'], SE: ['E', 'S'],
    S:  ['SE', 'SW'], SW: ['S', 'W'],
    W:  ['SW', 'NW'], NW: ['W', 'N'],
  }
  return adjacent[current]?.includes(historical) ? 0.5 : 0
}

/**
 * Map WMO weather code (Open-Meteo) to condition string
 * Matches OpenWeatherMap condition names used elsewhere in the app
 * @param {number} code - WMO code 0–99
 * @returns {string} Condition
 */
export function decodeWeatherCode(code) {
  if (code === 0)                        return 'Clear'
  if (code >= 1  && code <= 3)           return 'Clouds'
  if (code === 45 || code === 48)        return 'Fog'
  if (code >= 51 && code <= 57)          return 'Drizzle'
  if (code >= 61 && code <= 67)          return 'Rain'
  if (code >= 71 && code <= 77)          return 'Snow'
  if (code >= 80 && code <= 82)          return 'Rain'   // showers
  if (code === 85 || code === 86)        return 'Snow'   // snow showers
  if (code >= 95)                        return 'Thunderstorm'
  return 'Clouds'
}

/**
 * Format a historical match for display
 * Returns null if no match (caller should render nothing)
 * @param {Object|null} match - Best match from findHistoricalMatch
 * @returns {{ headline: string, description: string }|null}
 */
export function formatMatch(match) {
  if (!match) return null

  const date = new Date(match.date)
  const monthYear = date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  const headline = `Falmouth, ${monthYear}`
  const description = `${match.condition}, ${match.tempAvg}°F, ${match.windDirection} wind`

  return { headline, description }
}
