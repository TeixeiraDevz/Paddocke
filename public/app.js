const STORAGE_KEY = "paddocke-state-v1";
const FLOATING_POMODORO_POSITION_KEY = "paddocke-floating-pomodoro-position";

const categoryColors = {
  Pessoais: "#2f86ff",
  Faculdade: "#a77bff",
  Trabalho: "#57d8ff",
  Treino: "#ffad5a"
};

const pomodoroCategories = new Set(["Pessoais", "Faculdade"]);

const XP_RULES = {
  taskComplete: 10,
  pomodoroComplete: 25,
  dailyStreak: 15,
  allDailyTasks: 80,
  perfectWeek: 200,
  perfectMonth: 1000,
  maxTaskAwardsPerDay: 20,
  maxPomodoroAwardsPerDay: 16
};

const COMPLETED_TASK_RETENTION_DAYS = 7;
const ADMIN_BASE_XP = 300000;
const PROFILE_IMAGE_SOURCE_MAX_BYTES = 8 * 1024 * 1024;
const PROFILE_IMAGE_OUTPUT = {
  avatar: { width: 512, height: 512, quality: 0.88 },
  banner: { width: 1600, height: 600, quality: 0.86 }
};

const PATENTS = [
  { name: "Bronze", level: 1, xp: 0, image: "/assets/ranks/bronze.png?v=transparent", color: "#b36b2c" },
  { name: "Cobre", level: 10, xp: 2500, image: "/assets/ranks/cobre.png?v=transparent", color: "#c8783c" },
  { name: "Prata", level: 25, xp: 10000, image: "/assets/ranks/prata.png?v=transparent", color: "#9aa4ae" },
  { name: "Ouro", level: 50, xp: 30000, image: "/assets/ranks/ouro.png?v=transparent", color: "#f2b705" },
  { name: "Safira", level: 75, xp: 50000, image: "/assets/ranks/safira.png?v=transparent", color: "#1997ff" },
  { name: "Diamante", level: 100, xp: 75000, image: "/assets/ranks/diamante.png?v=transparent", color: "#168bff" },
  { name: "Diamante Vermelho", level: 150, xp: 150000, image: "/assets/ranks/diamante-vermelho.png?v=transparent", color: "#f12b2b" },
  { name: "Kwita", level: 300, xp: ADMIN_BASE_XP, image: "/assets/ranks/kwita.png?v=transparent", color: "#9b5cff" }
];

const icons = {
  "arrow-up": '<path d="m6 12 6-6 6 6"/><path d="M12 18V6"/>',
  bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/>',
  "book-open": '<path d="M12 7v14"/><path d="M3 6.8A2 2 0 0 1 5.2 5C7.4 5.2 9.3 6 12 7.5c2.7-1.5 4.6-2.3 6.8-2.5A2 2 0 0 1 21 6.8v11.6a2 2 0 0 1-2.2 2C16.6 20.2 14.7 19.4 12 18c-2.7 1.4-4.6 2.2-6.8 2.4A2 2 0 0 1 3 18.4Z"/>',
  briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  "chevron-left": '<path d="m15 18-6-6 6-6"/>',
  "chevron-right": '<path d="m9 18 6-6-6-6"/>',
  dumbbell: '<path d="M6 7v10M18 7v10M3 9v6M21 9v6M6 12h12"/>',
  flame: '<path d="M12 22c4 0 7-3 7-7 0-3-2-6-5-9 0 3-2 5-4 6 0-3-1-5-2-7-2 3-4 6-4 10 0 4 4 7 8 7Z"/><path d="M9.5 17.5c0 1.5 1 2.5 2.5 2.5s2.5-1 2.5-2.5c0-1.3-.8-2.5-2.2-3.7-.2 1.2-.9 2-1.8 2.5-.1-.8-.4-1.5-.8-2.1-.1 1.1-.2 2.1-.2 3.3Z"/>',
  "graduation-cap": '<path d="m22 10-10-5-10 5 10 5 10-5Z"/><path d="M6 12v5c3 2 9 2 12 0v-5"/><path d="M22 10v6"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
  eye: '<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5"/>',
  "eye-off": '<path d="m3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.2A11 11 0 0 1 12 5c6.5 0 10 7 10 7a15 15 0 0 1-2.1 2.8M6.6 6.6C3.7 8.3 2 12 2 12s3.5 7 10 7a10 10 0 0 0 4.1-.9"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  "log-out": '<path d="M10 17l5-5-5-5M15 12H3M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  mic: '<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0M12 17v5M8 22h8"/>',
  moon: '<path d="M20.5 14.5A8 8 0 0 1 9.5 3.5 8.5 8.5 0 1 0 20.5 14.5Z"/>',
  more: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
  pause: '<path d="M9 5v14M15 5v14"/>',
  play: '<path d="m8 5 11 7-11 7V5Z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  rotate: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H3v-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V3h4v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"/>',
  skip: '<path d="m5 5 10 7L5 19V5ZM19 5v14"/>',
  sparkles: '<path d="m12 3 1.1 3.1L16 7.5l-2.9 1.4L12 12l-1.1-3.1L8 7.5l2.9-1.4L12 3ZM19 13l.8 2.2L22 16l-2.2.8L19 19l-.8-2.2L16 16l2.2-.8L19 13ZM6 13l.8 2.2L9 16l-2.2.8L6 19l-.8-2.2L3 16l2.2-.8L6 13Z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  timer: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M9 2h6M12 2v3"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 14h10l1-14M9 7V4h6v3"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  x: '<path d="m6 6 12 12M18 6 6 18"/>'
};

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "long",
  year: "numeric"
});

const monthFormatter = new Intl.DateTimeFormat("pt-BR", {
  month: "long",
  year: "numeric"
});

const weekdayFormatter = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  day: "numeric",
  month: "long"
});

function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(date, amount) {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}

function createInitialState() {
  const today = new Date();
  const todayKey = localDateKey(today);
  const tomorrowKey = localDateKey(addDays(today, 1));
  const laterKey = localDateKey(addDays(today, 3));

  return {
    tasks: [
      {
        id: crypto.randomUUID(),
        title: "Revisar anotações de Cálculo",
        category: "Faculdade",
        date: todayKey,
        time: "09:30",
        priority: "high",
        notes: "Capítulos 3 e 4",
        completed: false,
        completedAt: null,
        xpAwardedAt: null
      },
      {
        id: crypto.randomUUID(),
        title: "Finalizar apresentação do projeto",
        category: "Trabalho",
        date: todayKey,
        time: "14:00",
        priority: "high",
        notes: "",
        completed: false,
        completedAt: null,
        xpAwardedAt: null
      },
      {
        id: crypto.randomUUID(),
        title: "Treino de superiores",
        category: "Treino",
        date: todayKey,
        time: "18:30",
        priority: "medium",
        notes: "Peito, ombro e tríceps",
        completed: false,
        completedAt: null,
        xpAwardedAt: null
      },
      {
        id: crypto.randomUUID(),
        title: "Organizar documentos pessoais",
        category: "Pessoais",
        date: tomorrowKey,
        time: "10:00",
        priority: "low",
        notes: "",
        completed: false,
        completedAt: null,
        xpAwardedAt: null
      },
      {
        id: crypto.randomUUID(),
        title: "Entregar lista de exercícios",
        category: "Faculdade",
        date: laterKey,
        time: "20:00",
        priority: "medium",
        notes: "",
        completed: false,
        completedAt: null,
        xpAwardedAt: null
      }
    ],
    xp: ADMIN_BASE_XP,
    focusSessions: 0,
    focusHistory: [],
    focusSessionDetails: [],
    taskCompletionHistory: [],
    xpLedger: {
      taskAwards: [],
      pomodoroAwards: [],
      streakBonusDates: [],
      dailyCompletionBonusDates: [],
      perfectWeekBonuses: [],
      perfectMonthBonuses: []
    },
    profile: {
      displayName: "",
      avatarUrl: "",
      bio: "Focado em evoluir 1% todos os dias.",
      location: "Brasil",
      bannerUrl: ""
    },
    streakRecord: 0,
    theme: "dark",
    notifications: {
      enabled: false,
      email: "",
      time: "07:00",
      includeCompleted: false
    }
  };
}

function loadState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : {};
    return normalizeState(parsed);
  } catch {
    return normalizeState();
  }
}

function normalizeState(stored = {}) {
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
  normalized.xp = Math.max(ADMIN_BASE_XP, Number(normalized.xp || 0));

  Object.keys(normalized.xpLedger).forEach((key) => {
    if (!Array.isArray(normalized.xpLedger[key])) normalized.xpLedger[key] = [];
  });

  pruneCompletedTasks(normalized);
  return normalized;
}

let state = loadState();
let activeCategory = "all";
let activeFilter = "today";
let searchTerm = "";
let calendarCursor = new Date();
calendarCursor.setDate(1);
let selectedDate = localDateKey();
let appInitialized = false;
let authMode = "login";
let supabaseClient = null;
let runtimeConfig = {};
let currentUser = null;
let remoteUserLoadedId = "";
let remoteSyncTimer = null;
let remoteSyncing = false;
let remoteSyncQueued = false;
let floatingPomodoroDismissed = false;
let floatingPomodoroDrag = null;
let pomodoroHistoryExpanded = false;

const pomodoro = {
  mode: "focus",
  durations: { focus: 25 * 60, short: 5 * 60, long: 15 * 60 },
  remaining: 25 * 60,
  running: false,
  timerId: null,
  endsAt: null,
  readyToComplete: false
};

function saveState(options = {}) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  if (options.syncNotifications !== false) syncNotificationData();
  if (options.syncRemote !== false) scheduleRemoteSync(options.remoteDelay);
}

function hasRemoteWorkspace() {
  return Boolean(supabaseClient && currentUser && sessionStorage.getItem("paddocke-demo-session") !== "true");
}

function taskToRow(task) {
  return {
    id: task.id,
    user_id: currentUser.id,
    title: task.title,
    category: task.category,
    due_date: task.date,
    due_time: task.time || null,
    priority: task.priority || "medium",
    notes: task.notes || "",
    completed: Boolean(task.completed),
    completed_at: task.completedAt || null,
    updated_at: new Date().toISOString()
  };
}

function rowToTask(row) {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    date: row.due_date,
    time: row.due_time ? String(row.due_time).slice(0, 5) : "",
    priority: row.priority || "medium",
    notes: row.notes || "",
    completed: Boolean(row.completed),
    completedAt: row.completed_at || null,
    xpAwardedAt: row.completed_at || null
  };
}

function getProfilePayload(user = currentUser) {
  const profile = getUserProfile(user);
  const syncedAvatar = profile.avatar?.startsWith("data:") ? null : profile.avatar;
  return {
    id: user.id,
    display_name: profile.name,
    avatar_url: syncedAvatar || null,
    xp: state.xp,
    focus_sessions: state.focusSessions,
    streak_record: state.streakRecord,
    theme: state.theme || "dark",
    updated_at: new Date().toISOString()
  };
}

function applyRemoteProfile(profile) {
  if (!profile) return;
  state.xp = Math.max(ADMIN_BASE_XP, Number(profile.xp ?? state.xp));
  state.focusSessions = Number(profile.focus_sessions ?? state.focusSessions);
  state.streakRecord = Number(profile.streak_record ?? state.streakRecord);
  if (profile.theme) state.theme = profile.theme;
  applyTheme(state.theme);
}

function applyRemoteNotificationPreferences(preferences) {
  if (!preferences) return;
  state.notifications = {
    enabled: Boolean(preferences.enabled),
    email: preferences.email || "",
    time: preferences.delivery_time ? String(preferences.delivery_time).slice(0, 5) : "07:00",
    includeCompleted: Boolean(preferences.include_completed)
  };
  updateNotificationIndicator();
}

function scheduleRemoteSync(delay = 500) {
  if (!hasRemoteWorkspace()) return;
  if (remoteSyncing) {
    remoteSyncQueued = true;
    return;
  }
  window.clearTimeout(remoteSyncTimer);
  remoteSyncTimer = window.setTimeout(syncRemoteWorkspace, delay);
}

async function syncRemoteTasks() {
  if (!hasRemoteWorkspace()) return;
  const localIds = new Set(state.tasks.map((task) => task.id));
  const { data: remoteRows, error: selectError } = await supabaseClient
    .from("tasks")
    .select("id")
    .eq("user_id", currentUser.id);
  if (selectError) throw selectError;

  const staleIds = (remoteRows || []).map((row) => row.id).filter((id) => !localIds.has(id));
  if (staleIds.length) {
    const { error } = await supabaseClient.from("tasks").delete().in("id", staleIds);
    if (error) throw error;
  }

  if (!state.tasks.length) return;
  const { error } = await supabaseClient.from("tasks").upsert(state.tasks.map(taskToRow), {
    onConflict: "id"
  });
  if (error) throw error;
}

async function syncRemoteNotificationPreferences() {
  if (!hasRemoteWorkspace()) return null;
  const preferences = state.notifications || {};
  const { error } = await supabaseClient.from("notification_preferences").upsert(
    {
      user_id: currentUser.id,
      enabled: Boolean(preferences.enabled),
      email: preferences.email || "",
      delivery_time: preferences.time || "07:00",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      updated_at: new Date().toISOString()
    },
    { onConflict: "user_id" }
  );
  if (error) throw error;
  return { saved: true };
}

