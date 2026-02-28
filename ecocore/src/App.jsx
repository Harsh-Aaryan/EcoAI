import React, { useState } from 'react';
import AuthScreen from './components/AuthScreen';
import Onboarding from './components/Onboarding';
import Settings from './components/Settings';
import HomeTab from './tabs/HomeTab';
import CityTab from './tabs/CityTab';
import JobsTab from './tabs/JobsTab';
import RevenueTab from './tabs/RevenueTab';
import { HomeIcon, CityIcon, JobsIcon, RevenueIcon, GearIcon } from './components/Icons';

const TABS = [
  { key: 'home', label: 'Home', Icon: HomeIcon },
  { key: 'city', label: 'City', Icon: CityIcon },
  { key: 'jobs', label: 'Jobs', Icon: JobsIcon },
  { key: 'revenue', label: 'Revenue', Icon: RevenueIcon },
];

export default function App() {
  const [screen, setScreen] = useState('auth'); // 'auth' | 'onboarding' | 'dashboard'
  const [activeTab, setActiveTab] = useState('home');
  const [showSettings, setShowSettings] = useState(false);

  // Auth flow (mock — replace with Auth0 later)
  if (screen === 'auth') {
    return <AuthScreen onLogin={() => setScreen('onboarding')} />;
  }

  if (screen === 'onboarding') {
    return <Onboarding onComplete={() => setScreen('dashboard')} />;
  }

  // Dashboard
  const renderTab = () => {
    switch (activeTab) {
      case 'home': return <HomeTab key="home" />;
      case 'city': return <CityTab key="city" />;
      case 'jobs': return <JobsTab key="jobs" />;
      case 'revenue': return <RevenueTab key="revenue" />;
      default: return <HomeTab key="home" />;
    }
  };

  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--bg)' }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0">
        <div className="font-display text-sm font-light" style={{ color: 'var(--green)' }}>
          EcoCore
        </div>
        <button
          onClick={() => setShowSettings(true)}
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <GearIcon />
        </button>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden">
        {renderTab()}
      </div>

      {/* Bottom nav */}
      <div
        className="flex items-center justify-around flex-shrink-0 py-2 pb-4"
        style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)' }}
      >
        {TABS.map(({ key, label, Icon }) => {
          const active = activeTab === key;
          return (
            <button
              key={key}
              className="flex flex-col items-center gap-1 py-1 px-3"
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              onClick={() => setActiveTab(key)}
            >
              <Icon size={20} color={active ? 'var(--green)' : 'var(--muted)'} />
              <span
                className="font-mono"
                style={{
                  fontSize: 10,
                  color: active ? 'var(--green)' : 'var(--muted)',
                }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Settings bottom sheet */}
      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
    </div>
  );
}
