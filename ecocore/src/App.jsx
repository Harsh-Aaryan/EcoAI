import React, { useState } from 'react';
import AuthScreen from './components/AuthScreen';
import Onboarding from './components/Onboarding';
import SettingsTab from './components/Settings';
import HomeTab from './tabs/HomeTab';
import CityTab from './tabs/CityTab';
import JobsTab from './tabs/JobsTab';
import RevenueTab from './tabs/RevenueTab';
import { HomeIcon, CityIcon, JobsIcon, RevenueIcon, SettingsIcon } from './components/Icons';

const TABS = [
  { key: 'home', label: 'Home', Icon: HomeIcon },
  { key: 'city', label: 'City', Icon: CityIcon },
  { key: 'jobs', label: 'Jobs', Icon: JobsIcon },
  { key: 'revenue', label: 'Revenue', Icon: RevenueIcon },
  { key: 'settings', label: 'Settings', Icon: SettingsIcon },
];

export default function App() {
  const [screen, setScreen] = useState('auth');
  const [activeTab, setActiveTab] = useState('home');

  if (screen === 'auth') {
    return <div className="phone-shell"><AuthScreen onLogin={() => setScreen('onboarding')} /></div>;
  }
  if (screen === 'onboarding') {
    return <div className="phone-shell"><Onboarding onComplete={() => setScreen('dashboard')} /></div>;
  }

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
