import React, { useState } from 'react';
import CircularProgress from '../components/CircularProgress';
import { LeafIcon, PlusIcon, CheckIcon, WarnLeafIcon } from '../components/Icons';
import { jobsList as initialJobs, tasksList as initialTasks } from '../data/mock';
import useLocation from '../hooks/useLocation';
import useWattTimeData from '../hooks/useWattTimeData';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:8000';

/* ── AI Jobs ── */
function AIJobsView() {
  const { center } = useLocation();
  const wt = useWattTimeData(center);
  const [showForm, setShowForm] = useState(false);
  const [jobType, setJobType] = useState('Inference');
  const [priority, setPriority] = useState('Normal');
  const [greenOnly, setGreenOnly] = useState(true);
  const [autoPause, setAutoPause] = useState(false);
  const [jobs, setJobs] = useState(initialJobs);
  const [plannerNote, setPlannerNote] = useState('');
  const [plannerBusy, setPlannerBusy] = useState(false);

  const running = jobs.filter(j => j.status === 'running').length;
  const queued = jobs.filter(j => j.status === 'queued').length;
  const done = jobs.filter(j => j.status === 'done').length;
  const statusColor = { running: 'var(--green)', queued: 'var(--sun)', done: 'var(--sky)' };

  const handleQueue = async () => {
    setPlannerBusy(true);
    setPlannerNote('');

    let plan = null;
    try {
      const response = await fetch(`${API_BASE_URL}/api/jobs/plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobType,
          priority,
          greenOnly,
          autoPause,
          gridPrice: wt.homeStats?.gridPrice ?? null,
          carbonScore: wt.homeStats?.carbonScore ?? null,
          cleanEnergyPct: wt.homeStats?.cleanEnergyPct ?? null,
        }),
      });

      if (response.ok) {
        plan = await response.json();
        setPlannerNote(`${plan.window} · ${plan.estimatedSavings} (${plan.source})`);
      } else {
        setPlannerNote('Planner unavailable, queued with default policy.');
      }
    } catch {
      setPlannerNote('Planner offline, queued with default policy.');
    }

    setJobs([
      {
        id: Date.now(),
        name: `${jobType} Job #${jobs.length + 1}`,
        type: jobType,
        power: '0.20 kW',
        carbon: '0.01 kg',
        status: 'queued',
        progress: 0,
        planWindow: plan?.window,
      },
      ...jobs,
    ]);

    setPlannerBusy(false);
    setShowForm(false);
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
          <span className="font-mono" style={{ color: 'var(--muted)' }}>Planner: {plannerNote}</span>
        </div>
      )}

      {/* Job list — scrollable area */}
      <div className="flex-1 min-h-0 overflow-y-auto mb-2" style={{ scrollbarWidth: 'none' }}>
        {jobs.map(job => (
          <div key={job.id} className="eco-card grain mb-1.5 vine-left pl-4" style={{ padding: '7px 10px 7px 14px' }}>
            <div className="flex justify-between items-center">
              <div>
                <span className="font-display" style={{ fontSize: 12 }}>{job.name}</span>
                <div className="font-mono" style={{ fontSize: 9, color: 'var(--muted)' }}>{job.type} · {job.power} · {job.carbon}</div>
                {job.planWindow && (
                  <div className="font-mono" style={{ fontSize: 9, color: 'var(--green)' }}>Window: {job.planWindow}</div>
                )}
              </div>
              <span className="font-mono" style={{ fontSize: 10, color: statusColor[job.status] }}>
                {job.status === 'running' ? 'Running' : job.status === 'queued' ? 'Queued' : 'Done'}
              </span>
            </div>
            {job.status === 'running' && (
              <div className="eco-progress mt-1">
                <div className="eco-progress-fill" style={{ width: `${job.progress}%`, background: 'linear-gradient(90deg, var(--green), var(--green-soft))' }} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* New job toggle */}
      <div className="flex-shrink-0">
        <button onClick={() => setShowForm(!showForm)} className="font-display text-xs w-full text-left mb-1"
          style={{ color: 'var(--green)', background: 'none', border: 'none', cursor: 'pointer' }}>
          {showForm ? '− Close' : '+ Schedule New Job'}
        </button>
        {showForm && (
          <div className="eco-card grain anim-fadein">
            <div className="flex gap-1.5 mb-2">
              {['Inference', 'Embedding', 'Vision'].map(t => (
                <button key={t} className={`eco-chip flex-1 ${jobType === t ? 'active' : ''}`} onClick={() => setJobType(t)}>{t}</button>
              ))}
            </div>
            <div className="flex gap-1.5 mb-2">
              {['Low', 'Normal', 'High'].map(p => (
                <button key={p} className={`eco-chip flex-1 ${priority === p ? 'active' : ''}`} onClick={() => setPriority(p)}>{p}</button>
              ))}
            </div>
            <div className="flex justify-between items-center mb-1.5">
              <span className="font-mono" style={{ fontSize: 11 }}>Clean energy only</span>
              <button className={`eco-toggle ${greenOnly ? 'active' : ''}`} onClick={() => setGreenOnly(!greenOnly)} />
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-mono" style={{ fontSize: 11 }}>Auto-pause &gt; $0.20</span>
              <button className={`eco-toggle ${autoPause ? 'active' : ''}`} onClick={() => setAutoPause(!autoPause)} />
            </div>
            <button className="eco-btn eco-btn-primary w-full" style={{ padding: '8px 16px', fontSize: 13, opacity: plannerBusy ? 0.7 : 1 }} onClick={handleQueue} disabled={plannerBusy}>
              {plannerBusy ? 'Planning…' : 'Queue Job'}
            </button>
          </div>
        )}
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
      <h2 className="font-display text-base font-light mb-2 flex-shrink-0" style={{ position: 'relative', zIndex: 1 }}>Jobs & Tasks</h2>

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
