import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import AuthScreen from './components/AuthScreen';
import Onboarding from './components/Onboarding';
import SettingsTab from './components/Settings';
import HomeTab from './tabs/HomeTab';
import CityTab from './tabs/CityTab';
import JobsTab from './tabs/JobsTab';
import RevenueTab from './tabs/RevenueTab';
import { HomeIcon, CityIcon, JobsIcon, RevenueIcon, SettingsIcon, CircuitLeafLogo } from './components/Icons';
import { JobsProvider } from './hooks/useJobs';
import { UnitsProvider } from './hooks/useUnits';
import houseSvg from './assets/house.svg';

const TABS = [
  { key: 'home', label: 'Home', Icon: HomeIcon },
  { key: 'city', label: 'City', Icon: CityIcon },
  { key: 'jobs', label: 'Jobs', Icon: JobsIcon },
  { key: 'revenue', label: 'Revenue', Icon: RevenueIcon },
  { key: 'settings', label: 'Settings', Icon: SettingsIcon },
];

export default function App() {
  const { isAuthenticated, isLoading, user, error } = useAuth0();
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [activeTab, setActiveTab] = useState('home');

  // Check if first-time user after auth resolves
  useEffect(() => {
    if (isAuthenticated && user) {
      const done = localStorage.getItem(`ecocore_onboarded_${user.sub}`);
      if (!done) setNeedsOnboarding(true);
    }
  }, [isAuthenticated, user]);

  const completeOnboarding = () => {
    if (user) localStorage.setItem(`ecocore_onboarded_${user.sub}`, 'true');
    setNeedsOnboarding(false);
  };

  // ── Loading splash ──
  if (isLoading) {
    return (
      <div className="phone-shell">
        <div className="h-full flex flex-col items-center justify-center solarpunk-bg" style={{ position: 'relative', overflow: 'hidden' }}>
          <div className="mb-3">
            <CircuitLeafLogo size={106} />
          </div>
          <h1 className="font-display text-xl font-light mb-2" style={{ color: 'var(--text)' }}>HomeNode</h1>
          <div className="flex items-center gap-2">
            <span className="inline-block w-3.5 h-3.5 border-2 rounded-full" style={{ borderColor: 'var(--green)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
            <span className="font-mono text-xs" style={{ color: 'var(--muted)' }}>Connecting…</span>
          </div>
        </div>
      </div>
    );
  }

  // ── Auth error ──
  if (error) {
    return (
      <div className="phone-shell">
        <div className="h-full flex flex-col items-center justify-center px-8 solarpunk-bg" style={{ position: 'relative', overflow: 'hidden' }}>
          <div className="mb-3">
            <CircuitLeafLogo size={106} />
          </div>
          <h1 className="font-display text-xl font-bold mb-2" style={{ color: 'var(--text)' }}>Login Error</h1>
          <div className="eco-card grain p-4 mb-4 w-full max-w-xs" style={{ borderLeft: '3px solid #e74c3c' }}>
            <p className="font-mono text-xs mb-1" style={{ color: '#e74c3c', fontWeight: 600 }}>{error.message || 'Unknown error'}</p>
            {error.error_description && (
              <p className="font-mono text-xs" style={{ color: 'var(--muted)' }}>{error.error_description}</p>
            )}
          </div>
          <button
            className="eco-btn eco-btn-primary w-full max-w-xs font-display text-sm"
            onClick={() => window.location.replace(window.location.origin)}
          >
            Try Again
          </button>
          <p className="font-mono mt-4 text-center" style={{ color: 'var(--muted)', fontSize: 9, lineHeight: 1.4 }}>
            If this persists, ensure your URL is added to<br/>Auth0 → Allowed Callback URLs &amp; Web Origins
          </p>
        </div>
      </div>
    );
  }

  // ── Not logged in → Auth screen ──
  if (!isAuthenticated) {
    return <div className="phone-shell"><AuthScreen /></div>;
  }

  // ── First-time user → Onboarding ──
  if (needsOnboarding) {
    return <div className="phone-shell"><Onboarding onComplete={completeOnboarding} /></div>;
  }

  // ── Dashboard ──
  const renderTab = () => {
    switch (activeTab) {
      case 'home': return <HomeTab key="home" />;
      case 'city': return <CityTab key="city" />;
      case 'jobs': return <JobsTab key="jobs" />;
      case 'revenue': return <RevenueTab key="revenue" />;
      case 'settings': return <SettingsTab key="settings" />;
      default: return <HomeTab key="home" />;
    }
  };

  return (
    <UnitsProvider>
    <JobsProvider>
    <div className="phone-shell">
    <div className="h-full flex flex-col" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* House SVG — persistent background across all tabs */}
      <img src={houseSvg} alt="" aria-hidden draggable={false} style={{
        position: 'absolute', left: '50%', bottom: '3%', transform: 'translateX(-50%)',
        height: '62%', width: 'auto', opacity: 0.18, pointerEvents: 'none', zIndex: 0,
        filter: 'brightness(0.8) saturate(0.4) sepia(0.15)',
      }} />
      {/* Tab content */}
      <div className="flex-1 overflow-hidden">
        {renderTab()}
      </div>

      {/* Bottom nav — 5 tabs */}
      <div className="flex items-center justify-around flex-shrink-0 py-1.5 pb-3"
        style={{
          background: 'rgba(255,255,255,0.12)',
          backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
          borderTop: '1px solid rgba(255,255,255,0.2)',
          boxShadow: '0 -4px 24px rgba(0,0,0,0.08)',
          position: 'relative', zIndex: 2,
        }}>
        {TABS.map(({ key, label, Icon }) => {
          const active = activeTab === key;
          return (
            <button key={key} className="flex flex-col items-center gap-0.5 py-1 px-2"
              style={{ background: 'none', border: 'none', cursor: 'pointer', transition: 'all 200ms' }}
              onClick={() => setActiveTab(key)}>
              <div style={{ transition: 'transform 200ms', transform: active ? 'scale(1.1)' : 'scale(1)' }}>
                <Icon size={19} color={active ? 'var(--green)' : 'var(--muted)'} />
              </div>
              <span className="font-mono" style={{ fontSize: 9, color: active ? 'var(--green)' : 'var(--muted)', fontWeight: active ? 500 : 400 }}>
                {label}
              </span>
              {active && (
                <div style={{ width: 16, height: 2, borderRadius: 999, background: 'var(--green)', marginTop: 1, boxShadow: '0 0 6px rgba(46,125,62,0.4)' }} />
              )}
            </button>
          );
        })}
      </div>
    </div>
    </div>
    </JobsProvider>
    </UnitsProvider>
  );
}
