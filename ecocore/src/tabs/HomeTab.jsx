import React from 'react';
import { ComposedChart, Line, Area, XAxis, YAxis, ResponsiveContainer, ReferenceLine } from 'recharts';
import BatteryGauge from '../components/BatteryGauge';
import { LeafIcon, SunIcon, BoltIcon, ChipIcon, FloatingLeaves, Sunbeam } from '../components/Icons';
import { homeStats, activeJob, chartData, userData } from '../data/mock';

export default function HomeTab() {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="tab-page solarpunk-bg">
      <FloatingLeaves />
      <Sunbeam />

      {/* Header row: greeting + status pill */}
      <div className="flex items-center justify-between mb-2 flex-shrink-0">
        <h1 className="font-display text-base font-light italic" style={{ color: 'var(--text)' }}>
          {greeting}, {userData.name}
        </h1>
        <div className="eco-pill" style={{ background: 'rgba(46,125,62,0.1)', color: 'var(--green)' }}>
          <LeafIcon size={11} />
          <span>{homeStats.cleanEnergyPct}% clean</span>
        </div>
      </div>

      {/* Battery + Live Stats side by side */}
      <div className="flex items-center gap-3 mb-2 flex-shrink-0">
        <BatteryGauge level={userData.batteryLevel} isCharging={userData.isCharging} />
        <div className="flex-1 flex flex-col gap-1.5">
          <div className="eco-card-glow flex items-center justify-between py-2 px-3">
            <div className="flex items-center gap-1.5">
              <SunIcon size={12} />
              <span className="font-mono text-xs" style={{ color: 'var(--muted)' }}>Price</span>
            </div>
            <span className="font-mono text-sm font-medium" style={{ color: 'var(--sun)' }}>${homeStats.gridPrice.toFixed(3)}</span>
          </div>
          <div className="eco-card-glow flex items-center justify-between py-2 px-3">
            <div className="flex items-center gap-1.5">
              <LeafIcon size={12} />
              <span className="font-mono text-xs" style={{ color: 'var(--muted)' }}>Carbon</span>
            </div>
            <span className="font-mono text-sm font-medium" style={{ color: 'var(--green)' }}>{homeStats.carbonScore}%</span>
          </div>
          <div className="eco-card-glow flex items-center justify-between py-2 px-3">
            <div className="flex items-center gap-1.5">
              <BoltIcon size={12} />
              <span className="font-mono text-xs" style={{ color: 'var(--muted)' }}>Solar</span>
            </div>
            <span className="font-mono text-sm font-medium" style={{ color: 'var(--sky)' }}>{homeStats.solarOutput} kW</span>
          </div>
        </div>
      </div>

      {/* 4 stat cards — 2×2 compact */}
      <div className="grid grid-cols-4 gap-2 mb-2 flex-shrink-0">
        {[
          { icon: <SunIcon size={13} />, label: 'Earned', value: `$${homeStats.earnedToday.toFixed(2)}`, color: 'var(--sun)' },
          { icon: <LeafIcon size={13} />, label: 'CO₂', value: `${homeStats.co2Avoided}kg`, color: 'var(--green)' },
          { icon: <BoltIcon size={13} />, label: 'kWh', value: homeStats.kwhShifted, color: 'var(--sky)' },
          { icon: <ChipIcon size={13} />, label: 'AI Jobs', value: homeStats.aiJobsRun, color: 'var(--green-soft)' },
        ].map((s, i) => (
          <div key={i} className="eco-card grain text-center py-2">
            <div className="flex justify-center mb-1">{s.icon}</div>
            <div className="font-display text-sm" style={{ color: s.color }}>{s.value}</div>
            <div className="font-mono" style={{ fontSize: 9, color: 'var(--muted)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Active AI Job — compact */}
      <div className="eco-card grain mb-2 flex-shrink-0 vine-left pl-4" style={{ padding: '8px 10px 8px 14px' }}>
        <div className="flex justify-between items-center mb-1">
          <span className="font-display text-xs">{activeJob.name}</span>
          <span className="font-mono anim-breathe" style={{ fontSize: 10, color: 'var(--green)' }}>Running</span>
        </div>
        <div className="eco-progress">
          <div className="eco-progress-fill" style={{ width: `${activeJob.progress}%`, background: 'linear-gradient(90deg, var(--green), var(--green-soft))' }} />
        </div>
        <div className="font-mono mt-1" style={{ fontSize: 9, color: 'var(--muted)' }}>
          {activeJob.powerDraw} kW · {activeJob.carbonCost} kg CO₂
        </div>
      </div>

      {/* 24h chart — fills remaining space */}
      <div className="eco-card grain flex-1 min-h-0 flex flex-col">
        <div className="font-display text-xs mb-1">24-Hour Grid Forecast</div>
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <defs>
                <linearGradient id="carbonG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2e7d3e" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#2e7d3e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="hour" tick={{ fill: '#7d8c72', fontSize: 9, fontFamily: 'DM Mono' }} axisLine={false} tickLine={false} interval={5} />
              <YAxis hide />
              <Area type="monotone" dataKey="carbon" fill="url(#carbonG)" stroke="none" />
              <Line type="monotone" dataKey="carbon" stroke="#2e7d3e" strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="price" stroke="#c98b1a" strokeWidth={1.5} dot={false} />
              <ReferenceLine x={chartData[new Date().getHours()]?.hour} stroke="#d6ceb4" strokeWidth={1} strokeDasharray="3 3" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="flex gap-3 pt-1">
          <div className="flex items-center gap-1"><div className="w-3 h-0.5 rounded" style={{ background: 'var(--sun)' }} /><span className="font-mono" style={{ fontSize: 9, color: 'var(--muted)' }}>Price</span></div>
          <div className="flex items-center gap-1"><div className="w-3 h-0.5 rounded" style={{ background: 'var(--green)' }} /><span className="font-mono" style={{ fontSize: 9, color: 'var(--muted)' }}>Carbon</span></div>
        </div>
      </div>
    </div>
  );
}
