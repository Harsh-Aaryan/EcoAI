import { useEffect, useMemo, useState } from 'react';
import { chartData as mockChartData, cityStats as mockCityStats, homeStats as mockHomeStats } from '../data/mock';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:8000';

function hourLabel(hour) {
  return hour === 0 ? '12a' : hour < 12 ? `${hour}a` : hour === 12 ? '12p' : `${hour - 12}p`;
}

const fallbackChart = Array.from({ length: 24 }, (_, index) => ({
  hour: hourLabel(index),
  carbon: 42,
  price: 0.082,
}));

export default function useWattTimeData(center) {
  const [state, setState] = useState({
    loading: true,
    error: null,
    source: 'mock',
    sources: [],
    region: null,
    regionUsed: null,
    eiaRespondent: null,
    currentCarbonValue: null,
    currentCarbonFrom: 'mock',
    signalIndex: null,
    fuelMix: null,
    demand: null,
    chartData: mockChartData,
    homeStats: mockHomeStats,
    cityStats: mockCityStats,
    mapOverlay: {
      label: 'Loading…',
      detail: 'Connecting to backend',
      color: 'var(--muted)',
      tint: 'rgba(125,140,114,0.10)',
    },
  });

  const centerKey = `${center?.[0]},${center?.[1]}`;

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const lat = Number(center?.[0]);
        const lon = Number(center?.[1]);

        if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
          throw new Error('Invalid coordinates');
        }

        const url = `${API_BASE_URL}/api/grid/live?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`;
        const response = await fetch(url, {
          signal: controller.signal,
          headers: { Accept: 'application/json' },
        });

        if (!response.ok) {
          throw new Error(`Backend ${response.status}`);
        }

        const payload = await response.json();

        setState({
          loading: false,
          error: payload.error || null,
          source: payload.source || 'mock',
          sources: payload.sources || [],
          region: payload.region || null,
          regionUsed: payload.regionUsed || null,
          eiaRespondent: payload.eiaRespondent || null,
          currentCarbonValue: payload.currentCarbonValue ?? null,
          currentCarbonFrom: payload.currentCarbonFrom || 'mock',
          signalIndex: payload.signalIndex ?? null,
          fuelMix: payload.fuelMix || null,
          demand: payload.demand || null,
          chartData: payload.chartData?.length ? payload.chartData : fallbackChart,
          homeStats: payload.homeStats || mockHomeStats,
          cityStats: payload.cityStats || mockCityStats,
          mapOverlay: payload.mapOverlay || {
            label: 'Mock',
            detail: 'No API data available',
            color: 'var(--muted)',
            tint: 'rgba(125,140,114,0.10)',
          },
        });
      } catch (error) {
        if (error?.name === 'AbortError') return;

        setState({
          loading: false,
          error: `Backend unavailable (${error.message}) – using mock values`,
          source: 'mock',
          sources: [],
          region: null,
          regionUsed: null,
          eiaRespondent: null,
          currentCarbonValue: mockHomeStats.carbonScore,
          currentCarbonFrom: 'mock',
          signalIndex: null,
          fuelMix: null,
          demand: null,
          chartData: mockChartData,
          homeStats: mockHomeStats,
          cityStats: mockCityStats,
          mapOverlay: {
            label: 'Mock',
            detail: 'Backend unreachable',
            color: 'var(--muted)',
            tint: 'rgba(125,140,114,0.10)',
          },
        });
      }
    }

    load();

    return () => controller.abort();
  }, [centerKey]);

  return useMemo(() => state, [state]);
}
