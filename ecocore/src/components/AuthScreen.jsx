import React from 'react';
import { CircuitLeafLogo, LeafIcon, ChipIcon, SunIcon } from './Icons';

export default function AuthScreen({ onLogin }) {
  return (
    <div
      className="h-full flex flex-col items-center justify-center px-8 anim-fadein"
      style={{
        background: 'radial-gradient(ellipse at center, rgba(74,222,128,0.05) 0%, var(--bg) 70%)',
      }}
    >
      <CircuitLeafLogo size={72} />
      <h1 className="font-display text-3xl font-bold mt-5 mb-1" style={{ color: 'var(--text)' }}>EcoCore</h1>
      <p className="font-mono text-xs mb-8" style={{ color: 'var(--muted)' }}>Smart City Energy Network</p>

      <div className="w-full max-w-xs space-y-3 mb-8">
        {[
          { icon: <LeafIcon size={16} />, text: 'Real-time grid optimization' },
          { icon: <ChipIcon size={16} />, text: 'Carbon-aware AI scheduling' },
          { icon: <SunIcon size={16} />, text: 'Earn from your home battery' },
        ].map((item, i) => (
          <div key={i} className="eco-card grain flex items-center gap-3 py-3">
            {item.icon}
            <span className="font-mono text-xs">{item.text}</span>
          </div>
        ))}
      </div>

      <button
        className="eco-btn eco-btn-primary w-full max-w-xs font-display text-base"
        onClick={onLogin}
      >
        Connect Your Home
      </button>

      <p className="font-mono text-xs mt-6" style={{ color: 'var(--muted)', fontSize: 11 }}>
        Secured by Auth0 · Data stored in MongoDB
      </p>
    </div>
  );
}
