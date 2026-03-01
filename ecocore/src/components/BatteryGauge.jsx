import React from 'react';

/**
 * Circular gauge — shows battery % when hasBattery is true,
 * or grid usage when hasBattery is false.
 */
export default function BatteryGauge({ level = 78, isCharging = true, hasBattery = true, gridUsage = 0 }) {
  const radius = 44;
  const stroke = 7;
  const center = 52;
  const circumference = 2 * Math.PI * radius;
  const arc = circumference * 0.75;

  if (!hasBattery) {
    // Grid usage mode: show current grid draw as a percentage of typical max (~10 kW)
    const usagePct = Math.min(100, Math.max(0, gridUsage));
    const filled = (usagePct / 100) * arc;
    const color = usagePct > 70 ? '#e67e22' : usagePct > 40 ? 'var(--sun)' : 'var(--sky)';

    return (
      <div className="flex flex-col items-center">
        <svg width="104" height="104" viewBox="0 0 104 104">
          <circle cx={center} cy={center} r={radius} fill="none" stroke="var(--warm)" strokeWidth={stroke}
            strokeDasharray={`${arc} ${circumference - arc}`} strokeLinecap="round" transform={`rotate(135 ${center} ${center})`} />
          <circle cx={center} cy={center} r={radius} fill="none" stroke={color} strokeWidth={stroke}
            strokeDasharray={`${filled} ${circumference - filled}`} strokeLinecap="round" transform={`rotate(135 ${center} ${center})`}
            style={{ transition: 'stroke-dasharray 1.2s ease-out', filter: `drop-shadow(0 0 4px ${color}44)` }} />
          <text x={center} y={center - 2} textAnchor="middle" dominantBaseline="central" fill={color}
            fontFamily="var(--font-mono)" fontSize="20" fontWeight="500">
            {usagePct.toFixed(0)}%
          </text>
          <text x={center} y={center + 17} textAnchor="middle" fill="var(--muted)"
            fontFamily="var(--font-display)" fontSize="8" letterSpacing="1.2">
            GRID LOAD
          </text>
        </svg>
      </div>
    );
  }

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
