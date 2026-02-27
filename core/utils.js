/**
 * Core utility functions for Foghorn
 * Pure business logic with no side effects
 */

/**
 * Weather condition types that trigger foghorn
 */
export const FOGHORN_TRIGGERS = {
  FOG: ['Mist', 'Fog', 'Haze'],
  RAIN: ['Rain', 'Drizzle'],
  SLEET: ['Sleet'],
  SNOW: ['Snow'],
};

/**
 * Check if weather condition should trigger foghorn
 * @param {string} weatherCondition - Main weather condition (e.g., "Fog", "Rain")
 * @returns {boolean}
 */
export function shouldPlayFoghorn(weatherCondition) {
  return Object.values(FOGHORN_TRIGGERS).some(triggers =>
    triggers.includes(weatherCondition)
  );
}

/**
 * Get weather emoji for condition
 * @param {string} condition - Weather condition
 * @returns {string} Emoji
 */
export function getWeatherEmoji(condition) {
  if (condition === 'Fog' || condition === 'Mist' || condition === 'Haze') {
    return '🌫️';
  }
  if (condition === 'Rain' || condition === 'Drizzle') {
    return '🌧️';
  }
  if (condition === 'Snow') {
    return '🌨️';
  }
  if (condition === 'Clouds') {
    return '☁️';
  }
  return '☀️';
}

/**
 * Convert wind degrees to cardinal direction
 * @param {number} degrees - Wind direction in degrees
 * @returns {string} Cardinal direction (N, NE, E, etc.)
 */
export function getWindDirection(degrees) {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
}

/**
 * Format temperature with degree symbol
 * @param {number} temp - Temperature in Fahrenheit
 * @returns {string}
 */
export function formatTemp(temp) {
  return `${Math.round(temp)}°F`;
}

/**
 * Format date for display
 * @param {Date|string} date - Date to format
 * @returns {string}
 */
export function formatDate(date) {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format time for display
 * @param {Date|string} date - Date to format
 * @returns {string}
 */
export function formatTime(date) {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}