async function syncRemoteWorkspace() {
  if (!hasRemoteWorkspace()) return;
  remoteSyncing = true;
  try {
    await supabaseClient.from("profiles").upsert(getProfilePayload(), { onConflict: "id" });
    await syncRemoteTasks();
    await syncRemoteNotificationPreferences();
  } catch (error) {
    console.warn("Falha ao sincronizar com Supabase:", error.message);
  } finally {
    remoteSyncing = false;
    if (remoteSyncQueued) {
      remoteSyncQueued = false;
      scheduleRemoteSync(250);
    }
  }
}

async function loadRemoteWorkspace(user) {
  if (!supabaseClient || !user || remoteUserLoadedId === user.id) return;
  currentUser = user;
  remoteUserLoadedId = user.id;

  try {
    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();
    if (profileError) throw profileError;

    if (profile) {
      applyRemoteProfile(profile);
    } else {
      const { error } = await supabaseClient.from("profiles").insert(getProfilePayload(user));
      if (error) throw error;
    }

    const { data: remoteTasks, error: tasksError } = await supabaseClient
      .from("tasks")
      .select("*")
      .eq("user_id", user.id)
      .order("due_date", { ascending: true })
      .order("due_time", { ascending: true });
    if (tasksError) throw tasksError;

    const migrationKey = `paddocke-remote-migrated-${user.id}`;
    if (remoteTasks.length) {
      state.tasks = remoteTasks.map(rowToTask);
    } else if (!localStorage.getItem(migrationKey) && state.tasks.length) {
      const { error } = await supabaseClient.from("tasks").insert(state.tasks.map(taskToRow));
      if (error) throw error;
      localStorage.setItem(migrationKey, "true");
    }

    const { data: preferences, error: preferencesError } = await supabaseClient
      .from("notification_preferences")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    if (preferencesError) throw preferencesError;
    applyRemoteNotificationPreferences(preferences);

    saveState({ syncNotifications: false, syncRemote: false });
    renderAll();
    updatePomodoroDisplay();
    updateNotificationIndicator();
    showToast("Dados da sua conta sincronizados.", "success");
  } catch (error) {
    console.warn("Falha ao carregar dados do Supabase:", error.message);
    showToast("Não consegui sincronizar com o Supabase. Mantive os dados locais.");
  }
}

function applyTheme(theme = state.theme || "dark") {
  state.theme = theme;
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  const nextTheme = theme === "dark" ? "light" : "dark";
  document.querySelectorAll("#theme-toggle, #auth-theme-toggle").forEach((toggle) => {
    toggle.dataset.icon = theme === "dark" ? "sun" : "moon";
    toggle.setAttribute("aria-label", `Ativar tema ${nextTheme === "dark" ? "escuro" : "claro"}`);
    toggle.innerHTML = icon(toggle.dataset.icon);
  });
}

