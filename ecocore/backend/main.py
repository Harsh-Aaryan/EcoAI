from __future__ import annotations

import asyncio
import base64
import json
import os
from pathlib import Path
from typing import Literal

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException

# asynchronous MongoDB driver
from motor.motor_asyncio import AsyncIOMotorClient
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

ROOT_ENV = Path(__file__).resolve().parents[1] / '.env'
load_dotenv(ROOT_ENV)

GROQ_API_KEY = os.getenv('GROQ_API_KEY', '').strip()
GROQ_MODEL = os.getenv('GROQ_MODEL', 'llama-3.3-70b-versatile')
ALLOWED_ORIGINS = [origin.strip() for origin in os.getenv('ALLOWED_ORIGINS', '*').split(',') if origin.strip()]
WATTTIME_USER = os.getenv('WATTTIME_USER', os.getenv('VITE_WATTTIME_USER', '')).strip()
WATTTIME_PASS = os.getenv('WATTTIME_PASS', os.getenv('VITE_WATTTIME_PASS', '')).strip()
EIA_API_KEY = os.getenv('EIA_API_KEY', os.getenv('VITE_EIA_API_KEY', 'DEMO_KEY')).strip() or 'DEMO_KEY'

WT_BASE = 'https://api.watttime.org'
EIA_BASE = 'https://api.eia.gov/v2/electricity/rto'
SIGNAL_TYPE = 'co2_moer'
PREVIEW_REGION = 'CAISO_NORTH'

REGION_TO_EIA = {
    'ERCOT': 'ERCO',
    'CAISO': 'CISO',
    'PJM': 'PJM',
    'MISO': 'MISO',
    'ISONE': 'ISNE',
    'NYISO': 'NYIS',
    'SPP': 'SWPP',
    'SOCO': 'SOCO',
    'TVA': 'TVA',
    'AECI': 'AECI',
}

MOCK_HOME = {
    'gridPrice': 0.082,
    'carbonScore': 42,
    'cleanEnergyPct': 58,
    'solarOutput': 3.4,
    'co2Avoided': 14.8,
    'kwhShifted': 126.2,
    'earnedToday': 4.20,
    'aiJobsRun': 3,
}

MOCK_CITY = {
    'homesOnline': 1247,
    'mwReduced': 3.4,
    'co2Offset': 14.8,
    'gridStress': 'Moderate',
}

app = FastAPI(title='EcoCore API', version='0.1.0')

# ---------- MongoDB configuration ----------
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017')
MONGO_DB = os.getenv('MONGO_DB', 'ecocore')


@app.on_event('startup')
async def startup_db_client() -> None:
    """Create MongoDB client and attach to FastAPI app."""
    app.mongodb_client = AsyncIOMotorClient(MONGO_URI)
    app.mongodb = app.mongodb_client[MONGO_DB]


@app.on_event('shutdown')
async def shutdown_db_client() -> None:
    """Close MongoDB client when the application shuts down."""
    app.mongodb_client.close()

# ------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS if ALLOWED_ORIGINS != ['*'] else ['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)


class PlanRequest(BaseModel):
    jobType: str = Field(default='Inference')
    priority: Literal['Low', 'Normal', 'High'] = Field(default='Normal')
    greenOnly: bool = Field(default=True)
    autoPause: bool = Field(default=False)
    gridPrice: float | None = None
    carbonScore: float | None = None
    cleanEnergyPct: float | None = None


class PlanResponse(BaseModel):
    window: str
    reason: str
    estimatedSavings: str
    model: str
    source: str


def hour_label(hour: int) -> str:
    return '12a' if hour == 0 else f'{hour}a' if hour < 12 else '12p' if hour == 12 else f'{hour - 12}p'


def hour_label_from_iso(iso: str) -> str:
    try:
        return hour_label(int(iso[11:13]))
    except Exception:
        return '0'


