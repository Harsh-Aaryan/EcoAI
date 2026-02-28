import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { cityNodes, cityStats, demandEvents, impactStats, tickerItems } from '../data/mock';

function CityStatsRow() {
  return (
    <div className="flex justify-between items-center mb-3 px-1">
      <div className="text-center">
        <div className="font-mono text-sm" style={{ color: 'var(--green)' }}>{cityStats.homesOnline.toLocaleString()}</div>
        <div className="font-mono text-xs" style={{ color: 'var(--muted)' }}>Homes</div>
      </div>
      <div className="text-center">
        <div className="font-mono text-sm" style={{ color: 'var(--sky)' }}>{cityStats.mwReduced} MW</div>
        <div className="font-mono text-xs" style={{ color: 'var(--muted)' }}>Reduced</div>
      </div>
      <div className="text-center">
        <div className="font-mono text-sm" style={{ color: 'var(--green)' }}>{cityStats.co2Offset} t</div>
        <div className="font-mono text-xs" style={{ color: 'var(--muted)' }}>CO₂ Offset</div>
      </div>
      <div className="text-center">
        <div
          className="eco-pill text-xs font-mono"
          style={{
            background: cityStats.gridStress === 'Low' ? 'rgba(74,222,128,0.15)' : 'rgba(251,191,36,0.15)',
            color: cityStats.gridStress === 'Low' ? 'var(--green)' : 'var(--sun)',
            padding: '3px 10px',
          }}
        >
          {cityStats.gridStress}
        </div>
        <div className="font-mono text-xs" style={{ color: 'var(--muted)' }}>Stress</div>
      </div>
    </div>
  );
}

function GridTicker() {
  return (
    <div className="overflow-hidden my-3" style={{ height: 20 }}>
      <div className="anim-ticker font-mono text-xs" style={{ color: 'var(--muted)' }}>
        {tickerItems.map((item, i) => (
          <span key={i}>
            {item}
            {i < tickerItems.length - 1 && <span className="mx-3">·</span>}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function CityTab() {
  return (
    <div className="tab-page">
      <h2 className="font-display text-lg font-light mb-4">City Grid</h2>

      {/* Aggregate stats */}
      <CityStatsRow />

      {/* Map */}
      <div style={{ height: 220, borderRadius: 'var(--radius-card)', overflow: 'hidden', border: '1px solid var(--border)' }} className="mb-0">
        <MapContainer
          center={[30.267, -97.743]}
          zoom={14}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
          {cityNodes.map((node) => (
            <CircleMarker
              key={node.id}
              center={[node.lat, node.lng]}
              radius={8}
              pathOptions={{
                fillColor: node.status === 'online' ? '#4ade80' : '#fbbf24',
                fillOpacity: 0.85,
                color: node.status === 'online' ? '#4ade80' : '#fbbf24',
                weight: 1,
              }}
            >
              <Popup>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text)', minWidth: 120 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, marginBottom: 4 }}>{node.name}</div>
                  <div>Battery: {node.battery}%</div>
                  <div>Earned: ${node.earnings.toFixed(2)}</div>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      {/* Ticker */}
      <GridTicker />

      {/* Combined DR + Impact Card */}
      <div className="eco-card grain">
        {/* Demand Response Events */}
        <div className="mb-3">
          <div className="font-display text-sm font-normal mb-2" style={{ color: 'var(--text)' }}>
            Demand Response Events
          </div>
          {demandEvents.map((ev, i) => (
            <div
              key={i}
              className="flex justify-between items-center py-2 px-2 rounded-lg mb-1"
              style={{
                background: ev.status === 'Upcoming' ? 'rgba(251,191,36,0.1)' : 'transparent',
              }}
            >
              <div>
                <span className="font-mono text-xs">{ev.time}</span>
                {ev.status === 'Upcoming' && (
                  <span
                    className="eco-pill ml-2 text-xs"
                    style={{ background: 'rgba(251,191,36,0.2)', color: 'var(--sun)', padding: '2px 8px' }}
                  >
                    Upcoming
                  </span>
                )}
              </div>
              <span className="font-mono text-xs" style={{ color: ev.status === 'Upcoming' ? 'var(--sun)' : 'var(--muted)' }}>
                {ev.bonus}
              </span>
            </div>
          ))}
        </div>

        {/* Hairline divider */}
        <div className="w-full mb-3" style={{ height: 1, background: 'var(--border)' }} />

        {/* Your Impact */}
        <div>
          <div className="font-display text-sm font-normal mb-2" style={{ color: 'var(--text)' }}>
            Your Impact
          </div>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(impactStats).map(([key, val]) => {
              const labels = {
                co2Avoided: 'CO₂ Avoided',
                peakerReplaced: 'Peaker Replaced',
                carFreeDays: 'Car-free Equiv.',
                kwhOptimized: 'kWh Optimized',
              };
              return (
                <div key={key} className="text-center">
                  <div className="font-display text-base font-normal" style={{ color: 'var(--text)' }}>{val}</div>
                  <div className="font-mono text-xs" style={{ color: 'var(--muted)' }}>{labels[key]}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
