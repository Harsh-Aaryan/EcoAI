import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { CircuitLeafLogo, LeafIcon, ChipIcon, SunIcon, FloatingLeaves, Sunbeam } from './Icons';

export default function AuthScreen() {
  const { loginWithRedirect, isLoading } = useAuth0();

  return (
    <div className="h-full flex flex-col items-center justify-center px-8 anim-fadein solarpunk-bg" style={{ position: 'relative', overflow: 'hidden' }}>
      <FloatingLeaves />
      <Sunbeam />

      {/* Logo */}
      <div className="anim-breathe mb-2">
        <CircuitLeafLogo size={80} />
      </div>
      <h1 className="font-display text-3xl font-bold mb-0.5" style={{ color: 'var(--text)' }}>EcoCore</h1>
      <p className="font-mono text-xs mb-8" style={{ color: 'var(--muted)' }}>Smart City Energy Network</p>

      {/* Feature pills */}
      <div className="w-full max-w-xs space-y-2 mb-8">
        {[
          { icon: <LeafIcon size={15} />, text: 'Real-time grid optimization' },
          { icon: <ChipIcon size={15} />, text: 'Carbon-aware AI scheduling' },
          { icon: <SunIcon size={15} />, text: 'Earn from your home battery' },
        ].map((item, i) => (
          <div key={i} className="eco-card-glow grain flex items-center gap-3 py-2.5 px-3"
            style={{ animation: `grow-in 400ms ease ${i * 120}ms both` }}>
            <div className="anim-sway">{item.icon}</div>
            <span className="font-mono text-xs">{item.text}</span>
          </div>
        ))}
      </div>

      {/* Auth0 Login Button */}
      <button
        className="eco-btn eco-btn-primary w-full max-w-xs font-display text-sm flex items-center justify-center gap-2"
        onClick={() => loginWithRedirect()}
        disabled={isLoading}
        style={{ opacity: isLoading ? 0.6 : 1 }}
      >
        {isLoading ? (
          <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" style={{ animation: 'spin 0.8s linear infinite' }} />
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
            <polyline points="10 17 15 12 10 7" />
            <line x1="15" y1="12" x2="3" y2="12" />
          </svg>
        )}
        {isLoading ? 'Connecting...' : 'Sign in to Continue'}
      </button>

      <p className="font-mono mt-5" style={{ color: 'var(--muted)', fontSize: 10 }}>
        Secured by Auth0 · End-to-end encrypted
      </p>
    </div>
  );
}