def stress_from_carbon_pct(pct: float) -> str:
    if pct < 35:
        return 'Low'
    if pct < 70:
        return 'Moderate'
    return 'High'


def overlay_tint(pct: float) -> str:
    alpha = max(0.12, min(0.45, pct / 180))
    if pct < 35:
        return f'rgba(46,125,62,{alpha:.2f})'
    if pct < 70:
        return f'rgba(201,139,26,{alpha:.2f})'
    return f'rgba(177,74,38,{alpha:.2f})'


def eia_respondent_from_region(region: str | None) -> str:
    if not region:
        return 'ERCO'
    for prefix, code in REGION_TO_EIA.items():
        if region.startswith(prefix):
            return code
    return 'ERCO'


def process_fuel_mix(raw: list[dict] | None) -> dict | None:
    if not raw:
        return None

    by_period: dict[str, dict[str, float]] = {}
    for row in raw:
        period = row.get('period')
        if not period:
            continue
        if period not in by_period:
            by_period[period] = {}
        fuel_name = row.get('fueltype') or row.get('type-name') or 'UNKNOWN'
        by_period[period][fuel_name] = float(row.get('value') or 0)

    periods = sorted(by_period.keys(), reverse=True)
    if not periods:
        return None

    latest = by_period[periods[0]]
    total = sum(abs(v) for v in latest.values()) or 1.0

    solar = latest.get('SUN', latest.get('Solar', 0.0))
    wind = latest.get('WND', latest.get('Wind', 0.0))
    nuclear = latest.get('NUC', latest.get('Nuclear', 0.0))
    hydro = latest.get('WAT', latest.get('Hydro', 0.0))
    gas = latest.get('NG', latest.get('Natural Gas', 0.0))
    coal = latest.get('COL', latest.get('Coal', 0.0))

    clean_mwh = solar + wind + nuclear + hydro
    clean_pct = round((clean_mwh / total) * 100)
    solar_kw = round(solar / 1000, 1) if solar > 0 else 0

    chart_points = []
    for period in list(reversed(periods[:24])):
        mix = by_period[period]
        t = sum(abs(v) for v in mix.values()) or 1.0
        carbonish = float(mix.get('NG', mix.get('Natural Gas', 0.0)) + mix.get('COL', mix.get('Coal', 0.0)))
        carbon_ratio = carbonish / t
        chart_points.append({
            'hour': hour_label_from_iso(period),
            'carbon': round(carbon_ratio * 100),
            'price': round(0.03 + carbon_ratio * 0.10, 3),
        })

    return {
        'cleanPct': clean_pct,
        'solarKw': solar_kw,
        'totalMwh': total,
        'chartPoints': chart_points,
        'gas': gas,
        'coal': coal,
        'wind': wind,
        'solar': solar,
        'nuclear': nuclear,
        'hydro': hydro,
    }


def process_demand(raw: list[dict] | None) -> dict | None:
    if not raw:
        return None

    latest_demand = None
    latest_forecast = None
    for row in raw:
        val = float(row.get('value') or 0)
        row_type = row.get('type') or row.get('type-name')
        if row_type in ('D', 'Demand') and latest_demand is None:
            latest_demand = val
        if row_type in ('DF', 'Day-ahead demand forecast') and latest_forecast is None:
            latest_forecast = val

    if latest_demand is None and latest_forecast is None:
        return None
    return {'demand': latest_demand, 'forecast': latest_forecast}


