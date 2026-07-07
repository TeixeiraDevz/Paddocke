import { COMPLETED_TASK_RETENTION_DAYS, STORAGE_KEY } from "./app-config.js";
import { createInitialState } from "./initial-state.js";

export function pruneCompletedTasks(targetState) {
  const cutoff = Date.now() - COMPLETED_TASK_RETENTION_DAYS * 24 * 60 * 60 * 1000;
  const before = targetState.tasks.length;
  targetState.tasks = targetState.tasks.filter((task) => {
    if (!task.completed || !task.completedAt) return true;
    return new Date(task.completedAt).getTime() >= cutoff;
  });
  return before - targetState.tasks.length;
}

export function normalizeState(stored = {}) {
  const initial = createInitialState();
  const normalized = {
    ...initial,
    ...stored,
    notifications: { ...initial.notifications, ...(stored.notifications || {}) },
    xpLedger: { ...initial.xpLedger, ...(stored.xpLedger || {}) },
    profile: { ...initial.profile, ...(stored.profile || {}) },
    focusHistory: Array.isArray(stored.focusHistory) ? stored.focusHistory : initial.focusHistory,
    focusSessionDetails: Array.isArray(stored.focusSessionDetails) ? stored.focusSessionDetails : initial.focusSessionDetails,
    taskCompletionHistory: Array.isArray(stored.taskCompletionHistory) ? stored.taskCompletionHistory : initial.taskCompletionHistory
  };

  normalized.tasks = Array.isArray(stored.tasks) ? stored.tasks : initial.tasks;
  normalized.tasks = normalized.tasks.map((task) => ({
    ...task,
    completed: Boolean(task.completed),
    completedAt: task.completedAt || null,
    xpAwardedAt: task.xpAwardedAt || null
  }));
  normalized.xp = Math.max(0, Number(normalized.xp || 0));

  Object.keys(normalized.xpLedger).forEach((key) => {
    if (!Array.isArray(normalized.xpLedger[key])) normalized.xpLedger[key] = [];
  });

  pruneCompletedTasks(normalized);
  return normalized;
}

export function loadState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : {};
    return normalizeState(parsed);
  } catch {
    return normalizeState();
  }
}

export function persistState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
