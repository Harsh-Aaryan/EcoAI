import React from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import { revenueData, revenueChart } from '../data/mock';

export default function RevenueTab() {
  return (
    <div className="tab-page">
      <h2 className="font-display text-lg font-light mb-4">Revenue</h2>

      {/* Balance Hero */}
      <div
        className="eco-card grain mb-5 text-center"
        style={{ background: 'rgba(74,222,128,0.06)', borderColor: 'var(--border)' }}
      >
        <div className="font-mono text-xs mb-1" style={{ color: 'var(--muted)' }}>Total Balance</div>
        <div className="font-display text-5xl font-bold mb-2" style={{ color: 'var(--green)' }}>
          ${revenueData.balance.toFixed(2)}
        </div>
        <div className="font-mono text-xs mb-4" style={{ color: 'var(--muted)' }}>
          ↑ ${revenueData.todayEarnings.toFixed(2)} today · ↑ ${revenueData.monthEarnings.toFixed(2)} this month
        </div>
        <button className="eco-btn eco-btn-outline text-sm">
          Move earnings to PayPal
        </button>
      </div>

      {/* 28-Day Bar Chart */}
      <div className="eco-card grain mb-5">
        <div className="font-display text-sm font-normal mb-3">28-Day Earnings</div>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={revenueChart} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="day"
              tick={{ fill: 'var(--muted)', fontSize: 9, fontFamily: 'var(--font-mono)' }}
              axisLine={false}
              tickLine={false}
              interval={6}
            />
            <YAxis hide />
            <Bar dataKey="amount" radius={[3, 3, 0, 0]}>
              {revenueChart.map((entry, index) => (
                <Cell
                  key={index}
                  fill={entry.isToday ? '#fbbf24' : '#4ade80'}
                  fillOpacity={entry.isToday ? 1 : 0.7}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Revenue Breakdown */}
      <div className="eco-card grain mb-5">
        <div className="font-display text-sm font-normal mb-3">Revenue Breakdown</div>
        {revenueData.breakdown.map((row, i) => (
          <div key={i} className="mb-3">
            <div className="flex justify-between mb-1">
              <span className="font-mono text-xs" style={{ color: 'var(--text)' }}>{row.label}</span>
              <span className="font-mono text-xs" style={{ color: row.color }}>${row.value.toFixed(2)}</span>
            </div>
            <div className="eco-progress">
              <div className="eco-progress-fill" style={{ width: `${row.pct}%`, background: row.color }} />
            </div>
          </div>
        ))}
      </div>

      {/* Leaderboard Card */}
      <div className="eco-card grain" style={{ borderColor: 'var(--sun)', borderLeftWidth: 3 }}>
        <div className="font-display text-sm font-normal mb-2">Community Standing</div>
        <div className="font-mono text-xs mb-3" style={{ color: 'var(--muted)' }}>
          You're among the top {revenueData.rank}% of homes in your region this week
        </div>
        <div className="eco-progress">
          <div
            className="eco-progress-fill"
            style={{
              width: `${100 - revenueData.rank}%`,
              background: 'linear-gradient(90deg, var(--green), var(--sun))',
            }}
          />
        </div>
      </div>
    </div>
  );
}
