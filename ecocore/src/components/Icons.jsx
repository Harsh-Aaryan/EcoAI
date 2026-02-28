import React from 'react';

export const LeafIcon = ({ size = 18, color = 'var(--green)' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89-.82c.94-.41 1.98-.41 2.92 0l.54.24c.94.41 1.98.41 2.92 0l.54-.24c.94-.41 1.98-.41 2.92 0l.54.24c.94.41 1.98.41 2.92 0L21 20" />
    <path d="M6 15c2-4 4.5-7 9-9" />
    <path d="M17 8c4-1 6-3 6-3s-2 2-3 6" />
  </svg>
);

export const SunIcon = ({ size = 18, color = 'var(--sun)' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

export const BoltIcon = ({ size = 18, color = 'var(--sky)' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

export const ChipIcon = ({ size = 18, color = 'var(--green-soft)' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <rect x="9" y="9" width="6" height="6" />
    <line x1="9" y1="1" x2="9" y2="4" />
    <line x1="15" y1="1" x2="15" y2="4" />
    <line x1="9" y1="20" x2="9" y2="23" />
    <line x1="15" y1="20" x2="15" y2="23" />
    <line x1="20" y1="9" x2="23" y2="9" />
    <line x1="20" y1="14" x2="23" y2="14" />
    <line x1="1" y1="9" x2="4" y2="9" />
    <line x1="1" y1="14" x2="4" y2="14" />
  </svg>
);

export const HomeIcon = ({ size = 22, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

export const CityIcon = ({ size = 22, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="6" width="7" height="18" rx="1" />
    <rect x="10" y="2" width="7" height="22" rx="1" />
    <rect x="16" y="10" width="7" height="14" rx="1" />
    <line x1="4" y1="10" x2="4" y2="10.01" />
    <line x1="4" y1="14" x2="4" y2="14.01" />
    <line x1="4" y1="18" x2="4" y2="18.01" />
    <line x1="13" y1="6" x2="13" y2="6.01" />
    <line x1="13" y1="10" x2="13" y2="10.01" />
    <line x1="13" y1="14" x2="13" y2="14.01" />
    <line x1="13" y1="18" x2="13" y2="18.01" />
    <line x1="19" y1="14" x2="19" y2="14.01" />
    <line x1="19" y1="18" x2="19" y2="18.01" />
  </svg>
);

export const JobsIcon = ({ size = 22, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
    <polyline points="7 8 10 11 17 7" />
  </svg>
);

export const RevenueIcon = ({ size = 22, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
  </svg>
);

export const GearIcon = ({ size = 20, color = 'var(--muted)' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
);

export const CheckIcon = ({ size = 16, color = 'var(--green)' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export const PlusIcon = ({ size = 18, color = 'var(--green)' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export const ChevronDown = ({ size = 16, color = 'var(--muted)' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

export const CircuitLeafLogo = ({ size = 72 }) => (
  <svg width={size} height={size} viewBox="0 0 72 72" fill="none">
    <rect x="4" y="4" width="64" height="64" rx="16" fill="var(--surface)" stroke="var(--border)" strokeWidth="1.5" />
    <path d="M36 16c-8 6-14 14-14 22 0 8 6 14 14 14s14-6 14-14c0-8-6-16-14-22z" fill="none" stroke="var(--green)" strokeWidth="1.5" />
    <line x1="36" y1="26" x2="36" y2="46" stroke="var(--green)" strokeWidth="1.5" />
    <line x1="36" y1="34" x2="28" y2="30" stroke="var(--green)" strokeWidth="1.5" />
    <line x1="36" y1="38" x2="44" y2="34" stroke="var(--green)" strokeWidth="1.5" />
    <circle cx="36" cy="46" r="2" fill="var(--green)" />
    <circle cx="28" cy="30" r="1.5" fill="var(--green)" />
    <circle cx="44" cy="34" r="1.5" fill="var(--green)" />
  </svg>
);

export const DriftingLeaf = () => (
  <svg className="anim-leaf" style={{ left: '75%', top: '-20px', width: 40, height: 40 }} viewBox="0 0 40 40" fill="none">
    <path d="M20 4c-6 4-12 12-12 20 0 6 5 12 12 12s12-6 12-12C32 16 26 8 20 4z" fill="var(--green)" opacity="0.08" />
    <line x1="20" y1="10" x2="20" y2="32" stroke="var(--green)" strokeWidth="0.8" opacity="0.15" />
  </svg>
);

export const WarnLeafIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="var(--sun)" strokeWidth="1.5" strokeLinecap="round">
    <path d="M12 4c-4 3-8 8-8 14h16c0-6-4-11-8-14z" />
    <line x1="12" y1="10" x2="12" y2="15" />
    <circle cx="12" cy="18" r="0.5" fill="var(--sun)" />
  </svg>
);