function icon(name) {
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${icons[name] || ""}</svg>`;
}

function hydrateIcons(root = document) {
  root.querySelectorAll("[data-icon]").forEach((element) => {
    element.innerHTML = icon(element.dataset.icon);
  });
}

async function getRuntimeConfig() {
  if (Object.keys(runtimeConfig).length) return runtimeConfig;
  try {
    const response = await fetch("/api/config");
    runtimeConfig = response.ok ? await response.json() : {};
  } catch {
    runtimeConfig = {};
  }
  return runtimeConfig;
}

function setAuthStatus(message = "", type = "") {
  const status = document.querySelector("#auth-status");
  status.textContent = message;
  status.dataset.type = type;
  if (!message) setGoogleAuthHelp(false);
}

function setGoogleAuthHelp(visible = false) {
  const help = document.querySelector("#google-auth-help");
  if (help) help.hidden = !visible;
}

function getAuthRedirectError() {
  const sources = [window.location.search, window.location.hash.replace(/^#/, "")];
  for (const source of sources) {
    const params = new URLSearchParams(source);
    const error = params.get("error");
    const description = params.get("error_description");
    if (!error && !description) continue;

    const message = description || error || "Não foi possível concluir o login.";
    if (message.includes("Unable to exchange external code")) {
      return {
        message: "O Google autorizou, mas o Supabase não conseguiu concluir o login. Confira a configuração abaixo.",
        showGoogleHelp: true
      };
    }
    return { message, showGoogleHelp: false };
  }
  return null;
}

function clearAuthRedirectError() {
  if (!window.location.search.includes("error") && !window.location.hash.includes("error")) return;
  window.history.replaceState({}, document.title, window.location.pathname);
}

function clearAuthCallbackUrl() {
  if (window.location.pathname === "/auth/callback") {
    window.history.replaceState({}, document.title, "/");
  }
}

function normalizeAuthEmail(value) {
  return String(value || "").trim().toLocaleLowerCase("pt-BR");
}

function getFriendlyAuthError(error) {
  const message = String(error.message || error || "").trim();
  const lower = message.toLocaleLowerCase("pt-BR");
  if (!message) return "Não foi possível autenticar.";
  if (lower.includes("email rate limit") || lower.includes("rate limit")) {
    return "Muitas tentativas de cadastro ou confirmação foram feitas em pouco tempo. Aguarde alguns minutos antes de tentar novamente.";
  }
  if (lower.includes("invalid email")) {
    return "Informe um e-mail válido para continuar.";
  }
  if (lower.includes("already registered") || lower.includes("user already exists")) {
    return "Este e-mail já tem cadastro. Use Entrar ou recupere a senha.";
  }
  if (lower.includes("email not confirmed")) {
    return "Confirme seu e-mail antes de entrar. Confira sua caixa de entrada e spam.";
  }
  if (lower.includes("invalid login credentials")) {
    return "E-mail ou senha incorretos. Confira os dados e tente novamente.";
  }
  return message;
}

function setAuthLoading(loading) {
  const submit = document.querySelector("#auth-submit");
  const google = document.querySelector("#google-auth-button");
  submit.disabled = loading;
  google.disabled = loading;
  submit.textContent = loading
    ? "Aguarde..."
    : authMode === "recovery"
      ? "Salvar nova senha"
      : authMode === "login"
        ? "Entrar"
        : "Criar conta";
}

function setAuthView(mode) {
  authMode = mode;
  const isSignup = mode === "signup";
  const isRecovery = mode === "recovery";
  document.querySelector("#auth-kicker").textContent = isRecovery
    ? "RECUPERAÇÃO DE ACESSO"
    : isSignup
      ? "COMECE SUA JORNADA"
      : "BEM-VINDO DE VOLTA";
  document.querySelector("#auth-title").textContent = isRecovery
    ? "Defina uma nova senha"
    : isSignup
      ? "Crie sua conta"
      : "Entre na sua conta";
  document.querySelector("#auth-description").textContent = isRecovery
    ? "Digite sua nova senha para recuperar o acesso ao Paddocke."
    : isSignup
      ? "Comece a organizar suas tarefas de forma eficiente."
      : "Continue organizando seu dia e avançando nos seus objetivos.";
  document.querySelector("#auth-name-fields").hidden = !isSignup;
  document.querySelector("#auth-confirm-email-label").hidden = !isSignup;
  document.querySelector("#auth-terms").hidden = !isSignup;
  document.querySelector("#auth-email").closest("label").hidden = isRecovery;
  document.querySelector(".auth-tabs").hidden = isRecovery;
  document.querySelector(".auth-divider").hidden = isRecovery;
  document.querySelector("#google-auth-button").hidden = isRecovery;
  document.querySelector(".auth-switch-copy").hidden = isRecovery;
  document.querySelector("#demo-access-button").hidden = isRecovery;
  document.querySelector("#forgot-password-button").hidden = isSignup || isRecovery;
  document.querySelector("#auth-first-name").required = isSignup;
  document.querySelector("#auth-last-name").required = isSignup;
  document.querySelector("#auth-email-confirm").required = isSignup;
  document.querySelector("#auth-terms-checkbox").required = isSignup;
  document.querySelector("#auth-email").required = !isRecovery;
  document.querySelector("#auth-password").autocomplete = isSignup || isRecovery ? "new-password" : "current-password";
  document.querySelector("#auth-password").placeholder = isRecovery ? "Nova senha com mínimo de 8 caracteres" : "Mínimo de 8 caracteres";
  document.querySelector("#auth-switch-prompt").textContent = isSignup
    ? "Já tem uma conta?"
    : "Ainda não tem uma conta?";
  document.querySelector("#auth-switch-button").textContent = isSignup ? "Faça login" : "Cadastre-se";
  document.querySelectorAll("[data-auth-view]").forEach((button) => {
    const active = button.dataset.authView === mode;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", String(active));
  });
  setGoogleAuthHelp(false);
  setAuthStatus();
  setAuthLoading(false);
}
function getUserProfile(user) {
  if (!user) return { name: "Visitante", fullName: "Visitante", initials: "VI", avatar: state.profile.avatarUrl || "" };
  const metadata = user.user_metadata || {};
  const fullName = state.profile.displayName || metadata.full_name || metadata.name || user.email.split("@")[0] || "Usuário";
  const initials = fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toLocaleUpperCase("pt-BR");
  return {
    name: fullName.split(/\s+/)[0],
    fullName,
    initials: initials || "US",
    avatar: state.profile.avatarUrl || metadata.avatar_url || metadata.picture || ""
  };
}

function updateUserInterface(user) {
  const profile = getUserProfile(user);
  const avatar = document.querySelector("#profile-avatar");
  document.querySelector("#profile-name").textContent = profile.name;
  avatar.style.backgroundImage = profile.avatar ? `url("${profile.avatar}")` : "";
  avatar.classList.toggle("has-image", Boolean(profile.avatar));
  avatar.innerHTML = `${profile.avatar ? "" : escapeHtml(profile.initials)}<span class="status-dot"></span>`;
  const welcome = document.querySelector(".welcome-row h1");
  if (welcome) welcome.textContent = `Bom dia, ${profile.name}.`;
  renderProfile();
}

function showAuthScreen(message = "") {
  currentUser = null;
  document.querySelector("#app-shell").hidden = true;
  document.querySelector("#auth-shell").hidden = false;
  document.body.classList.add("auth-visible");
  if (message) setAuthStatus(message, "success");
}

function enterApp(user = null) {
  currentUser = user;
  document.querySelector("#auth-shell").hidden = true;
  document.querySelector("#app-shell").hidden = false;
  document.body.classList.remove("auth-visible");
  updateUserInterface(user);
  if (!appInitialized) initializeApp();
  if (user && supabaseClient) loadRemoteWorkspace(user);
}

async function loadSupabaseClient(config) {
  if (!config.supabaseUrl || !config.supabaseAnonKey) return null;
  try {
    const module = await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm");
    return module.createClient(config.supabaseUrl, config.supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
  } catch (error) {
    console.error("Falha ao carregar Supabase:", error);
    setAuthStatus("Não foi possível conectar ao serviço de autenticação.", "error");
    return null;
  }
}

async function submitAuth(event) {
  event.preventDefault();
  if (!supabaseClient) {
    setAuthStatus("Configure SUPABASE_URL e SUPABASE_ANON_KEY para ativar o login.", "error");
    return;
  }

  const emailInput = document.querySelector("#auth-email");
  const email = normalizeAuthEmail(emailInput.value);
  emailInput.value = email;
  const password = document.querySelector("#auth-password").value;
  setAuthStatus();

  try {
    if (authMode === "recovery") {
      setAuthLoading(true);
      const { data, error } = await supabaseClient.auth.updateUser({ password });
      if (error) throw error;
      setAuthView("login");
      setAuthStatus("Senha atualizada com sucesso.", "success");
      if (data.user) enterApp(data.user);
    } else if (authMode === "signup") {
      const firstName = document.querySelector("#auth-first-name").value.trim();
      const lastName = document.querySelector("#auth-last-name").value.trim();
      const emailConfirmInput = document.querySelector("#auth-email-confirm");
      const emailConfirm = normalizeAuthEmail(emailConfirmInput.value);
      emailConfirmInput.value = emailConfirm;
      if (email !== emailConfirm) {
        setAuthStatus("Os e-mails não conferem. Revise antes de criar a conta.", "error");
        emailConfirmInput.focus();
        return;
      }
      setAuthLoading(true);
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: `${firstName} ${lastName}`.trim()
          },
          emailRedirectTo: window.location.origin
        }
      });
      if (error) throw error;
      if (data.session) {
        enterApp(data.user);
      } else {
        setAuthStatus(`Cadastro criado para ${email}. Confirme esse e-mail para entrar.`, "success");
      }
    } else {
      setAuthLoading(true);
      const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
      if (error) throw error;
      enterApp(data.user);
    }
  } catch (error) {
    setAuthStatus(getFriendlyAuthError(error), "error");
  } finally {
    setAuthLoading(false);
  }
}

async function signInWithGoogle() {
  if (!supabaseClient) {
    setAuthStatus("Configure o Supabase para ativar a entrada com Google.", "error");
    return;
  }
  setAuthLoading(true);
  setAuthStatus("Abrindo login do Google...", "success");
  sessionStorage.setItem("paddocke-auth-mode-before-google", authMode);
  const { error } = await supabaseClient.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      scopes: "email profile",
      queryParams: {
        access_type: "offline",
        prompt: "select_account"
      }
    }
  });
  if (error) {
    setAuthStatus(getFriendlyAuthError(error), "error");
    setGoogleAuthHelp(true);
    setAuthLoading(false);
  }
}

async function resetPassword() {
  const emailInput = document.querySelector("#auth-email");
  const email = normalizeAuthEmail(emailInput.value);
  emailInput.value = email;
  if (!email) {
    setAuthStatus("Informe seu e-mail para recuperar a senha.", "error");
    document.querySelector("#auth-email").focus();
    return;
  }
  if (!supabaseClient) {
    setAuthStatus("Configure o Supabase para recuperar sua senha.", "error");
    return;
  }
  const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin
  });
  setAuthStatus(
    error ? error.message : "Enviamos o link de recuperação para seu e-mail.",
    error ? "error" : "success"
  );
}

async function logOut() {
  if (supabaseClient) await supabaseClient.auth.signOut();
  currentUser = null;
  remoteUserLoadedId = "";
  sessionStorage.removeItem("paddocke-demo-session");
  showAuthScreen("Você saiu da sua conta.");
}

function bindAuthEvents() {
  document.querySelectorAll("[data-auth-view]").forEach((button) => {
    button.addEventListener("click", () => setAuthView(button.dataset.authView));
  });
  document.querySelector("#auth-switch-button").addEventListener("click", () => {
    setAuthView(authMode === "login" ? "signup" : "login");
  });
  document.querySelector("#auth-form").addEventListener("submit", submitAuth);
  document.querySelector("#google-auth-button").addEventListener("click", signInWithGoogle);
  document.querySelector("#retry-google-auth").addEventListener("click", signInWithGoogle);
  document.querySelector("#use-email-auth").addEventListener("click", () => {
    setAuthView("login");
    setAuthStatus("Entre com e-mail e senha enquanto ajustamos o Google.", "success");
  });
  document.querySelector("#forgot-password-button").addEventListener("click", resetPassword);
  document.querySelector("#auth-theme-toggle").addEventListener("click", () => {
    applyTheme(state.theme === "dark" ? "light" : "dark");
    saveState({ syncNotifications: false });
  });
  document.querySelector("#demo-access-button").addEventListener("click", () => {
    sessionStorage.setItem("paddocke-demo-session", "true");
    enterApp();
  });
  document.querySelector("#password-toggle").addEventListener("click", (event) => {
    const input = document.querySelector("#auth-password");
    const visible = input.type === "text";
    input.type = visible ? "password" : "text";
    event.currentTarget.setAttribute("aria-label", visible ? "Mostrar senha" : "Ocultar senha");
    event.currentTarget.innerHTML = icon(visible ? "eye" : "eye-off");
  });
}

async function initializeAuth() {
  applyTheme(state.theme || "dark");
  hydrateIcons();
  bindAuthEvents();
  setAuthView("login");

  const config = await getRuntimeConfig();
  supabaseClient = await loadSupabaseClient(config);

  if (supabaseClient) {
    const redirectError = getAuthRedirectError();
    const { data } = await supabaseClient.auth.getSession();
    if (data.session.user) {
      clearAuthCallbackUrl();
      enterApp(data.session.user);
    } else {
      const previousAuthMode = sessionStorage.getItem("paddocke-auth-mode-before-google");
      if (previousAuthMode === "signup") setAuthView("signup");
      showAuthScreen();
      if (redirectError) {
        setAuthStatus(redirectError.message, "error");
        setGoogleAuthHelp(redirectError.showGoogleHelp);
        clearAuthRedirectError();
      }
    }
    supabaseClient.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session.user) {
        clearAuthCallbackUrl();
        sessionStorage.removeItem("paddocke-auth-mode-before-google");
        enterApp(session.user);
      }
      if (event === "PASSWORD_RECOVERY") {
        showAuthScreen();
        setAuthView("recovery");
        setAuthStatus("Informe sua nova senha para concluir a recuperacao.", "success");
      }
      if (event === "SIGNED_OUT") showAuthScreen();
    });
    return;
  }

  if (sessionStorage.getItem("paddocke-demo-session") === "true") {
    enterApp();
  } else {
    showAuthScreen();
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizeText(value) {
  return value
    .toLocaleLowerCase("pt-BR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function formatDisplayDate(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  const todayKey = localDateKey();
  const tomorrowKey = localDateKey(addDays(new Date(), 1));
  if (dateKey === todayKey) return "Hoje";
  if (dateKey === tomorrowKey) return "Amanhã";
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" })
    .format(date)
    .replace(".", "");
}

function formatNumber(value) {
  return new Intl.NumberFormat("pt-BR").format(value);
}

function getPatentByXp(xp = state.xp) {
  return PATENTS.reduce((current, patent) => (xp >= patent.xp ? patent : current), PATENTS[0]);
}

function getGamification() {
  const current = getPatentByXp();
  const currentIndex = PATENTS.findIndex((patent) => patent.name === current.name);
  const next = PATENTS[currentIndex + 1] || null;
  const progress = next
    ? Math.min(100, ((state.xp - current.xp) / (next.xp - current.xp)) * 100)
    : 100;
  const xpLabel = next
    ? `${formatNumber(state.xp)} / ${formatNumber(next.xp)} XP`
    : `${formatNumber(state.xp)} XP total`;
  return {
    level: current.level,
    levelXp: progress,
    rank: current.name,
    current,
    next,
    xpLabel
  };
}

function getLedgerDateCount(key, dateKey = localDateKey()) {
  const entries = state.xpLedger?.[key] || [];
  return entries.filter((entry) => localDateKey(new Date(entry)) === dateKey).length;
}

function recordXpLedger(key, timestamp = new Date().toISOString()) {
  if (!state.xpLedger) state.xpLedger = createInitialState().xpLedger;
  if (!Array.isArray(state.xpLedger[key])) state.xpLedger[key] = [];
  state.xpLedger[key].push(timestamp);
}

function addXp(amount) {
  state.xp = Math.max(ADMIN_BASE_XP, Number(state.xp || 0)) + amount;
}

function getActivityDays() {
  const days = new Set();
  state.tasks.forEach((task) => {
    if (task.completedAt) days.add(localDateKey(new Date(task.completedAt)));
  });
  (state.focusHistory || []).forEach((entry) => days.add(localDateKey(new Date(entry))));
  return days;
}

function getStreak() {
  const completionDays = getActivityDays();

  let cursor = new Date();
  if (!completionDays.has(localDateKey(cursor))) {
    cursor = addDays(cursor, -1);
  }

  let streak = 0;
  while (completionDays.has(localDateKey(cursor))) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }

  if (streak > state.streakRecord) {
    state.streakRecord = streak;
    saveState();
  }

  return streak;
}

function getFilteredTasks() {
  const today = localDateKey();
  const normalizedSearch = normalizeText(searchTerm);

  return state.tasks
    .filter((task) => activeCategory === "all" || task.category === activeCategory)
    .filter((task) => {
      if (activeFilter === "today") return task.date === today && !task.completed;
      if (activeFilter === "upcoming") return task.date > today && !task.completed;
      if (activeFilter === "completed") return task.completed;
      return true;
    })
    .filter((task) => {
      if (!normalizedSearch) return true;
      return normalizeText(`${task.title} ${task.category} ${task.notes}`).includes(normalizedSearch);
    })
    .sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      if (!a.time) return 1;
      if (!b.time) return -1;
      return a.time.localeCompare(b.time);
    });
}

function renderTasks() {
  const container = document.querySelector("#task-list");
  const tasks = getFilteredTasks();

  if (!tasks.length) {
    const messages = {
      today: ["Dia livre por aqui", "Adicione uma tarefa ou aproveite para planejar."],
      upcoming: ["Nenhuma tarefa futura", "Seu horizonte está limpo por enquanto."],
      completed: ["Nenhuma conclusão ainda", "Conclua uma tarefa e ela aparecerá aqui."]
    };
    const [title, copy] = messages[activeFilter];
    container.innerHTML = `<div class="empty-state"><strong>${title}</strong><span>${copy}</span></div>`;
    return;
  }

  container.innerHTML = tasks
    .map((task) => {
      const color = categoryColors[task.category];
      const priority = task.priority === "high" ? '<span class="priority-flag">Alta prioridade</span>' : "";
      const notes = task.notes ? `<span>${escapeHtml(task.notes)}</span>` : "";

      return `
        <article class="task-item ${task.completed ? "completed" : ""}" data-task-id="${task.id}">
          <button class="task-check" data-action="toggle-task" aria-label="${task.completed ? "Reabrir" : "Concluir"} tarefa">
            ${icon("check")}
          </button>
          <div class="task-copy">
            <span class="task-title">${escapeHtml(task.title)}</span>
            <div class="task-meta">
              <span class="category-tag" style="--category-color:${color}"><i></i>${escapeHtml(task.category)}</span>
              <span>${formatDisplayDate(task.date)}${task.time ? `, ${task.time}` : ""}</span>
              ${priority}
              ${notes}
            </div>
          </div>
          <div class="task-actions">
            ${!task.completed && pomodoroCategories.has(task.category) ? `<button class="icon-button focus-task-button" data-action="focus-task" aria-label="Iniciar Pomodoro nesta tarefa">${icon("timer")}</button>` : ""}
            <button class="icon-button" data-action="delete-task" aria-label="Excluir tarefa">${icon("trash")}</button>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderCounts() {
  const pendingTasks = state.tasks.filter((task) => !task.completed);
  const ids = {
    all: "count-all",
    Pessoais: "count-pessoais",
    Faculdade: "count-faculdade",
    Trabalho: "count-trabalho",
    Treino: "count-treino"
  };

  Object.entries(ids).forEach(([category, id]) => {
    const count =
      category === "all"
        ? pendingTasks.length
        : pendingTasks.filter((task) => task.category === category).length;
    document.querySelector(`#${id}`).textContent = count;
  });
}

function renderDailySummary() {
  const todayTasks = state.tasks.filter((task) => task.date === localDateKey() && !task.completed);
  const completedToday = state.tasks.filter(
    (task) => task.completedAt && localDateKey(new Date(task.completedAt)) === localDateKey()
  ).length;

  let copy = "Vamos transformar seus planos em progresso.";
  if (todayTasks.length === 1) copy = "Você tem 1 tarefa para concluir hoje.";
  if (todayTasks.length > 1) copy = `Você tem ${todayTasks.length} tarefas para concluir hoje.`;
  if (!todayTasks.length && completedToday) copy = "Tudo concluído por hoje. Excelente trabalho.";
  document.querySelector("#daily-summary").textContent = copy;
}

function renderGamification() {
  const { level, levelXp, rank, current, next, xpLabel } = getGamification();
  const streak = getStreak();
  const progressCard = document.querySelector(".progress-card");
  const progressRankImage = document.querySelector("#progress-rank-image");
  document.querySelector("#rank-name").textContent = rank;
  document.querySelector("#sidebar-rank").textContent = rank;
  document.querySelector("#level-pill").textContent = `NÍVEL ${level}`;
  document.querySelector("#xp-label").textContent = xpLabel;
  document.querySelector("#xp-next").textContent = next ? "Próxima patente" : "Patente máxima";
  document.querySelector("#level-bar-fill").style.width = `${levelXp}%`;
  progressCard?.style.setProperty("--rank-color", current.color);
  if (progressRankImage) {
    progressRankImage.src = current.image;
    progressRankImage.alt = `Patente ${rank}`;
    progressRankImage.classList.toggle("kwita", rank === "Kwita");
  }
  document.querySelector("#streak-value").textContent = `${streak} ${streak === 1 ? "dia" : "dias"}`;
  document.querySelector("#streak-record").textContent = state.streakRecord;
}

function startOfDay(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfWeek(date = new Date()) {
  const start = startOfDay(date);
  const mondayOffset = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - mondayOffset);
  return start;
}

function startOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function isAfterOrSame(dateValue, start) {
  return new Date(dateValue).getTime() >= start.getTime();
}

function formatFocusDuration(sessionCount) {
  const totalMinutes = sessionCount * 25;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (!hours) return `${minutes}min`;
  if (!minutes) return `${hours}h`;
  return `${hours}h ${minutes}min`;
}

function getProfileStats(start = null) {
  const taskCompletions = [
    ...(state.taskCompletionHistory || []),
    ...state.tasks.filter((task) => task.completedAt).map((task) => task.completedAt)
  ];
  const uniqueTaskCompletions = Array.from(new Set(taskCompletions));
  const completedTasks = uniqueTaskCompletions.filter((entry) => (start ? isAfterOrSame(entry, start) : true)).length;
  const focusSessions = start
    ? (state.focusHistory || []).filter((entry) => isAfterOrSame(entry, start)).length
    : Math.max(Number(state.focusSessions || 0), (state.focusHistory || []).length);
  return {
    completedTasks,
    focus: formatFocusDuration(focusSessions)
  };
}

function renderRankRoadmap() {
  const container = document.querySelector("#rank-roadmap-list");
  if (!container) return;
  const current = getPatentByXp();
  container.innerHTML = PATENTS.map((patent) => {
    const active = patent.name === current.name ? "active" : "";
    return `
      <div class="rank-roadmap-item ${active}" data-rank="${patent.name}" style="--rank-color: ${patent.color}">
        <img class="rank-roadmap-image" src="${patent.image}" alt="Patente ${patent.name}">
        <div class="rank-roadmap-copy">
          <strong>${patent.name}</strong>
          <span>Nível ${patent.level}</span>
        </div>
        <b>${formatNumber(patent.xp)} XP</b>
      </div>
    `;
  }).join("");
}

function renderProfile() {
  const profile = getUserProfile(currentUser);
  const game = getGamification();
  const now = new Date();
  const todayStats = getProfileStats(startOfDay(now));
  const weekStats = getProfileStats(startOfWeek(now));
  const monthStats = getProfileStats(startOfMonth(now));
  const totalStats = getProfileStats();
  const joinedAt = currentUser?.created_at ? new Date(currentUser.created_at) : now;
  const joinedLabel = new Intl.DateTimeFormat("pt-BR", { month: "short", year: "numeric" })
    .format(joinedAt)
    .replace(".", "");
  const profilePhoto = document.querySelector("#profile-photo");
  const profileBanner = document.querySelector("#profile-banner");
  const rankCard = document.querySelector("#open-rank-roadmap");
  const rankImage = document.querySelector("#profile-rank-image");

  if (!document.querySelector("#view-profile")) return;

  document.querySelector("#profile-full-name").textContent = profile.fullName || profile.name;
  document.querySelector("#profile-bio").textContent = state.profile.bio || "Focado em evoluir 1% todos os dias.";
  document.querySelector("#profile-location").textContent = state.profile.location || "Brasil";
  document.querySelector("#profile-joined-date").textContent = joinedLabel;
  document.querySelector("#profile-rank-name").textContent = game.rank;
  document.querySelector("#profile-rank-level").textContent = `Nível ${game.level}`;
  document.querySelector("#profile-rank-xp").textContent = game.xpLabel;
  document.querySelector("#profile-rank-fill").style.width = `${game.levelXp}%`;
  rankCard.style.setProperty("--rank-color", game.current.color);
  rankImage.src = game.current.image;
  rankImage.alt = `Patente ${game.rank}`;

  profilePhoto.style.backgroundImage = profile.avatar ? `url("${profile.avatar}")` : "";
  profilePhoto.classList.toggle("has-image", Boolean(profile.avatar));
  profilePhoto.textContent = profile.avatar ? "" : profile.initials;

  const bannerUrl = state.profile.bannerUrl || "";
  profileBanner.style.backgroundImage = bannerUrl
    ? `linear-gradient(rgba(10, 28, 52, 0.12), rgba(10, 28, 52, 0.12)), url("${bannerUrl}")`
    : "";
  profileBanner.classList.toggle("has-image", Boolean(bannerUrl));

  document.querySelector("#profile-tasks-today").textContent = todayStats.completedTasks;
  document.querySelector("#profile-focus-today").textContent = todayStats.focus;
  document.querySelector("#profile-tasks-week").textContent = weekStats.completedTasks;
  document.querySelector("#profile-focus-week").textContent = weekStats.focus;
  document.querySelector("#profile-tasks-month").textContent = monthStats.completedTasks;
  document.querySelector("#profile-focus-month").textContent = monthStats.focus;
  document.querySelector("#profile-tasks-total").textContent = totalStats.completedTasks;
  document.querySelector("#profile-focus-total").textContent = totalStats.focus;
  renderRankRoadmap();
}

function getCalendarGrid(cursor) {
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay = new Date(year, month, 1);
  const mondayOffset = (firstDay.getDay() + 6) % 7;
  const gridStart = new Date(year, month, 1 - mondayOffset);
  return Array.from({ length: 42 }, (_, index) => addDays(gridStart, index));
}

function renderMiniCalendar() {
  const container = document.querySelector("#mini-calendar");
  const days = getCalendarGrid(calendarCursor);
  const month = calendarCursor.getMonth();
  const weekdays = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"];
  const datesWithTasks = new Set(state.tasks.map((task) => task.date));

  document.querySelector("#calendar-month-label").textContent = capitalize(monthFormatter.format(calendarCursor));
  container.innerHTML =
    weekdays.map((day) => `<span class="calendar-weekday">${day}</span>`).join("") +
    days
      .map((date) => {
        const key = localDateKey(date);
        const dayTasks = state.tasks
          .filter((task) => task.date === key)
          .sort((a, b) => (a.time || "99:99").localeCompare(b.time || "99:99"));
        const classes = [
          "calendar-day",
          date.getMonth() !== month ? "outside" : "",
          key === localDateKey() ? "today" : "",
          key === selectedDate ? "selected" : "",
          datesWithTasks.has(key) ? "has-event" : ""
        ]
          .filter(Boolean)
          .join(" ");
        const tooltip = dayTasks.length
          ? `<span class="calendar-tooltip" role="tooltip"><strong>${dayTasks.length} ${dayTasks.length === 1 ? "tarefa" : "tarefas"}</strong>${dayTasks
              .slice(0, 4)
              .map(
                (task) =>
                  `<span><i style="--tooltip-color:${categoryColors[task.category]}"></i>${task.time || "Dia todo"} - ${escapeHtml(task.title)}</span>`
              )
              .join("")}</span>`
          : "";
        return `<button class="${classes}" data-date="${key}" aria-label="${dateFormatter.format(date)}${dayTasks.length ? `, ${dayTasks.length} tarefas` : ""}">${date.getDate()}${tooltip}</button>`;
      })
      .join("");

  const count = state.tasks.filter((task) => {
    const [year, taskMonth] = task.date.split("-").map(Number);
    return year === calendarCursor.getFullYear() && taskMonth - 1 === month;
  }).length;
  document.querySelector("#calendar-events-count").textContent = `${count} ${count === 1 ? "evento" : "eventos"}`;
}

function renderFullCalendar() {
  const container = document.querySelector("#full-calendar");
  const days = getCalendarGrid(calendarCursor);
  const month = calendarCursor.getMonth();
  const weekdays = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
  document.querySelector("#full-calendar-title").textContent = capitalize(monthFormatter.format(calendarCursor));

  container.innerHTML =
    weekdays.map((day) => `<div class="full-weekday">${day}</div>`).join("") +
    days
      .map((date) => {
        const key = localDateKey(date);
        const events = state.tasks
          .filter((task) => task.date === key)
          .sort((a, b) => (a.time || "99:99").localeCompare(b.time || "99:99"))
          .slice(0, 3);
        return `
          <div class="full-calendar-day ${date.getMonth() !== month ? "outside" : ""} ${key === localDateKey() ? "today" : ""} ${key === selectedDate ? "selected" : ""}" data-date="${key}">
            <time datetime="${key}">${date.getDate()}</time>
            ${events
              .map(
                (task) =>
                  `<span class="calendar-event" style="--event-color:${categoryColors[task.category]}" title="${escapeHtml(task.title)}">${task.time ? `${task.time} ` : ""}${escapeHtml(task.title)}</span>`
              )
              .join("")}
          </div>
        `;
      })
      .join("");
}

function getTasksForDate(dateKey) {
  return state.tasks
    .filter((task) => task.date === dateKey)
    .sort((a, b) => (a.time || "99:99").localeCompare(b.time || "99:99"));
}

function renderCalendarDayPanel() {
  const panel = document.querySelector("#calendar-day-panel");
  if (!panel) return;

  const dayTasks = getTasksForDate(selectedDate);
  const isPastDate = selectedDate < localDateKey();
  const title = document.querySelector("#calendar-day-panel-title");
  const copy = document.querySelector("#calendar-day-panel-copy");
  const list = document.querySelector("#calendar-day-task-list");
  const clearButton = document.querySelector("#calendar-clear-selected-day");

  title.textContent = formatDisplayDate(selectedDate);
  copy.textContent = dayTasks.length
    ? `${dayTasks.length} ${dayTasks.length === 1 ? "tarefa encontrada" : "tarefas encontradas"} nesse dia.`
    : "Nenhuma tarefa nesse dia. Você pode adicionar uma nova tarefa para essa data.";
  clearButton.hidden = !(isPastDate && dayTasks.length);
  clearButton.textContent = dayTasks.length === 1 ? "Excluir tarefa desse dia" : "Limpar dia do calendário";

  list.innerHTML = dayTasks.length
    ? dayTasks
        .map(
          (task) => `
            <article class="calendar-day-task ${task.completed ? "completed" : ""}" data-calendar-task-id="${task.id}">
              <i style="--task-color:${categoryColors[task.category] || categoryColors.Pessoais}"></i>
              <div>
                <strong>${escapeHtml(task.title)}</strong>
                <span>${task.time || "Dia todo"} · ${escapeHtml(task.category)}${task.completed ? " · Concluída" : ""}</span>
              </div>
              <div class="calendar-day-task-actions">
                <button class="ghost-button" type="button" data-calendar-action="toggle-task">
                  ${task.completed ? "Reabrir" : "Concluir"}
                </button>
                <label>
                  <span>Mover para</span>
                  <input type="date" value="${task.date}" data-calendar-move-date>
                </label>
                <button class="ghost-button" type="button" data-calendar-action="move-task">Mover</button>
                <button class="danger-button" type="button" data-calendar-action="delete-task">Excluir</button>
              </div>
            </article>
          `
        )
        .join("")
    : `<div class="calendar-day-empty">Esse dia está livre no calendário.</div>`;
}

function scrollToCalendarDayPanel() {
  window.requestAnimationFrame(() => {
    document.querySelector("#calendar-day-panel")?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  });
}

function selectCalendarDate(dateKey, options = {}) {
  selectedDate = dateKey;
  renderMiniCalendar();
  renderFullCalendar();
  renderCalendarDayPanel();
  if (options.scrollToPanel) scrollToCalendarDayPanel();
}

function clearSelectedCalendarDay() {
  clearCalendarDate(selectedDate);
}

function clearCalendarDate(dateKey) {
  const dayTasks = getTasksForDate(dateKey);
  if (!dayTasks.length || dateKey >= localDateKey()) return false;

  const label = formatDisplayDate(dateKey);
  const confirmed = window.confirm(
    `Excluir ${dayTasks.length} ${dayTasks.length === 1 ? "tarefa" : "tarefas"} de ${label} do calendário? Seu XP já conquistado será mantido.`
  );
  if (!confirmed) return false;

  const ids = new Set(dayTasks.map((task) => task.id));
  state.tasks = state.tasks.filter((task) => !ids.has(task.id));
  saveState();
  renderAll();
  renderCalendarDayPanel();
  showToast(dayTasks.length === 1 ? "Tarefa removida do calendário." : "Dia removido do calendário.", "success");
  return true;
}

function moveCalendarTask(taskId, nextDate) {
  const task = state.tasks.find((item) => item.id === taskId);
  if (!task || !nextDate) return;

  const previousDate = task.date;
  task.date = nextDate;
  saveState({ remoteDelay: 0 });
  renderAll();
  renderCalendarDayPanel();
  showToast(
    previousDate === nextDate
      ? "A tarefa já está nessa data."
      : `Tarefa movida para ${formatDisplayDate(nextDate)}.`,
    "success"
  );
}

function deleteCalendarTask(taskId) {
  const task = state.tasks.find((item) => item.id === taskId);
  if (!task) return;
  const confirmed = window.confirm(`Excluir "${task.title}" do calendário? Seu XP já conquistado será mantido.`);
  if (!confirmed) return;
  deleteTask(taskId);
}

function handleCalendarTaskAction(event) {
  const button = event.target.closest("[data-calendar-action]");
  if (!button) return;

  const item = button.closest("[data-calendar-task-id]");
  const taskId = item?.dataset.calendarTaskId;
  if (!taskId) return;

  const action = button.dataset.calendarAction;
  if (action === "toggle-task") toggleTask(taskId);
  if (action === "delete-task") deleteCalendarTask(taskId);
  if (action === "move-task") {
    const nextDate = item.querySelector("[data-calendar-move-date]")?.value;
    moveCalendarTask(taskId, nextDate);
  }
}

function renderFocusSelect() {
  const select = document.querySelector("#focus-task-select");
  const currentValue = select.value;
  const tasks = state.tasks.filter((task) => !task.completed && pomodoroCategories.has(task.category));
  const sessionsToday = (state.focusHistory || []).filter(
    (entry) => localDateKey(new Date(entry)) === localDateKey()
  ).length;
  select.innerHTML =
    '<option value="">Foco livre (sem tarefa vinculada)</option>' +
    tasks.map((task) => `<option value="${task.id}">${escapeHtml(task.title)}</option>`).join("");
  if (tasks.some((task) => task.id === currentValue)) select.value = currentValue;
  document.querySelector("#focus-sessions").textContent = sessionsToday;
}

function renderPomodoroHistory() {
  const container = document.querySelector("#pomodoro-history-list");
  if (!container) return;

  const visibleLimit = 3;
  const sessions = (state.focusSessionDetails || []).slice().reverse();
  const visibleSessions = pomodoroHistoryExpanded ? sessions : sessions.slice(0, visibleLimit);
  const remainingCount = Math.max(sessions.length - visibleLimit, 0);
  container.innerHTML = sessions.length
    ? visibleSessions
        .map((session) => {
          const time = new Intl.DateTimeFormat("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            hour: "2-digit",
            minute: "2-digit"
          }).format(new Date(session.completedAt));
          return `
            <article class="pomodoro-history-item">
              <i style="--history-color:${categoryColors[session.category] || "#2f86ff"}"></i>
              <div>
                <strong>${escapeHtml(session.taskTitle || "Foco livre")}</strong>
                <span>${time} · ${session.durationMinutes}min · +${session.xpGained || 0} XP</span>
              </div>
            </article>
          `;
        })
        .join("") +
      (remainingCount
        ? `<button class="pomodoro-history-more" id="pomodoro-history-more" type="button">
            ${pomodoroHistoryExpanded ? "Ver menos" : `Ver mais (${remainingCount})`}
          </button>`
        : "")
    : `<div class="pomodoro-history-empty">Nenhuma sessão de foco concluída ainda.</div>`;
}

