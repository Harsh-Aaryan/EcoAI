import React, { useState } from 'react';
import { LeafIcon, PlusIcon } from '../components/Icons';
import useLocation from '../hooks/useLocation';
import useWattTimeData from '../hooks/useWattTimeData';
import useJobs from '../hooks/useJobs';

/* ── Sample AI job templates ── */
const SAMPLE_JOBS = [
  { id: 'summarize', name: 'Text Summarization', type: 'Inference', icon: '📝', desc: 'Summarize smart grid concepts' },
  { id: 'classify', name: 'Energy Event Classifier', type: 'Vision', icon: '🏷️', desc: 'Classify grid events by type' },
  { id: 'generate', name: 'Optimization Advisor', type: 'Inference', icon: '⚡', desc: 'Get battery discharge advice' },
  { id: 'embed', name: 'Knowledge Base Writer', type: 'Embedding', icon: '📚', desc: 'Generate V2G documentation' },
  { id: 'analyze', name: 'Energy Data Analyst', type: 'Inference', icon: '📊', desc: 'Analyze 24h energy patterns' },
];

/* ── Available job marketplace listings ── */
const AVAILABLE_JOBS = [
  { id: 'av-1', name: 'Peak Shaving Analysis', icon: '📉', category: 'Grid Ops', severity: 'High', pay: 0.85, estTime: '~3 min', desc: 'Analyze local grid peaks and recommend optimal battery discharge windows to flatten demand curves.', tags: ['grid', 'battery', 'optimization'] },
  { id: 'av-2', name: 'Solar Forecast Model', icon: '☀️', category: 'Prediction', severity: 'Medium', pay: 0.42, estTime: '~2 min', desc: 'Train a micro-forecast for next-day solar irradiance using local weather patterns.', tags: ['solar', 'ML', 'forecast'] },
  { id: 'av-3', name: 'EV Charge Scheduler', icon: '🔋', category: 'Scheduling', severity: 'Low', pay: 0.28, estTime: '~1 min', desc: 'Generate an optimal overnight EV charging schedule based on real-time carbon intensity.', tags: ['EV', 'scheduling', 'carbon'] },
  { id: 'av-4', name: 'Demand Response Report', icon: '📋', category: 'Reporting', severity: 'High', pay: 1.20, estTime: '~5 min', desc: 'Compile a detailed demand response event report for utility submission and credit claiming.', tags: ['DR', 'utility', 'compliance'] },
  { id: 'av-5', name: 'Anomaly Detection Scan', icon: '🔍', category: 'Monitoring', severity: 'Critical', pay: 1.75, estTime: '~4 min', desc: 'Scan 48h of meter data for anomalies — theft detection, meter drift, or inverter faults.', tags: ['security', 'anomaly', 'monitoring'] },
  { id: 'av-6', name: 'Carbon Credit Calc', icon: '🌱', category: 'Finance', severity: 'Medium', pay: 0.55, estTime: '~2 min', desc: 'Calculate verified carbon credits earned from your clean energy exports this billing cycle.', tags: ['carbon', 'credits', 'finance'] },
  { id: 'av-7', name: 'Microgrid Balancer', icon: '⚖️', category: 'Grid Ops', severity: 'High', pay: 0.95, estTime: '~3 min', desc: 'Balance load across neighborhood microgrid nodes for optimal power distribution.', tags: ['microgrid', 'balancing', 'P2P'] },
  { id: 'av-8', name: 'Tariff Optimizer', icon: '💰', category: 'Finance', severity: 'Low', pay: 0.35, estTime: '~1 min', desc: 'Compare available utility tariff plans and recommend the best fit for your usage pattern.', tags: ['tariff', 'savings', 'finance'] },
];

const severityColors = {
  Critical: { bg: 'rgba(180,50,50,0.1)', text: '#c0392b' },
  High: { bg: 'rgba(201,139,26,0.1)', text: '#c98b1a' },
  Medium: { bg: 'rgba(46,139,150,0.1)', text: 'var(--sky)' },
  Low: { bg: 'rgba(46,125,62,0.1)', text: 'var(--green)' },
};

