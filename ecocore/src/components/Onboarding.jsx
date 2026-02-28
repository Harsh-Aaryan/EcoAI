import React, { useState } from 'react';
import { FloatingLeaves } from './Icons';

const cities = [
  { label: 'Austin, TX', region: 'ERCOT' },
  { label: 'San Francisco, CA', region: 'CAISO' },
  { label: 'Chicago, IL', region: 'PJM' },
];

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const [city, setCity] = useState(null);
  const [battery, setBattery] = useState(13.5);

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
          <p className="font-mono text-xs mb-5" style={{ color: 'var(--muted)' }}>We'll connect you to your local grid</p>
          <div className="space-y-2">
            {cities.map(c => (
              <button key={c.label} className="w-full eco-card grain text-center py-3 cursor-pointer transition-all"
                style={{ borderColor: city === c.label ? 'var(--green)' : 'var(--border)', background: city === c.label ? 'rgba(46,125,62,0.06)' : 'var(--surface)',
                  boxShadow: city === c.label ? 'var(--shadow-glow)' : 'var(--shadow-card)' }}
                onClick={() => { setCity(c.label); setTimeout(() => setStep(1), 400); }}>
                <span className="font-display text-sm">{c.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Battery */}
      {step === 1 && (
        <div className="w-full max-w-xs text-center anim-fadein">
          <h2 className="font-display text-xl font-light mb-0.5">Your Battery</h2>
          <p className="font-mono text-xs mb-5" style={{ color: 'var(--muted)' }}>Tell us about your home storage</p>
          <div className="eco-card grain mb-3 py-5">
            <div className="font-mono text-3xl mb-3" style={{ color: 'var(--green)' }}>{battery} kWh</div>
            <input type="range" min="5" max="40" step="0.5" value={battery} onChange={e => setBattery(parseFloat(e.target.value))} className="w-full px-4" />
            <div className="flex justify-between px-4 mt-1.5">
              <span className="font-mono" style={{ fontSize: 10, color: 'var(--muted)' }}>5 kWh</span>
              <span className="font-mono" style={{ fontSize: 10, color: 'var(--muted)' }}>40 kWh</span>
            </div>
          </div>
          <div className="font-mono text-xs mb-3" style={{ color: 'var(--muted)' }}>Detected: Tesla Powerwall 2</div>
          <button className="eco-btn eco-btn-primary w-full" onClick={() => setStep(2)}>Continue</button>
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
            <div className="font-mono text-xs" style={{ color: 'var(--muted)' }}>
              You've joined <span style={{ color: 'var(--green)', fontWeight: 500 }}>1,247</span> homes in the {city || 'Austin, TX'} grid
            </div>
          </div>
          <button className="eco-btn eco-btn-primary w-full" onClick={onComplete}>Enter Dashboard</button>
        </div>
      )}
    </div>
  );
}