function renderPomodoroAvailability() {
  const card = document.querySelector("#study-pomodoro-card");
  if (!card) return;
  const isStudySpace = pomodoroCategories.has(activeCategory);
  card.hidden = !isStudySpace;
}

function renderAll() {
  const pruned = pruneCompletedTasks();
  renderTasks();
  renderCounts();
  renderDailySummary();
  renderGamification();
  renderProfile();
  renderMiniCalendar();
  renderFullCalendar();
  renderCalendarDayPanel();
  renderFocusSelect();
  renderPomodoroHistory();
  renderPomodoroAvailability();
  if (pruned) saveState({ remoteDelay: 0 });
}

function capitalize(value) {
  return value.charAt(0).toLocaleUpperCase("pt-BR") + value.slice(1);
}

function openTaskModal(date = selectedDate || localDateKey()) {
  const modal = document.querySelector("#task-modal");
  document.querySelector("#task-form").reset();
  document.querySelector("#task-date").value = date;
  modal.showModal();
  window.setTimeout(() => document.querySelector("#task-title").focus(), 80);
}

function closeTaskModal() {
  document.querySelector("#task-modal").close();
}

function addTask(taskData, source = "manual") {
  const task = {
    id: crypto.randomUUID(),
    title: taskData.title.trim(),
    category: taskData.category || "Pessoais",
    date: taskData.date || localDateKey(),
    time: taskData.time || "",
    priority: taskData.priority || "medium",
    notes: taskData.notes || "",
    completed: false,
    completedAt: null,
    xpAwardedAt: null
  };
  state.tasks.push(task);
  saveState();
  renderAll();
  if (source === "manual") showToast("Tarefa criada com sucesso.", "success");
  return task;
}

