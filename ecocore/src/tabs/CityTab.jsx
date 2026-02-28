import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { cityNodes, cityStats as mockCityStats, demandEvents, impactStats } from '../data/mock';
import useLocation from '../hooks/useLocation';
import useWattTimeData from '../hooks/useWattTimeData';

/* Small helper: fly to new center when location resolves */
function FlyTo({ center }) {
  const map = useMap();
  React.useEffect(() => { map.flyTo(center, map.getZoom(), { duration: 1.2 }); }, [center, map]);
  return null;
}

export default function CityTab() {
  const { center, source, loading } = useLocation();
  const wt = useWattTimeData(center);
  const cityStats = wt.cityStats || mockCityStats;

  return (
    <div className="tab-page">
      {/* Header + aggregate stats inline */}
      <div className="flex items-center justify-between mb-2 flex-shrink-0">
        <div>
          <h2 className="font-display text-base font-light">City Grid</h2>
          {wt.region && (
            <span className="font-mono" style={{ fontSize: 9, color: 'var(--muted)' }}>
              {wt.region.replace(/_/g, ' ')}
            </span>
          )}
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
      <div className="flex gap-2 mb-2 flex-shrink-0">
        {[
          { v: cityStats.homesOnline.toLocaleString(), l: 'Homes', c: 'var(--green)' },
          { v: `${cityStats.mwReduced} MW`, l: 'Reduced', c: 'var(--sky)' },
          { v: `${cityStats.co2Offset} t`, l: 'CO₂ Off', c: 'var(--green)' },
        ].map((s, i) => (
          <div key={i} className="flex-1 eco-card text-center py-1.5">
            <div className="font-mono text-sm" style={{ color: s.c }}>{s.v}</div>
            <div className="font-mono" style={{ fontSize: 9, color: 'var(--muted)' }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Map — constrained height so demand card stays visible */}
      <div className="flex-shrink-0 mb-2" style={{ height: 'clamp(200px, 46vh, 380px)', borderRadius: 'var(--radius-card)', overflow: 'hidden', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)', position: 'relative' }}>
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
        {/* Top-left badge */}
        <div className="eco-pill" style={{ position: 'absolute', left: 10, top: 10, zIndex: 1001, background: 'rgba(250,248,240,0.92)', color: 'var(--text)', fontSize: 9, padding: '3px 8px', backdropFilter: 'blur(4px)' }}>
          {wt.mapOverlay.label}
        </div>
        {/* Bottom-left detail */}
        <div className="eco-pill" style={{ position: 'absolute', left: 10, bottom: 10, zIndex: 1001, background: 'rgba(250,248,240,0.92)', color: 'var(--muted)', fontSize: 8, padding: '3px 8px', maxWidth: '70%', backdropFilter: 'blur(4px)' }}>
          {wt.mapOverlay.detail}
        </div>
        {/* Bottom-right price */}
        <div className="eco-pill" style={{ position: 'absolute', right: 10, bottom: 10, zIndex: 1001, background: 'rgba(250,248,240,0.92)', color: 'var(--sun)', fontSize: 9, padding: '3px 8px', fontFamily: 'var(--font-mono)', backdropFilter: 'blur(4px)' }}>
          {wt.eiaRespondent || 'ERCO'} ${wt.homeStats?.gridPrice?.toFixed(3) || '0.082'}/kWh
        </div>
      </div>

      {/* DR Events + Impact — compact to avoid blank white space */}
      <div className="eco-card grain flex-shrink-0 overflow-hidden" style={{ padding: '10px 12px' }}>
        {/* Demand response */}
        <div className="mb-1">
          <div className="flex items-center justify-between mb-1">
            <span className="font-display text-xs">Demand Response</span>
            {wt.demand?.demand && (
              <span className="font-mono" style={{ fontSize: 9, color: 'var(--sky)' }}>
                {Math.round(wt.demand.demand / 1000).toLocaleString()} GW load
              </span>
            )}
          </div>
          {demandEvents.map((ev, i) => (
            <div key={i} className="flex justify-between items-center py-1 px-1.5 rounded-lg mb-0.5"
              style={{ background: ev.status === 'Upcoming' ? 'rgba(201,139,26,0.08)' : 'transparent' }}>
              <div className="flex items-center gap-2">
                <span className="font-mono" style={{ fontSize: 10 }}>{ev.time}</span>
                {ev.status === 'Upcoming' && (
                  <span className="eco-pill" style={{ background: 'rgba(201,139,26,0.15)', color: 'var(--sun)', padding: '1px 6px', fontSize: 9 }}>Soon</span>
                )}
              </div>
              <span className="font-mono" style={{ fontSize: 10, color: ev.status === 'Upcoming' ? 'var(--sun)' : 'var(--muted)' }}>{ev.bonus}</span>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="w-full flex-shrink-0" style={{ height: 1, background: 'var(--border)' }} />

        {/* Impact grid */}
        <div className="pt-1">
          <div className="font-display text-xs mb-0.5">Your Impact</div>
          <div className="grid grid-cols-4 gap-1">
            {[
              { v: impactStats.co2Avoided, l: 'CO₂' },
              { v: impactStats.peakerReplaced, l: 'Peaker' },
              { v: impactStats.carFreeDays, l: 'Car-free' },
              { v: impactStats.kwhOptimized, l: 'kWh' },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="font-display text-xs" style={{ color: 'var(--green)' }}>{s.v}</div>
                <div className="font-mono" style={{ fontSize: 8, color: 'var(--muted)' }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
