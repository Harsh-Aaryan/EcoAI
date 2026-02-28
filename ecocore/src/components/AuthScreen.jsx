import React from 'react';
import { CircuitLeafLogo, LeafIcon, ChipIcon, SunIcon, FloatingLeaves, Sunbeam } from './Icons';

export default function AuthScreen({ onLogin }) {
  return (
    <div className="h-full flex flex-col items-center justify-center px-8 anim-fadein solarpunk-bg" style={{ position: 'relative', overflow: 'hidden' }}>
      <FloatingLeaves />
      <Sunbeam />

      <CircuitLeafLogo size={68} />
      <h1 className="font-display text-3xl font-bold mt-4 mb-0.5" style={{ color: 'var(--text)' }}>EcoCore</h1>
      <p className="font-mono text-xs mb-6" style={{ color: 'var(--muted)' }}>Smart City Energy Network</p>

      <div className="w-full max-w-xs space-y-2 mb-6">
        {[
          { icon: <LeafIcon size={15} />, text: 'Real-time grid optimization' },
          { icon: <ChipIcon size={15} />, text: 'Carbon-aware AI scheduling' },
          { icon: <SunIcon size={15} />, text: 'Earn from your home battery' },
        ].map((item, i) => (
          <div key={i} className="eco-card-glow grain flex items-center gap-3 py-2.5 px-3">
            <div className="anim-sway">{item.icon}</div>
            <span className="font-mono text-xs">{item.text}</span>
          </div>
        ))}
      </div>

      <button className="eco-btn eco-btn-primary w-full max-w-xs font-display text-sm" onClick={onLogin}>
        Connect Your Home
      </button>

      <p className="font-mono mt-4" style={{ color: 'var(--muted)', fontSize: 10 }}>
        Secured by Auth0 · Data stored in MongoDB
      </p>
    </div>
  );
}