function pruneCompletedTasks(targetState = state) {
  const cutoff = Date.now() - COMPLETED_TASK_RETENTION_DAYS * 24 * 60 * 60 * 1000;
  const before = targetState.tasks.length;
  targetState.tasks = targetState.tasks.filter((task) => {
    if (!task.completed || !task.completedAt) return true;
    return new Date(task.completedAt).getTime() >= cutoff;
  });
  return before - targetState.tasks.length;
}

function hasCompletedAllTasksForDate(dateKey) {
  const dayTasks = state.tasks.filter((task) => task.date === dateKey);
  return Boolean(dayTasks.length) && dayTasks.every((task) => task.completed);
}

function awardDailyActivityBonuses(timestamp = new Date().toISOString(), completionDateKey = localDateKey(new Date(timestamp))) {
  const dateKey = localDateKey(new Date(timestamp));
  let gained = 0;
  if (!state.xpLedger.streakBonusDates.includes(dateKey)) {
    state.xpLedger.streakBonusDates.push(dateKey);
    addXp(XP_RULES.dailyStreak);
    gained += XP_RULES.dailyStreak;
  }
  if (hasCompletedAllTasksForDate(completionDateKey) && !state.xpLedger.dailyCompletionBonusDates.includes(completionDateKey)) {
    state.xpLedger.dailyCompletionBonusDates.push(completionDateKey);
    addXp(XP_RULES.allDailyTasks);
    gained += XP_RULES.allDailyTasks;
  }
  return gained;
}

function awardTaskCompletionXp(task, timestamp = new Date().toISOString()) {
  if (task.xpAwardedAt) return { gained: 0, capped: false };
  if (getLedgerDateCount("taskAwards", localDateKey(new Date(timestamp))) >= XP_RULES.maxTaskAwardsPerDay) {
    task.xpAwardedAt = timestamp;
    return { gained: 0, capped: true };
  }
  task.xpAwardedAt = timestamp;
  recordXpLedger("taskAwards", timestamp);
  addXp(XP_RULES.taskComplete);
  const bonus = awardDailyActivityBonuses(timestamp, task.date);
  return { gained: XP_RULES.taskComplete + bonus, capped: false };
}

function toggleTask(taskId) {
  const task = state.tasks.find((item) => item.id === taskId);
  if (!task) return;
  task.completed = !task.completed;
  const completedAt = new Date().toISOString();
  let xpResult = { gained: 0, capped: false };
  task.completedAt = task.completed ? completedAt : null;
  if (task.completed) {
    state.taskCompletionHistory.push(completedAt);
    xpResult = awardTaskCompletionXp(task, completedAt);
  }
  saveState({ remoteDelay: 0 });
  renderAll();
  if (!task.completed) {
    showToast("Tarefa reaberta. Seu XP já conquistado foi mantido.");
  } else if (xpResult.capped) {
    showToast("Tarefa concluída. Limite diário de XP por tarefas atingido.", "success");
  } else {
    showToast(`+${xpResult.gained} XP. Tarefa concluída!`, "success");
  }
}

function deleteTask(taskId) {
  const task = state.tasks.find((item) => item.id === taskId);
  if (!task) return;
  state.tasks = state.tasks.filter((item) => item.id !== taskId);
  saveState();
  renderAll();
  showToast(`"${task.title}" foi excluída. Seu XP foi mantido.`);
}

function selectTaskForFocus(taskId) {
  const task = state.tasks.find((item) => item.id === taskId);
  if (!task || !pomodoroCategories.has(task.category)) {
    showToast("O Pomodoro está disponível para Pessoais / Estudos e Faculdade.");
    return;
  }
  showView("focus");
  document.querySelector("#focus-task-select").value = taskId;
  if (!pomodoro.running) startPomodoro();
}

function showView(viewName) {
  document.querySelectorAll(".view").forEach((view) => view.classList.remove("active"));
  document.querySelector(`#view-${viewName}`).classList.add("active");
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.toggle("active", item.dataset.view === viewName);
  });
  document.querySelectorAll("[data-mobile-view]").forEach((item) => {
    item.classList.toggle("active", item.dataset.mobileView === viewName);
  });
  document.querySelector("#sidebar").classList.remove("open");
  if (viewName === "calendar") renderFullCalendar();
  if (viewName === "profile") renderProfile();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function syncNotificationData() {
  const preferences = state.notifications || {
    enabled: false,
    email: "",
    time: "07:00",
    includeCompleted: false
  };
  try {
    const response = await fetch("/api/notifications/preferences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...preferences,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        tasks: state.tasks
      })
    });
    const result = await response.json();
    if (!response.ok || !result.saved) throw new Error(result.error || "Falha ao salvar notificações");
    try {
      await syncRemoteNotificationPreferences();
    } catch (error) {
      console.warn("Falha ao salvar notificações no Supabase:", error.message);
    }
    return result;
  } catch {
    // The local state remains authoritative when the notification service is offline.
    return null;
  }
}

function openNotificationModal() {
  const preferences = state.notifications || {};
  document.querySelector("#email-enabled").checked = Boolean(preferences.enabled);
  document.querySelector("#notification-email").value = preferences.email || "";
  document.querySelector("#notification-time").value = preferences.time || "07:00";
  document.querySelector("#email-include-completed").checked = Boolean(preferences.includeCompleted);
  updateNotificationFields();
  document.querySelector("#notification-modal").showModal();
}

function closeNotificationModal() {
  document.querySelector("#notification-modal").close();
}

async function saveNotificationPreferences(event) {
  event.preventDefault();
  const enabled = document.querySelector("#email-enabled").checked;
  const emailInput = document.querySelector("#notification-email");
  const timeInput = document.querySelector("#notification-time");
  const includeCompleted = document.querySelector("#email-include-completed").checked;
  const email = emailInput.value.trim();
  const time = timeInput.value;
  const status = document.querySelector("#email-integration-status");

  if (enabled && (!email || !emailInput.checkValidity())) {
    showToast("Informe um e-mail válido para ativar o resumo diário.");
    emailInput.focus();
    return;
  }
  if (enabled && !time) {
    showToast("Escolha o horário do resumo diário.");
    timeInput.focus();
    return;
  }

  const previous = state.notifications;
  state.notifications = { enabled, email, time, includeCompleted };
  saveState({ syncNotifications: false });
  status.textContent = "Salvando sua preferência...";
  const result = await syncNotificationData();

  if (!result) {
    state.notifications = previous;
    saveState({ syncNotifications: false });
    status.textContent = "Não foi possível salvar. Tente novamente.";
    showToast("A preferência não foi salva no servidor.");
    return;
  }

  updateNotificationIndicator();
  closeNotificationModal();
  showToast(
    enabled
      ? `Resumo diário ativado para ${email}, às ${time}.`
      : "Resumo diário desativado.",
    "success"
  );
}

function updateNotificationFields() {
  const enabled = document.querySelector("#email-enabled").checked;
  const emailInput = document.querySelector("#notification-email");
  const timeInput = document.querySelector("#notification-time");
  emailInput.required = enabled;
  timeInput.required = enabled;
  emailInput.setAttribute("aria-describedby", "email-integration-status");
  timeInput.setAttribute("aria-describedby", "email-integration-status");
}

function updateNotificationIndicator() {
  const button = document.querySelector("#notification-button");
  const preferences = state.notifications || {};
  button.classList.toggle("active", Boolean(preferences.enabled));
  button.classList.toggle("inactive", !preferences.enabled);
  button.title = preferences.enabled
    ? `Resumo diário ativo às ${preferences.time}`
    : "Resumo diário desativado";
  button.setAttribute(
    "aria-label",
    preferences.enabled
      ? `Configurar notificações, resumo ativo às ${preferences.time}`
      : "Configurar notificações, resumo desativado"
  );
}

async function sendTestNotificationEmail() {
  const email = document.querySelector("#notification-email").value.trim();
  const includeCompleted = document.querySelector("#email-include-completed").checked;
  const status = document.querySelector("#email-integration-status");
  if (!email) {
    showToast("Informe o e-mail que recebera o teste.");
    return;
  }

  status.textContent = "Enviando e-mail de teste...";
  try {
    const response = await fetch("/api/notifications/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        includeCompleted,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        tasks: state.tasks
      })
    });
    const result = await response.json();
    if (!response.ok || !result.sent) throw new Error(result.error || "Falha no envio");
    status.textContent = `Teste enviado para ${email}.`;
    showToast("E-mail de teste enviado. Confira sua caixa de entrada.", "success");
  } catch (error) {
    status.textContent = error.message.includes("RESEND_API_KEY")
      ? "Configure RESEND_API_KEY para enviar o teste."
      : `Não foi possível enviar: ${error.message}`;
    showToast(status.textContent);
  }
}

async function initializeIntegrations() {
  try {
    const config = await getRuntimeConfig();
    document.querySelector("#email-integration-status").textContent = config.emailConfigured
      ? "Serviço de envio conectado e pronto."
      : "O envio real requer a chave RESEND_API_KEY no servidor.";
  } catch {
    document.querySelector("#email-integration-status").textContent =
      "Não foi possível verificar o serviço de envio agora.";
  }
}

function updateClock() {
  const now = new Date();
  document.querySelector("#clock-time").textContent = now.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit"
  });
  document.querySelector("#clock-period").textContent = "AMT";
}

function getPomodoroDisplayData() {
  const minutes = Math.floor(pomodoro.remaining / 60);
  const seconds = pomodoro.remaining % 60;
  const display = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  const labels = {
    focus: pomodoro.readyToComplete ? "Tempo encerrado" : pomodoro.running ? "Foco em andamento" : "Pronto para começar",
    short: pomodoro.readyToComplete ? "Pausa encerrada" : pomodoro.running ? "Pausa em andamento" : "Pausa curta",
    long: pomodoro.readyToComplete ? "Pausa encerrada" : pomodoro.running ? "Pausa em andamento" : "Pausa longa"
  };
  const modeLabels = {
    focus: "Foco",
    short: "Pausa",
    long: "Pausa"
  };
  return { display, label: labels[pomodoro.mode], modeLabel: modeLabels[pomodoro.mode] };
}

