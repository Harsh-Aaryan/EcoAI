from __future__ import annotations

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
