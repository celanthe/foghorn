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

/**
 * Get current time of day period
 * @returns {string} 'morning', 'afternoon', 'evening', or 'night'
 */
export function getTimeOfDay() {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

/**
 * Assess current energy level based on weather and time
 * @param {Object} weather - Weather data
 * @param {string|null} userOverride - Optional user manual override ('low', 'medium', 'high')
 * @returns {Object} Energy assessment
 */
export function assessEnergyLevel(weather, userOverride = null) {
  // If user manually set energy, use that
  if (userOverride) {
    return {
      level: userOverride,
      factors: {
        userOverride,
        weather: weather?.condition || 'unknown',
        timeOfDay: getTimeOfDay(),
      },
      timestamp: new Date().toISOString(),
    };
  }

  // Otherwise, assess based on weather + time
  const timeOfDay = getTimeOfDay();
  let level = 'medium'; // Default
  const factors = {
    weather: weather?.condition || 'unknown',
    timeOfDay,
    userOverride: null,
  };

  // Weather that typically lowers energy
  const lowEnergyWeather = ['Fog', 'Mist', 'Rain', 'Drizzle', 'Snow', 'Clouds'];
  const weatherLowersEnergy = weather && lowEnergyWeather.includes(weather.condition);

  // Time-based energy patterns
  const isLowEnergyTime = timeOfDay === 'afternoon' || timeOfDay === 'night';
  const isHighEnergyTime = timeOfDay === 'morning';

  // Combine factors
  if (weatherLowersEnergy && isLowEnergyTime) {
    level = 'low'; // Both weather and time suggest low energy
  } else if (weatherLowersEnergy || isLowEnergyTime) {
    level = 'medium'; // One factor suggests lower energy
  } else if (isHighEnergyTime && !weatherLowersEnergy) {
    level = 'high'; // Morning + good weather
  }

  return {
    level,
    factors,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Get tasks that match a given energy level
 * @param {Array} tasks - Array of task objects
 * @param {string} energyLevel - Current energy level ('low', 'medium', 'high')
 * @param {number} limit - Maximum number of tasks to return
 * @returns {Array} Matching tasks
 */
export function getMatchingTasks(tasks, energyLevel, limit = 3) {
  // Filter incomplete tasks only
  const incompleteTasks = tasks.filter(task => !task.completed);

  // Define matching logic
  let matchingTasks = [];

  if (energyLevel === 'low') {
    // Low energy: only show low energy tasks
    matchingTasks = incompleteTasks.filter(task => task.energy === 'low');
  } else if (energyLevel === 'medium') {
    // Medium energy: show low and medium tasks
    matchingTasks = incompleteTasks.filter(task =>
      task.energy === 'low' || task.energy === 'medium'
    );
  } else {
    // High energy: show all tasks, prioritizing high energy ones
    matchingTasks = incompleteTasks;
  }

  // Sort by energy level (high first) and creation date (newest first)
  matchingTasks.sort((a, b) => {
    const energyOrder = { high: 3, medium: 2, low: 1 };
    const energyDiff = energyOrder[b.energy] - energyOrder[a.energy];

    if (energyDiff !== 0) return energyDiff;

    // If same energy level, sort by creation date (newest first)
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  // Return limited number
  return matchingTasks.slice(0, limit);
}
