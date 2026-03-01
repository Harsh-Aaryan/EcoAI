import { useState, useEffect, useCallback, useRef } from 'react';

// Offline fallback — small lookup for common US zips
const ZIP_COORDS = {
  '78701': [30.267, -97.743],   // Austin TX
  '94102': [37.779, -122.419],  // San Francisco CA
  '60601': [41.882, -87.623],   // Chicago IL
  '10001': [40.748, -73.997],   // New York NY
  '90001': [33.942, -118.256],  // Los Angeles CA
  '77001': [29.760, -95.370],   // Houston TX
  '85001': [33.448, -112.074],  // Phoenix AZ
  '33101': [25.774, -80.194],   // Miami FL
  '98101': [47.606, -122.332],  // Seattle WA
  '80201': [39.739, -104.990],  // Denver CO
};

const DEFAULT_CENTER = [30.267, -97.743]; // Austin TX fallback
const STORAGE_KEY = 'ecocore_user_location';
const ZIP_KEY = 'ecocore_user_zip';

/**
 * Geocode a US zip code via OpenStreetMap Nominatim (free, no key).
 * Falls back to local lookup table if the API fails.
 */
async function geocodeZip(zip) {
  // Try local lookup first for instant response
  if (ZIP_COORDS[zip]) return ZIP_COORDS[zip];

  try {
    const resp = await fetch(
      `https://nominatim.openstreetmap.org/search?postalcode=${encodeURIComponent(zip)}&country=us&format=json&limit=1`,
      { headers: { 'Accept': 'application/json' } }
    );
    const data = await resp.json();
    if (data?.length > 0) {
      return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    }
  } catch (err) {
    console.warn('Nominatim geocode failed:', err.message);
  }
  return null; // zip not found
}

/**
 * useLocation hook
 * Priority: 1) saved zipcode override → geocode  2) browser GPS  3) default
 * Returns { center, source, loading, error, setZipcode }
 */
export default function useLocation() {
  const [center, setCenter] = useState(() => {
    // Sync init from localStorage
    const savedZip = localStorage.getItem(ZIP_KEY);
    if (savedZip && ZIP_COORDS[savedZip]) return ZIP_COORDS[savedZip];
    const savedGeo = localStorage.getItem(STORAGE_KEY);
    if (savedGeo) {
      try { const p = JSON.parse(savedGeo); return [p.lat, p.lng]; } catch {}
    }
    return DEFAULT_CENTER;
  });

  const [source, setSource] = useState(() => {
    if (localStorage.getItem(ZIP_KEY)) return 'zipcode';
    if (localStorage.getItem(STORAGE_KEY)) return 'gps-cached';
    return 'default';
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const zipOverrideRef = useRef(!!localStorage.getItem(ZIP_KEY));

  // ── On mount: resolve saved zip (async geocode) or try GPS ──
  useEffect(() => {
    const savedZip = localStorage.getItem(ZIP_KEY);

    if (savedZip) {
      // Geocode the saved zip (may already be instant from lookup)
      zipOverrideRef.current = true;
      setLoading(true);
      geocodeZip(savedZip).then(coords => {
        if (coords) {
          setCenter(coords);
          setSource('zipcode');
        } else {
          // Invalid saved zip — clear it, fall through to GPS
          localStorage.removeItem(ZIP_KEY);
          zipOverrideRef.current = false;
          tryGPS();
        }
        setLoading(false);
      });
      return;
    }

    // No zip override → try GPS
    tryGPS();

    function tryGPS() {
      if (typeof navigator === 'undefined' || !navigator.geolocation) return;
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (zipOverrideRef.current) return; // zip was set while GPS was resolving
          const coords = [pos.coords.latitude, pos.coords.longitude];
          setCenter(coords);
          setSource('gps');
          setLoading(false);
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ lat: coords[0], lng: coords[1] }));
        },
        (err) => {
          console.warn('Geolocation error:', err.message);
          if (!zipOverrideRef.current) setError(err.message);
          setLoading(false);
        },
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
      );
    }
  }, []); // runs once on mount

  /**
   * Set a zipcode override — geocodes via Nominatim, persisted in localStorage.
   * Pass null/empty to clear and revert to GPS/default.
   */
  const setZipcode = useCallback((zip) => {
    setError(null);

    if (!zip) {
      // Clear zip override
      localStorage.removeItem(ZIP_KEY);
      zipOverrideRef.current = false;
      const savedGeo = localStorage.getItem(STORAGE_KEY);
      if (savedGeo) {
        try {
          const p = JSON.parse(savedGeo);
          setCenter([p.lat, p.lng]);
          setSource('gps-cached');
        } catch {
          setCenter(DEFAULT_CENTER);
          setSource('default');
        }
      } else {
        setCenter(DEFAULT_CENTER);
        setSource('default');
      }
      return;
    }

    // Geocode the zip
    zipOverrideRef.current = true;
    setLoading(true);
    geocodeZip(zip).then(coords => {
      if (coords) {
        localStorage.setItem(ZIP_KEY, zip);
        setCenter(coords);
        setSource('zipcode');
        setError(null);
      } else {
        setError(`Zip "${zip}" not found`);
        zipOverrideRef.current = false;
      }
      setLoading(false);
    });
  }, []);

  return { center, source, loading, error, setZipcode };
}
