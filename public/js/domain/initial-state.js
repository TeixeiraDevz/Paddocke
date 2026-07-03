import { ADMIN_BASE_XP, XP_RULES } from "./app-config.js";
import { addDays, localDateKey } from "../shared/formatters.js";

export function createInitialState(options = {}) {
  const today = new Date();
  const todayKey = localDateKey(today);
  const tomorrowKey = localDateKey(addDays(today, 1));
  const laterKey = localDateKey(addDays(today, 3));

  return {
    tasks: options.demo ? [
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
    ] : [],
    xp: options.admin ? ADMIN_BASE_XP : 0,
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