/* ── AI Jobs (My Jobs) ── */
function AIJobsView() {
  const { center } = useLocation();
  const wt = useWattTimeData(center);
  const { jobs, plannerNote, runJob } = useJobs();
  const [showForm, setShowForm] = useState(false);
  const [expandedJob, setExpandedJob] = useState(null);

  const running = jobs.filter(j => j.status === 'running').length;
  const queued = jobs.filter(j => j.status === 'queued').length;
  const done = jobs.filter(j => j.status === 'done').length;
  const statusColor = { running: 'var(--green)', queued: 'var(--sun)', done: 'var(--sky)', error: '#b14a26' };

  const runSampleJob = (sample) => {
    setShowForm(false);
    runJob(sample, {
      gridPrice: wt.homeStats?.gridPrice ?? null,
      carbonScore: wt.homeStats?.carbonScore ?? null,
      cleanEnergyPct: wt.homeStats?.cleanEnergyPct ?? null,
    });
  };

  return (
    <div className="anim-fadein flex flex-col flex-1 min-h-0">
      {/* Scheduler + counts */}
      <div className="flex gap-2 mb-2 flex-shrink-0">
        <div className="flex-1 eco-card-glow flex items-center gap-2 py-2 px-3">
          <LeafIcon size={13} />
          <div>
            <div className="font-display" style={{ fontSize: 11 }}>Next clean window</div>
            <div className="font-mono text-sm" style={{ color: 'var(--green)' }}>1h 42m</div>
          </div>
        </div>
        {[{ l: 'Run', v: running, c: 'var(--green)' }, { l: 'Queue', v: queued, c: 'var(--sun)' }, { l: 'Done', v: done, c: 'var(--sky)' }].map((s, i) => (
          <div key={i} className="eco-card text-center py-2 px-2">
            <div className="font-display text-base" style={{ color: s.c }}>{s.v}</div>
            <div className="font-mono" style={{ fontSize: 9, color: 'var(--muted)' }}>{s.l}</div>
          </div>
        ))}
      </div>

      {plannerNote && (
        <div className="eco-card mb-2 py-1.5 px-2" style={{ fontSize: 10 }}>
          <span className="font-mono" style={{ color: 'var(--green)' }}>🧠 Planner: </span>
          <span className="font-mono" style={{ color: 'var(--muted)' }}>{plannerNote}</span>
        </div>
      )}

      {/* Job list — scrollable area */}
      <div className="flex-1 min-h-0 overflow-y-auto" style={{ scrollbarWidth: 'none', paddingBottom: 70, marginTop: plannerNote ? 0 : 6 }}>
        {jobs.length === 0 && (
          <div className="eco-card grain text-center flex flex-col items-center justify-center" style={{ minHeight: 'clamp(220px, 48vh, 420px)' }}>
            <div className="font-display text-sm mb-1" style={{ color: 'var(--muted)' }}>No jobs yet</div>
            <div className="font-mono" style={{ fontSize: 10, color: 'var(--muted)' }}>Tap + to run a sample AI job via Groq</div>
          </div>
        )}
        {jobs.map(job => (
          <div key={job.id} className="eco-card grain vine-left pl-4" style={{ padding: '8px 12px 8px 14px', cursor: 'pointer', marginBottom: 8 }}
            onClick={() => setExpandedJob(expandedJob === job.id ? null : job.id)}>
            <div className="flex justify-between items-center">
              <div>
                <span className="font-display" style={{ fontSize: 12 }}>{job.name}</span>
                <div className="font-mono" style={{ fontSize: 9, color: 'var(--muted)' }}>
                  {job.type} · {job.power} · {job.carbon}
                  {job.tokens > 0 && ` · ${job.tokens} tokens`}
                  {job.source && ` · ${job.source}`}
                </div>
              </div>
              <span className="font-mono" style={{ fontSize: 10, color: statusColor[job.status], fontWeight: 600 }}>
                {job.status === 'running' ? 'Running' : job.status === 'queued' ? 'Queued' : job.status === 'error' ? 'Error' : 'Completed'}
              </span>
            </div>
            {job.status === 'running' && (
              <div className="eco-progress mt-1">
                <div className="eco-progress-fill" style={{ width: `${job.progress}%`, background: 'linear-gradient(90deg, var(--green), var(--green-soft))' }} />
              </div>
            )}
            {expandedJob === job.id && job.result && (
              <div className="mt-2 anim-fadein" style={{
                background: 'rgba(46,125,62,0.06)',
                borderRadius: 8,
                padding: '8px 10px',
                borderLeft: '2px solid var(--green)',
              }}>
                <div className="font-mono" style={{ fontSize: 9, color: 'var(--green)', marginBottom: 3, fontWeight: 600 }}>AI Output</div>
                <div className="font-mono" style={{ fontSize: 10, color: 'var(--text)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{job.result}</div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* New job modal / sheet */}
      {showForm && (
        <div style={{
          position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 10,
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        }} onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}>
          <div className="anim-fadein" style={{
            background: 'var(--card-bg, rgba(255,255,255,0.92))',
            backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '16px 16px 0 0',
            padding: '16px 16px 24px',
            width: '100%',
            maxHeight: '60%',
            overflowY: 'auto',
            boxShadow: '0 -4px 24px rgba(0,0,0,0.15)',
          }}>
            <div className="flex justify-between items-center mb-3">
              <span className="font-display text-sm">Run AI Job</span>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--muted)' }}>✕</button>
            </div>
            <div className="font-mono mb-3" style={{ fontSize: 10, color: 'var(--muted)' }}>
              Sample jobs powered by Groq (LLaMA 3.3 70B). Tap to run.
            </div>
            {SAMPLE_JOBS.map(sample => (
              <button key={sample.id}
                className="eco-card grain w-full text-left mb-2 flex items-center gap-3"
                style={{ padding: '10px 12px', cursor: 'pointer', border: 'none', transition: 'transform 100ms' }}
                onClick={() => runSampleJob(sample)}
              >
                <span style={{ fontSize: 22 }}>{sample.icon}</span>
                <div className="flex-1">
                  <div className="font-display" style={{ fontSize: 12 }}>{sample.name}</div>
                  <div className="font-mono" style={{ fontSize: 9, color: 'var(--muted)' }}>{sample.type} · {sample.desc}</div>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round"><polygon points="5 3 19 12 5 21 5 3" /></svg>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Floating + button — bottom center */}
      <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', zIndex: 5 }}>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            width: 52, height: 52, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--green), #3a7d44)',
            border: 'none', cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(46,125,62,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'transform 200ms, box-shadow 200ms',
            transform: showForm ? 'rotate(45deg)' : 'rotate(0deg)',
          }}
        >
          <PlusIcon size={24} color="white" />
        </button>
      </div>
    </div>
  );
}

/* ── Available Jobs ── */
function AvailableJobsView() {
  const { center } = useLocation();
  const wt = useWattTimeData(center);
  const { runJob } = useJobs();
  const [runningId, setRunningId] = useState(null);

  const handleRun = (avJob) => {
    if (runningId) return;
    setRunningId(avJob.id);
    // Map available job to a sample-compatible shape for runJob
    const sample = {
      id: avJob.id,
      name: avJob.name,
      type: avJob.category,
      icon: avJob.icon,
      desc: avJob.desc,
    };
    runJob(sample, {
      gridPrice: wt.homeStats?.gridPrice ?? null,
      carbonScore: wt.homeStats?.carbonScore ?? null,
      cleanEnergyPct: wt.homeStats?.cleanEnergyPct ?? null,
    });
    setTimeout(() => setRunningId(null), 1500);
  };

  const totalEarnings = AVAILABLE_JOBS.reduce((sum, j) => sum + j.pay, 0);

  return (
    <div className="anim-fadein flex flex-col flex-1 min-h-0">
      {/* Summary bar */}
      <div className="flex gap-2 mb-2 flex-shrink-0">
        {[
          { l: 'Available', v: AVAILABLE_JOBS.length, c: 'var(--green)' },
          { l: 'Potential', v: `$${totalEarnings.toFixed(2)}`, c: 'var(--sun)' },
          { l: 'Categories', v: [...new Set(AVAILABLE_JOBS.map(j => j.category))].length, c: 'var(--sky)' },
        ].map((s, i) => (
          <div key={i} className="flex-1 text-center py-1.5" style={{
            background: 'rgba(205,196,178,0.65)',
            backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: 'var(--radius-card)',
            boxShadow: 'var(--shadow-card)',
          }}>
            <div className="font-mono text-sm" style={{ color: s.c, fontWeight: 600 }}>{s.v}</div>
            <div className="font-mono" style={{ fontSize: 8, color: 'var(--muted)' }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Job cards list */}
      <div className="flex-1 min-h-0 overflow-y-auto" style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch', paddingBottom: 96 }}>
        {AVAILABLE_JOBS.map(job => {
          const sev = severityColors[job.severity] || severityColors.Low;
          const isLaunching = runningId === job.id;
          return (
            <div key={job.id} className="eco-card grain" style={{ padding: '10px 12px', marginBottom: 8, transition: 'transform 150ms', transform: isLaunching ? 'scale(0.98)' : 'scale(1)' }}>
              {/* Top row: icon + name + pay */}
              <div className="flex items-start gap-2.5 mb-1.5">
                <div style={{
                  width: 34, height: 34, borderRadius: 10,
                  background: 'rgba(46,125,62,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, flexShrink: 0,
                }}>
                  {job.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-display" style={{ fontSize: 12, lineHeight: 1.3 }}>{job.name}</div>
                  <div className="font-mono" style={{ fontSize: 9, color: 'var(--muted)', lineHeight: 1.4 }}>{job.desc}</div>
                </div>
                <div className="text-right flex-shrink-0" style={{ marginLeft: 4 }}>
                  <div className="font-mono" style={{ fontSize: 14, fontWeight: 700, color: 'var(--green)', lineHeight: 1 }}>${job.pay.toFixed(2)}</div>
                  <div className="font-mono" style={{ fontSize: 8, color: 'var(--muted)' }}>reward</div>
                </div>
              </div>

              {/* Meta row: severity, category, time, tags */}
              <div className="flex items-center gap-1.5 mb-2" style={{ flexWrap: 'wrap' }}>
                <span className="font-mono" style={{
                  fontSize: 9, padding: '2px 6px', borderRadius: 6,
                  background: sev.bg, color: sev.text, fontWeight: 600,
                }}>{job.severity}</span>
                <span className="font-mono" style={{
                  fontSize: 9, padding: '2px 6px', borderRadius: 6,
                  background: 'rgba(46,139,150,0.08)', color: 'var(--sky)',
                }}>{job.category}</span>
                <span className="font-mono" style={{
                  fontSize: 9, padding: '2px 6px', borderRadius: 6,
                  background: 'rgba(140,130,115,0.08)', color: 'var(--muted)',
                }}>⏱ {job.estTime}</span>
                {job.tags.map(t => (
                  <span key={t} className="font-mono" style={{
                    fontSize: 8, padding: '1px 5px', borderRadius: 4,
                    background: 'rgba(46,125,62,0.05)', color: 'var(--muted)',
                  }}>#{t}</span>
                ))}
              </div>

              {/* Run button */}
              <button
                onClick={() => handleRun(job)}
                disabled={!!runningId}
                style={{
                  width: '100%', padding: '7px 0',
                  borderRadius: 10, border: 'none', cursor: isLaunching ? 'default' : 'pointer',
                  background: isLaunching
                    ? 'rgba(46,125,62,0.15)'
                    : 'linear-gradient(135deg, var(--green), #3a7d44)',
                  color: isLaunching ? 'var(--green)' : 'white',
                  fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 500,
                  transition: 'all 150ms',
                  boxShadow: isLaunching ? 'none' : '0 2px 8px rgba(46,125,62,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >
                {isLaunching ? (
                  <>
                    <span className="inline-block w-3 h-3 border-2 rounded-full" style={{ borderColor: 'var(--green)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
                    Launching…
                  </>
                ) : (
                  <>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                    Run Job
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Main ── */
export default function JobsTab() {
  const [subTab, setSubTab] = useState('jobs');

  return (
    <div className="tab-page frosted-page" style={{ position: 'relative' }}>
      {/* Sub-tab switcher */}
      <div className="flex gap-0 mb-2 p-0.5 rounded-full flex-shrink-0" style={{ background: 'rgba(195,186,168,0.6)', border: '1px solid rgba(180,170,148,0.4)', position: 'relative', zIndex: 1, backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}>
        {['jobs', 'available'].map(t => (
          <button key={t} className="flex-1 py-1.5 rounded-full font-mono text-xs transition-all"
            style={{ background: subTab === t ? 'var(--green)' : 'transparent', color: subTab === t ? 'white' : 'var(--muted)', border: 'none', cursor: 'pointer',
              boxShadow: subTab === t ? '0 1px 4px rgba(46,125,62,0.25)' : 'none' }}
            onClick={() => setSubTab(t)}>
            {t === 'jobs' ? 'My Jobs' : 'Available Jobs'}
          </button>
        ))}
      </div>

      {subTab === 'jobs' ? <AIJobsView /> : <AvailableJobsView />}
    </div>
  );
}
