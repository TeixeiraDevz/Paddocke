export const STORAGE_KEY = "paddocke-state-v1";
export const FLOATING_POMODORO_POSITION_KEY = "paddocke-floating-pomodoro-position";

export const categoryColors = {
  Pessoais: "#2f86ff",
  Faculdade: "#a77bff",
  Trabalho: "#57d8ff",
  Treino: "#ffad5a"
};

export const pomodoroCategories = new Set(["Pessoais", "Faculdade"]);

export const XP_RULES = {
  taskComplete: 10,
  pomodoroComplete: 25,
  dailyStreak: 15,
  allDailyTasks: 80,
  perfectWeek: 200,
  perfectMonth: 1000,
  maxTaskAwardsPerDay: 20,
  maxPomodoroAwardsPerDay: 16
};

export const COMPLETED_TASK_RETENTION_DAYS = 7;
export const ADMIN_BASE_XP = 300000;
export const PROFILE_IMAGE_SOURCE_MAX_BYTES = 8 * 1024 * 1024;
export const PROFILE_IMAGE_OUTPUT = {
  avatar: { width: 512, height: 512, quality: 0.88 },
  banner: { width: 1600, height: 600, quality: 0.86 }
};

export const PATENTS = [
  { name: "Bronze", level: 1, xp: 0, image: "/assets/ranks/optimized/bronze.webp", color: "#b36b2c" },
  { name: "Cobre", level: 10, xp: 2500, image: "/assets/ranks/optimized/cobre.webp", color: "#c8783c" },
  { name: "Prata", level: 25, xp: 10000, image: "/assets/ranks/optimized/prata.webp", color: "#9aa4ae" },
  { name: "Ouro", level: 50, xp: 30000, image: "/assets/ranks/optimized/ouro.webp", color: "#f2b705" },
  { name: "Safira", level: 75, xp: 50000, image: "/assets/ranks/optimized/safira.webp", color: "#1997ff" },
  { name: "Diamante", level: 100, xp: 75000, image: "/assets/ranks/optimized/diamante.webp", color: "#168bff" },
  { name: "Diamante Vermelho", level: 150, xp: 150000, image: "/assets/ranks/optimized/diamante-vermelho.webp", color: "#f12b2b" },
  { name: "Kwita", level: 300, xp: ADMIN_BASE_XP, image: "/assets/ranks/optimized/kwita.webp", color: "#9b5cff" }
];
