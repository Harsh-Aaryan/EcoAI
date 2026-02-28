import { useEffect, useMemo, useState } from 'react';
import { chartData as mockChartData, cityStats as mockCityStats, homeStats as mockHomeStats } from '../data/mock';

// ─── WattTime config ───────────────────────────────────────────
const WT_BASE = 'https://api.watttime.org';
const SIGNAL_TYPE = 'co2_moer';
const PREVIEW_REGION = 'CAISO_NORTH';

// ─── EIA config (free, no API key required – DEMO_KEY works) ──
const EIA_BASE = 'https://api.eia.gov/v2/electricity/rto';
const EIA_KEY = import.meta.env.VITE_EIA_API_KEY || 'DEMO_KEY';

// Map WattTime region prefixes → EIA respondent codes
const REGION_TO_EIA = {
  ERCOT: 'ERCO', CAISO: 'CISO', PJM: 'PJM', MISO: 'MISO',
  ISONE: 'ISNE', NYISO: 'NYIS', SPP: 'SWPP', SOCO: 'SOCO',
  TVA: 'TVA', AECI: 'AECI',
};

function eiaRespondentFromRegion(region) {
  if (!region) return 'ERCO';
  for (const [prefix, code] of Object.entries(REGION_TO_EIA)) {
    if (region.startsWith(prefix)) return code;
  }
  return 'ERCO'; // fallback
}

// ─── Helpers ──────────────────────────────────────────────────
let cachedToken = null;
let tokenFetchedAt = 0;

function hourLabel(h) {
  return h === 0 ? '12a' : h < 12 ? `${h}a` : h === 12 ? '12p' : `${h - 12}p`;
}

function hourLabelFromIso(iso) { return hourLabel(new Date(iso).getHours()); }

function stressFromCarbonPct(pct) {
  if (pct < 35) return 'Low';
  if (pct < 70) return 'Moderate';
  return 'High';
}

function overlayTint(pct) {
  const alpha = Math.max(0.12, Math.min(0.45, pct / 180)).toFixed(2);
  if (pct < 35) return `rgba(46,125,62,${alpha})`;
  if (pct < 70) return `rgba(201,139,26,${alpha})`;
  return `rgba(177,74,38,${alpha})`;
}

// ─── WattTime fetch helpers ───────────────────────────────────
async function wtLogin(user, pass) {
  const ttl = 30 * 60 * 1000;
  if (cachedToken && Date.now() - tokenFetchedAt < ttl - 15000) return cachedToken;
  const resp = await fetch(`${WT_BASE}/login`, {
    headers: { Authorization: `Basic ${btoa(`${user}:${pass}`)}` },
  });
  if (!resp.ok) throw new Error(`WattTime login ${resp.status}`);
  const json = await resp.json();
  cachedToken = json.token;
  tokenFetchedAt = Date.now();
  return cachedToken;
}