function clampFloatingPomodoroPosition(left, top) {
  const widget = document.querySelector("#floating-pomodoro");
  if (!widget) return { left, top };
  const margin = 12;
  const rect = widget.getBoundingClientRect();
  const maxLeft = Math.max(margin, window.innerWidth - rect.width - margin);
  const maxTop = Math.max(margin, window.innerHeight - rect.height - margin);
  return {
    left: Math.min(Math.max(left, margin), maxLeft),
    top: Math.min(Math.max(top, margin), maxTop)
  };
}

function setFloatingPomodoroPosition(left, top, persist = true) {
  const widget = document.querySelector("#floating-pomodoro");
  if (!widget) return;
  const position = clampFloatingPomodoroPosition(left, top);
  widget.style.left = `${position.left}px`;
  widget.style.top = `${position.top}px`;
  widget.style.right = "auto";
  widget.style.bottom = "auto";
  if (persist) localStorage.setItem(FLOATING_POMODORO_POSITION_KEY, JSON.stringify(position));
}

function restoreFloatingPomodoroPosition() {
  try {
    const stored = JSON.parse(localStorage.getItem(FLOATING_POMODORO_POSITION_KEY) || "null");
    if (stored && Number.isFinite(stored.left) && Number.isFinite(stored.top)) {
      window.requestAnimationFrame(() => setFloatingPomodoroPosition(stored.left, stored.top, false));
    }
  } catch {
    localStorage.removeItem(FLOATING_POMODORO_POSITION_KEY);
  }
}

function updateFloatingPomodoro() {
  const widget = document.querySelector("#floating-pomodoro");
  if (!widget) return;
  const shouldShow = (pomodoro.running || pomodoro.remaining < pomodoro.durations[pomodoro.mode]) && !floatingPomodoroDismissed;
  const { display, label, modeLabel } = getPomodoroDisplayData();

  document.querySelector("#floating-pomodoro-display").textContent = display;
  document.querySelector("#floating-pomodoro-status").textContent = label;
  document.querySelector("#floating-pomodoro-mode").textContent = modeLabel;

  const toggle = document.querySelector("#floating-pomodoro-toggle");
  toggle.innerHTML = icon(pomodoro.readyToComplete ? "check" : pomodoro.running ? "pause" : "play");
  toggle.setAttribute(
    "aria-label",
    pomodoro.readyToComplete ? "Finalizar Pomodoro" : pomodoro.running ? "Pausar Pomodoro" : "Retomar Pomodoro"
  );
  widget.classList.toggle("is-hidden", !shouldShow);
}

function beginFloatingPomodoroDrag(event) {
  if (event.target.closest(".floating-pomodoro-actions")) return;
  const widget = document.querySelector("#floating-pomodoro");
  if (!widget || widget.classList.contains("is-hidden")) return;
  const rect = widget.getBoundingClientRect();
  floatingPomodoroDrag = {
    pointerId: event.pointerId,
    offsetX: event.clientX - rect.left,
    offsetY: event.clientY - rect.top
  };
  widget.classList.add("is-dragging");
  widget.setPointerCapture(event.pointerId);
}

function moveFloatingPomodoro(event) {
  if (!floatingPomodoroDrag || event.pointerId !== floatingPomodoroDrag.pointerId) return;
  event.preventDefault();
  setFloatingPomodoroPosition(event.clientX - floatingPomodoroDrag.offsetX, event.clientY - floatingPomodoroDrag.offsetY);
}

function endFloatingPomodoroDrag(event) {
  if (!floatingPomodoroDrag || event.pointerId !== floatingPomodoroDrag.pointerId) return;
  const widget = document.querySelector("#floating-pomodoro");
  widget?.classList.remove("is-dragging");
  floatingPomodoroDrag = null;
}

function setPomodoroMode(mode) {
  pomodoro.mode = mode;
  pomodoro.remaining = pomodoro.durations[mode];
  pomodoro.readyToComplete = false;
  stopPomodoro();
  document.querySelectorAll(".pomodoro-tabs button").forEach((button) => {
    button.classList.toggle("active", button.dataset.mode === mode);
  });
  updatePomodoroDisplay();
}

function startPomodoro() {
  if (pomodoro.running) return;
  if (pomodoro.readyToComplete) {
    finishPomodoro();
    return;
  }
  if (pomodoro.remaining <= 0) pomodoro.remaining = pomodoro.durations[pomodoro.mode];
  floatingPomodoroDismissed = false;
  pomodoro.readyToComplete = false;
  pomodoro.running = true;
  pomodoro.endsAt = Date.now() + pomodoro.remaining * 1000;
  pomodoro.timerId = window.setInterval(tickPomodoro, 250);
  updatePomodoroDisplay();
  showToast(pomodoro.mode === "focus" ? "Sessão de foco iniciada." : "Pausa iniciada.", "success");
}

function stopPomodoro() {
  if (pomodoro.timerId) window.clearInterval(pomodoro.timerId);
  if (pomodoro.running && pomodoro.endsAt) {
    pomodoro.remaining = Math.max(0, Math.ceil((pomodoro.endsAt - Date.now()) / 1000));
  }
  pomodoro.timerId = null;
  pomodoro.running = false;
  pomodoro.endsAt = null;
  updatePomodoroDisplay();
}

function togglePomodoro() {
  if (pomodoro.readyToComplete) {
    finishPomodoro();
    return;
  }
  if (pomodoro.running) {
    stopPomodoro();
    showToast("Sessão pausada.");
  } else {
    startPomodoro();
  }
}

function resetPomodoro() {
  stopPomodoro();
  pomodoro.readyToComplete = false;
  pomodoro.remaining = pomodoro.durations[pomodoro.mode];
  floatingPomodoroDismissed = false;
  updatePomodoroDisplay();
}

function finishPomodoro() {
  if (!pomodoro.readyToComplete || pomodoro.remaining > 0) {
    showToast("Você só pode finalizar quando o cronômetro chegar em 00:00.");
    return;
  }
  completePomodoro();
}

function tickPomodoro() {
  pomodoro.remaining = Math.max(0, Math.ceil((pomodoro.endsAt - Date.now()) / 1000));
  updatePomodoroDisplay();
  if (pomodoro.remaining <= 0) {
    if (pomodoro.timerId) window.clearInterval(pomodoro.timerId);
    pomodoro.timerId = null;
    pomodoro.running = false;
    pomodoro.endsAt = null;
    pomodoro.readyToComplete = true;
    updatePomodoroDisplay();
    showToast("Tempo encerrado. Clique em Finalizar para registrar a sessão.", "success");
  }
}

function completePomodoro() {
  const completedMode = pomodoro.mode;
  const durationMinutes = Math.round((pomodoro.durations[pomodoro.mode] || 0) / 60);
  pomodoro.readyToComplete = false;
  stopPomodoro();
  if (completedMode === "focus") {
    const timestamp = new Date().toISOString();
    const todayKey = localDateKey(new Date(timestamp));
    const canAwardPomodoro = getLedgerDateCount("pomodoroAwards", todayKey) < XP_RULES.maxPomodoroAwardsPerDay;
    const selectedTaskId = document.querySelector("#focus-task-select")?.value || "";
    const selectedTask = selectedTaskId ? state.tasks.find((task) => task.id === selectedTaskId) : null;
    state.focusSessions += 1;
    state.focusHistory.push(timestamp);
    if (canAwardPomodoro) {
      recordXpLedger("pomodoroAwards", timestamp);
      addXp(XP_RULES.pomodoroComplete);
    }
    const bonus = awardDailyActivityBonuses(timestamp);
    const xpGained = canAwardPomodoro ? XP_RULES.pomodoroComplete + bonus : bonus;
    state.focusSessionDetails.push({
      id: crypto.randomUUID(),
      completedAt: timestamp,
      durationMinutes,
      taskId: selectedTask?.id || null,
      taskTitle: selectedTask?.title || "Foco livre",
      category: selectedTask?.category || "Pessoais",
      xpGained
    });
    saveState();
    renderAll();
    showToast(
      canAwardPomodoro
        ? `+${XP_RULES.pomodoroComplete + bonus} XP. Sessão de foco concluída!`
        : "Sessão de foco concluída. Limite diário de XP por Pomodoros atingido.",
      "success"
    );
    speak("Sessão de foco concluída. Hora de respirar um pouco.");
    setPomodoroMode(state.focusSessions % 4 === 0 ? "long" : "short");
  } else {
    showToast("Pausa concluída. Vamos voltar ao foco?", "success");
    setPomodoroMode("focus");
  }
}

function updatePomodoroDisplay() {
  const { display, label } = getPomodoroDisplayData();
  const total = pomodoro.durations[pomodoro.mode];
  const progress = total ? ((total - pomodoro.remaining) / total) * 100 : 0;

  document.querySelector("#pomodoro-display").textContent = display;
  document.querySelector("#pomodoro-status").textContent = label.toLocaleUpperCase("pt-BR");
  document.querySelector("#pomodoro-ring").style.setProperty("--progress", `${progress}%`);
  document.querySelector(".timer-center span").textContent = display;

  const toggle = document.querySelector("#pomodoro-toggle");
  toggle.innerHTML = `${icon(pomodoro.readyToComplete ? "check" : pomodoro.running ? "pause" : "play")}${
    pomodoro.readyToComplete ? "Finalizar" : pomodoro.running ? "Pausar" : "Iniciar"
  }`;

  const finishButton = document.querySelector("#pomodoro-skip");
  if (finishButton) {
    finishButton.disabled = !pomodoro.readyToComplete;
    finishButton.title = pomodoro.readyToComplete
      ? "Finalizar sessão"
      : "Disponível quando o cronômetro chegar em 00:00";
  }
  document.title = pomodoro.running ? `${display} | Paddocke` : "Paddocke | Seu dia em movimento";
  updateFloatingPomodoro();
}

function showToast(message, type = "") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.querySelector("#toast-region").append(toast);
  window.setTimeout(() => {
    toast.classList.add("removing");
    window.setTimeout(() => toast.remove(), 220);
  }, 3200);
}

function parseDateFromCommand(command) {
  const normalized = normalizeText(command);
  if (normalized.includes("depois de amanha")) return localDateKey(addDays(new Date(), 2));
  if (normalized.includes("amanha")) return localDateKey(addDays(new Date(), 1));
  if (normalized.includes("hoje")) return localDateKey();

  const dateMatch = normalized.match(/\b(\d{1,2})[/-](\d{1,2})(?:[/-](\d{2,4}))\b/);
  if (dateMatch) {
    const year = dateMatch[3]
      ? Number(dateMatch[3].length === 2 ? `20${dateMatch[3]}` : dateMatch[3])
      : new Date().getFullYear();
    const date = new Date(year, Number(dateMatch[2]) - 1, Number(dateMatch[1]));
    if (!Number.isNaN(date.getTime())) return localDateKey(date);
  }

  return localDateKey();
}

function commandHasDateReference(command) {
  const normalized = normalizeText(command);
  return (
    normalized.includes("hoje") ||
    normalized.includes("amanha") ||
    normalized.includes("depois de amanha") ||
    /\b\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?\b/.test(normalized)
  );
}

function parseCategory(command) {
  const normalized = normalizeText(command);
  if (normalized.includes("faculdade") || normalized.includes("estudo")) return "Faculdade";
  if (normalized.includes("trabalho") || normalized.includes("profissional")) return "Trabalho";
  if (normalized.includes("treino") || normalized.includes("academia")) return "Treino";
  return "Pessoais";
}

