import { useEffect, useState, useMemo } from 'react';

/**
 * useWeather — Open-Meteo Weather + Air Quality (100% free, no API key)
 *
 * APIs used:
 *   • https://api.open-meteo.com/v1/forecast  (weather)
 *   • https://air-quality-api.open-meteo.com/v1/air-quality  (AQI)
 *
 * Returns real-time and hourly forecast data for solar, wind, temp, AQI.
 */

const WEATHER_BASE = 'https://api.open-meteo.com/v1/forecast';
const AQI_BASE = 'https://air-quality-api.open-meteo.com/v1/air-quality';

// Cache to avoid re-fetching on tab switches
let weatherCache = { key: '', data: null, ts: 0 };
const CACHE_TTL = 10 * 60 * 1000; // 10 min

function cacheKey(lat, lng) {
  return `${lat.toFixed(2)},${lng.toFixed(2)}`;
}

export default function useWeather(center) {
  const [state, setState] = useState({
    loading: true,
    error: null,

    // Current conditions
    temperature: null,      // °C
    humidity: null,          // %
    windSpeed: null,         // km/h
    windDirection: null,     // degrees
    cloudCover: null,        // %
    weatherCode: null,       // WMO code
    isDay: true,

    // Solar
    solarIrradiance: null,  // W/m² (shortwave radiation)
    solarOutput: null,       // estimated kW for ~8 kW residential array
    uvIndex: null,

    // Air Quality
    aqi: null,               // US EPA AQI
    pm25: null,              // µg/m³
    pm10: null,

    // Derived
    weatherLabel: '',        // e.g. "Sunny", "Cloudy", "Rain"
    weatherEmoji: '☀',

    // 24h forecast arrays
    hourlyTemp: [],          // [{hour, temp, windSpeed, cloudCover, solar}]
    hourlySolar: [],         // [{hour, irradiance, estimatedKw}]
  });

  useEffect(() => {
    if (!center || center[0] === 0) return;
    let cancelled = false;

    const key = cacheKey(center[0], center[1]);
    if (weatherCache.key === key && Date.now() - weatherCache.ts < CACHE_TTL && weatherCache.data) {
      setState(weatherCache.data);
      return;
    }

    async function load() {
      try {
        // Parallel fetch: weather + air quality
        const [weatherResp, aqiResp] = await Promise.all([
          fetch(`${WEATHER_BASE}?latitude=${center[0]}&longitude=${center[1]}`
            + `&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,cloud_cover,weather_code,is_day,shortwave_radiation`
            + `&hourly=temperature_2m,wind_speed_10m,cloud_cover,shortwave_radiation`
            + `&daily=uv_index_max`
            + `&timezone=auto&forecast_days=1`,
            { signal: AbortSignal.timeout(10000) }
          ),
          fetch(`${AQI_BASE}?latitude=${center[0]}&longitude=${center[1]}`
            + `&current=us_aqi,pm2_5,pm10`
            + `&timezone=auto&forecast_days=1`,
            { signal: AbortSignal.timeout(10000) }
          ).catch(() => null), // non-fatal
        ]);

        if (!weatherResp.ok) throw new Error(`Weather API ${weatherResp.status}`);
        const weather = await weatherResp.json();
        const aqi = aqiResp?.ok ? await aqiResp.json() : null;

        const cur = weather.current || {};
        const hourly = weather.hourly || {};
        const daily = weather.daily || {};
        const aqiCur = aqi?.current || {};

        // Solar estimate: ~8 kW residential array, typical 15% efficiency
        const irradiance = cur.shortwave_radiation ?? 0;
        // kW = irradiance(W/m²) × panel_area(~50m²) × efficiency(0.18) / 1000
        const solarKw = Number(((irradiance * 50 * 0.18) / 1000).toFixed(1));

        // Weather label from WMO code
        const { label, emoji } = wmoToLabel(cur.weather_code, cur.is_day);

        // Build hourly arrays
        const now = new Date();
        const currentHour = now.getHours();
        const hourLabels = (hourly.time || []).map(t => {
          const h = new Date(t).getHours();
          return h === 0 ? '12a' : h < 12 ? `${h}a` : h === 12 ? '12p' : `${h - 12}p`;
        });

        const hourlyTemp = (hourly.temperature_2m || []).map((temp, i) => ({
          hour: hourLabels[i],
          temp,
          windSpeed: hourly.wind_speed_10m?.[i] ?? 0,
          cloudCover: hourly.cloud_cover?.[i] ?? 0,
          solar: hourly.shortwave_radiation?.[i] ?? 0,
        }));

        const hourlySolar = (hourly.shortwave_radiation || []).map((rad, i) => ({
          hour: hourLabels[i],
          irradiance: rad,
          estimatedKw: Number(((rad * 50 * 0.18) / 1000).toFixed(2)),
        }));

        const result = {
          loading: false,
          error: null,
          temperature: cur.temperature_2m ?? null,
          humidity: cur.relative_humidity_2m ?? null,
          windSpeed: cur.wind_speed_10m ?? null,
          windDirection: cur.wind_direction_10m ?? null,
          cloudCover: cur.cloud_cover ?? null,
          weatherCode: cur.weather_code ?? null,
          isDay: cur.is_day === 1 || cur.is_day === true,
          solarIrradiance: irradiance,
          solarOutput: solarKw,
          uvIndex: daily.uv_index_max?.[0] ?? null,
          aqi: aqiCur.us_aqi ?? null,
          pm25: aqiCur.pm2_5 ?? null,
          pm10: aqiCur.pm10 ?? null,
          weatherLabel: label,
          weatherEmoji: emoji,
          hourlyTemp,
          hourlySolar,
        };

        if (!cancelled) {
          setState(result);
          weatherCache = { key, data: result, ts: Date.now() };
        }
      } catch (e) {
        console.warn('[useWeather]', e.message);
        if (!cancelled) setState(prev => ({ ...prev, loading: false, error: e.message }));
      }
    }

    load();
    return () => { cancelled = true; };
  }, [center?.[0], center?.[1]]);

  return useMemo(() => state, [state]);
}

