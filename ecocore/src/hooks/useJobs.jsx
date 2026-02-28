import React, { createContext, useContext, useState, useCallback } from 'react';

const JobsContext = createContext(null);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:8000';

export function JobsProvider({ children }) {
  const [jobs, setJobs] = useState([]);
  const [plannerNote, setPlannerNote] = useState('');

  const runJob = useCallback(async (sample, gridInfo) => {
    const jobId = Date.now();
    const newJob = {
      id: jobId,
      name: sample.name,
      type: sample.type,
      jobType: sample.id,
      power: '0.01 kW',
      carbon: '< 0.01 kg',
      status: 'running',
      progress: 30,
      result: null,
      tokens: 0,
      source: null,
    };

    setJobs(prev => [newJob, ...prev]);
    setPlannerNote('');

    // Call the planner
    try {
      const planResp = await fetch(`${API_BASE_URL}/api/jobs/plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobType: sample.type,
          priority: 'Normal',
          greenOnly: true,
          autoPause: false,
          gridPrice: gridInfo?.gridPrice ?? null,
          carbonScore: gridInfo?.carbonScore ?? null,
          cleanEnergyPct: gridInfo?.cleanEnergyPct ?? null,
        }),
      });
      if (planResp.ok) {
        const plan = await planResp.json();
        setPlannerNote(`${plan.window} · ${plan.estimatedSavings} (${plan.source})`);
      }
    } catch {}

    // Update progress
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, progress: 60 } : j));

    // Run the actual job via Groq
    try {
      const resp = await fetch(`${API_BASE_URL}/api/jobs/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobType: sample.id }),
      });

      if (resp.ok) {
        const data = await resp.json();
        setJobs(prev => prev.map(j => j.id === jobId ? {
          ...j,
          status: 'done',
          progress: 100,
          result: data.result,
          tokens: data.tokens,
          source: data.source,
        } : j));
      } else {
        setJobs(prev => prev.map(j => j.id === jobId ? {
          ...j,
          status: 'error',
          progress: 100,
          result: `Backend error ${resp.status}`,
        } : j));
      }
    } catch (err) {
      setJobs(prev => prev.map(j => j.id === jobId ? {
        ...j,
        status: 'error',
        progress: 100,
        result: `Network error: ${err.message}`,
      } : j));
    }
  }, []);

  return (
    <JobsContext.Provider value={{ jobs, plannerNote, runJob }}>
      {children}
    </JobsContext.Provider>
  );
}

export default function useJobs() {
  const ctx = useContext(JobsContext);
  if (!ctx) throw new Error('useJobs must be used within <JobsProvider>');
  return ctx;
}
