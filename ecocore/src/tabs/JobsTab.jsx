import React, { useState } from 'react';
import CircularProgress from '../components/CircularProgress';
import { LeafIcon, PlusIcon, CheckIcon, WarnLeafIcon } from '../components/Icons';
import { tasksList as initialTasks } from '../data/mock';
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

/* ── AI Jobs ── */
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
      <div className="flex-1 min-h-0 overflow-y-auto" style={{ scrollbarWidth: 'none', paddingBottom: 70 }}>
        {jobs.length === 0 && (
          <div className="eco-card grain text-center py-6">
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
            {/* Expanded result */}
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

/* ── Tasks ── */
function TasksView() {
  const [tasks, setTasks] = useState(initialTasks);
  const [newTask, setNewTask] = useState('');
  const completed = tasks.filter(t => t.done).length;
  const pct = Math.round((completed / tasks.length) * 100);
  const hasUrgent = tasks.some(t => t.urgent && !t.done);

  const toggleTask = (id) => setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const addTask = () => {
    if (!newTask.trim()) return;
    setTasks([...tasks, { id: Date.now(), name: newTask, category: 'General', due: 'Today', done: false, urgent: false }]);
    setNewTask('');
  };

  return (
    <div className="anim-fadein flex flex-col flex-1 min-h-0">
      {/* Progress + urgent */}
      <div className="flex items-center gap-3 mb-2 flex-shrink-0">
        <CircularProgress pct={pct} size={70} />
        <div className="flex-1">
          <div className="font-display text-sm mb-1">Today's Progress</div>
          <div className="font-mono text-xs" style={{ color: 'var(--muted)' }}>{completed} of {tasks.length} complete</div>
          {hasUrgent && (
            <div className="eco-pill mt-1" style={{ background: 'rgba(201,139,26,0.1)', color: 'var(--sun)' }}>
              <WarnLeafIcon size={12} />
              <span className="font-mono" style={{ fontSize: 10 }}>Urgent tasks pending</span>
            </div>
          )}
        </div>
      </div>

      {/* Task list */}
      <div className="flex-1 min-h-0 overflow-y-auto mb-2" style={{ scrollbarWidth: 'none' }}>
        {tasks.map(task => (
          <div key={task.id} className={`flex items-center gap-2.5 py-2 px-1.5 border-b cursor-pointer ${task.done ? 'task-done' : ''}`}
            style={{ borderColor: 'var(--border)' }} onClick={() => toggleTask(task.id)}>
            <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
              style={{ border: `1.5px solid ${task.done ? 'var(--green)' : 'var(--border)'}`, background: task.done ? 'var(--green)' : 'transparent' }}>
              {task.done && <CheckIcon size={10} color="white" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-mono text-xs truncate">{task.name}</div>
              <div className="flex gap-1.5 items-center">
                <span className="font-mono px-1.5 py-0.5 rounded" style={{ fontSize: 9, background: 'rgba(46,125,62,0.08)', color: 'var(--green)' }}>{task.category}</span>
                <span className="font-mono" style={{ fontSize: 9, color: 'var(--muted)' }}>{task.due}</span>
                {task.urgent && !task.done && <span className="font-mono" style={{ fontSize: 9, color: 'var(--sun)' }}>!</span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add task */}
      <div className="flex gap-2 flex-shrink-0">
        <input className="eco-input flex-1" placeholder="Add a task..." value={newTask}
          onChange={e => setNewTask(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTask()} style={{ padding: '7px 10px', fontSize: 12 }} />
        <button className="eco-btn eco-btn-primary flex items-center justify-center" onClick={addTask} style={{ padding: '7px 12px' }}>
          <PlusIcon size={16} color="white" />
        </button>
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
        {['jobs', 'tasks'].map(t => (
          <button key={t} className="flex-1 py-1.5 rounded-full font-mono text-xs transition-all"
            style={{ background: subTab === t ? 'var(--green)' : 'transparent', color: subTab === t ? 'white' : 'var(--muted)', border: 'none', cursor: 'pointer',
              boxShadow: subTab === t ? '0 1px 4px rgba(46,125,62,0.25)' : 'none' }}
            onClick={() => setSubTab(t)}>
            {t === 'jobs' ? 'AI Jobs' : 'Tasks'}
          </button>
        ))}
      </div>

      {subTab === 'jobs' ? <AIJobsView /> : <TasksView />}
    </div>
  );
}
