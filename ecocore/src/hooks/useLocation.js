import { useState, useEffect } from 'react';

// Common US zip → lat/lng (small lookup for offline fallback)
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

/* Resolve initial state synchronously from localStorage */
function getInitialLocation() {
  const savedZip = localStorage.getItem(ZIP_KEY);
  if (savedZip) {
	// If zip not in our lookup, try a geocoding API (free nominatim)
    fetch(`https://nominatim.openstreetmap.org/search?postalcode=${savedZip}&country=us&format=json&limit=1`)
      .then(r => r.json())
      .then(data => {
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
		  return { center: ([lat, lon]);, source: 'zipcode', needsGeo: false };
        } else {
          setError('Zip not found');
        }
      })
      .catch(() => setError('Zip lookup failed'));
  }
  const savedGeo = localStorage.getItem(STORAGE_KEY);
  if (savedGeo) {
    try {
      const parsed = JSON.parse(savedGeo);
      return { center: [parsed.lat, parsed.lng], source: 'gps-cached', needsGeo: true };
    } catch { /* ignore */ }
  }
  return { center: DEFAULT_CENTER, source: 'default', needsGeo: true };
}

/**
 * useLocation hook
 * Priority: 1) saved zipcode override  2) browser geolocation  3) default
 * Returns { center, source, loading, error, setZipcode }
 */
export default function useLocation() {
  const initial = getInitialLocation();
  const [center, setCenter] = useState(initial.center);
  const [source, setSource] = useState(initial.source);
  const needsGeo = initial.needsGeo;
  const [loading, setLoading] = useState(() => {
    // Set loading false right away if geo not available
    if (!needsGeo) return false;
    if (typeof navigator === 'undefined' || !navigator.geolocation) return false;
    return true;
  });
  const [error, setError] = useState(() => {
    if (needsGeo && (typeof navigator === 'undefined' || !navigator.geolocation)) return 'Geolocation not supported';
    return null;
  });

  // Try browser geolocation on mount (only if not zip-overridden)
  useEffect(() => {
    if (!needsGeo || !navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setCenter(coords);
        setSource('gps');
        setLoading(false);
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ lat: coords[0], lng: coords[1] }));
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
        setError(err.message);
        setLoading(false);
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
    );
  }, [needsGeo]);

  /**
   * Set a zipcode override — persisted in localStorage
   * Pass null/empty to clear and revert to GPS
   */
  const setZipcode = (zip) => {
    if (!zip) {
      localStorage.removeItem(ZIP_KEY);
      // Re-resolve from GPS cache or default
      const savedGeo = localStorage.getItem(STORAGE_KEY);
      if (savedGeo) {
        const parsed = JSON.parse(savedGeo);
        setCenter([parsed.lat, parsed.lng]);
        setSource('gps-cached');
      } else {
        setCenter(DEFAULT_CENTER);
        setSource('default');
      }
      return true;
    }

    if (ZIP_COORDS[zip]) {
      localStorage.setItem(ZIP_KEY, zip);
      setCenter(ZIP_COORDS[zip]);
      setSource('zipcode');
      return true;
    }

    // If zip not in our lookup, try a geocoding API (free nominatim)
    fetch(`https://nominatim.openstreetmap.org/search?postalcode=${zip}&country=us&format=json&limit=1`)
      .then(r => r.json())
      .then(data => {
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          localStorage.setItem(ZIP_KEY, zip);
          setCenter([lat, lon]);
          setSource('zipcode');
        } else {
          setError('Zip not found');
        }
      })
      .catch(() => setError('Zip lookup failed'));

    return true;
  };

  return { center, source, loading, error, setZipcode, zipCodes: Object.keys(ZIP_COORDS) };
}
