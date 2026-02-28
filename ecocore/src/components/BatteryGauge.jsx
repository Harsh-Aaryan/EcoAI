import React from 'react';

export default function BatteryGauge({ level = 78, isCharging = true }) {
  const radius = 58;
  const stroke = 8;
  const center = 70;
  const circumference = 2 * Math.PI * radius;
  const arc = circumference * 0.75; // 270° arc
  const filled = (level / 100) * arc;
  const gap = arc - filled;

  return (
    <div className="flex flex-col items-center">
      <svg width="140" height="140" viewBox="0 0 140 140">
        {/* Background arc */}
        <circle
          cx={center} cy={center} r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth={stroke}
          strokeDasharray={`${arc} ${circumference - arc}`}
          strokeDashoffset={0}
          strokeLinecap="round"
          transform={`rotate(135 ${center} ${center})`}
        />
        {/* Filled arc */}
        <circle
          cx={center} cy={center} r={radius}
          fill="none"
          stroke="var(--green)"
          strokeWidth={stroke}
          strokeDasharray={`${filled} ${circumference - filled}`}
          strokeDashoffset={0}
          strokeLinecap="round"
          transform={`rotate(135 ${center} ${center})`}
          style={{ transition: 'stroke-dasharray 1.2s ease-out' }}
        />
        {/* Percentage text */}
        <text
          x={center} y={center - 4}
          textAnchor="middle"
          dominantBaseline="central"
          fill="var(--green)"
          fontFamily="var(--font-mono)"
          fontSize="28"
          fontWeight="500"
          className={isCharging ? 'anim-breathe' : ''}
          style={{ transformOrigin: `${center}px ${center}px` }}
        >
          {level}%
        </text>
        <text
          x={center} y={center + 22}
          textAnchor="middle"
          fill="var(--muted)"
          fontFamily="var(--font-display)"
          fontSize="11"
          letterSpacing="1.5"
        >
          BATTERY
        </text>
      </svg>
    </div>
  );
}
