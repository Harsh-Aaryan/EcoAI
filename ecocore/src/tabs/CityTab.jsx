import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { cityNodes, cityStats, demandEvents, impactStats, tickerItems } from '../data/mock';

export default function CityTab() {
  return (
    <div className="tab-page">
      {/* Header + aggregate stats inline */}
      <div className="flex items-center justify-between mb-2 flex-shrink-0">
        <h2 className="font-display text-base font-light">City Grid</h2>
        <div className="eco-pill" style={{ background: cityStats.gridStress === 'Low' ? 'rgba(46,125,62,0.1)' : 'rgba(201,139,26,0.12)', color: cityStats.gridStress === 'Low' ? 'var(--green)' : 'var(--sun)', padding: '3px 10px' }}>
          Stress: {cityStats.gridStress}
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

      {/* Map */}
      <div className="flex-shrink-0 mb-1" style={{ height: 175, borderRadius: 'var(--radius-card)', overflow: 'hidden', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}>
        <MapContainer center={[30.267, -97.743]} zoom={14} style={{ height: '100%', width: '100%' }} zoomControl={false} attributionControl={false}>
          <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
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
      </div>

      {/* Ticker */}
      <div className="overflow-hidden flex-shrink-0 mb-1" style={{ height: 16 }}>
        <div className="anim-ticker font-mono" style={{ fontSize: 10, color: 'var(--muted)' }}>
          {tickerItems.map((t, i) => <span key={i}>{t}{i < tickerItems.length - 1 && <span className="mx-2">·</span>}</span>)}
        </div>
      </div>

      {/* DR Events + Impact — combined card, fills remaining */}
      <div className="eco-card grain flex-1 min-h-0 flex flex-col overflow-hidden">
        {/* Demand response */}
        <div className="mb-1.5">
          <div className="font-display text-xs mb-1">Demand Response</div>
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
        <div className="pt-1.5">
          <div className="font-display text-xs mb-1">Your Impact</div>
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