function parseTime(command) {
  const normalized = normalizeText(command);
  const match = normalized.match(/\b(?:as|a|para)\s*(\d{1,2})(?::|h)(\d{2})\b/);
  if (!match) return "";
  const hour = Math.min(23, Number(match[1]));
  const minute = Math.min(59, Number(match[2] || 0));
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function findTaskFromCommand(command) {
  const normalized = normalizeText(command);
  return state.tasks
    .filter((task) => normalized.includes(normalizeText(task.title)))
    .sort((a, b) => b.title.length - a.title.length)[0];
}

function extractExplicitTaskTitleFromCommand(command) {
  const text = String(command || "").trim();
  const normalized = normalizeText(text);
  const marker = normalized.match(/\b(?:chamad[ao]|nomead[ao]|com\s+(?:o\s+)titulo|titulo|nome\s+da\s+tarefa)\s+/);
  if (!marker) return "";

  let title = text.slice(marker.index + marker[0].length).trim();
  title = title.split(/\s*,\s*(?:e\s+)(?:adicionar|adicione|colocar|coloque|criar|crie|agendar|agende)\b/i)[0];
  title = title.replace(/\s+(?:para|pra|no|na|em)\s+(?:o\s+)(?:dia|data|horario|campo|categoria)\b.*$/i, "");
  title = title.replace(/\s+(?:as|a)\s+\d{1,2}(?::|h)\d{0,2}\b.*$/i, "");
  return title.trim().replace(/^["'\u201C\u201D]|["'\u201C\u201D]$/g, "").replace(/[.!]+$/, "");
}

function extractTaskTitle(command) {
  const explicitTitleV2 = extractExplicitTaskTitleFromCommand(command);
  if (explicitTitleV2) return explicitTitleV2;

  let title = command.trim();
  const explicitTitle = title.match(
    /\b(?:chamad[ao]|nomead[ao]|com\s+(?:o\s+)titulo|t[ií]tulo|nome\s+da\s+tarefa)\s+["“”'](.+)$/i
  );
  if (explicitTitle) {
    title = explicitTitle[1];
    title = title.split(/\s*,\s*(?:e\s+)(?:adicionar|adicione|colocar|coloque|criar|crie|agendar|agende)\b/i)[0];
    title = title.replace(/\s+(?:para|pra|no|na|em)\s+(?:o\s+)(?:dia|data|hor[aá]rio|campo|categoria)\b.*$/i, "");
    title = title.replace(/\s+(?:às|as|a)\s+\d{1,2}(?::|h)\d{0,2}\b.*$/i, "");
    return title.trim().replace(/^["“”']|["“”']$/g, "").replace(/[.!]+$/, "");
  }
  title = title.replace(/^(adicione|adicionar|crie|criar|agende|agendar)\s+(uma\s+)tarefa\s*/i, "");
  title = title.replace(/^(adicione|adicionar|crie|criar|agende|agendar)\s*/i, "");
  title = title.replace(/\s+(para|pra|em)\s+(hoje|amanh[aã]|depois de amanh[aã]).*$/i, "");
  title = title.replace(/\s+(para|pra|em)\s+\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4}).*$/i, "");
  title = title.replace(/\s+(na|no|de)\s+(categoria\s+)(pessoais|faculdade|trabalho|treino|estudos).*$/i, "");
  title = title.replace(/\s+(a|às|as)\s+\d{1,2}(?::|h)\d{0,2}.*$/i, "");
  return title.trim().replace(/[.!]+$/, "");
}

function describeTasks(tasks, label) {
  if (!tasks.length) return `Você não tem tarefas ${label}.`;
  const list = tasks
    .slice(0, 6)
    .map((task, index) => `${index + 1}. ${task.title}${task.time ? `, às ${task.time}` : ""}`)
    .join(" ");
  const extra = tasks.length > 6 ? ` E mais ${tasks.length - 6}.` : "";
  return `Você tem ${tasks.length} ${tasks.length === 1 ? "tarefa" : "tarefas"} ${label}: ${list}.${extra}`;
}

function processLocalAssistantCommand(rawCommand, fromVoice = false) {
  const command = rawCommand.trim();
  const normalized = normalizeText(command);
  if (!command) return;

  let response = "";

  if (/^(adicione|adicionar|crie|criar|agende|agendar)/.test(normalized)) {
    const title = extractTaskTitle(command);
    if (title.length < 2) {
      response = "Qual é o título da tarefa que você quer criar?";
    } else {
      const task = addTask(
        {
          title,
          category: parseCategory(command),
          date: parseDateFromCommand(command),
          time: parseTime(command),
          priority: normalized.includes("prioridade alta") || normalized.includes("urgente") ? "high" : "medium"
        },
        "assistant"
      );
      response = `Pronto. Criei a tarefa ${task.title} para ${formatDisplayDate(task.date)}${task.time ? `, às ${task.time}` : ""}, em ${task.category}.`;
    }
  } else if (
    (normalized.includes("limpar") || normalized.includes("remover") || normalized.includes("apagar")) &&
    normalized.includes("calendario")
  ) {
    const date = parseDateFromCommand(command);
    const tasks = getTasksForDate(date);
    if (date >= localDateKey()) {
      response = "Por segurança, eu só limpo dias anteriores no calendário.";
    } else if (!tasks.length) {
      response = `Não encontrei tarefas em ${formatDisplayDate(date)} para remover do calendário.`;
    } else if (clearCalendarDate(date)) {
      response = `Removi ${tasks.length} ${tasks.length === 1 ? "tarefa" : "tarefas"} de ${formatDisplayDate(date)} do calendário.`;
    } else {
      response = "Limpeza cancelada.";
    }
  } else if (normalized.includes("mover") || normalized.includes("reagendar")) {
    const task = findTaskFromCommand(command);
    if (!task) {
      response = "Não encontrei essa tarefa para mover. Use o título completo.";
    } else if (!commandHasDateReference(command)) {
      response = "Para qual data você quer mover essa tarefa?";
    } else {
      const nextDate = parseDateFromCommand(command);
      moveCalendarTask(task.id, nextDate);
      response = `Movi ${task.title} para ${formatDisplayDate(nextDate)}.`;
    }
  } else if (normalized.includes("exclu") || normalized.includes("apague") || normalized.includes("remova")) {
    const task = findTaskFromCommand(command);
    if (!task) {
      response = "Não encontrei essa tarefa. Tente usar o título completo.";
    } else {
      const title = task.title;
      deleteTask(task.id);
      response = `A tarefa ${title} foi excluída.`;
    }
  } else if (normalized.includes("conclu") || normalized.includes("finaliz") || normalized.includes("feito")) {
    const task = findTaskFromCommand(command);
    if (!task) {
      response = "Não encontrei essa tarefa para concluir. Diga o título completo.";
    } else if (task.completed) {
      response = `${task.title} já está concluída.`;
    } else {
      toggleTask(task.id);
      response = `Boa. ${task.title} foi concluída e você ganhou ${XP_RULES.taskComplete} pontos de experiência.`;
    }
  } else if (
    normalized.includes("iniciar pomodoro") ||
    normalized.includes("ativar pomodoro") ||
    normalized.includes("iniciar foco") ||
    normalized.includes("modo foco")
  ) {
    showView("focus");
    startPomodoro();
    response = "Pomodoro de 25 minutos iniciado. Hora de focar.";
  } else if (normalized.includes("pausar pomodoro") || normalized.includes("pausar foco")) {
    stopPomodoro();
    response = "Pomodoro pausado.";
  } else if (normalized.includes("reiniciar pomodoro") || normalized.includes("resetar pomodoro")) {
    resetPomodoro();
    response = "Pomodoro reiniciado para 25 minutos.";
  } else if (normalized.includes("calendario")) {
    const date = parseDateFromCommand(command);
    selectedDate = date;
    calendarCursor = new Date(`${date}T00:00:00`);
    calendarCursor.setDate(1);
    showView("calendar");
    selectCalendarDate(date, { scrollToPanel: true });
    response = `Abri seu calendário em ${formatDisplayDate(date)}.`;
  } else if (normalized.includes("nivel") || normalized.includes("experiencia") || normalized.includes("patente")) {
    const game = getGamification();
    response = `Você está no nível ${game.level}, patente ${game.rank}, com ${state.xp} pontos de experiência no total.`;
  } else if (
    normalized.includes("tarefas") ||
    normalized.includes("tenho para") ||
    normalized.includes("o que fazer")
  ) {
    const date = parseDateFromCommand(command);
    const tasks = state.tasks.filter((task) => task.date === date && !task.completed);
    const label =
      date === localDateKey()
        ? "para hoje"
        : date === localDateKey(addDays(new Date(), 1))
          ? "para amanhã"
          : `em ${formatDisplayDate(date)}`;
    response = describeTasks(tasks, label);
  } else if (normalized.includes("ajuda") || normalized.includes("o que voce faz")) {
    response =
      "Posso criar, concluir, excluir e listar tarefas, abrir o calendário, informar seu nível e controlar o Pomodoro. Por exemplo: crie uma tarefa estudar Cálculo para amanhã às 19 horas.";
  } else {
    response =
      "Ainda não entendi esse comando. Tente pedir para criar, concluir, excluir ou listar tarefas, ou para iniciar o Pomodoro.";
  }

  document.querySelector("#assistant-message").textContent = response;
  if (fromVoice) speak(response);
  return response;
}

function applyAssistantAction(action) {
  if (!action || action.type === "none") return;
  const matchedTask = state.tasks.find((task) => normalizeText(task.title) === normalizeText(action.title || ""));
  const taskId =
    action.taskId ||
    matchedTask?.id;

  if (action.type === "create_task" && action.title) {
    addTask(
      {
        title: action.title,
        category: pomodoroCategories.has(action.category) || ["Trabalho", "Treino"].includes(action.category)
          ? action.category
          : "Pessoais",
        date: action.date || localDateKey(),
        time: action.time || "",
        priority: action.priority || "medium",
        notes: action.notes || ""
      },
      "assistant"
    );
  }
  if (action.type === "complete_task" && taskId) toggleTask(taskId);
  if (action.type === "delete_task" && taskId) deleteTask(taskId);
  if (action.type === "move_task" && taskId && action.date) moveCalendarTask(taskId, action.date);
  if (action.type === "clear_calendar_day" && action.date) clearCalendarDate(action.date);
  if (action.type === "start_pomodoro") {
    showView("focus");
    if (taskId) document.querySelector("#focus-task-select").value = taskId;
    startPomodoro();
  }
  if (action.type === "pause_pomodoro") stopPomodoro();
  if (action.type === "reset_pomodoro") resetPomodoro();
  if (action.type === "open_calendar") {
    showView("calendar");
    if (action.date) selectCalendarDate(action.date, { scrollToPanel: true });
  }
}

async function processAssistantCommand(rawCommand, fromVoice = false) {
  const command = rawCommand.trim();
  if (!command) return "";
  setAssistantCollapsed(false);

  const message = document.querySelector("#assistant-message");
  const status = document.querySelector("#voice-status");
  const commandInput = document.querySelector("#assistant-command-input");
  const commandSubmit = document.querySelector("#assistant-command-form button[type='submit']");
  if (commandInput) commandInput.disabled = true;
  if (commandSubmit) commandSubmit.disabled = true;
  message.textContent = "Pensando...";
  status.textContent = "A inteligência do Paddocke está analisando seu pedido.";

  try {
    const response = await fetch("/api/assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        command,
        today: localDateKey(),
        tasks: state.tasks,
        profile: getGamification()
      })
    });
    if (!response.ok) throw new Error("assistant unavailable");
    const result = await response.json();
    if (!result.ai) throw new Error("AI not configured");
    applyAssistantAction(result.action);
    message.textContent = result.reply;
    status.textContent = "Resposta gerada pela IA.";
    if (fromVoice) speak(result.reply);
    return result.reply;
  } catch {
    status.textContent = "Modo inteligente local ativo.";
    return processLocalAssistantCommand(command, fromVoice);
  } finally {
    if (commandInput) commandInput.disabled = false;
    if (commandSubmit) commandSubmit.disabled = false;
    if (!fromVoice && commandInput) commandInput.focus();
  }
}

function submitAssistantCommand(event) {
  event.preventDefault();
  setAssistantCollapsed(false);
  const input = document.querySelector("#assistant-command-input");
  const command = input.value.trim();
  if (!command) {
    input.focus();
    return;
  }
  input.value = "";
  processAssistantCommand(command);
}

function setAssistantCollapsed(collapsed, options = {}) {
  const card = document.querySelector("#assistant-card");
  const toggle = document.querySelector("#assistant-float-toggle");
  if (!card || !toggle) return;
  card.classList.toggle("is-collapsed", collapsed);
  card.classList.toggle("is-awake", !collapsed);
  toggle.classList.toggle("is-awake", !collapsed);
  toggle.setAttribute("aria-expanded", String(!collapsed));
  toggle.setAttribute(
    "aria-label",
    collapsed ? "Abrir assistente de voz Paddocke" : "Recolher assistente Paddocke"
  );
  if (!collapsed) {
    window.requestAnimationFrame(() => document.querySelector("#assistant-command-input")?.focus());
    if (options.startVoice) startVoiceRecognition();
  }
}

function toggleAssistantFloat() {
  const card = document.querySelector("#assistant-card");
  if (!card) return;
  setAssistantCollapsed(!card.classList.contains("is-collapsed"), { startVoice: true });
}

function speak(text) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "pt-BR";
  utterance.rate = 1.02;
  window.speechSynthesis.speak(utterance);
}

function startVoiceRecognition() {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const button = document.querySelector("#voice-button");
  const status = document.querySelector("#voice-status");

  if (!Recognition) {
    status.textContent = "Reconhecimento de voz não disponível neste navegador.";
    showToast("Use Chrome ou Edge para comandos de voz.");
    return;
  }

  const recognition = new Recognition();
  recognition.lang = "pt-BR";
  recognition.interimResults = false;
  recognition.continuous = false;
  button.classList.add("listening");
  status.textContent = "Ouvindo... diga seu comando.";
  recognition.start();

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    status.textContent = `Entendi: "${transcript}"`;
    processAssistantCommand(transcript, true);
  };

  recognition.onerror = () => {
    status.textContent = "Não consegui ouvir. Tente novamente.";
  };

  recognition.onend = () => {
    button.classList.remove("listening");
  };
}

