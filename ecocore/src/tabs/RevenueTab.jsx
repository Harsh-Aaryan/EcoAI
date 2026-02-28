import React from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import { revenueData, revenueChart } from '../data/mock';

export default function RevenueTab() {
  return (
    <div className="tab-page">
      {/* Balance Hero — compact */}
      <div className="eco-card-glow grain text-center mb-2 py-3 flex-shrink-0"
        style={{ background: 'linear-gradient(135deg, rgba(46,125,62,0.06), rgba(201,139,26,0.04))' }}>
        <div className="font-mono text-xs" style={{ color: 'var(--muted)' }}>Total Balance</div>
        <div className="font-display text-4xl font-bold my-1" style={{ color: 'var(--green)' }}>
          ${revenueData.balance.toFixed(2)}
        </div>
        <div className="font-mono" style={{ fontSize: 10, color: 'var(--muted)' }}>
          ↑ ${revenueData.todayEarnings.toFixed(2)} today · ↑ ${revenueData.monthEarnings.toFixed(2)} this month
        </div>
        <button className="eco-btn eco-btn-outline mt-2" style={{ padding: '6px 16px', fontSize: 12 }}>
          Move earnings to PayPal
        </button>
      </div>

      {/* 28-day chart */}
      <div className="eco-card grain mb-2 flex-shrink-0">
        <div className="font-display text-xs mb-1">28-Day Earnings</div>
        <ResponsiveContainer width="100%" height={100}>
          <BarChart data={revenueChart} margin={{ top: 0, right: 0, left: -24, bottom: 0 }}>
            <XAxis dataKey="day" tick={{ fill: '#7d8c72', fontSize: 8, fontFamily: 'DM Mono' }} axisLine={false} tickLine={false} interval={6} />
            <YAxis hide />
            <Bar dataKey="amount" radius={[3, 3, 0, 0]}>
              {revenueChart.map((entry, i) => (
                <Cell key={i} fill={entry.isToday ? '#c98b1a' : '#2e7d3e'} fillOpacity={entry.isToday ? 1 : 0.6} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Revenue Breakdown */}
      <div className="eco-card grain mb-2 flex-shrink-0">
        <div className="font-display text-xs mb-2">Revenue Breakdown</div>
        {revenueData.breakdown.map((row, i) => (
          <div key={i} className="mb-2 last:mb-0">
            <div className="flex justify-between mb-0.5">
              <span className="font-mono" style={{ fontSize: 11 }}>{row.label}</span>
              <span className="font-mono" style={{ fontSize: 11, color: row.color }}>${row.value.toFixed(2)}</span>
            </div>
            <div className="eco-progress">
              <div className="eco-progress-fill" style={{ width: `${row.pct}%`, background: row.color }} />
            </div>
          </div>
        ))}
      </div>

      {/* Leaderboard — fills rest */}
      <div className="eco-card grain flex-1 min-h-0 flex flex-col justify-center vine-left pl-4"
        style={{ background: 'linear-gradient(135deg, rgba(201,139,26,0.04), transparent)' }}>
        <div className="font-display text-xs mb-1">Community Standing</div>
        <div className="font-mono mb-2" style={{ fontSize: 11, color: 'var(--muted)' }}>
          You're among the top {revenueData.rank}% of homes in your region this week
        </div>
        <div className="eco-progress">
          <div className="eco-progress-fill" style={{ width: `${100 - revenueData.rank}%`, background: 'linear-gradient(90deg, var(--green), var(--sun))' }} />
        </div>
      </div>
    </div>
  );
}
