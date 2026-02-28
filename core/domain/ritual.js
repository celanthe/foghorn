/**
 * Ritual domain model
 * Pure business logic for ritual tracking (no side effects)
 */

/**
 * Create a new ritual record
 * @param {Object} weather - Weather data at time of ritual
 * @param {boolean} foghornPlayed - Whether foghorn was played
 * @param {number|null} intensity - Optional grief intensity (1-10)
 * @returns {Object} Ritual record
 */
export function createRitual(weather, foghornPlayed, intensity = null) {
  return {
    id: generateRitualId(),
    timestamp: new Date().toISOString(),
    weather: {
      condition: weather.condition,
      description: weather.description,
      temp: weather.temp,
      feelsLike: weather.feelsLike,
      location: weather.location,
      wind: weather.wind,
    },
    foghornPlayed,
    intensity: intensity ? validateIntensity(intensity) : null,
  };
}

/**
 * Generate unique ritual ID
 * @returns {string} Unique ID
 */
function generateRitualId() {
  return `ritual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Validate grief intensity (1-10)
 * @param {number} intensity - Grief intensity
 * @returns {number} Validated intensity
 * @throws {Error} If intensity is invalid
 */
function validateIntensity(intensity) {
  const val = parseInt(intensity, 10);
  if (isNaN(val) || val < 1 || val > 10) {
    throw new Error('Intensity must be between 1 and 10');
  }
  return val;
}

/**
 * Validate ritual record
 * @param {Object} ritual - Ritual record to validate
 * @returns {boolean} True if valid
 * @throws {Error} If ritual is invalid
 */
export function validateRitual(ritual) {
  if (!ritual.timestamp) {
    throw new Error('Ritual must have timestamp');
  }
  if (!ritual.weather || !ritual.weather.condition) {
    throw new Error('Ritual must have weather data');
  }
  if (typeof ritual.foghornPlayed !== 'boolean') {
    throw new Error('foghornPlayed must be boolean');
  }
  if (ritual.intensity !== null) {
    validateIntensity(ritual.intensity);
  }
  return true;
}

/**
 * Format ritual for display
 * @param {Object} ritual - Ritual record
 * @returns {Object} Formatted ritual data
 */
export function formatRitual(ritual) {
  const date = new Date(ritual.timestamp);
  return {
    ...ritual,
    displayDate: date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    displayTime: date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    }),
  };
}
