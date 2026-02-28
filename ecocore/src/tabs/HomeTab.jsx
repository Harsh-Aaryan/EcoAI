import React from 'react';
import { LineChart, Line, XAxis, YAxis, Area, ComposedChart, ResponsiveContainer, ReferenceLine } from 'recharts';
import BatteryGauge from '../components/BatteryGauge';
import { LeafIcon, SunIcon, BoltIcon, ChipIcon, DriftingLeaf } from '../components/Icons';
import { homeStats, activeJob, chartData, userData } from '../data/mock';

function StatCard({ icon, label, value, color }) {
  return (
    <div className="eco-card grain flex flex-col gap-2 items-start">
      <div className="flex items-center gap-2">
        {icon}
        <span className="font-mono text-xs" style={{ color: 'var(--muted)' }}>{label}</span>
      </div>
      <span className="font-display text-xl font-normal" style={{ color }}>{value}</span>
    </div>
  );
}

export default function HomeTab() {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="tab-page">
      <DriftingLeaf />

      {/* Header */}
      <h1 className="font-display text-xl font-light italic mb-4" style={{ color: 'var(--text)' }}>
        {greeting}, {userData.name}
      </h1>

      {/* Status Banner */}
      <div className="eco-pill mb-5" style={{ background: 'rgba(134,239,172,0.15)', color: 'var(--green)' }}>
        <LeafIcon size={14} />
        <span>Charging on {homeStats.cleanEnergyPct}% clean energy</span>
      </div>

      {/* Battery Gauge */}
      <div className="flex justify-center mb-5">
        <BatteryGauge level={userData.batteryLevel} isCharging={userData.isCharging} />
      </div>

      {/* Live Stats Row */}
      <div className="flex justify-between mb-5 px-2">
        <div className="text-center">
          <div className="font-mono text-lg" style={{ color: 'var(--sun)' }}>${homeStats.gridPrice.toFixed(3)}</div>
          <div className="font-mono text-xs" style={{ color: 'var(--muted)' }}>Grid Price</div>
        </div>
        <div className="text-center">
          <div className="font-mono text-lg" style={{ color: 'var(--green)' }}>{homeStats.carbonScore}%</div>
          <div className="font-mono text-xs" style={{ color: 'var(--muted)' }}>Carbon</div>
        </div>
        <div className="text-center">
          <div className="font-mono text-lg" style={{ color: 'var(--sky)' }}>{homeStats.solarOutput} kW</div>
          <div className="font-mono text-xs" style={{ color: 'var(--muted)' }}>Solar</div>
        </div>
      </div>

      {/* 4 Stat Cards — 2×2 grid */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <StatCard
          icon={<SunIcon size={16} />}
          label="Earned Today"
          value={`$${homeStats.earnedToday.toFixed(2)}`}
          color="var(--sun)"
        />
        <StatCard
          icon={<LeafIcon size={16} />}
          label="CO₂ Avoided"
          value={`${homeStats.co2Avoided} kg`}
          color="var(--green)"
        />
        <StatCard
          icon={<BoltIcon size={16} />}
          label="kWh Shifted"
          value={homeStats.kwhShifted}
          color="var(--sky)"
        />
        <StatCard
          icon={<ChipIcon size={16} />}
          label="AI Jobs Run"
          value={homeStats.aiJobsRun}
          color="var(--green-soft)"
        />
      </div>

      {/* Active AI Job Card */}
      <div className="eco-card grain mb-5" style={{ borderColor: 'var(--sky)', borderLeftWidth: 3 }}>
        <div className="flex justify-between items-start mb-2">
          <div>
            <div className="font-display text-sm font-normal">{activeJob.name}</div>
            <div className="font-mono text-xs" style={{ color: 'var(--muted)' }}>
              Started {activeJob.startedAgo} · {activeJob.powerDraw} kW
            </div>
          </div>
          <span className="font-mono text-xs anim-breathe" style={{ color: 'var(--green)' }}>Running</span>
        </div>
        <div className="eco-progress mb-1">
          <div className="eco-progress-fill" style={{ width: `${activeJob.progress}%`, background: 'var(--sky)' }} />
        </div>
        <div className="font-mono text-xs" style={{ color: 'var(--muted)' }}>
          Carbon footprint: {activeJob.carbonCost} kg CO₂
        </div>
      </div>

      {/* 24h Forecast Chart */}
      <div className="eco-card grain">
        <div className="font-display text-sm font-normal mb-3" style={{ color: 'var(--text)' }}>
          24-Hour Grid Forecast
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <ComposedChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="carbonGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--green)" stopOpacity={0.1} />
                <stop offset="100%" stopColor="var(--green)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="hour"
              tick={{ fill: 'var(--muted)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
              axisLine={false}
              tickLine={false}
              interval={5}
            />
            <YAxis hide />
            <Area
              type="monotone"
              dataKey="carbon"
              fill="url(#carbonGrad)"
              stroke="none"
            />
            <Line
              type="monotone"
              dataKey="carbon"
              stroke="var(--green)"
              strokeWidth={1.5}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke="var(--sun)"
              strokeWidth={1.5}
              dot={false}
            />
            <ReferenceLine
              x={chartData[new Date().getHours()]?.hour}
              stroke="var(--border)"
              strokeWidth={1}
              strokeDasharray="3 3"
            />
          </ComposedChart>
        </ResponsiveContainer>
        <div className="flex gap-4 mt-2">
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5 rounded" style={{ background: 'var(--sun)' }} />
            <span className="font-mono text-xs" style={{ color: 'var(--muted)' }}>Price</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5 rounded" style={{ background: 'var(--green)' }} />
            <span className="font-mono text-xs" style={{ color: 'var(--muted)' }}>Carbon</span>
          </div>
        </div>
      </div>
    </div>
  );
}
