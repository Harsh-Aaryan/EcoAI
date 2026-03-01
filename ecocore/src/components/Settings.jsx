import React, { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { userData, settingsToggles } from '../data/mock';
import useLocation from '../hooks/useLocation';
import { useUnits } from '../hooks/useUnits';

export default function SettingsTab() {
  const { user, logout } = useAuth0();
  const { source, setZipcode, center, loading: locLoading, error: locError } = useLocation();
  const { system: unitSystem, setSystem: setUnitSystem } = useUnits();
  const [battery, setBattery] = useState(userData.batteryCapacity);
  const [toggles, setToggles] = useState(settingsToggles.map(() => true));
  const [region, setRegion] = useState(userData.gridRegion);
  const [zipInput, setZipInput] = useState(localStorage.getItem('ecocore_user_zip') || '');
  const [computeMode, setComputeMode] = useState(localStorage.getItem('homenode_compute_mode') || 'cloud');
  const [sshKey, setSshKey] = useState(localStorage.getItem('homenode_ssh_key') || '');

  const handleToggle = (i) => {
    const next = [...toggles];
    next[i] = !next[i];
    setToggles(next);
  };

  const handleComputeModeChange = (mode) => {
    setComputeMode(mode);
    localStorage.setItem('homenode_compute_mode', mode);
  };

  const handleSshSave = () => {
    localStorage.setItem('homenode_ssh_key', sshKey.trim());
  };

  const handleZipSubmit = () => {
    if (zipInput.trim().length === 5) {
      setZipcode(zipInput.trim());
    } else if (!zipInput.trim()) {
      setZipcode(null); // clear override
    }
  };

  return (
    <div className="tab-page frosted-page" style={{ overflowY: 'auto', display: 'block' }}>
      <h2 className="font-display text-base font-light mb-2" style={{ position: 'relative', zIndex: 1 }}>Settings</h2>

      {/* Profile — from Auth0 */}
      <div className="eco-card grain mb-2 flex-shrink-0">
        <div className="flex items-center gap-3">
          {user?.picture ? (
            <img src={user.picture} alt="" className="w-9 h-9 rounded-full" style={{ border: '2px solid var(--green)', objectFit: 'cover' }} />
          ) : (
            <div className="w-9 h-9 rounded-full flex items-center justify-center font-display text-base"
              style={{ background: 'var(--green)', color: 'white', boxShadow: '0 2px 8px rgba(46,125,62,0.25)' }}>
              {(user?.name || 'U')[0]}
            </div>
          )}
          <div className="flex-1">
            <div className="font-display text-sm">{user?.name || 'User'}</div>
            <div className="font-mono" style={{ fontSize: 10, color: 'var(--muted)' }}>{user?.email || ''}</div>
          </div>
          <button className="eco-pill" onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
            style={{ background: 'rgba(180,60,60,0.08)', color: '#b43c3c', padding: '3px 10px', fontSize: 9, cursor: 'pointer', border: 'none' }}>
            Sign Out
          </button>
        </div>
      </div>

      {/* Location / Zipcode */}
      <div className="eco-card grain mb-2 flex-shrink-0">
        <div className="font-display text-xs mb-1.5">Location</div>
        <div className="flex items-center gap-2 mb-1">
          <div className="eco-pill" style={{ background: 'rgba(46,139,150,0.1)', color: 'var(--sky)', padding: '2px 8px', fontSize: 9 }}>
            {source === 'gps' ? '◉ GPS' : source === 'zipcode' ? '⌖ Zipcode' : source === 'gps-cached' ? '◉ GPS (cached)' : '◎ Default'}
          </div>
          <span className="font-mono" style={{ fontSize: 10, color: 'var(--muted)' }}>
            {center[0].toFixed(2)}, {center[1].toFixed(2)}
          </span>
        </div>
        <div className="flex gap-2">
          <input className="eco-input flex-1"
            placeholder="Any US ZIP code (e.g. 90210)"
            value={zipInput}
            onChange={e => setZipInput(e.target.value.replace(/\D/g, '').slice(0, 5))}
            onKeyDown={e => e.key === 'Enter' && handleZipSubmit()}
            style={{ padding: '5px 10px', fontSize: 11 }}
          />
          <button className="eco-btn eco-btn-primary" onClick={handleZipSubmit}
            disabled={locLoading}
            style={{ padding: '5px 12px', fontSize: 11, borderRadius: 'var(--radius-input)', opacity: locLoading ? 0.6 : 1 }}>
            {locLoading ? '…' : 'Set'}
          </button>
        </div>
        {locError && (
          <div className="font-mono mt-1" style={{ fontSize: 10, color: '#c0392b' }}>
            {locError}
          </div>
        )}
        {source === 'zipcode' && (
          <button className="font-mono mt-1" style={{ fontSize: 10, color: 'var(--sky)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
            onClick={() => { setZipInput(''); setZipcode(null); }}>
            Clear override, use GPS
          </button>
        )}
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

      {/* Unit System */}
      <div className="eco-card grain mb-2 flex-shrink-0">
        <div className="font-display text-xs mb-2">Unit System</div>
        <div className="flex gap-1.5">
          {[
            { key: 'metric', label: '🌡️ Metric', desc: '°C · km/h' },
            { key: 'imperial', label: '🌡️ Imperial', desc: '°F · mph' },
          ].map(opt => (
            <button key={opt.key}
              className="flex-1 text-left"
              style={{
                padding: '8px 10px',
                borderRadius: 10,
                border: unitSystem === opt.key ? '1.5px solid var(--green)' : '1.5px solid var(--border)',
                background: unitSystem === opt.key ? 'rgba(46,125,62,0.08)' : 'transparent',
                cursor: 'pointer',
                transition: 'all 150ms',
              }}
              onClick={() => setUnitSystem(opt.key)}
            >
              <div className="font-mono" style={{ fontSize: 11, color: unitSystem === opt.key ? 'var(--green)' : 'var(--text)' }}>{opt.label}</div>
              <div className="font-mono" style={{ fontSize: 9, color: 'var(--muted)' }}>{opt.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Compute Provider */}
      <div className="eco-card grain mb-2 flex-shrink-0">
        <div className="font-display text-xs mb-2">AI Compute Provider</div>
        <div className="font-mono mb-2" style={{ fontSize: 10, color: 'var(--muted)' }}>
          Choose where AI jobs run. Cloud uses the default Groq API. Local connects to your machine via SSH.
        </div>

        <div className="flex gap-1.5 mb-2">
          {[
            { key: 'cloud', label: '☁️ Cloud (Groq)', desc: 'Default · No setup needed' },
            { key: 'local', label: '🖥️ Local Machine', desc: 'SSH into your hardware' },
          ].map(opt => (
            <button key={opt.key}
              className="flex-1 text-left"
              style={{
                padding: '8px 10px',
                borderRadius: 10,
                border: computeMode === opt.key ? '1.5px solid var(--green)' : '1.5px solid var(--border)',
                background: computeMode === opt.key ? 'rgba(46,125,62,0.08)' : 'transparent',
                cursor: 'pointer',
                transition: 'all 150ms',
              }}
              onClick={() => handleComputeModeChange(opt.key)}
            >
              <div className="font-mono" style={{ fontSize: 11, color: computeMode === opt.key ? 'var(--green)' : 'var(--text)' }}>{opt.label}</div>
              <div className="font-mono" style={{ fontSize: 9, color: 'var(--muted)' }}>{opt.desc}</div>
            </button>
          ))}
        </div>

        {computeMode === 'local' && (
          <div className="anim-fadein">
            <div className="font-mono mb-1" style={{ fontSize: 10, color: 'var(--muted)' }}>SSH Public Key</div>
            <textarea
              className="eco-input w-full mb-1.5"
              placeholder="ssh-rsa AAAA... user@host"
              value={sshKey}
              onChange={e => setSshKey(e.target.value)}
              rows={3}
              style={{ padding: '6px 10px', fontSize: 10, fontFamily: 'monospace', resize: 'none' }}
            />
            <button className="eco-btn eco-btn-primary w-full" onClick={handleSshSave}
              style={{ padding: '6px 12px', fontSize: 11 }}>
              Save SSH Key
            </button>
          </div>
        )}

        {computeMode === 'cloud' && (
          <div className="flex items-center gap-2" style={{ padding: '4px 0' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 6px rgba(46,125,62,0.5)' }} />
            <span className="font-mono" style={{ fontSize: 10, color: 'var(--green)' }}>Connected to Groq · LLaMA 3.3 70B</span>
          </div>
        )}
      </div>

      {/* Automation Rules — fills remaining */}
      <div className="eco-card grain flex flex-col items-stretch" style={{ marginTop: 16, padding: '16px 12px' }}>
        <div className="font-display text-xs mb-1">Automation Rules</div>
        <div className="flex flex-col" style={{gap: 10}}>
          {settingsToggles.map((label, i) => (
            <div key={i} className="flex flex-row items-center justify-between" style={{minHeight: 28}}>
              <span style={{
                fontSize: 13,
                color: 'var(--text)',
                lineHeight: 1.2,
                background: 'none',
                borderRadius: '12px',
                padding: 0,
                display: 'inline-block',
                marginRight: 12,
                boxShadow: 'none',
                flex: 1
              }}>{label}</span>
              <button className={`eco-toggle ${toggles[i] ? 'active' : ''}`} onClick={() => handleToggle(i)} style={{transform: 'scale(0.8)', minWidth: 22, minHeight: 16, alignSelf: 'flex-end'}} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