/**
 * Map WMO weather code → human label + emoji
 * https://open-meteo.com/en/docs#weathervariables
 */
function wmoToLabel(code, isDay) {
  if (code == null) return { label: 'Unknown', emoji: '❓' };
  const day = isDay === 1 || isDay === true;
  const map = {
    0: { label: 'Clear Sky', emoji: day ? '☀️' : '🌙' },
    1: { label: 'Mostly Clear', emoji: day ? '🌤️' : '🌙' },
    2: { label: 'Partly Cloudy', emoji: '⛅' },
    3: { label: 'Overcast', emoji: '☁️' },
    45: { label: 'Foggy', emoji: '🌫️' },
    48: { label: 'Rime Fog', emoji: '🌫️' },
    51: { label: 'Light Drizzle', emoji: '🌦️' },
    53: { label: 'Drizzle', emoji: '🌧️' },
    55: { label: 'Heavy Drizzle', emoji: '🌧️' },
    56: { label: 'Freezing Drizzle', emoji: '🌨️' },
    57: { label: 'Heavy Freezing Drizzle', emoji: '🌨️' },
    61: { label: 'Light Rain', emoji: '🌦️' },
    63: { label: 'Rain', emoji: '🌧️' },
    65: { label: 'Heavy Rain', emoji: '🌧️' },
    66: { label: 'Freezing Rain', emoji: '🌨️' },
    67: { label: 'Heavy Freezing Rain', emoji: '🌨️' },
    71: { label: 'Light Snow', emoji: '🌨️' },
    73: { label: 'Snow', emoji: '❄️' },
    75: { label: 'Heavy Snow', emoji: '❄️' },
    77: { label: 'Snow Grains', emoji: '❄️' },
    80: { label: 'Light Showers', emoji: '🌦️' },
    81: { label: 'Showers', emoji: '🌧️' },
    82: { label: 'Heavy Showers', emoji: '🌧️' },
    85: { label: 'Snow Showers', emoji: '🌨️' },
    86: { label: 'Heavy Snow Showers', emoji: '🌨️' },
    95: { label: 'Thunderstorm', emoji: '⛈️' },
    96: { label: 'Thunderstorm + Hail', emoji: '⛈️' },
    99: { label: 'Thunderstorm + Heavy Hail', emoji: '⛈️' },
  };
  return map[code] || { label: `WMO ${code}`, emoji: '🌡️' };
}
