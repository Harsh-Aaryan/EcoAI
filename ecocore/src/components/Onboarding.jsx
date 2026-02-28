import React, { useState } from 'react';

const cities = [
  { label: 'Austin, TX', region: 'ERCOT' },
  { label: 'San Francisco, CA', region: 'CAISO' },
  { label: 'Chicago, IL', region: 'PJM' },
];

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const [city, setCity] = useState(null);
  const [battery, setBattery] = useState(13.5);

  const dots = [0, 1, 2];

  return (
    <div className="h-full flex flex-col items-center justify-center px-8 anim-fadein">
      {/* Step dots */}
      <div className="flex gap-2 mb-8">
        {dots.map(d => (
          <div
            key={d}
            className="w-2.5 h-2.5 rounded-full transition-all"
            style={{
              background: d <= step ? 'var(--green)' : 'transparent',
              border: `1.5px solid ${d <= step ? 'var(--green)' : 'var(--border)'}`,
            }}
          />
        ))}
      </div>

      {/* Step 1: Location */}
      {step === 0 && (
        <div className="w-full max-w-xs text-center anim-fadein">
          <h2 className="font-display text-xl font-light mb-1">Your Location</h2>
          <p className="font-mono text-xs mb-6" style={{ color: 'var(--muted)' }}>
            We'll connect you to your local grid
          </p>
          <div className="space-y-3">
            {cities.map(c => (
              <button
                key={c.label}
                className={`w-full eco-card grain text-center py-3 cursor-pointer border-2 transition-all ${city === c.label ? '' : ''}`}
                style={{
                  borderColor: city === c.label ? 'var(--green)' : 'var(--border)',
                  background: city === c.label ? 'rgba(74,222,128,0.08)' : 'var(--surface)',
                }}
                onClick={() => { setCity(c.label); setTimeout(() => setStep(1), 400); }}
              >
                <span className="font-display text-sm">{c.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Battery */}
      {step === 1 && (
        <div className="w-full max-w-xs text-center anim-fadein">
          <h2 className="font-display text-xl font-light mb-1">Your Battery</h2>
          <p className="font-mono text-xs mb-6" style={{ color: 'var(--muted)' }}>
            Tell us about your home storage
          </p>
          <div className="eco-card grain mb-4 py-6">
            <div className="font-mono text-3xl mb-4" style={{ color: 'var(--green)' }}>
              {battery} kWh
            </div>
            <input
              type="range"
              min="5"
              max="40"
              step="0.5"
              value={battery}
              onChange={e => setBattery(parseFloat(e.target.value))}
              className="w-full px-4"
            />
            <div className="flex justify-between px-4 mt-2">
              <span className="font-mono text-xs" style={{ color: 'var(--muted)' }}>5 kWh</span>
              <span className="font-mono text-xs" style={{ color: 'var(--muted)' }}>40 kWh</span>
            </div>
          </div>
          <div className="font-mono text-xs mb-4" style={{ color: 'var(--muted)' }}>
            Detected: Tesla Powerwall 2
          </div>
          <button className="eco-btn eco-btn-primary w-full" onClick={() => setStep(2)}>
            Continue
          </button>
        </div>
      )}

      {/* Step 3: Confirmation */}
      {step === 2 && (
        <div className="w-full max-w-xs text-center anim-fadein">
          <h2 className="font-display text-xl font-light mb-2">All Set</h2>
          <p className="font-display text-base font-light italic mb-6" style={{ color: 'var(--green-soft)' }}>
            Your home is now part of something bigger.
          </p>
          <div className="eco-card grain py-4 mb-6">
            <div className="font-mono text-xs" style={{ color: 'var(--muted)' }}>
              You've joined <span style={{ color: 'var(--green)' }}>1,247</span> homes in the{' '}
              {city || 'Austin, TX'} grid
            </div>
          </div>
          <button className="eco-btn eco-btn-primary w-full" onClick={onComplete}>
            Enter Dashboard
          </button>
        </div>
      )}
    </div>
  );
}
