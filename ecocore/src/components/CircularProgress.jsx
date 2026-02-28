import React from 'react';

export default function CircularProgress({ pct = 60, size = 80 }) {
  const radius = (size / 2) - 5;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="var(--warm)" strokeWidth="4" />
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="var(--green)" strokeWidth="4"
        strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition: 'stroke-dashoffset 1.2s ease-out', filter: 'drop-shadow(0 0 3px rgba(46,125,62,0.25))' }} />
      <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="central" fill="var(--green)"
        fontFamily="var(--font-display)" fontSize="18" fontWeight="400">{pct}%</text>
    </svg>
  );
}