async function wtGet(path, token, params) {
  const qs = new URLSearchParams(params).toString();
  const resp = await fetch(`${WT_BASE}${path}?${qs}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!resp.ok) { const e = new Error(resp.status); e.status = resp.status; throw e; }
  return resp.json();
}

async function wtGetFallback(path, token, region, extra = {}) {
  try {
    return { data: await wtGet(path, token, { region, signal_type: SIGNAL_TYPE, ...extra }), regionUsed: region };
  } catch (e) {
    if (e.status === 403 && region !== PREVIEW_REGION) {
      return { data: await wtGet(path, token, { region: PREVIEW_REGION, signal_type: SIGNAL_TYPE, ...extra }), regionUsed: PREVIEW_REGION };
    }
    throw e;
  }
}

// ─── EIA fetch helpers ────────────────────────────────────────
async function eiaFuelMix(respondent) {
  const url = new URL(`${EIA_BASE}/fuel-type-data/data/`);
  url.searchParams.set('api_key', EIA_KEY);
  url.searchParams.set('frequency', 'hourly');
  url.searchParams.set('data[0]', 'value');
  url.searchParams.set('facets[respondent][]', respondent);
  url.searchParams.set('length', '40'); // ~5 hours × 8 fuel types
  url.searchParams.set('sort[0][column]', 'period');
  url.searchParams.set('sort[0][direction]', 'desc');
  const resp = await fetch(url, { signal: AbortSignal.timeout(15000) });
  if (!resp.ok) return null;
  const json = await resp.json();
  return json?.response?.data || [];
}

async function eiaDemand(respondent) {
  const url = new URL(`${EIA_BASE}/region-data/data/`);
  url.searchParams.set('api_key', EIA_KEY);
  url.searchParams.set('frequency', 'hourly');
  url.searchParams.set('data[0]', 'value');
  url.searchParams.set('facets[respondent][]', respondent);
  url.searchParams.set('length', '48'); // 24 hours × 2 types
  url.searchParams.set('sort[0][column]', 'period');
  url.searchParams.set('sort[0][direction]', 'desc');
  const resp = await fetch(url, { signal: AbortSignal.timeout(15000) });
  if (!resp.ok) return null;
  const json = await resp.json();
  return json?.response?.data || [];
}

function processFuelMix(raw) {
  if (!raw || raw.length === 0) return null;
  // Group by period, take the latest
  const byPeriod = {};
  for (const d of raw) {
    const p = d.period;
    if (!byPeriod[p]) byPeriod[p] = {};
    byPeriod[p][d.fueltype || d['type-name']] = Number(d.value) || 0;
  }
  const periods = Object.keys(byPeriod).sort().reverse();
  // Build hourly series (latest → oldest) and compute aggregate for latest hour
  const latest = byPeriod[periods[0]] || {};
  const total = Object.values(latest).reduce((s, v) => s + Math.abs(v), 0) || 1;
  const solar = latest['SUN'] || latest['Solar'] || 0;
  const wind = latest['WND'] || latest['Wind'] || 0;
  const nuclear = latest['NUC'] || latest['Nuclear'] || 0;
  const hydro = latest['WAT'] || latest['Hydro'] || 0;
  const gas = latest['NG'] || latest['Natural Gas'] || 0;
  const coal = latest['COL'] || latest['Coal'] || 0;
  const cleanMwh = solar + wind + nuclear + hydro;
  const cleanPct = Math.round((cleanMwh / total) * 100);
  const solarKw = solar > 0 ? Number((solar / 1000).toFixed(1)) : 0;

  // Build 24-hour chart from available periods
  const chartPoints = periods.slice(0, 24).reverse().map((period) => {
    const mix = byPeriod[period];
    const t = Object.values(mix).reduce((s, v) => s + Math.abs(v), 0) || 1;
    const c = ((mix['NG'] || mix['Natural Gas'] || 0) + (mix['COL'] || mix['Coal'] || 0));
    const carbonRatio = c / t;
    const h = parseInt(period.split('T')[1], 10);
    return {
      hour: hourLabel(isNaN(h) ? 0 : h),
      carbon: Math.round(carbonRatio * 100),
      price: Number((0.03 + carbonRatio * 0.10).toFixed(3)),
    };
  });

  return { cleanPct, solarKw, totalMwh: total, chartPoints, gas, coal, wind, solar, nuclear, hydro };
}

function processDemand(raw) {
  if (!raw || raw.length === 0) return null;
  // Get latest actual demand (type=D) and forecast (type=DF)
  let latestDemand = null;
  let latestForecast = null;
  for (const d of raw) {
    const val = Number(d.value) || 0;
    if ((d.type === 'D' || d['type-name'] === 'Demand') && !latestDemand) latestDemand = val;
    if ((d.type === 'DF' || d['type-name'] === 'Day-ahead demand forecast') && !latestForecast) latestForecast = val;
  }
  return { demand: latestDemand, forecast: latestForecast };
}

// ─── Main Hook ────────────────────────────────────────────────
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
      detail: 'Connecting to grid APIs',
      color: 'var(--muted)',
      tint: 'rgba(125,140,114,0.10)',
    },
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const user = import.meta.env.VITE_WATTTIME_USER;
      const pass = import.meta.env.VITE_WATTTIME_PASS;
      const sources = [];
      let region = null;
      let regionFullName = '';
      let regionUsed = null;
      let carbonPct = mockHomeStats.carbonScore;
      let currentCarbonFrom = 'mock';
      let signalIndex = null;
      let chartData = mockChartData;
      let fuelMix = null;
      let demandInfo = null;
      let gridPrice = mockHomeStats.gridPrice;
      let cleanPct = mockHomeStats.cleanEnergyPct;
      let solarOutput = mockHomeStats.solarOutput;
      let eiaRespondent = null;

      // ── 1. WattTime: region lookup + signal index ─────────
      let wtToken = null;
      if (user && pass) {
        try {
          wtToken = await wtLogin(user, pass);
          const regionData = await wtGet('/v3/region-from-loc', wtToken, {
            latitude: center[0], longitude: center[1], signal_type: SIGNAL_TYPE,
          });
          region = regionData.region;
          regionFullName = regionData.region_full_name || region;
          sources.push('watttime-region');

          // Signal index (free for all regions)
          try {
            const idxResp = await wtGetFallback('/v3/signal-index', wtToken, region);
            const idxVal = idxResp.data?.data?.[0]?.value;
            if (typeof idxVal === 'number') {
              signalIndex = idxVal;
              carbonPct = Math.round(idxVal);
              currentCarbonFrom = 'watttime-index';
              sources.push('watttime-index');
            }
            regionUsed = idxResp.regionUsed;
          } catch { /* non-fatal */ }

          // Forecast (may 403 for non-preview regions)
          try {
            const fcResp = await wtGetFallback('/v3/forecast', wtToken, region, { horizon_hours: 24 });
            const fcData = fcResp.data?.data || [];
            if (fcData.length > 0) {
              regionUsed = fcResp.regionUsed;
              // We'll use this for carbon chart only if EIA doesn't give us better data
              if (fcResp.regionUsed === region) {
                // Direct region data available
                chartData = fcData.slice(0, 24).map((p, i) => ({
                  hour: p.point_time ? hourLabelFromIso(p.point_time) : mockChartData[i]?.hour || `${i}`,
                  carbon: Number(p.value ?? 0),
                  price: Number((0.04 + (Math.min(1200, Math.max(0, p.value || 0)) / 1200) * 0.12).toFixed(3)),
                }));
                sources.push('watttime-forecast');
              }
            }
          } catch { /* non-fatal – EIA will fill in */ }
        } catch (e) {
          console.warn('[useWattTimeData] WattTime error:', e.message);
        }
      }

      // ── 2. EIA: real fuel mix + demand (works for any US grid) ──
      eiaRespondent = eiaRespondentFromRegion(region);
      try {
        const [fuelRaw, demandRaw] = await Promise.all([
          eiaFuelMix(eiaRespondent),
          eiaDemand(eiaRespondent),
        ]);

        fuelMix = processFuelMix(fuelRaw);
        demandInfo = processDemand(demandRaw);

        if (fuelMix) {
          sources.push('eia-fuel-mix');
          // EIA gives us verified clean energy % and solar output
          cleanPct = fuelMix.cleanPct;
          solarOutput = fuelMix.solarKw > 0 ? fuelMix.solarKw : mockHomeStats.solarOutput;

          // If we didn't get WattTime carbon index, derive from fuel mix
          if (currentCarbonFrom === 'mock') {
            carbonPct = 100 - cleanPct;
            currentCarbonFrom = 'eia-fuel-mix';
          }

          // Use EIA chart data if WattTime forecast wasn't available for user's region
          if (!sources.includes('watttime-forecast') && fuelMix.chartPoints.length > 0) {
            chartData = fuelMix.chartPoints;
            sources.push('eia-chart');
          }

          // Derive grid price from fuel-mix carbon ratio
          const carbonRatio = (fuelMix.gas + fuelMix.coal) / (fuelMix.totalMwh || 1);
          gridPrice = Number((0.03 + carbonRatio * 0.10).toFixed(3));
        }

        if (demandInfo) {
          sources.push('eia-demand');
        }
      } catch (e) {
        console.warn('[useWattTimeData] EIA error:', e.message);
      }

      // ── 3. Compute derived stats ──────────────────────────
      cleanPct = Math.max(0, Math.min(100, cleanPct));
      carbonPct = Math.max(0, Math.min(100, carbonPct));
      const demandMw = demandInfo?.demand ? Math.round(demandInfo.demand / 1000) : null;

      const updatedHomeStats = {
        ...mockHomeStats,
        gridPrice,
        carbonScore: carbonPct,
        cleanEnergyPct: cleanPct,
        solarOutput,
        co2Avoided: Number((mockHomeStats.co2Avoided + cleanPct / 25).toFixed(1)),
        kwhShifted: Number((mockHomeStats.kwhShifted + cleanPct / 12).toFixed(1)),
      };

      const updatedCityStats = {
        ...mockCityStats,
        gridStress: stressFromCarbonPct(carbonPct),
        mwReduced: Number(Math.max(0.8, 4.2 - carbonPct / 50).toFixed(1)),
        co2Offset: Number(Math.max(2.5, cleanPct / 6).toFixed(1)),
      };

      const sourceSummary = sources.length > 0 ? sources.join(' + ') : 'mock';
      const overlayLabel = sources.includes('eia-fuel-mix')
        ? 'EIA Live'
        : sources.includes('watttime-index')
          ? 'WattTime Live'
          : 'Mock';

      const overlayDetail = [
        regionFullName || eiaRespondent,
        `${carbonPct}% carbon`,
        `${cleanPct}% clean`,
        demandMw ? `${demandMw.toLocaleString()} GW demand` : null,
      ].filter(Boolean).join(' · ');

      if (!cancelled) {
        setState({
          loading: false,
          error: sources.length === 0 ? 'No API data available – using mock values' : null,
          source: sourceSummary,
          sources,
          region,
          regionUsed,
          eiaRespondent,
          currentCarbonValue: carbonPct,
          currentCarbonFrom,
          signalIndex,
          fuelMix,
          demand: demandInfo,
          chartData,
          homeStats: updatedHomeStats,
          cityStats: updatedCityStats,
          mapOverlay: {
            label: overlayLabel,
            detail: overlayDetail,
            color: carbonPct < 35 ? 'var(--green)' : carbonPct < 70 ? 'var(--sun)' : '#b14a26',
            tint: overlayTint(carbonPct),
          },
        });
      }
    }

    load();
    return () => { cancelled = true; };
  }, [center]);

  return useMemo(() => state, [state]);
}
