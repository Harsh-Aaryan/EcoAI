import React, { useEffect } from 'react';
import { ComposedChart, Line, Area, XAxis, YAxis, ResponsiveContainer, ReferenceLine } from 'recharts';
import BatteryGauge from '../components/BatteryGauge';
import { LeafIcon, SunIcon, BoltIcon, ChipIcon } from '../components/Icons';
import { homeStats as mockHomeStats, activeJob, chartData as mockChartData, userData } from '../data/mock';
import useLocation from '../hooks/useLocation';
import useWattTimeData from '../hooks/useWattTimeData';
import houseSvg from '../assets/house.svg';

/* ── Determine time-of-day token ── */
function getTimeOfDay(hour) {
  if (hour >= 5 && hour < 8) return 'dawn';
  if (hour >= 8 && hour < 17) return 'day';
  if (hour >= 17 && hour < 20) return 'evening';
  return 'night';
}

export default function HomeTab() {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const tod = getTimeOfDay(hour);

  /* set data-tod on root for CSS variable switching */
  useEffect(() => {
    document.documentElement.setAttribute('data-tod', tod);
    return () => document.documentElement.removeAttribute('data-tod');
  }, [tod]);

  const { center } = useLocation();
  const wt = useWattTimeData(center);
  const homeStats = wt.homeStats || mockHomeStats;
  const chartData = wt.chartData?.length ? wt.chartData : mockChartData;
  const fuelMix = wt.fuelMix;

  const aiDensity = [
    { label: 'Source', value: wt.loading ? '…' : (wt.sources?.includes('eia-fuel-mix') ? 'EIA Live' : wt.sources?.includes('watttime-index') ? 'WattTime' : 'Mock') },
    { label: 'Region', value: wt.region || userData.gridRegion },
    { label: 'Grid', value: wt.eiaRespondent || 'ERCO' },
    ...(fuelMix ? [
      { label: 'Wind', value: `${Math.round(fuelMix.wind)} MW` },
      { label: 'Solar', value: `${Math.round(fuelMix.solar)} MW` },
      { label: 'Gas', value: `${Math.round(fuelMix.gas)} MW` },
    ] : [
      { label: 'Demand', value: wt.demand?.demand ? `${Math.round(wt.demand.demand / 1000)} GW` : '—' },
    ]),
  ];

  return (
    <div className="house-scene" data-tod={tod}>
      {/* House SVG background — centred, 68% height */}
      <img src={houseSvg} alt="" aria-hidden className="house-scene__svg" draggable={false} />

      {/* ─── Zone 1 · Sky (top ~28%) ─── greeting + clean badge ─── */}
      <div style={{ position: 'absolute', inset: '0 0 auto 0', zIndex: 2, padding: '14px 16px 0' }}>
        <div className="flex items-center justify-between">
          <h1 className="font-display text-base font-light italic" style={{ color: '#fff', textShadow: '0 1px 6px rgba(0,0,0,0.25)' }}>
            {greeting}, {userData.name}
          </h1>
          <div className="frost-panel" style={{ padding: '4px 12px', display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#fff', borderRadius: 'var(--radius-pill)' }}>
            <LeafIcon size={11} />
            <span style={{ fontFamily: 'var(--font-mono)' }}>{homeStats.cleanEnergyPct}% clean</span>
          </div>
        </div>
      </div>

      {/* ─── Zone 2 · Roof (~25%) ─── 3 stat chips arcing above roof ─── */}
      <div style={{ position: 'absolute', top: '26%', left: 0, right: 0, zIndex: 2, display: 'flex', justifyContent: 'center', gap: 6, padding: '0 12px' }}>
        {[
          { icon: <SunIcon size={12} />, label: 'Price', value: `$${homeStats.gridPrice.toFixed(3)}`, color: 'var(--sun)' },
          { icon: <LeafIcon size={12} />, label: 'Carbon', value: `${homeStats.carbonScore}%`, color: 'var(--green)' },
          { icon: <BoltIcon size={12} />, label: 'Solar', value: `${homeStats.solarOutput} kW`, color: 'var(--sky)' },
        ].map((s, i) => (
          <div key={i} className="frost-panel-warm" style={{ padding: '5px 14px', display: 'flex', alignItems: 'center', gap: 5, minWidth: 0 }}>
            {s.icon}
            <div>
              <div className="font-mono" style={{ fontSize: 12, fontWeight: 600, color: s.color }}>{s.value}</div>
              <div className="font-mono" style={{ fontSize: 8, color: 'var(--muted)' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Zone 3 · House body (~25%) ─── Battery + AI job card ─── */}
      <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translateX(-50%)', zIndex: 2, width: 'calc(100% - 40px)', maxWidth: 340 }}>
        <div className="frost-card" style={{ padding: '10px 14px' }}>
          <div className="flex items-center gap-3">
            {/* scaled-down battery gauge */}
            <div style={{ transform: 'scale(0.72)', transformOrigin: 'center', flexShrink: 0, margin: '-10px' }}>
              <BatteryGauge level={userData.batteryLevel} isCharging={userData.isCharging} />
            </div>
            {/* AI job status */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-0.5">
                <span className="font-display text-xs truncate">{activeJob.name}</span>
                <span className="font-mono anim-breathe" style={{ fontSize: 10, color: 'var(--green)', whiteSpace: 'nowrap' }}>Running</span>
              </div>
              <div className="eco-progress" style={{ height: 4, marginBottom: 3 }}>
                <div className="eco-progress-fill" style={{ width: `${activeJob.progress}%`, background: 'linear-gradient(90deg, var(--green), var(--green-soft))' }} />
              </div>
              <div className="font-mono" style={{ fontSize: 8, color: 'var(--muted)' }}>
                {activeJob.powerDraw} kW · {activeJob.carbonCost} kg CO₂ · {homeStats.gridPrice.toFixed(3)} $/kWh
              </div>
              <div className="grid grid-cols-3 gap-1 mt-1">
                {aiDensity.slice(0, 6).map((item) => (
                  <div key={item.label} style={{ background: 'rgba(46,125,62,0.06)', borderRadius: 6, padding: '2px 4px' }}>
                    <div className="font-mono" style={{ fontSize: 7, color: 'var(--muted)' }}>{item.label}</div>
                    <div className="font-mono" style={{ fontSize: 8, color: 'var(--text)' }}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Zone 4 · Ground / Hill (bottom ~28%) ─── Stats + chart ─── */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 2, padding: '0 10px 6px' }}>

        {/* 4 floating stat chips */}
        <div className="grid grid-cols-4 gap-2 mb-2">
          {[
            { icon: <SunIcon size={12} />, label: 'Earned', value: `$${homeStats.earnedToday.toFixed(2)}`, color: 'var(--sun)' },
            { icon: <LeafIcon size={12} />, label: 'CO₂', value: `${homeStats.co2Avoided}kg`, color: 'var(--green)' },
            { icon: <BoltIcon size={12} />, label: 'kWh', value: homeStats.kwhShifted, color: 'var(--sky)' },
            { icon: <ChipIcon size={12} />, label: 'AI Jobs', value: homeStats.aiJobsRun, color: 'var(--green-soft)' },
          ].map((s, i) => (
            <div key={i} className="frost-panel-warm text-center" style={{ padding: '6px 2px', borderRadius: 12 }}>
              <div className="flex justify-center mb-0.5">{s.icon}</div>
              <div className="font-display" style={{ fontSize: 12, color: s.color }}>{s.value}</div>
              <div className="font-mono" style={{ fontSize: 8, color: 'var(--muted)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* 24h chart card on the hill */}
        <div className="frost-bottom" style={{ padding: '8px 10px 6px' }}>
          <div className="flex items-center justify-between mb-1">
            <span className="font-display" style={{ fontSize: 11 }}>24-Hour Grid Forecast</span>
            {!wt.loading && (
              <span className="font-mono" style={{ fontSize: 8, color: 'var(--muted)' }}>
                {wt.sources?.includes('eia-chart') ? 'EIA data' : wt.sources?.includes('watttime-forecast') ? 'WattTime' : 'Mock'}
              </span>
            )}
          </div>
          <div style={{ height: 90 }}>
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
    </div>
  );
}
