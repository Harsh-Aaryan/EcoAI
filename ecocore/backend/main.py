from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Literal

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

ROOT_ENV = Path(__file__).resolve().parents[1] / '.env'
load_dotenv(ROOT_ENV)

GROQ_API_KEY = os.getenv('GROQ_API_KEY', '').strip()
GROQ_MODEL = os.getenv('GROQ_MODEL', 'llama-3.3-70b-versatile')
ALLOWED_ORIGINS = [origin.strip() for origin in os.getenv('ALLOWED_ORIGINS', '*').split(',') if origin.strip()]

app = FastAPI(title='EcoCore API', version='0.1.0')

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

        return PlanResponse(
            window=str(parsed.get('window') or fallback.window),
            reason=str(parsed.get('reason') or fallback.reason),
            estimatedSavings=str(parsed.get('estimatedSavings') or fallback.estimatedSavings),
            model=GROQ_MODEL,
            source='groq',
        )
    except Exception:
        return fallback


@app.get('/')
def root() -> dict[str, str]:
    return {'message': 'EcoCore API running'}
