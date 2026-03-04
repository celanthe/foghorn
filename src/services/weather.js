/**
 * Weather service using OpenWeatherMap API
 * Free tier: 1000 calls/day, 60 calls/minute
 */

import { shouldPlayFoghorn, getWindDirection } from '../../core/utils.js';

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

/**
 * Get current weather for location
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<Object>} Weather data
 */
export async function getCurrentWeather(lat, lon) {
  if (!API_KEY) {
    throw new Error('OpenWeatherMap API key not configured');
  }

  const url = `${BASE_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=imperial`;

  const response = await fetch(url);

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Weather API error: 401');
    }
    throw new Error(`Weather API error: ${response.status}`);
  }

  const data = await response.json();

  return {
    location: data.name,
    condition: data.weather[0].main, // "Fog", "Rain", "Snow", etc.
    description: data.weather[0].description, // "heavy fog", "light rain"
    temp: Math.round(data.main.temp), // Fahrenheit
    feelsLike: Math.round(data.main.feels_like),
    humidity: data.main.humidity,
    wind: {
      speed: Math.round(data.wind?.speed ?? 0),
      direction: data.wind?.deg != null ? getWindDirection(data.wind.deg) : '—',
    },
    timestamp: new Date(data.dt * 1000),
    shouldPlayFoghorn: shouldPlayFoghorn(data.weather[0].main),
  };
}

/**
 * Get user's geolocation
 * @returns {Promise<{lat: number, lon: number}>}
 */
export function getUserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      () => {
        // Fall back to default location — caller should surface this to the user
        const defaultLat = parseFloat(import.meta.env.VITE_DEFAULT_LAT);
        const defaultLon = parseFloat(import.meta.env.VITE_DEFAULT_LON);
        resolve({ lat: defaultLat, lon: defaultLon, usingDefault: true });
      }
    );
  });
}
