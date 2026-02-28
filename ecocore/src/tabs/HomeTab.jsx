import React, { useEffect } from 'react';
import { ComposedChart, Line, Area, XAxis, YAxis, ResponsiveContainer, ReferenceLine } from 'recharts';
import BatteryGauge from '../components/BatteryGauge';
import { LeafIcon, SunIcon, BoltIcon, ChipIcon } from '../components/Icons';
import { homeStats as mockHomeStats, activeJob, chartData as mockChartData, userData } from '../data/mock';
import useLocation from '../hooks/useLocation';
import useWattTimeData from '../hooks/useWattTimeData';
import useWeather from '../hooks/useWeather';
import useGeocode from '../hooks/useGeocode';
import houseSvg from '../assets/house.svg';
import sunSvg from '../assets/sun.svg';
import moonSvg from '../assets/moon.svg';
import cloudSvg from '../assets/cloud.svg';
import starSvg from '../assets/star.svg';

/* ── Determine time-of-day token ── */
function getTimeOfDay(hour) {
  if (hour >= 5 && hour < 8) return 'dawn';
  if (hour >= 8 && hour < 17) return 'day';
  if (hour >= 17 && hour < 20) return 'evening';
  return 'night';
}

export default function HomeTab() {
  const hour = new Date().getHours();
  const minutes = new Date().getMinutes();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const tod = getTimeOfDay(hour);

  /* ── Sun / Moon arc position ──
     Sun rises at 6 AM (left edge), peaks at noon (centre-top), sets at 18 (right edge).
     Moon rises at 18 (left), peaks at midnight (centre-top), sets at 6 (right). */
  const fractionalHour = hour + minutes / 60;
  const sunArc = (() => {
    // Sun visible window: 5–20h  → map to 0..1
    const rise = 5, set = 20;
    const t = Math.max(0, Math.min(1, (fractionalHour - rise) / (set - rise)));
    // Horizontal: 8% → 92%
    const left = 8 + t * 84;
    // Vertical arc (parabola): peaks at t=0.5 → top 18%, edges → top 80%
    const top = 18 + 62 * Math.pow(2 * (t - 0.5), 2);
    return { left, top };
  })();
  const moonArc = (() => {
    // Moon visible window: 20–5h (wraps midnight) → map to 0..1
    let elapsed;
    if (fractionalHour >= 20) elapsed = fractionalHour - 20;
    else if (fractionalHour < 5) elapsed = fractionalHour + 4;
    else elapsed = 0;
    const t = Math.max(0, Math.min(1, elapsed / 9));
    const left = 10 + t * 80;
    const top = 18 + 62 * Math.pow(2 * (t - 0.5), 2);
    return { left, top };
  })();

  /* set data-tod on root for CSS variable switching */
  useEffect(() => {
    document.documentElement.setAttribute('data-tod', tod);
    return () => document.documentElement.removeAttribute('data-tod');
  }, [tod]);

  const { center } = useLocation();
  const wt = useWattTimeData(center);
  const weather = useWeather(center);
  const geo = useGeocode(center);
  const homeStats = wt.homeStats || mockHomeStats;
  const chartData = wt.chartData?.length ? wt.chartData : mockChartData;
  const fuelMix = wt.fuelMix;

  // Use real solar output from Open-Meteo if available
  const solarOutput = weather.solarOutput ?? homeStats.solarOutput;
  const cityName = geo.city || userData.location.split(',')[0] || 'Home';

  const aiDensity = [
    { label: 'Source', value: wt.loading ? '…' : (wt.sources?.includes('eia-fuel-mix') ? 'EIA Live' : wt.sources?.includes('watttime-index') ? 'WattTime' : 'Mock') },
    { label: 'Region', value: wt.region || userData.gridRegion },
    { label: 'Grid', value: wt.eiaRespondent || 'ERCO' },
    ...(weather.temperature != null ? [
      { label: 'Temp', value: `${Math.round(weather.temperature)}°C` },
      { label: 'Wind', value: `${Math.round(weather.windSpeed || 0)} km/h` },
    ] : []),
    ...(fuelMix ? [
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

      {/* ─── TOP CLUSTER ─── greeting + stats + AI job ─── */}
      <div style={{ position: 'absolute', inset: '0 0 auto 0', zIndex: 2, padding: '12px 14px 0' }}>

        {/* Row 1: greeting + clean badge */}
        <div className="flex items-center justify-between mb-2">
          <h1 className="font-display text-base font-light italic" style={{ color: '#fff', textShadow: '0 1px 8px rgba(0,0,0,0.35)' }}>
            {greeting}, {userData.name}
          </h1>
          <div className="flex items-center gap-1.5">
            {/* Weather badge — live from Open-Meteo */}
            {weather.temperature != null && (
              <div className="frost-panel" style={{ padding: '3px 8px', display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#fff', borderRadius: 'var(--radius-pill)' }}>
                <span>{weather.weatherEmoji}</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>{Math.round(weather.temperature)}° · {Math.round(weather.windSpeed || 0)} km/h</span>
              </div>
            )}
            <div className="frost-panel" style={{ padding: '4px 12px', display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#fff', borderRadius: 'var(--radius-pill)' }}>
              <LeafIcon size={11} />
              <span style={{ fontFamily: 'var(--font-mono)' }}>{homeStats.cleanEnergyPct}% clean</span>
            </div>
          </div>
        </div>

        {/* Row 2: 3 stat chips — compact, high contrast */}
        <div className="flex gap-2" style={{ marginBottom: 6 }}>
          {[
            { icon: <SunIcon size={11} />, label: 'Price', value: `$${(homeStats.gridPrice ?? 0).toFixed(3)}`, color: '#f5c842' },
            { icon: <LeafIcon size={11} />, label: 'Carbon', value: `${homeStats.carbonScore}%`, color: '#6aff8d' },
            { icon: <BoltIcon size={11} />, label: 'Solar', value: `${solarOutput} kW`, color: '#7dd8ff' },
          ].map((s, i) => (
            <div key={i} style={{
              flex: 1,
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '6px 10px',
              background: 'rgba(0,0,0,0.35)',
              backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 12,
            }}>
              {s.icon}
              <div>
                <div className="font-mono" style={{ fontSize: 13, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
                <div className="font-mono" style={{ fontSize: 8, color: 'rgba(255,255,255,0.6)' }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Row 3: AI job running — compact bar */}
        <div style={{
          padding: '6px 12px',
          marginTop: 2,
          background: 'rgba(0,0,0,0.3)',
          backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 12,
        }}>
          <div className="flex justify-between items-center mb-1">
            <span className="font-display" style={{ fontSize: 11, color: '#fff' }}>{activeJob.name}</span>
            <span className="font-mono anim-breathe" style={{ fontSize: 10, color: '#6aff8d' }}>Running</span>
          </div>
          <div style={{ height: 3, background: 'rgba(255,255,255,0.15)', borderRadius: 99, overflow: 'hidden', marginBottom: 3 }}>
            <div style={{ width: `${activeJob.progress}%`, height: '100%', borderRadius: 99, background: 'linear-gradient(90deg, #2e7d3e, #6aad73)' }} />
          </div>
          <div className="flex justify-between items-center">
            <span className="font-mono" style={{ fontSize: 8, color: 'rgba(255,255,255,0.5)' }}>
              {activeJob.powerDraw} kW · {activeJob.carbonCost} kg CO₂ · {(homeStats.gridPrice ?? 0).toFixed(3)} $/kWh
            </span>
            <div className="flex gap-1">
              {aiDensity.slice(0, 3).map((item) => (
                <span key={item.label} className="font-mono" style={{
                  fontSize: 7, color: 'rgba(255,255,255,0.7)',
                  background: 'rgba(255,255,255,0.08)', borderRadius: 4, padding: '1px 4px',
                }}>
                  {item.label}: {item.value}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── SKY SCENE ─── sun/moon + clouds + stars ─── */}
      <div className="sky-zone" style={{ position: 'absolute', top: '22%', left: 0, right: 0, height: '22%', zIndex: 1, pointerEvents: 'none', overflow: 'hidden' }}>
        {/* Sun (day/dawn/evening) or Moon (night) */}
        {tod === 'night' ? (
          <img src={moonSvg} alt="" aria-hidden className="sky-moon"
            style={{ left: `${moonArc.left}%`, top: `${moonArc.top}%` }} />
        ) : (
          <img src={sunSvg} alt="" aria-hidden className="sky-sun"
            style={{ left: `${sunArc.left}%`, top: `${sunArc.top}%` }} />
        )}

        {/* Stars — night only */}
        {tod === 'night' && (
          <>
            <img src={starSvg} alt="" aria-hidden className="sky-star sky-star--1" />
            <img src={starSvg} alt="" aria-hidden className="sky-star sky-star--2" />
            <img src={starSvg} alt="" aria-hidden className="sky-star sky-star--3" />
            <img src={starSvg} alt="" aria-hidden className="sky-star sky-star--4" />
            <img src={starSvg} alt="" aria-hidden className="sky-star sky-star--5" />
            <img src={starSvg} alt="" aria-hidden className="sky-star sky-star--6" />
            <img src={starSvg} alt="" aria-hidden className="sky-star sky-star--7" />
          </>
        )}

        {/* Clouds — count driven by live cloudCover % from weather API */}
        {(() => {
          const cc = weather.cloudCover ?? 30; // fallback to light clouds
          // 0–20% → 1 cloud, 21–50% → 2, 51–75% → 3, 76–90% → 4, 91–100% → 5
          const count = cc <= 20 ? 1 : cc <= 50 ? 2 : cc <= 75 ? 3 : cc <= 90 ? 4 : 5;
          const ids = ['sky-cloud--1','sky-cloud--2','sky-cloud--3','sky-cloud--4','sky-cloud--5'];
          return ids.slice(0, count).map(id => (
            <img key={id} src={cloudSvg} alt="" aria-hidden className={`sky-cloud ${id}`} />
          ));
        })()}
      </div>

      {/* ─── CENTER ─── Battery gauge over the house door ─── */}
      <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 2 }}>
        <div style={{
          background: 'rgba(195,186,168,0.25)',
          backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
          borderRadius: '50%',
          padding: 6,
          border: '1px solid rgba(255,255,255,0.2)',
        }}>
          <div style={{ transform: 'scale(0.78)', transformOrigin: 'center', margin: -6 }}>
            <BatteryGauge level={userData.batteryLevel} isCharging={userData.isCharging} />
          </div>
        </div>
      </div>

      {/* ─── BOTTOM CLUSTER ─── 4 stat chips + chart ─── */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 2, padding: '0 10px 10px' }}>

        {/* 4 stat chips — frosted, translucent */}
        <div className="grid grid-cols-4 gap-2" style={{ marginBottom: 8 }}>
          {[
            { icon: <SunIcon size={11} />, label: 'Earned', value: `$${(homeStats.earnedToday ?? 0).toFixed(2)}`, color: '#f5c842' },
            { icon: <LeafIcon size={11} />, label: 'CO₂', value: `${homeStats.co2Avoided}kg`, color: '#6aff8d' },
            { icon: <BoltIcon size={11} />, label: 'kWh', value: homeStats.kwhShifted, color: '#7dd8ff' },
            { icon: <ChipIcon size={11} />, label: 'AI Jobs', value: homeStats.aiJobsRun, color: '#a8e6a3' },
          ].map((s, i) => (
            <div key={i} className="text-center" style={{
              padding: '6px 2px',
              borderRadius: 12,
              background: 'rgba(205,196,178,0.55)',
              backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.35)',
            }}>
              <div className="flex justify-center mb-0.5" style={{ opacity: 0.7 }}>{s.icon}</div>
              <div className="font-display" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{s.value}</div>
              <div className="font-mono" style={{ fontSize: 8, color: 'var(--muted)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* 24h chart — frosted glass */}
        <div style={{
          padding: '8px 10px 6px',
          background: 'rgba(205,196,178,0.6)',
          backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
          border: '1px solid rgba(255,255,255,0.4)',
          borderRadius: 16,
          boxShadow: '0 -4px 24px rgba(0,0,0,0.06)',
        }}>
          <div className="flex items-center justify-between mb-1">
            <span className="font-display" style={{ fontSize: 11 }}>24-Hour Grid Forecast</span>
            {!wt.loading && (
              <span className="font-mono" style={{ fontSize: 8, color: 'var(--muted)' }}>
                {wt.sources?.includes('eia-chart') ? 'EIA data' : wt.sources?.includes('watttime-forecast') ? 'WattTime' : 'Mock'}
              </span>
            )}
          </div>
          <div style={{ height: 80, minWidth: 0 }}>
            <ResponsiveContainer width="100%" height={80} minWidth={0}>
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
          <div className="flex gap-3 pt-0.5">
            <div className="flex items-center gap-1"><div className="w-3 h-0.5 rounded" style={{ background: 'var(--sun)' }} /><span className="font-mono" style={{ fontSize: 9, color: 'var(--muted)' }}>Price</span></div>
            <div className="flex items-center gap-1"><div className="w-3 h-0.5 rounded" style={{ background: 'var(--green)' }} /><span className="font-mono" style={{ fontSize: 9, color: 'var(--muted)' }}>Carbon</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