function exportCalendar() {
  const escapeIcs = (value) =>
    String(value).replaceAll("\\", "\\\\").replaceAll(",", "\\,").replaceAll(";", "\\;").replaceAll("\n", "\\n");
  const toIcsDate = (task) => {
    const compactDate = task.date.replaceAll("-", "");
    if (!task.time) return { start: `DTSTART;VALUE=DATE:${compactDate}`, end: "" };
    const compactTime = task.time.replace(":", "") + "00";
    const endDate = new Date(`${task.date}T${task.time}:00`);
    endDate.setHours(endDate.getHours() + 1);
    const endKey = `${localDateKey(endDate).replaceAll("-", "")}T${String(endDate.getHours()).padStart(2, "0")}${String(endDate.getMinutes()).padStart(2, "0")}00`;
    return { start: `DTSTART:${compactDate}T${compactTime}`, end: `DTEND:${endKey}` };
  };

  const events = state.tasks
    .map((task) => {
      const dates = toIcsDate(task);
      return [
        "BEGIN:VEVENT",
        `UID:${task.id}@paddocke.local`,
        `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")}`,
        dates.start,
        dates.end,
        `SUMMARY:${escapeIcs(task.title)}`,
        `DESCRIPTION:${escapeIcs(task.notes || `Categoria: ${task.category}`)}`,
        "END:VEVENT"
      ]
        .filter(Boolean)
        .join("\r\n");
    })
    .join("\r\n");

  const content = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Paddocke//PT-BR", "CALSCALE:GREGORIAN", events, "END:VCALENDAR"].join("\r\n");
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "paddocke-calendario.ics";
  anchor.click();
  URL.revokeObjectURL(url);
  showToast("Calendário exportado. Importe o arquivo no Google Calendar.", "success");
}

function editProfileInfo() {
  const currentProfile = getUserProfile(currentUser);
  document.querySelector("#profile-display-name-input").value =
    state.profile.displayName || currentProfile.fullName || "";
  document.querySelector("#profile-bio-input").value = state.profile.bio || "";
  document.querySelector("#profile-location-input").value = state.profile.location || "";
  document.querySelector("#profile-edit-modal").showModal();
}

function closeProfileInfoModal() {
  document.querySelector("#profile-edit-modal").close();
}

function saveProfileInfo(event) {
  event.preventDefault();
  const displayName = document.querySelector("#profile-display-name-input").value.trim();
  const bio = document.querySelector("#profile-bio-input").value.trim();
  const location = document.querySelector("#profile-location-input").value.trim();

  state.profile.displayName = displayName;
  state.profile.bio = bio || "Focado em evoluir 1% todos os dias.";
  state.profile.location = location || "Brasil";
  saveState();
  updateUserInterface(currentUser);
  renderAll();
  closeProfileInfoModal();
  showToast("Perfil atualizado.", "success");
}

function editProfileImage(kind) {
  const input = document.querySelector(kind === "banner" ? "#banner-file-input" : "#avatar-file-input");
  input?.click();
}

function resizeProfileImage(file, kind) {
  const settings = PROFILE_IMAGE_OUTPUT[kind] || PROFILE_IMAGE_OUTPUT.avatar;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read-error"));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("image-error"));
      image.onload = () => {
        const scale = Math.min(settings.width / image.width, settings.height / image.height, 1);
        const width = Math.max(1, Math.round(image.width * scale));
        const height = Math.max(1, Math.round(image.height * scale));
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        canvas.width = width;
        canvas.height = height;
        context.drawImage(image, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", settings.quality));
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

async function handleProfileImageFile(event, kind) {
  const input = event.currentTarget;
  const file = input.files?.[0];
  input.value = "";
  if (!file) return;

  if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
    showToast("Use uma imagem em PNG, JPG ou WebP.", "error");
    return;
  }

  if (file.size > PROFILE_IMAGE_SOURCE_MAX_BYTES) {
    showToast("Escolha uma imagem de até 8 MB.", "error");
    return;
  }

  const previousAvatar = state.profile.avatarUrl;
  const previousBanner = state.profile.bannerUrl;

  try {
    const dataUrl = await resizeProfileImage(file, kind);
    if (kind === "banner") state.profile.bannerUrl = dataUrl;
    else state.profile.avatarUrl = dataUrl;
    saveState({ syncRemote: false });
    updateUserInterface(currentUser);
    renderAll();
    showToast(kind === "banner" ? "Capa atualizada." : "Foto de perfil atualizada.", "success");
  } catch {
    state.profile.avatarUrl = previousAvatar;
    state.profile.bannerUrl = previousBanner;
    showToast("Não foi possível carregar essa imagem. Tente uma imagem menor.", "error");
  }
}

function bindEvents() {
  document.querySelectorAll(".nav-item").forEach((button) => {
    button.addEventListener("click", () => showView(button.dataset.view));
  });

  document.querySelector("#menu-button").addEventListener("click", () => {
    document.querySelector("#sidebar").classList.toggle("open");
  });
  document.querySelector("#sidebar-backdrop").addEventListener("click", () => {
    document.querySelector("#sidebar").classList.remove("open");
  });
  document.querySelectorAll("[data-mobile-view]").forEach((button) => {
    button.addEventListener("click", () => showView(button.dataset.mobileView));
  });
  document.querySelector("[data-mobile-menu]").addEventListener("click", () => {
    document.querySelector("#sidebar").classList.add("open");
  });
  document.querySelector("#mobile-add-task").addEventListener("click", () => openTaskModal());

  document.querySelectorAll(".space-item").forEach((button) => {
    button.addEventListener("click", () => {
      activeCategory = button.dataset.category;
      document.querySelectorAll(".space-item").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      showView("today");
      renderTasks();
      renderPomodoroAvailability();
    });
  });

  document.querySelectorAll(".filter-button").forEach((button) => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.filter;
      document.querySelectorAll(".filter-button").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      renderTasks();
    });
  });

  document.querySelector("#search-input").addEventListener("input", (event) => {
    searchTerm = event.target.value;
    renderTasks();
  });

  document.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      document.querySelector("#search-input").focus();
    }
    if (event.key === "Escape") document.querySelector("#sidebar").classList.remove("open");
  });

  document.querySelector("#add-task-button").addEventListener("click", () => openTaskModal());
  document.querySelector("#add-inline-button").addEventListener("click", () => openTaskModal());
  document.querySelectorAll("[data-open-task-modal]").forEach((button) => {
    button.addEventListener("click", () => openTaskModal());
  });
  document.querySelector("#close-modal").addEventListener("click", closeTaskModal);
  document.querySelector("#cancel-modal").addEventListener("click", closeTaskModal);

  document.querySelector("#task-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    addTask(Object.fromEntries(formData.entries()));
    closeTaskModal();
  });

  document.querySelector("#task-list").addEventListener("click", (event) => {
    const actionButton = event.target.closest("[data-action]");
    const taskItem = event.target.closest("[data-task-id]");
    if (!actionButton || !taskItem) return;
    const { taskId } = taskItem.dataset;
    if (actionButton.dataset.action === "toggle-task") toggleTask(taskId);
    if (actionButton.dataset.action === "delete-task") deleteTask(taskId);
    if (actionButton.dataset.action === "focus-task") selectTaskForFocus(taskId);
  });

  document.querySelector("#calendar-prev").addEventListener("click", () => moveCalendar(-1));
  document.querySelector("#calendar-next").addEventListener("click", () => moveCalendar(1));
  document.querySelector("#full-calendar-prev").addEventListener("click", () => moveCalendar(-1));
  document.querySelector("#full-calendar-next").addEventListener("click", () => moveCalendar(1));
  document.querySelector("#calendar-today-button").addEventListener("click", () => {
    calendarCursor = new Date();
    calendarCursor.setDate(1);
    selectCalendarDate(localDateKey());
  });

  document.querySelector("#mini-calendar").addEventListener("click", (event) => {
    const day = event.target.closest("[data-date]");
    if (!day) return;
    selectedDate = day.dataset.date;
    openTaskModal(selectedDate);
  });

  document.querySelector("#full-calendar").addEventListener("click", (event) => {
    const day = event.target.closest("[data-date]");
    if (!day) return;
    selectCalendarDate(day.dataset.date, { scrollToPanel: true });
  });
  document.querySelector("#calendar-add-selected-task").addEventListener("click", () => openTaskModal(selectedDate));
  document.querySelector("#calendar-clear-selected-day").addEventListener("click", clearSelectedCalendarDay);
  document.querySelector("#calendar-day-task-list").addEventListener("click", handleCalendarTaskAction);

  document.querySelector("#open-calendar-button").addEventListener("click", () => showView("calendar"));
  document.querySelector("#hero-focus-button").addEventListener("click", () => {
    showView("focus");
    startPomodoro();
  });

  document.querySelectorAll(".pomodoro-tabs button").forEach((button) => {
    button.addEventListener("click", () => setPomodoroMode(button.dataset.mode));
  });
  document.querySelector("#pomodoro-toggle").addEventListener("click", togglePomodoro);
  document.querySelector("#pomodoro-reset").addEventListener("click", resetPomodoro);
  document.querySelector("#pomodoro-skip").addEventListener("click", finishPomodoro);
  document.querySelector("#pomodoro-history-list").addEventListener("click", (event) => {
    if (!event.target.closest("#pomodoro-history-more")) return;
    pomodoroHistoryExpanded = !pomodoroHistoryExpanded;
    renderPomodoroHistory();
  });
  document.querySelector("#floating-pomodoro-toggle").addEventListener("click", togglePomodoro);
  document.querySelector("#floating-pomodoro-close").addEventListener("click", () => {
    floatingPomodoroDismissed = true;
    updateFloatingPomodoro();
  });

  document.querySelector("#voice-button").addEventListener("click", startVoiceRecognition);
  document.querySelector("#assistant-command-form").addEventListener("submit", submitAssistantCommand);
  document.querySelector("#assistant-float-toggle").addEventListener("click", (event) => {
    event.stopPropagation();
    toggleAssistantFloat();
  });
  document.querySelector("#assistant-card").addEventListener("click", (event) => {
    if (!event.currentTarget.classList.contains("is-collapsed")) return;
    setAssistantCollapsed(false, { startVoice: true });
  });
  document.querySelector("#theme-toggle").addEventListener("click", () => {
    applyTheme(state.theme === "dark" ? "light" : "dark");
    saveState();
  });
  document.querySelector("#notification-button").addEventListener("click", openNotificationModal);
  document.querySelector("#close-notification-modal").addEventListener("click", closeNotificationModal);
  document.querySelector("#cancel-notification-modal").addEventListener("click", closeNotificationModal);
  document.querySelector("#notification-form").addEventListener("submit", saveNotificationPreferences);
  document.querySelector("#test-notification-email").addEventListener("click", sendTestNotificationEmail);
  document.querySelector("#email-enabled").addEventListener("change", updateNotificationFields);

  document.querySelectorAll("#google-calendar-button, #google-calendar-large").forEach((button) => {
    button.addEventListener("click", exportCalendar);
  });

  document.querySelector("#open-rank-roadmap").addEventListener("click", () => {
    renderRankRoadmap();
    document.querySelector("#rank-roadmap-modal").showModal();
  });
  document.querySelector("#close-rank-roadmap").addEventListener("click", () => {
    document.querySelector("#rank-roadmap-modal").close();
  });
  document.querySelector("#rank-roadmap-modal").addEventListener("click", (event) => {
    if (event.target === event.currentTarget) event.currentTarget.close();
  });
  document.querySelector("#edit-profile-button").addEventListener("click", editProfileInfo);
  document.querySelector("#close-profile-edit-modal").addEventListener("click", closeProfileInfoModal);
  document.querySelector("#cancel-profile-edit-modal").addEventListener("click", closeProfileInfoModal);
  document.querySelector("#profile-edit-form").addEventListener("submit", saveProfileInfo);
  document.querySelector("#profile-edit-modal").addEventListener("click", (event) => {
    if (event.target === event.currentTarget) event.currentTarget.close();
  });
  document.querySelector("#edit-avatar-button").addEventListener("click", () => editProfileImage("avatar"));
  document.querySelector("#edit-banner-button").addEventListener("click", () => editProfileImage("banner"));
  document.querySelector("#avatar-file-input").addEventListener("change", (event) => handleProfileImageFile(event, "avatar"));
  document.querySelector("#banner-file-input").addEventListener("change", (event) => handleProfileImageFile(event, "banner"));

  document.querySelectorAll("[data-waitlist]").forEach((button) => {
    button.addEventListener("click", () => showToast("Interesse registrado localmente. Os planos chegam em breve.", "success"));
  });

  document.querySelector('[data-action="logout"]').addEventListener("click", logOut);
}

function moveCalendar(amount) {
  calendarCursor.setMonth(calendarCursor.getMonth() + amount);
  renderMiniCalendar();
  renderFullCalendar();
}

function initializeApp() {
  if (appInitialized) return;
  appInitialized = true;
  applyTheme(state.theme || "dark");
  hydrateIcons();
  const now = new Date();
  document.querySelector("#current-date-label").textContent = weekdayFormatter.format(now).toLocaleUpperCase("pt-BR");
  document.querySelector("#task-date").min = localDateKey();
  updateClock();
  window.setInterval(updateClock, 1000);
  bindEvents();
  renderAll();
  updatePomodoroDisplay();
  updateNotificationIndicator();
  initializeIntegrations();
}

initializeAuth();
