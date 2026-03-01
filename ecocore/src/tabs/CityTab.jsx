import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { cityNodes, cityStats as mockCityStats, demandEvents, impactStats } from '../data/mock';
import useLocation from '../hooks/useLocation';
import useWattTimeData from '../hooks/useWattTimeData';
import useWeather from '../hooks/useWeather';
import useGeocode from '../hooks/useGeocode';
import { useUnits } from '../hooks/useUnits';

/* Small helper: fly to new center when location resolves */
function FlyTo({ center }) {
  const map = useMap();
  React.useEffect(() => { map.flyTo(center, map.getZoom(), { duration: 1.2 }); }, [center, map]);
  return null;
}

export default function CityTab() {
  const { center, source, loading } = useLocation();
  const wt = useWattTimeData(center);
  const weather = useWeather(center);
  const geo = useGeocode(center);
  const { convertTemp, convertSpeed, tempUnit, speedUnit } = useUnits();
  const cityStats = wt.cityStats || mockCityStats;

  /* Readable names for EIA respondents */
  const EIA_NAMES = {
    ERCO: 'Texas', CISO: 'California', PJM: 'Mid-Atlantic',
    MISO: 'Midwest', ISNE: 'New England', NYIS: 'New York',
    SWPP: 'Southwest', SOCO: 'Southeast', TVA: 'Tennessee Valley',
    AECI: 'Central',
  };

  /* Derive a readable city name — prefer real geocoded city */
  const regionName = wt.region
    ? wt.region.replace(/^[A-Z]+_/, '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    : EIA_NAMES[wt.eiaRespondent] || null;
  const headerTitle = geo.city
    ? `${geo.city} Grid`
    : regionName ? `${regionName} Grid` : 'City Grid';

  /* Data source label — show actual source, not defaulting to Mock */
  const dataSourceLabel = wt.loading
    ? 'Loading…'
    : wt.sources?.includes('eia-fuel-mix')
      ? 'EIA Live'
      : wt.sources?.includes('watttime-index')
        ? 'WattTime'
        : wt.sources?.length > 0
          ? wt.sources[0]
          : 'Mock';

  return (
    <div className="tab-page frosted-page" style={{ position: 'relative' }}>
      {/* Header + aggregate stats inline */}
      <div className="flex items-center justify-between mb-3 flex-shrink-0" style={{ position: 'relative', zIndex: 1 }}>
        <div>
          <h2 className="font-display text-base font-light">{headerTitle}</h2>
          <span className="font-mono" style={{ fontSize: 9, color: 'var(--muted)' }}>
            {geo.displayName || wt.eiaRespondent || ''}{wt.region ? ` · ${wt.region.replace(/_/g, ' ')}` : ''}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {/* Location indicator */}
          <div className="eco-pill" style={{ background: 'rgba(46,139,150,0.1)', color: 'var(--sky)', padding: '2px 7px', fontSize: 8 }}>
            {loading ? '◌ locating…' : source === 'gps' ? '◉ GPS' : source === 'zipcode' ? '⌖ Zip' : '◎ Default'}
          </div>
          <div className="eco-pill" style={{ background: cityStats.gridStress === 'Low' ? 'rgba(46,125,62,0.1)' : 'rgba(201,139,26,0.12)', color: cityStats.gridStress === 'Low' ? 'var(--green)' : 'var(--sun)', padding: '3px 10px' }}>
            Stress: {cityStats.gridStress}
          </div>
        </div>
      </div>

      {/* Compact stats row */}
      <div className="flex gap-2 mb-3 flex-shrink-0" style={{ position: 'relative', zIndex: 1 }}>
        {[
          { v: cityStats.homesOnline.toLocaleString(), l: 'Homes', c: 'var(--green)' },
          { v: `${cityStats.mwReduced} MW`, l: 'Reduced', c: 'var(--sky)' },
          { v: `${cityStats.co2Offset} t`, l: 'CO₂ Off', c: 'var(--green)' },
        ].map((s, i) => (
          <div key={i} className="flex-1 text-center py-1.5" style={{
            background: 'rgba(205,196,178,0.65)',
            backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: 'var(--radius-card)',
            boxShadow: 'var(--shadow-card)',
          }}>
            <div className="font-mono text-sm" style={{ color: s.c }}>{s.v}</div>
            <div className="font-mono" style={{ fontSize: 9, color: 'var(--muted)' }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Weather row — live from Open-Meteo */}
      {weather.temperature != null && (
        <div className="flex gap-2 mb-3 flex-shrink-0" style={{ position: 'relative', zIndex: 1 }}>
          {[
            { v: `${weather.weatherEmoji} ${weather.weatherLabel}`, l: 'Weather', c: 'var(--text)' },
            { v: `${convertTemp(weather.temperature)}${tempUnit}`, l: 'Temp', c: 'var(--sun)' },
            { v: `${convertSpeed(weather.windSpeed || 0)} ${speedUnit}`, l: 'Wind', c: 'var(--sky)' },
            ...(weather.aqi != null ? [{ v: weather.aqi <= 50 ? `${weather.aqi} Good` : weather.aqi <= 100 ? `${weather.aqi} Fair` : `${weather.aqi} Poor`, l: 'AQI', c: weather.aqi <= 50 ? 'var(--green)' : weather.aqi <= 100 ? 'var(--sun)' : '#d32f2f' }] : []),
          ].map((s, i) => (
            <div key={i} className="flex-1 text-center py-1" style={{
              background: 'rgba(205,196,178,0.65)',
              backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: 'var(--radius-card)',
              boxShadow: 'var(--shadow-card)',
            }}>
              <div className="font-mono" style={{ fontSize: 10, color: s.c }}>{s.v}</div>
              <div className="font-mono" style={{ fontSize: 8, color: 'var(--muted)' }}>{s.l}</div>
            </div>
          ))}
        </div>
      )}

      {/* Map — constrained height so demand card stays visible */}
      <div className="flex-shrink-0" style={{ marginTop: 10, marginBottom: 16, height: 'clamp(200px, 46vh, 380px)', borderRadius: 'var(--radius-card)', overflow: 'hidden', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)', position: 'relative', zIndex: 1 }}>
        <MapContainer center={center} zoom={14} style={{ height: '100%', width: '100%' }} zoomControl={false} attributionControl={false}>
          <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
          <FlyTo center={center} />
          {/* User location marker */}
          <CircleMarker center={center} radius={8}
            pathOptions={{ fillColor: '#2e8b96', fillOpacity: 0.6, color: '#2e8b96', weight: 2 }}>
            <Popup>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text)' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, marginBottom: 3 }}>📍 Your Location</div>
                <div>{center[0].toFixed(3)}, {center[1].toFixed(3)}</div>
              </div>
            </Popup>
          </CircleMarker>
          {cityNodes.map(n => (
            <CircleMarker key={n.id} center={[n.lat, n.lng]} radius={7}
              pathOptions={{ fillColor: n.status === 'online' ? '#2e7d3e' : '#c98b1a', fillOpacity: 0.8, color: n.status === 'online' ? '#2e7d3e' : '#c98b1a', weight: 1.5 }}>
              <Popup>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text)', minWidth: 100 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, marginBottom: 3 }}>{n.name}</div>
                  <div>Battery: {n.battery}%</div>
                  <div>Earned: ${n.earnings.toFixed(2)}</div>
                </div>
              </Popup>
            </CircleMarker>
          ))}

          {/* Data-driven grid zone overlay circles from fuel mix */}
          {wt.fuelMix && (
            <>
              {/* Solar generation zone */}
              <CircleMarker center={[center[0] + 0.008, center[1] - 0.012]} radius={22}
                pathOptions={{ fillColor: '#f5c842', fillOpacity: 0.18, color: '#f5c842', weight: 1.5, dashArray: '4 4' }}>
                <Popup>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text)' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, marginBottom: 3 }}>☀ Solar Zone</div>
                    <div>Output: {Math.round(wt.fuelMix.solar)} MW</div>
                    <div>{Math.round(wt.fuelMix.solar / (wt.fuelMix.totalMwh || 1) * 100)}% of grid</div>
                  </div>
                </Popup>
              </CircleMarker>
              {/* Wind generation zone */}
              <CircleMarker center={[center[0] - 0.01, center[1] + 0.015]} radius={25}
                pathOptions={{ fillColor: '#7dd8ff', fillOpacity: 0.15, color: '#2e8b96', weight: 1.5, dashArray: '4 4' }}>
                <Popup>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text)' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, marginBottom: 3 }}>💨 Wind Zone</div>
                    <div>Output: {Math.round(wt.fuelMix.wind)} MW</div>
                    <div>{Math.round(wt.fuelMix.wind / (wt.fuelMix.totalMwh || 1) * 100)}% of grid</div>
                  </div>
                </Popup>
              </CircleMarker>
              {/* Clean energy radius */}
              <CircleMarker center={center} radius={35}
                pathOptions={{ fillColor: '#2e7d3e', fillOpacity: 0.06, color: '#2e7d3e', weight: 1, dashArray: '6 6' }}>
                <Popup>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text)' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, marginBottom: 3 }}>🌿 Clean Energy</div>
                    <div>Clean: {wt.fuelMix.cleanPct}% of mix</div>
                    <div>Gas: {Math.round(wt.fuelMix.gas)} MW</div>
                    <div>Nuclear: {Math.round(wt.fuelMix.nuclear || 0)} MW</div>
                  </div>
                </Popup>
              </CircleMarker>
            </>
          )}
        </MapContainer>

        {/* Overlay gradient — z-index 1000 to sit above leaflet tiles */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 1000,
            pointerEvents: 'none',
            background: `linear-gradient(180deg, ${wt.mapOverlay.tint} 0%, transparent 60%)`,
          }}
        />
        {/* Top-left badge — shows live data source */}
        <div className="eco-pill" style={{ position: 'absolute', left: 10, top: 10, zIndex: 1001, background: 'rgba(210,200,180,0.92)', color: 'var(--text)', fontSize: 9, padding: '3px 8px', backdropFilter: 'blur(4px)' }}>
          {dataSourceLabel}
        </div>
        {/* Bottom-left detail — shows fuel mix + carbon data */}
        <div className="eco-pill" style={{ position: 'absolute', left: 10, bottom: 10, zIndex: 1001, background: 'rgba(210,200,180,0.92)', color: 'var(--muted)', fontSize: 8, padding: '3px 8px', maxWidth: '70%', backdropFilter: 'blur(4px)' }}>
          {wt.fuelMix
            ? `${wt.eiaRespondent || 'ERCO'} · ${wt.homeStats?.carbonScore ?? '--'}% carbon · ${wt.fuelMix.cleanPct}% clean`
            : wt.mapOverlay.detail
          }
        </div>
        {/* Bottom-right price */}
        <div className="eco-pill" style={{ position: 'absolute', right: 10, bottom: 10, zIndex: 1001, background: 'rgba(210,200,180,0.92)', color: 'var(--sun)', fontSize: 9, padding: '3px 8px', fontFamily: 'var(--font-mono)', backdropFilter: 'blur(4px)' }}>
          {wt.eiaRespondent || 'ERCO'} ${wt.homeStats?.gridPrice?.toFixed(3) || '0.082'}/kWh
        </div>
      </div>

      {/* DR Events + Impact — frosted glass */}
      <div className="flex-shrink-0" style={{
        padding: '12px 14px', position: 'relative', zIndex: 1,
        background: 'rgba(205,196,178,0.65)',
        backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.3)',
        borderRadius: 'var(--radius-card)',
        boxShadow: 'var(--shadow-card)',
      }}>
        {/* Demand response */}
        <div className="mb-1.5">
          <div className="flex items-center justify-between mb-1">
            <span className="font-display" style={{ fontSize: 14 }}>Demand Response</span>
            {wt.demand?.demand && (
              <span className="font-mono" style={{ fontSize: 11, color: 'var(--sky)' }}>
                {Math.round(wt.demand.demand / 1000).toLocaleString()} GW load
              </span>
            )}
          </div>
          {demandEvents.map((ev, i) => (
            <div key={i} className="flex justify-between items-center py-1.5 px-2 rounded-lg mb-1"
              style={{ background: ev.status === 'Upcoming' ? 'rgba(201,139,26,0.08)' : 'transparent' }}>
              <div className="flex items-center gap-2">
                <span className="font-mono" style={{ fontSize: 12 }}>{ev.time}</span>
                {ev.status === 'Upcoming' && (
                  <span className="eco-pill" style={{ background: 'rgba(201,139,26,0.15)', color: 'var(--sun)', padding: '1px 6px', fontSize: 10 }}>Soon</span>
                )}
              </div>
              <span className="font-mono" style={{ fontSize: 12, color: ev.status === 'Upcoming' ? 'var(--sun)' : 'var(--muted)' }}>{ev.bonus}</span>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="w-full flex-shrink-0" style={{ height: 1, background: 'var(--border)' }} />

        {/* Impact grid */}
        <div className="pt-1.5">
          <div className="font-display" style={{ fontSize: 13, marginBottom: 4 }}>Your Impact</div>
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { v: impactStats.co2Avoided, l: 'CO₂' },
              { v: impactStats.gridSavings, l: 'Savings' },
              { v: impactStats.cleanHours, l: 'Clean Hrs' },
              { v: impactStats.kwhOptimized, l: 'kWh' },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="font-display" style={{ fontSize: 13, color: 'var(--green)' }}>{s.v}</div>
                <div className="font-mono" style={{ fontSize: 9, color: 'var(--muted)' }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
