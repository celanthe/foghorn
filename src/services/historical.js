/**
 * Historical weather service — Open-Meteo archive API
 * Free, no API key, covers 1940–present for Falmouth, MA
 *
 * Finds historical Cape Cod days that match the current weather.
 * The emotionally significant range is 1985–2003 (childhood/adolescence).
 */

import { getWindDirection } from '../../core/utils.js'
import { scoreMatch, decodeWeatherCode } from '../../core/domain/historical-match.js'
import { getCachedMatch, cacheMatch } from './storage/historical-cache.js'

const FALMOUTH_LAT = 41.5515
const FALMOUTH_LON = -70.6148
const BASE_URL = 'https://archive-api.open-meteo.com/v1/archive'

const HISTORICAL_START_YEAR = 1985
const HISTORICAL_END_YEAR   = 2003
const MATCH_WINDOW_DAYS     = 30  // ±30 days around today's calendar date
const SCORE_THRESHOLD       = 0.5 // Minimum score to consider a match

/**
 * Fetch one year's worth of daily weather around today's calendar date
 * @param {number} year
 * @param {Date}   today
 * @returns {Promise<Array>} Array of daily weather objects
 */
async function fetchYearWindow(year, today) {
  const startDate = new Date(today)
  startDate.setFullYear(year)
  startDate.setDate(startDate.getDate() - MATCH_WINDOW_DAYS)

  const endDate = new Date(today)
  endDate.setFullYear(year)
  endDate.setDate(endDate.getDate() + MATCH_WINDOW_DAYS)

  const fmt = (d) => d.toISOString().split('T')[0]

  const url = new URL(BASE_URL)
  url.searchParams.set('latitude',         FALMOUTH_LAT)
  url.searchParams.set('longitude',        FALMOUTH_LON)
  url.searchParams.set('start_date',       fmt(startDate))
  url.searchParams.set('end_date',         fmt(endDate))
  url.searchParams.set('daily',            [
    'weather_code',
    'temperature_2m_max',
    'temperature_2m_min',
    'wind_speed_10m_max',
    'wind_direction_10m_dominant',
  ].join(','))
  url.searchParams.set('temperature_unit', 'fahrenheit')
  url.searchParams.set('wind_speed_unit',  'mph')
  url.searchParams.set('timezone',         'America/New_York')

  const response = await fetch(url.toString())
  if (!response.ok) return []

  const data = await response.json()
  const daily = data.daily
  if (!daily?.time?.length) return []

  return daily.time.map((dateStr, i) => ({
    date:          dateStr,
    condition:     decodeWeatherCode(daily.weather_code[i]),
    tempMax:       Math.round(daily.temperature_2m_max[i]),
    tempMin:       Math.round(daily.temperature_2m_min[i]),
    tempAvg:       Math.round((daily.temperature_2m_max[i] + daily.temperature_2m_min[i]) / 2),
    windSpeed:     Math.round(daily.wind_speed_10m_max[i] ?? 0),
    windDirection: getWindDirection(daily.wind_direction_10m_dominant[i] ?? 0),
  }))
}

/**
 * Find the best historical Falmouth, MA day matching the current weather
 * Checks cache first. Falls back to live API calls across all years.
 * @param {Object} currentWeather - { condition, temp, wind: { direction } }
 * @returns {Promise<Object|null>} Best match or null if none found
 */
export async function findHistoricalMatch(currentWeather) {
  const today = new Date()

  // Cache hit
  const cached = await getCachedMatch(today)
  if (cached !== undefined && cached !== null) return cached  // null = "searched, no match"

  try {
    // Fetch all years in parallel
    const years = []
    for (let y = HISTORICAL_START_YEAR; y <= HISTORICAL_END_YEAR; y++) years.push(y)

    const results = await Promise.allSettled(
      years.map(year => fetchYearWindow(year, today))
    )

    const candidates = []

    for (const result of results) {
      if (result.status !== 'fulfilled') continue
      for (const day of result.value) {
        const score = scoreMatch(currentWeather, day)
        if (score >= SCORE_THRESHOLD) {
          candidates.push({ ...day, score })
        }
      }
    }

    // Best match wins
    candidates.sort((a, b) => b.score - a.score)
    const match = candidates[0] ?? null

    await cacheMatch(today, match)
    return match

  } catch (err) {
    if (import.meta.env.DEV) {
      console.error('[historical] Failed to find match:', err)
    }
    return null
  }
}
