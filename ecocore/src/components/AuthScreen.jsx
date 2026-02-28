import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { CircuitLeafLogo, FloatingLeaves, Sunbeam } from './Icons';

export default function AuthScreen() {
  const { loginWithRedirect, isLoading } = useAuth0();

  const handleLogin = async () => {
    try {
      await loginWithRedirect();
    } catch (err) {
      console.error('Auth0 loginWithRedirect error:', err);
      alert('Login failed: ' + (err.message || 'Unknown error'));
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center px-8 anim-fadein solarpunk-bg" style={{ position: 'relative', overflow: 'hidden' }}>
      <FloatingLeaves />
      <Sunbeam />

      {/* Logo */}
      <div className="mb-2">
        <CircuitLeafLogo size={132} />
      </div>
      <h1 className="font-display text-3xl font-bold mb-0.5" style={{ color: 'var(--text)' }}>HomeNode</h1>
      <p className="font-mono text-xs mb-8" style={{ color: 'var(--muted)' }}>Smart City Energy Network</p>

      {/* Auth0 Login Button */}
      <button
        className="eco-btn eco-btn-primary w-full max-w-xs font-display text-sm flex items-center justify-center gap-2"
        onClick={() => handleLogin()}
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
