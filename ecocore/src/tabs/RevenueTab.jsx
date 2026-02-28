import React from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import { revenueData, revenueChart } from '../data/mock';

export default function RevenueTab() {
  return (
    <div className="tab-page frosted-page" style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 6 }}>
      {/* Balance Hero — compact */}
      <div className="grain text-center py-4 flex-shrink-0"
        style={{
          background: 'rgba(205,196,178,0.65)',
          backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.3)',
          borderRadius: 'var(--radius-card)',
          boxShadow: 'var(--shadow-glow)',
          position: 'relative', zIndex: 1,
        }}>
        <div className="font-mono" style={{ fontSize: 17, color: 'var(--muted)' }}>Total Balance</div>
        <div className="font-display text-5xl font-bold my-1" style={{ color: 'var(--green)' }}>
          ${revenueData.balance.toFixed(2)}
        </div>
        <div className="font-mono my-2" style={{ fontSize: 12, color: 'rgba(66, 74, 60, 0.95)', lineHeight: 1.4 }}>
          ↑ ${revenueData.todayEarnings.toFixed(2)} today · ↑ ${revenueData.monthEarnings.toFixed(2)} this month
        </div>
        <button className="eco-btn eco-btn-outline mt-2.5" style={{ padding: '7px 18px', fontSize: 13 }}>
          Move earnings to PayPal
        </button>
      </div>

      {/* 28-day chart */}
      <div className="grain flex-shrink-0" style={{
        background: 'rgba(205,196,178,0.65)',
        backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,0.3)',
        borderRadius: 'var(--radius-card)',
        padding: 12, position: 'relative', zIndex: 1,
        boxShadow: 'var(--shadow-card)',
      }}>
        <div className="font-display text-xs mb-1">28-Day Earnings</div>
        <ResponsiveContainer width="100%" height={120} minWidth={0}>
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
      <div className="grain flex-shrink-0" style={{
        background: 'rgba(205,196,178,0.65)',
        backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,0.3)',
        borderRadius: 'var(--radius-card)',
        padding: 14, position: 'relative', zIndex: 1,
        boxShadow: 'var(--shadow-card)',
      }}>
        <div className="font-display text-xs mb-2">Revenue Breakdown</div>
        {revenueData.breakdown.map((row, i) => (
          <div key={i} className="mb-2.5 last:mb-0">
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

      {/* Leaderboard — compact */}
      <div className="grain flex-shrink-0 flex flex-col vine-left pl-4"
        style={{
          background: 'rgba(205,196,178,0.6)',
          backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.3)',
          borderRadius: 'var(--radius-card)',
          padding: '9px 12px', position: 'relative', zIndex: 1,
          boxShadow: 'var(--shadow-card)',
        }}>
        <div className="font-display text-xs mb-0.5">Community Standing</div>
        <div className="font-mono mb-1.5" style={{ fontSize: 11, color: 'rgba(58, 66, 54, 0.92)' }}>
          You're among the top {revenueData.rank}% of homes in your region this week
        </div>
        <div className="eco-progress">
          <div className="eco-progress-fill" style={{ width: `${100 - revenueData.rank}%`, background: 'linear-gradient(90deg, var(--green), var(--sun))' }} />
        </div>
      </div>
    </div>
  );
}
