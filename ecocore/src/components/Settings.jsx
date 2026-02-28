import React, { useState } from 'react';
import { userData, settingsToggles, techStack } from '../data/mock';

export default function Settings({ onClose }) {
  const [battery, setBattery] = useState(userData.batteryCapacity);
  const [toggles, setToggles] = useState(settingsToggles.map(() => true));
  const [region, setRegion] = useState(userData.gridRegion);

  const handleToggle = (i) => {
    const next = [...toggles];
    next[i] = !next[i];
    setToggles(next);
  };

  return (
    <>
      <div className="sheet-overlay" onClick={onClose} />
      <div className="sheet">
        {/* Handle */}
        <div className="flex justify-center mb-4">
          <div className="w-10 h-1 rounded-full" style={{ background: 'var(--border)' }} />
        </div>

        <h2 className="font-display text-lg font-light mb-5">Settings</h2>

        {/* Profile */}
        <div className="eco-card grain mb-4">
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center font-display text-lg"
              style={{ background: 'var(--green)', color: 'var(--bg)' }}
            >
              {userData.name[0]}
            </div>
            <div>
              <div className="font-display text-sm">{userData.name}</div>
              <div className="font-mono text-xs" style={{ color: 'var(--muted)' }}>{userData.email}</div>
            </div>
          </div>
          <div className="eco-pill text-xs" style={{ background: 'rgba(74,222,128,0.1)', color: 'var(--green)', padding: '3px 10px' }}>
            Auth0 Connected
          </div>
        </div>

        {/* Home Configuration */}
        <div className="eco-card grain mb-4">
          <div className="font-display text-sm mb-3">Home Configuration</div>

          <div className="mb-3">
            <div className="flex justify-between mb-1">
              <span className="font-mono text-xs" style={{ color: 'var(--muted)' }}>Battery Capacity</span>
              <span className="font-mono text-xs" style={{ color: 'var(--green)' }}>{battery} kWh</span>
            </div>
            <input
              type="range"
              min="5"
              max="40"
              step="0.5"
              value={battery}
              onChange={e => setBattery(parseFloat(e.target.value))}
            />
          </div>

          <div className="flex justify-between items-center mb-3">
            <span className="font-mono text-xs" style={{ color: 'var(--muted)' }}>Solar Panels</span>
            <span className="font-mono text-xs">{userData.solarPanels}</span>
          </div>

          <div className="mb-3">
            <span className="font-mono text-xs" style={{ color: 'var(--muted)' }}>Grid Region</span>
            <select
              className="eco-input mt-1"
              value={region}
              onChange={e => setRegion(e.target.value)}
              style={{ background: 'var(--surface)' }}
            >
              <option value="ERCOT">ERCOT (Texas)</option>
              <option value="CAISO">CAISO (California)</option>
              <option value="PJM">PJM (Mid-Atlantic)</option>
            </select>
          </div>

          <div className="flex justify-between items-center">
            <span className="font-mono text-xs" style={{ color: 'var(--muted)' }}>Inverter</span>
            <span className="font-mono text-xs">{userData.inverter}</span>
          </div>
        </div>

        {/* Automation Rules */}
        <div className="eco-card grain mb-4">
          <div className="font-display text-sm mb-3">Automation Rules</div>
          {settingsToggles.map((label, i) => (
            <div key={i} className="flex justify-between items-center mb-3 last:mb-0">
              <span className="font-mono text-xs" style={{ color: 'var(--text)' }}>{label}</span>
              <button className={`eco-toggle ${toggles[i] ? 'active' : ''}`} onClick={() => handleToggle(i)} />
            </div>
          ))}
        </div>

        {/* Tech Stack */}
        <div className="eco-card grain mb-4">
          <div className="font-display text-sm mb-3">Tech Stack</div>
          {techStack.map((row, i) => (
            <div key={i} className="flex justify-between items-center py-1.5 border-b last:border-b-0" style={{ borderColor: 'var(--border)' }}>
              <span className="font-mono text-xs" style={{ color: 'var(--muted)' }}>{row.layer}</span>
              <span className="font-mono text-xs">{row.value}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
