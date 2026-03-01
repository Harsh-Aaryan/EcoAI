import React from 'react';

export default function BatteryGauge({ level = 78, isCharging = true }) {
  const radius = 44;
  const stroke = 7;
  const center = 52;
  const circumference = 2 * Math.PI * radius;
  const arc = circumference * 0.75;
  const filled = (level / 100) * arc;

  return (
    <div className="flex flex-col items-center">
      <svg width="104" height="104" viewBox="0 0 104 104">
        <circle cx={center} cy={center} r={radius} fill="none" stroke="var(--warm)" strokeWidth={stroke}
          strokeDasharray={`${arc} ${circumference - arc}`} strokeLinecap="round" transform={`rotate(135 ${center} ${center})`} />
        <circle cx={center} cy={center} r={radius} fill="none" stroke="var(--green)" strokeWidth={stroke}
          strokeDasharray={`${filled} ${circumference - filled}`} strokeLinecap="round" transform={`rotate(135 ${center} ${center})`}
          style={{ transition: 'stroke-dasharray 1.2s ease-out', filter: 'drop-shadow(0 0 4px rgba(46,125,62,0.3))' }} />
        <text x={center} y={center - 2} textAnchor="middle" dominantBaseline="central" fill="var(--green)"
          fontFamily="var(--font-mono)" fontSize="22" fontWeight="500">
          {level}%
        </text>
        <text x={center} y={center + 17} textAnchor="middle" fill="var(--muted)"
          fontFamily="var(--font-mono)" fontSize="10" letterSpacing="1.5">
          BATTERY
        </text>
      </svg>
    </div>
  );
}