@app.get('/api/grid/live')
async def grid_live(lat: float, lon: float) -> dict:
    sources: list[str] = []
    region = None
    region_used = None
    region_full_name = ''
    signal_index = None
    current_carbon_from = 'mock'

    chart_data = [{'hour': hour_label(h), 'carbon': 42, 'price': 0.082} for h in range(24)]
    fuel_mix = None
    demand_info = None

    grid_price = float(MOCK_HOME['gridPrice'])
    carbon_pct = float(MOCK_HOME['carbonScore'])
    clean_pct = float(MOCK_HOME['cleanEnergyPct'])
    solar_output = float(MOCK_HOME['solarOutput'])

    async with httpx.AsyncClient(timeout=20) as client:
        if WATTTIME_USER and WATTTIME_PASS:
            try:
                basic = base64.b64encode(f'{WATTTIME_USER}:{WATTTIME_PASS}'.encode()).decode()
                login_resp = await client.get(
                    f'{WT_BASE}/login',
                    headers={'Authorization': f'Basic {basic}'},
                )
                login_resp.raise_for_status()
                token = login_resp.json().get('token')
                if token:
                    region_resp = await client.get(
                        f'{WT_BASE}/v3/region-from-loc',
                        params={'latitude': lat, 'longitude': lon, 'signal_type': SIGNAL_TYPE},
                        headers={'Authorization': f'Bearer {token}'},
                    )
                    region_resp.raise_for_status()
                    region_json = region_resp.json()
                    region = region_json.get('region')
                    region_full_name = region_json.get('region_full_name') or (region or '')
                    sources.append('watttime-region')

                    if region:
                        try:
                            idx_region = region
                            idx_resp = await client.get(
                                f'{WT_BASE}/v3/signal-index',
                                params={'region': idx_region, 'signal_type': SIGNAL_TYPE},
                                headers={'Authorization': f'Bearer {token}'},
                            )
                            if idx_resp.status_code == 403 and idx_region != PREVIEW_REGION:
                                idx_region = PREVIEW_REGION
                                idx_resp = await client.get(
                                    f'{WT_BASE}/v3/signal-index',
                                    params={'region': idx_region, 'signal_type': SIGNAL_TYPE},
                                    headers={'Authorization': f'Bearer {token}'},
                                )
                            idx_resp.raise_for_status()
                            idx_data = idx_resp.json().get('data') or []
                            if idx_data and isinstance(idx_data[0].get('value'), (int, float)):
                                signal_index = float(idx_data[0]['value'])
                                carbon_pct = round(signal_index)
                                current_carbon_from = 'watttime-index'
                                sources.append('watttime-index')
                            region_used = idx_region
                        except Exception:
                            pass

                        try:
                            fc_region = region
                            fc_resp = await client.get(
                                f'{WT_BASE}/v3/forecast',
                                params={'region': fc_region, 'signal_type': SIGNAL_TYPE, 'horizon_hours': 24},
                                headers={'Authorization': f'Bearer {token}'},
                            )
                            if fc_resp.status_code == 403 and fc_region != PREVIEW_REGION:
                                fc_region = PREVIEW_REGION
                                fc_resp = await client.get(
                                    f'{WT_BASE}/v3/forecast',
                                    params={'region': fc_region, 'signal_type': SIGNAL_TYPE, 'horizon_hours': 24},
                                    headers={'Authorization': f'Bearer {token}'},
                                )
                            fc_resp.raise_for_status()
                            fc_data = fc_resp.json().get('data') or []
                            if fc_data and fc_region == region:
                                chart_data = []
                                for i, point in enumerate(fc_data[:24]):
                                    val = float(point.get('value') or 0)
                                    chart_data.append({
                                        'hour': hour_label_from_iso(point.get('point_time', '')),
                                        'carbon': val,
                                        'price': round(0.04 + (min(1200, max(0, val)) / 1200) * 0.12, 3),
                                    })
                                sources.append('watttime-forecast')
                            region_used = fc_region
                        except Exception:
                            pass
            except Exception:
                pass

        eia_respondent = eia_respondent_from_region(region)
        try:
            fuel_url = f'{EIA_BASE}/fuel-type-data/data/'
            demand_url = f'{EIA_BASE}/region-data/data/'

            fuel_params = {
                'api_key': EIA_API_KEY,
                'frequency': 'hourly',
                'data[0]': 'value',
                'facets[respondent][]': eia_respondent,
                'length': '40',
                'sort[0][column]': 'period',
                'sort[0][direction]': 'desc',
            }
            demand_params = {
                'api_key': EIA_API_KEY,
                'frequency': 'hourly',
                'data[0]': 'value',
                'facets[respondent][]': eia_respondent,
                'length': '48',
                'sort[0][column]': 'period',
                'sort[0][direction]': 'desc',
            }

            fuel_resp, demand_resp = await asyncio.gather(
                client.get(fuel_url, params=fuel_params),
                client.get(demand_url, params=demand_params),
            )

            fuel_raw = fuel_resp.json().get('response', {}).get('data', []) if fuel_resp.status_code < 400 else []
            demand_raw = demand_resp.json().get('response', {}).get('data', []) if demand_resp.status_code < 400 else []

            fuel_mix = process_fuel_mix(fuel_raw)
            demand_info = process_demand(demand_raw)

            if fuel_mix:
                sources.append('eia-fuel-mix')
                clean_pct = float(fuel_mix['cleanPct'])
                solar_output = float(fuel_mix['solarKw']) if fuel_mix['solarKw'] > 0 else float(MOCK_HOME['solarOutput'])

                if current_carbon_from == 'mock':
                    carbon_pct = float(100 - clean_pct)
                    current_carbon_from = 'eia-fuel-mix'

                if 'watttime-forecast' not in sources and fuel_mix['chartPoints']:
                    chart_data = fuel_mix['chartPoints']
                    sources.append('eia-chart')

                carbon_ratio = float((fuel_mix['gas'] + fuel_mix['coal']) / (fuel_mix['totalMwh'] or 1))
                grid_price = round(0.03 + carbon_ratio * 0.10, 3)

            if demand_info:
                sources.append('eia-demand')
        except Exception:
            eia_respondent = eia_respondent_from_region(region)

    clean_pct = max(0, min(100, clean_pct))
    carbon_pct = max(0, min(100, carbon_pct))

    demand_mw = round((demand_info.get('demand') or 0) / 1000) if demand_info and demand_info.get('demand') else None

    home_stats = {
        **MOCK_HOME,
        'gridPrice': grid_price,
        'carbonScore': carbon_pct,
        'cleanEnergyPct': clean_pct,
        'solarOutput': solar_output,
        'co2Avoided': round(float(MOCK_HOME['co2Avoided']) + clean_pct / 25, 1),
        'kwhShifted': round(float(MOCK_HOME['kwhShifted']) + clean_pct / 12, 1),
    }
    city_stats = {
        **MOCK_CITY,
        'gridStress': stress_from_carbon_pct(carbon_pct),
        'mwReduced': round(max(0.8, 4.2 - carbon_pct / 50), 1),
        'co2Offset': round(max(2.5, clean_pct / 6), 1),
    }

    source_summary = ' + '.join(sources) if sources else 'mock'
    overlay_label = 'EIA Live' if 'eia-fuel-mix' in sources else 'WattTime Live' if 'watttime-index' in sources else 'Mock'
    overlay_detail = ' · '.join(
        part for part in [
            region_full_name or eia_respondent,
            f'{int(round(carbon_pct))}% carbon',
            f'{int(round(clean_pct))}% clean',
            f'{demand_mw:,} GW demand' if demand_mw else None,
        ]
        if part
    )

    return {
        'loading': False,
        'error': None if sources else 'No API data available – using mock values',
        'source': source_summary,
        'sources': sources,
        'region': region,
        'regionUsed': region_used,
        'eiaRespondent': eia_respondent,
        'currentCarbonValue': carbon_pct,
        'currentCarbonFrom': current_carbon_from,
        'signalIndex': signal_index,
        'fuelMix': fuel_mix,
        'demand': demand_info,
        'chartData': chart_data,
        'homeStats': home_stats,
        'cityStats': city_stats,
        'mapOverlay': {
            'label': overlay_label,
            'detail': overlay_detail,
            'color': 'var(--green)' if carbon_pct < 35 else 'var(--sun)' if carbon_pct < 70 else '#b14a26',
            'tint': overlay_tint(carbon_pct),
        },
    }


