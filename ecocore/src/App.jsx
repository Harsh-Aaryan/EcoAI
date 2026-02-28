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

const TABS = [
  { key: 'home', label: 'Home', Icon: HomeIcon },
  { key: 'city', label: 'City', Icon: CityIcon },
  { key: 'jobs', label: 'Jobs', Icon: JobsIcon },
  { key: 'revenue', label: 'Revenue', Icon: RevenueIcon },
  { key: 'settings', label: 'Settings', Icon: SettingsIcon },
];

export default function App() {
  const { isAuthenticated, isLoading, user } = useAuth0();
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
          <div className="anim-breathe mb-3">
            <CircuitLeafLogo size={64} />
          </div>
          <h1 className="font-display text-xl font-light mb-2" style={{ color: 'var(--text)' }}>EcoCore</h1>
          <div className="flex items-center gap-2">
            <span className="inline-block w-3.5 h-3.5 border-2 rounded-full" style={{ borderColor: 'var(--green)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
            <span className="font-mono text-xs" style={{ color: 'var(--muted)' }}>Connecting…</span>
          </div>
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
    <div className="phone-shell">
    <div className="h-full flex flex-col" style={{ background: 'var(--bg)' }}>
      {/* Top bar */}
      <div className="flex items-center px-4 py-2 flex-shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="font-display text-sm font-light" style={{ color: 'var(--green)' }}>
          EcoCore
        </div>
        <div className="flex-1" />
        {user?.picture && (
          <img src={user.picture} alt="" className="w-5 h-5 rounded-full mr-2" style={{ border: '1.5px solid var(--green)', objectFit: 'cover' }} />
        )}
        <div className="eco-pill" style={{ background: 'rgba(46,125,62,0.08)', color: 'var(--green)', padding: '2px 8px', fontSize: 9 }}>
          ● Online
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden">
        {renderTab()}
      </div>

      {/* Bottom nav — 5 tabs */}
      <div className="flex items-center justify-around flex-shrink-0 py-1.5 pb-3"
        style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', boxShadow: '0 -2px 12px rgba(44,80,50,0.04)' }}>
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
  );
}
