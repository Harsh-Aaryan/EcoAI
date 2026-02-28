import React, { useState } from 'react';
import CircularProgress from '../components/CircularProgress';
import { LeafIcon, PlusIcon, CheckIcon, WarnLeafIcon } from '../components/Icons';
import { jobsList as initialJobs, tasksList as initialTasks } from '../data/mock';

/* ── AI Jobs Sub-tab ── */
function AIJobsView() {
  const [showForm, setShowForm] = useState(false);
  const [jobType, setJobType] = useState('Inference');
  const [priority, setPriority] = useState('Normal');
  const [greenOnly, setGreenOnly] = useState(true);
  const [autoPause, setAutoPause] = useState(false);
  const [jobs, setJobs] = useState(initialJobs);

  const running = jobs.filter(j => j.status === 'running').length;
  const queued = jobs.filter(j => j.status === 'queued').length;
  const done = jobs.filter(j => j.status === 'done').length;

  const statusColor = { running: 'var(--green)', queued: 'var(--sun)', done: 'var(--sky)' };

  const handleQueue = () => {
    const newJob = {
      id: Date.now(),
      name: `${jobType} Job #${jobs.length + 1}`,
      type: jobType,
      power: '0.20 kW',
      carbon: '0.01 kg',
      status: 'queued',
      progress: 0,
    };
    setJobs([newJob, ...jobs]);
    setShowForm(false);
  };

  return (
    <div className="anim-fadein">
      {/* Scheduler Intelligence */}
      <div className="eco-card grain mb-4" style={{ borderColor: 'var(--green)', borderLeftWidth: 3 }}>
        <div className="flex items-center gap-2 mb-1">
          <LeafIcon size={14} />
          <span className="font-display text-sm">Scheduler Intelligence</span>
        </div>
        <div className="font-mono text-xs" style={{ color: 'var(--muted)' }}>
          Next clean energy window in <span style={{ color: 'var(--green)' }}>1h 42m</span>
        </div>
      </div>

      {/* Summary counts */}
      <div className="flex gap-3 mb-4">
        {[
          { label: 'Running', count: running, color: 'var(--green)' },
          { label: 'Queued', count: queued, color: 'var(--sun)' },
          { label: 'Done Today', count: done, color: 'var(--sky)' },
        ].map(s => (
          <div key={s.label} className="flex-1 eco-card grain text-center py-3">
            <div className="font-display text-lg" style={{ color: s.color }}>{s.count}</div>
            <div className="font-mono text-xs" style={{ color: 'var(--muted)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Job list */}
      <div className="mb-4">
        {jobs.map(job => (
          <div
            key={job.id}
            className="eco-card grain mb-2"
            style={{ borderLeft: `3px solid ${statusColor[job.status]}`, paddingLeft: 14 }}
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="font-display text-sm">{job.name}</div>
                <div className="font-mono text-xs" style={{ color: 'var(--muted)' }}>
                  {job.type} · {job.power} · {job.carbon}
                </div>
              </div>
              <span className="font-mono text-xs" style={{ color: statusColor[job.status] }}>
                {job.status === 'running' ? 'Running' : job.status === 'queued' ? 'Queued' : 'Done'}
              </span>
            </div>
            {job.status === 'running' && (
              <div className="eco-progress mt-2">
                <div className="eco-progress-fill" style={{ width: `${job.progress}%`, background: 'var(--green)' }} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Schedule New Job */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="w-full text-left font-display text-sm mb-2"
        style={{ color: 'var(--green)', background: 'none', border: 'none', cursor: 'pointer' }}
      >
        {showForm ? '− Close' : '+ Schedule New Job'}
      </button>

      {showForm && (
        <div className="eco-card grain anim-fadein">
          <div className="mb-3">
            <div className="font-mono text-xs mb-2" style={{ color: 'var(--muted)' }}>Job Type</div>
            <div className="flex gap-2">
              {['Inference', 'Embedding', 'Vision'].map(t => (
                <button key={t} className={`eco-chip ${jobType === t ? 'active' : ''}`} onClick={() => setJobType(t)}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-3">
            <div className="font-mono text-xs mb-2" style={{ color: 'var(--muted)' }}>Priority</div>
            <div className="flex gap-2">
              {['Low', 'Normal', 'High'].map(p => (
                <button key={p} className={`eco-chip ${priority === p ? 'active' : ''}`} onClick={() => setPriority(p)}>
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center mb-3">
            <span className="font-mono text-xs" style={{ color: 'var(--text)' }}>Wait for clean energy</span>
            <button className={`eco-toggle ${greenOnly ? 'active' : ''}`} onClick={() => setGreenOnly(!greenOnly)} />
          </div>

          <div className="flex justify-between items-center mb-4">
            <span className="font-mono text-xs" style={{ color: 'var(--text)' }}>Auto-pause if price &gt; $0.20</span>
            <button className={`eco-toggle ${autoPause ? 'active' : ''}`} onClick={() => setAutoPause(!autoPause)} />
          </div>

          <button className="eco-btn eco-btn-primary w-full" onClick={handleQueue}>
            Queue Job
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Tasks Sub-tab ── */
function TasksView() {
  const [tasks, setTasks] = useState(initialTasks);
  const [newTask, setNewTask] = useState('');

  const completed = tasks.filter(t => t.done).length;
  const pct = Math.round((completed / tasks.length) * 100);
  const hasUrgent = tasks.some(t => t.urgent && !t.done);

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const addTask = () => {
    if (!newTask.trim()) return;
    setTasks([...tasks, {
      id: Date.now(),
      name: newTask,
      category: 'General',
      due: 'Today',
      done: false,
      urgent: false,
    }]);
    setNewTask('');
  };

  return (
    <div className="anim-fadein">
      {/* Progress arc */}
      <div className="flex justify-center mb-4">
        <CircularProgress pct={pct} />
      </div>

      {/* Urgent banner */}
      {hasUrgent && (
        <div className="eco-pill mb-4" style={{ background: 'rgba(251,191,36,0.12)', color: 'var(--sun)' }}>
          <WarnLeafIcon size={14} />
          <span className="font-mono text-xs">You have urgent tasks to review</span>
        </div>
      )}

      {/* Task list */}
      <div className="mb-4">
        {tasks.map(task => (
          <div
            key={task.id}
            className={`flex items-center gap-3 py-3 px-2 border-b cursor-pointer ${task.done ? 'task-done' : ''}`}
            style={{ borderColor: 'var(--border)' }}
            onClick={() => toggleTask(task.id)}
          >
            <div
              className="w-5 h-5 rounded border flex items-center justify-center flex-shrink-0"
              style={{
                borderColor: task.done ? 'var(--green)' : 'var(--border)',
                background: task.done ? 'var(--green)' : 'transparent',
              }}
            >
              {task.done && <CheckIcon size={12} color="var(--bg)" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-mono text-sm truncate">{task.name}</div>
              <div className="flex gap-2 items-center mt-1">
                <span
                  className="font-mono text-xs px-2 py-0.5 rounded"
                  style={{ background: 'rgba(74,222,128,0.1)', color: 'var(--green)' }}
                >
                  {task.category}
                </span>
                <span className="font-mono text-xs" style={{ color: 'var(--muted)' }}>{task.due}</span>
                {task.urgent && !task.done && (
                  <span className="font-mono text-xs" style={{ color: 'var(--sun)' }}>Urgent</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add task */}
      <div className="flex gap-2">
        <input
          className="eco-input flex-1"
          placeholder="Add a new task..."
          value={newTask}
          onChange={e => setNewTask(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addTask()}
        />
        <button
          className="eco-btn eco-btn-primary flex items-center justify-center"
          onClick={addTask}
          style={{ padding: '10px 14px' }}
        >
          <PlusIcon size={18} color="var(--bg)" />
        </button>
      </div>
    </div>
  );
}

/* ── Main Jobs & Tasks Tab ── */
export default function JobsTab() {
  const [subTab, setSubTab] = useState('jobs');

  return (
    <div className="tab-page">
      <h2 className="font-display text-lg font-light mb-4">Jobs & Tasks</h2>

      {/* Sub-tab switcher */}
      <div className="flex gap-0 mb-5 p-1 rounded-full" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <button
          className="flex-1 py-2 rounded-full font-mono text-sm transition-all"
          style={{
            background: subTab === 'jobs' ? 'var(--green)' : 'transparent',
            color: subTab === 'jobs' ? 'var(--bg)' : 'var(--muted)',
            border: 'none',
            cursor: 'pointer',
          }}
          onClick={() => setSubTab('jobs')}
        >
          AI Jobs
        </button>
        <button
          className="flex-1 py-2 rounded-full font-mono text-sm transition-all"
          style={{
            background: subTab === 'tasks' ? 'var(--green)' : 'transparent',
            color: subTab === 'tasks' ? 'var(--bg)' : 'var(--muted)',
            border: 'none',
            cursor: 'pointer',
          }}
          onClick={() => setSubTab('tasks')}
        >
          Tasks
        </button>
      </div>

      {subTab === 'jobs' ? <AIJobsView /> : <TasksView />}
    </div>
  );
}
