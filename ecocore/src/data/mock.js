// Mock data for EcoCore — replace with real API calls later

export const userData = {
  name: 'Alex',
  email: 'alex@ecocore.io',
  location: 'Austin, TX',
  gridRegion: 'ERCOT',
  batteryCapacity: 13.5,
  batteryLevel: 78,
  isCharging: true,
  solarPanels: '8.2 kW Array',
  inverter: 'SolarEdge SE7600H',
};

export const homeStats = {
  earnedToday: 4.20,
  co2Avoided: 8.3,
  kwhShifted: 24.7,
  aiJobsRun: 3,
  gridPrice: 0.082,
  carbonScore: 42,
  solarOutput: 5.1,
  cleanEnergyPct: 89,
};

export const activeJob = {
  id: 1,
  name: 'LLaMA 3 Inference Batch',
  type: 'Inference',
  startedAgo: '12 min ago',
  powerDraw: 0.34,
  progress: 67,
  carbonCost: 0.02,
};

// Generate 24h chart data
export const chartData = Array.from({ length: 24 }, (_, i) => {
  const hour = i;
  const label = hour === 0 ? '12a' : hour < 12 ? `${hour}a` : hour === 12 ? '12p' : `${hour - 12}p`;
  return {
    hour: label,
    price: 0.04 + Math.sin(i / 4) * 0.03 + Math.random() * 0.02,
    carbon: 30 + Math.sin(i / 3) * 20 + Math.random() * 10,
  };
});

export const cityNodes = [
  { id: 1, lat: 30.267, lng: -97.743, name: "River House", battery: 92, earnings: 5.10, status: 'online' },
  { id: 2, lat: 30.275, lng: -97.738, name: "Oak Villa", battery: 65, earnings: 3.80, status: 'discharging' },
  { id: 3, lat: 30.260, lng: -97.750, name: "Pine Cottage", battery: 88, earnings: 4.60, status: 'online' },
  { id: 4, lat: 30.272, lng: -97.755, name: "Cedar Lodge", battery: 45, earnings: 2.90, status: 'discharging' },
  { id: 5, lat: 30.258, lng: -97.735, name: "Elm Manor", battery: 96, earnings: 6.20, status: 'online' },
  { id: 6, lat: 30.280, lng: -97.748, name: "Birch Home", battery: 71, earnings: 3.40, status: 'online' },
  { id: 7, lat: 30.265, lng: -97.760, name: "Maple Nest", battery: 53, earnings: 4.10, status: 'online' },
  { id: 8, lat: 30.270, lng: -97.730, name: "Aspen Flat", battery: 80, earnings: 5.50, status: 'online' },
];

export const cityStats = {
  homesOnline: 1247,
  mwReduced: 2.4,
  co2Offset: 12.8,
  gridStress: 'Low',
};

export const demandEvents = [
  { time: 'Today 6–8 PM', status: 'Upcoming', bonus: '$0.45/kWh bonus' },
  { time: 'Yesterday 5–7 PM', status: 'Completed', bonus: '+$2.10 earned' },
  { time: 'Feb 25, 4–6 PM', status: 'Completed', bonus: '+$1.80 earned' },
];

export const impactStats = {
  co2Avoided: '42 kg',
  peakerReplaced: '8.3 hrs',
  carFreeDays: '4 days',
  kwhOptimized: '312 kWh',
};

export const tickerItems = [
  'ERCOT $0.082/kWh',
  'CAISO $0.094/kWh',
  'PJM $0.071/kWh',
  'Grid Carbon 42%',
  'Network Earnings $14,230 today',
];

export const jobsList = [
  { id: 1, name: 'LLaMA 3 Inference Batch', type: 'Inference', power: '0.34 kW', carbon: '0.02 kg', status: 'running', progress: 67 },
  { id: 2, name: 'Document Embedding Job', type: 'Embedding', power: '0.12 kW', carbon: '0.01 kg', status: 'queued', progress: 0 },
  { id: 3, name: 'Image Classification', type: 'Vision', power: '0.28 kW', carbon: '0.03 kg', status: 'done', progress: 100 },
  { id: 4, name: 'Text Summarization', type: 'Inference', power: '0.15 kW', carbon: '0.01 kg', status: 'done', progress: 100 },
];

export const tasksList = [
  { id: 1, name: 'Review battery discharge schedule', category: 'Energy', due: 'Today', done: false, urgent: true },
  { id: 2, name: 'Check solar panel output logs', category: 'Solar', due: 'Today', done: false, urgent: false },
  { id: 3, name: 'Update grid region preference', category: 'Settings', due: 'Tomorrow', done: false, urgent: false },
  { id: 4, name: 'Approve demand response enrollment', category: 'Grid', due: 'Feb 28', done: true, urgent: false },
  { id: 5, name: 'Calibrate home battery sensor', category: 'Energy', due: 'Mar 1', done: true, urgent: false },
];

export const revenueData = {
  balance: 142.80,
  todayEarnings: 4.20,
  monthEarnings: 31.40,
  breakdown: [
    { label: 'Energy Arbitrage', value: 68.40, pct: 48, color: 'var(--green)' },
    { label: 'AI Compute Revenue', value: 52.20, pct: 37, color: 'var(--sky)' },
    { label: 'Demand Response', value: 22.20, pct: 15, color: 'var(--sun)' },
  ],
  rank: 18,
};

// 28-day revenue chart
export const revenueChart = Array.from({ length: 28 }, (_, i) => ({
  day: i + 1,
  amount: 2 + Math.random() * 6,
  isToday: i === 27,
}));

export const settingsToggles = [
  'Auto-discharge during price spikes',
  'Only run AI jobs on clean energy',
  'Reserve 20% battery for home use',
  'Enable demand response events',
  'Push notifications',
];

export const techStack = [
  { layer: 'Auth', value: 'Auth0 Universal Login' },
  { layer: 'Database', value: 'MongoDB Atlas' },
  { layer: 'Backend', value: 'FastAPI + Python' },
  { layer: 'Queue', value: 'Celery + Redis' },
  { layer: 'Grid Data', value: 'ERCOT API + WattTime' },
  { layer: 'Solar', value: 'Open-Meteo API' },
  { layer: 'AI Runtime', value: 'Ollama + Groq' },
  { layer: 'Maps', value: 'Leaflet.js + OpenStreetMap' },
  { layer: 'Frontend', value: 'React PWA + Vite' },
];
