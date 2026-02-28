import React, { useState } from 'react';
import { userData, settingsToggles } from '../data/mock';

export default function SettingsTab() {
  const [battery, setBattery] = useState(userData.batteryCapacity);
  const [toggles, setToggles] = useState(settingsToggles.map(() => true));
  const [region, setRegion] = useState(userData.gridRegion);

  const handleToggle = (i) => {
    const next = [...toggles];
    next[i] = !next[i];
    setToggles(next);
  };

  return (
    <div className="tab-page">
      <h2 className="font-display text-base font-light mb-2 flex-shrink-0">Settings</h2>

      {/* Profile */}
      <div className="eco-card grain mb-2 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center font-display text-base"
            style={{ background: 'var(--green)', color: 'white', boxShadow: '0 2px 8px rgba(46,125,62,0.25)' }}>
            {userData.name[0]}
          </div>
          <div className="flex-1">
            <div className="font-display text-sm">{userData.name}</div>
            <div className="font-mono" style={{ fontSize: 10, color: 'var(--muted)' }}>{userData.email}</div>
          </div>
          <div className="eco-pill" style={{ background: 'rgba(46,125,62,0.08)', color: 'var(--green)', padding: '2px 8px', fontSize: 9 }}>
            Connected
          </div>
        </div>
      </div>

      {/* Home Configuration */}
      <div className="eco-card grain mb-2 flex-shrink-0">
        <div className="font-display text-xs mb-2">Home Configuration</div>

        <div className="mb-2">
          <div className="flex justify-between mb-0.5">
            <span className="font-mono" style={{ fontSize: 11, color: 'var(--muted)' }}>Battery Capacity</span>
            <span className="font-mono" style={{ fontSize: 11, color: 'var(--green)' }}>{battery} kWh</span>
          </div>
          <input type="range" min="5" max="40" step="0.5" value={battery} onChange={e => setBattery(parseFloat(e.target.value))} />
        </div>

        <div className="flex justify-between items-center mb-2">
          <span className="font-mono" style={{ fontSize: 11, color: 'var(--muted)' }}>Solar Panels</span>
          <span className="font-mono" style={{ fontSize: 11 }}>{userData.solarPanels}</span>
        </div>

        <div className="mb-2">
          <span className="font-mono" style={{ fontSize: 11, color: 'var(--muted)' }}>Grid Region</span>
          <select className="eco-input mt-1" value={region} onChange={e => setRegion(e.target.value)} style={{ padding: '6px 10px', fontSize: 12 }}>
            <option value="ERCOT">ERCOT (Texas)</option>
            <option value="CAISO">CAISO (California)</option>
            <option value="PJM">PJM (Mid-Atlantic)</option>
          </select>
        </div>

        <div className="flex justify-between items-center">
          <span className="font-mono" style={{ fontSize: 11, color: 'var(--muted)' }}>Inverter</span>
          <span className="font-mono" style={{ fontSize: 11 }}>{userData.inverter}</span>
        </div>
      </div>

      {/* Automation Rules — fills remaining */}
      <div className="eco-card grain flex-1 min-h-0 flex flex-col">
        <div className="font-display text-xs mb-2">Automation Rules</div>
        <div className="flex-1 flex flex-col justify-between">
          {settingsToggles.map((label, i) => (
            <div key={i} className="flex justify-between items-center py-1.5">
              <span className="font-mono" style={{ fontSize: 11, color: 'var(--text)' }}>{label}</span>
              <button className={`eco-toggle ${toggles[i] ? 'active' : ''}`} onClick={() => handleToggle(i)} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
