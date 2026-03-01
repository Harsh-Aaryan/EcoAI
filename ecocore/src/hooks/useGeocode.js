import { useEffect, useState, useMemo } from 'react';

/**
 * useGeocode — Nominatim reverse geocoding (100% free, no API key)
 *
 * API: https://nominatim.openstreetmap.org/reverse
 * Rate limit: 1 req/sec — we cache aggressively.
 *
 * Returns { city, state, country, displayName, loading }
 */

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org/reverse';

// Persistent cache across re-renders
let geocodeCache = { key: '', data: null, ts: 0 };
const CACHE_TTL = 30 * 60 * 1000; // 30 min — location rarely changes

function cacheKey(lat, lng) {
  return `${lat.toFixed(3)},${lng.toFixed(3)}`;
}

export default function useGeocode(center) {
  const [state, setState] = useState({
    loading: true,
    city: null,
    state: null,
    county: null,
    country: null,
    displayName: null,
  });

  useEffect(() => {
    if (!center || center[0] === 0) return;
    let cancelled = false;

    const key = cacheKey(center[0], center[1]);

    // Check memory cache
    if (geocodeCache.key === key && Date.now() - geocodeCache.ts < CACHE_TTL && geocodeCache.data) {
      setState(geocodeCache.data);
      return;
    }

    // Check localStorage cache
    try {
      const stored = localStorage.getItem(`ecocore_geocode_${key}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Date.now() - (parsed._ts || 0) < CACHE_TTL) {
          const result = { ...parsed, loading: false };
          delete result._ts;
          setState(result);
          geocodeCache = { key, data: result, ts: Date.now() };
          return;
        }
      }
    } catch { /* ignore */ }

    async function load() {
      try {
        const resp = await fetch(
          `${NOMINATIM_BASE}?lat=${center[0]}&lon=${center[1]}&format=json&zoom=12&addressdetails=1`,
          {
            headers: { 'User-Agent': 'EcoCore-PWA/1.0 (education project)' },
            signal: AbortSignal.timeout(8000),
          }
        );
        if (!resp.ok) throw new Error(`Nominatim ${resp.status}`);
        const data = await resp.json();

        const addr = data.address || {};
        const city = addr.city || addr.town || addr.village || addr.hamlet || addr.municipality || null;
        const county = addr.county || null;
        const stateAbbr = addr['ISO3166-2-lvl4']?.split('-')[1] || addr.state || null;
        const country = addr.country_code?.toUpperCase() || null;

        const result = {
          loading: false,
          city,
          state: stateAbbr,
          county,
          country,
          displayName: city
            ? `${city}${stateAbbr ? ', ' + stateAbbr : ''}`
            : county
              ? `${county}${stateAbbr ? ', ' + stateAbbr : ''}`
              : data.name || null,
        };

        if (!cancelled) {
          setState(result);
          geocodeCache = { key, data: result, ts: Date.now() };
          try {
            localStorage.setItem(`ecocore_geocode_${key}`, JSON.stringify({ ...result, _ts: Date.now() }));
          } catch { /* quota */ }
        }
      } catch (e) {
        console.warn('[useGeocode]', e.message);
        if (!cancelled) setState(prev => ({ ...prev, loading: false }));
      }
    }

    load();
    return () => { cancelled = true; };
  }, [center?.[0], center?.[1]]);

  return useMemo(() => state, [state]);
}