@app.get('/api/health')
def health() -> dict[str, str]:
    return {'status': 'ok'}


@app.get('/api/health/db')
async def health_db() -> dict[str, str]:
    """Optional health endpoint that verifies a round‑trip to MongoDB."""
    try:
        # list_collection_names will trigger a network call
        await app.mongodb.list_collection_names()
        return {'status': 'ok', 'db': 'reachable'}
    except Exception as e:  # pragma: no cover - simple health check
        raise HTTPException(status_code=503, detail=f'database error: {e}')


@app.post('/api/jobs/plan', response_model=PlanResponse)
async def plan_job(payload: PlanRequest) -> PlanResponse:
    # Deterministic fallback plan if key is missing or provider fails
    fallback = PlanResponse(
        window='Start in 1h 30m',
        reason='Clean-energy window expected to improve while keeping queue latency acceptable.',
        estimatedSavings='~12% lower CO₂, ~8% lower cost',
        model=GROQ_MODEL,
        source='fallback',
    )

    if not GROQ_API_KEY:
        # even without a model key we can log the request/response for local
        # debugging or metrics. ignore errors since persistence is optional.
        try:
            await app.mongodb.job_plans.insert_one({
                'request': payload.model_dump(),
                'response': fallback.model_dump(),
            })
        except Exception:  # pragma: no cover
            pass
        return fallback

    system_prompt = (
        'You are an energy-aware AI scheduler for a hackathon demo. '
        'Given job and grid inputs, output STRICT JSON with keys: '
        'window, reason, estimatedSavings. Keep reason concise (max 22 words).'
    )
    user_prompt = (
        f'JobType={payload.jobType}; priority={payload.priority}; greenOnly={payload.greenOnly}; '
        f'autoPause={payload.autoPause}; gridPrice={payload.gridPrice}; carbonScore={payload.carbonScore}; '
        f'cleanEnergyPct={payload.cleanEnergyPct}'
    )

    body = {
        'model': GROQ_MODEL,
        'temperature': 0.2,
        'messages': [
            {'role': 'system', 'content': system_prompt},
            {'role': 'user', 'content': user_prompt},
        ],
        'response_format': {'type': 'json_object'},
    }

    try:
        async with httpx.AsyncClient(timeout=20) as client:
            resp = await client.post(
                'https://api.groq.com/openai/v1/chat/completions',
                headers={
                    'Authorization': f'Bearer {GROQ_API_KEY}',
                    'Content-Type': 'application/json',
                },
                json=body,
            )

        if resp.status_code >= 400:
            return fallback

        content = resp.json()['choices'][0]['message']['content']
        parsed = json.loads(content)

        result = PlanResponse(
            window=str(parsed.get('window') or fallback.window),
            reason=str(parsed.get('reason') or fallback.reason),
            estimatedSavings=str(parsed.get('estimatedSavings') or fallback.estimatedSavings),
            model=GROQ_MODEL,
            source='groq',
        )
        return result
    except Exception:
        return fallback
    finally:
        # store a record of the request/response for auditing or analysis
        try:
            # we always have a `result` variable in normal flow, but in the
            # fallback case we simply recreate the response here
            record = {
                'request': payload.model_dump(),
                'response': (result.model_dump() if 'result' in locals() else {
                    'window': fallback.window,
                    'reason': fallback.reason,
                    'estimatedSavings': fallback.estimatedSavings,
                    'model': fallback.model,
                    'source': fallback.source,
                }),
            }
            await app.mongodb.job_plans.insert_one(record)
        except Exception:  # pragma: no cover - noncritical logging
            pass


@app.get('/')
def root() -> dict[str, str]:
    return {'message': 'EcoCore API running'}
