import React, { useState } from 'react';
import { FloatingLeaves } from './Icons';

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const [locationLabel, setLocationLabel] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [hasSolar, setHasSolar] = useState(null);
  const [connectedToGrid, setConnectedToGrid] = useState(null);

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Location not supported. Use ZIP code instead.');
      return;
    }

    setLocating(true);
    setLocationError('');

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const label = `GPS (${coords.latitude.toFixed(3)}, ${coords.longitude.toFixed(3)})`;
        setLocationLabel(label);
        localStorage.removeItem('ecocore_user_zip');
        localStorage.setItem('ecocore_user_location', JSON.stringify({ lat: coords.latitude, lng: coords.longitude }));
        setLocating(false);
        setTimeout(() => setStep(1), 300);
      },
      () => {
        setLocating(false);
        setLocationError('Could not get location. Try ZIP code.');
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
    );
  };

  const handleZipContinue = () => {
    if (zipCode.length !== 5) {
      setLocationError('Enter a valid 5-digit ZIP code.');
      return;
    }
    setLocationError('');
    setLocationLabel(`ZIP ${zipCode}`);
    localStorage.setItem('ecocore_user_zip', zipCode);
    setStep(1);
  };

  const completeSetup = () => {
    localStorage.setItem(
      'ecocore_onboarding_profile',
      JSON.stringify({
        location: locationLabel || 'Unknown',
        zipCode: zipCode || null,
        hasSolar,
        connectedToGrid,
      })
    );
    onComplete();
  };

  return (
    <div className="h-full flex flex-col items-center justify-center px-8 anim-fadein solarpunk-bg" style={{ position: 'relative', overflow: 'hidden' }}>
      <FloatingLeaves />

      {/* Step dots */}
      <div className="flex gap-2 mb-6">
        {[0, 1, 2].map(d => (
          <div key={d} className="w-2.5 h-2.5 rounded-full transition-all" style={{
            background: d <= step ? 'var(--green)' : 'var(--warm)',
            border: `1.5px solid ${d <= step ? 'var(--green)' : 'var(--border)'}`,
            boxShadow: d <= step ? '0 0 6px rgba(46,125,62,0.3)' : 'none',
          }} />
        ))}
      </div>

      {/* Step 1: Location */}
      {step === 0 && (
        <div className="w-full max-w-xs text-center anim-fadein">
          <h2 className="font-display text-xl font-light mb-0.5">Your Location</h2>
          <p className="font-mono text-xs mb-4" style={{ color: 'var(--muted)' }}>Use current location or enter ZIP code</p>

          <button className="eco-btn eco-btn-primary w-full mb-2" onClick={handleUseLocation} disabled={locating}>
            {locating ? 'Detecting location…' : 'Use My Current Location'}
          </button>

          <div className="eco-card grain p-3">
            <div className="font-mono text-[11px] mb-1" style={{ color: 'var(--muted)' }}>or enter ZIP code</div>
            <div className="flex gap-2">
              <input
                className="eco-input"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                placeholder="e.g. 78701"
                style={{ padding: '7px 10px', fontSize: 12 }}
              />
              <button className="eco-btn eco-btn-outline" style={{ padding: '7px 12px', fontSize: 12 }} onClick={handleZipContinue}>
                Continue
              </button>
            </div>
          </div>

          {!!locationError && (
            <p className="font-mono text-[10px] mt-2" style={{ color: '#b43c3c' }}>{locationError}</p>
          )}
        </div>
      )}

      {/* Step 2: Home setup */}
      {step === 1 && (
        <div className="w-full max-w-xs text-center anim-fadein">
          <h2 className="font-display text-xl font-light mb-0.5">Home Setup</h2>
          <p className="font-mono text-xs mb-4" style={{ color: 'var(--muted)' }}>This app works with or without solar</p>

          <div className="eco-card grain mb-3 p-3 text-left">
            <div className="font-mono text-[11px] mb-2" style={{ color: 'var(--muted)' }}>Do you have solar panels?</div>
            <div className="flex gap-2">
              <button
                className={`eco-chip ${hasSolar === true ? 'active' : ''}`}
                onClick={() => setHasSolar(true)}
                style={{ flex: 1, textAlign: 'center' }}
              >
                Yes
              </button>
              <button
                className={`eco-chip ${hasSolar === false ? 'active' : ''}`}
                onClick={() => setHasSolar(false)}
                style={{ flex: 1, textAlign: 'center' }}
              >
                No
              </button>
            </div>
          </div>

          <div className="eco-card grain mb-4 p-3 text-left">
            <div className="font-mono text-[11px] mb-2" style={{ color: 'var(--muted)' }}>Are you connected to the city grid?</div>
            <div className="flex gap-2">
              <button
                className={`eco-chip ${connectedToGrid === true ? 'active' : ''}`}
                onClick={() => setConnectedToGrid(true)}
                style={{ flex: 1, textAlign: 'center' }}
              >
                Yes
              </button>
              <button
                className={`eco-chip ${connectedToGrid === false ? 'active' : ''}`}
                onClick={() => setConnectedToGrid(false)}
                style={{ flex: 1, textAlign: 'center' }}
              >
                No
              </button>
            </div>
          </div>

          <button className="eco-btn eco-btn-primary w-full" onClick={() => setStep(2)} disabled={hasSolar === null || connectedToGrid === null} style={{ opacity: hasSolar === null || connectedToGrid === null ? 0.55 : 1 }}>
            Continue
          </button>
        </div>
      )}

      {/* Step 3: Confirmation */}
      {step === 2 && (
        <div className="w-full max-w-xs text-center anim-fadein">
          <h2 className="font-display text-xl font-light mb-1">All Set</h2>
          <p className="font-display text-sm font-light italic mb-5" style={{ color: 'var(--green)' }}>
            Your home is now part of something bigger.
          </p>
          <div className="eco-card-glow grain py-4 mb-5">
            <div className="font-mono text-xs mb-1" style={{ color: 'var(--muted)' }}>Location: <span style={{ color: 'var(--text)' }}>{locationLabel || 'Unknown'}</span></div>
            <div className="font-mono text-xs mb-1" style={{ color: 'var(--muted)' }}>Solar: <span style={{ color: 'var(--text)' }}>{hasSolar ? 'Yes' : 'No'}</span></div>
            <div className="font-mono text-xs" style={{ color: 'var(--muted)' }}>City Grid: <span style={{ color: 'var(--text)' }}>{connectedToGrid ? 'Connected' : 'Not connected'}</span></div>
          </div>
          <button className="eco-btn eco-btn-primary w-full" onClick={completeSetup}>Enter Dashboard</button>
        </div>
      )}
    </div>
  );
}
