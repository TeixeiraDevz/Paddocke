const fs = require("node:fs");
const { DATA_DIR, PREFERENCES_FILE } = require("./config");

function readPreferences() {
  try {
    return JSON.parse(fs.readFileSync(PREFERENCES_FILE, "utf8"));
  } catch {
    return {};
  }
}

function writePreferences(preferences) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(PREFERENCES_FILE, JSON.stringify(preferences, null, 2));
}

function escapeEmailHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function getLocalParts(timeZone) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  }).formatToParts(new Date());
  return Object.fromEntries(parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
}

async function sendDailyDigest(preferences, options = {}) {
  if (!process.env.RESEND_API_KEY) return false;
  const parts = getLocalParts(preferences.timezone || "America/Manaus");
  const today = `${parts.year}-${parts.month}-${parts.day}`;
  const includeCompleted = Boolean(preferences.includeCompleted);
  const tasks = (preferences.tasks || []).filter(
    (task) => task.date === today && (includeCompleted || !task.completed)
  );
  const pendingCount = tasks.filter((task) => !task.completed).length;
  const list = tasks.length
    ? tasks
        .map(
          (task) =>
            `<li style="margin:0 0 12px"><strong>${escapeEmailHtml(task.title)}</strong><br><span style="color:#667085">${escapeEmailHtml(task.time || "Sem horario")} - ${escapeEmailHtml(task.category)}</span></li>`
        )
        .join("")
    : "<li>Voce nao tem tarefas pendentes para hoje.</li>";

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
      "Idempotency-Key": options.test
        ? `paddocke-test-${preferences.email}-${Date.now()}`
        : `paddocke-digest-${preferences.email}-${today}`
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || "Paddocke <onboarding@resend.dev>",
      to: [preferences.email],
      subject: options.test
        ? "Paddocke: e-mail de teste"
        : pendingCount
          ? `Paddocke: ${pendingCount} ${pendingCount === 1 ? "tarefa" : "tarefas"} para hoje`
          : "Paddocke: seu dia esta livre",
      html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#101828"><h1 style="color:#176fdc">${options.test ? "Seu e-mail esta conectado" : "Seu dia no Paddocke"}</h1><p>${options.test ? "Este e um teste do resumo diario. As tarefas de hoje aparecem abaixo:" : "Estas sao suas tarefas para hoje:"}</p><ul style="padding-left:20px">${list}</ul><p style="color:#667085">Um passo de cada vez.</p></div>`
    })
  });
  return response.ok;
}

async function checkDailyDigest() {
  const preferences = readPreferences();
  if (!preferences.enabled || !preferences.email || !preferences.time) return;
  const parts = getLocalParts(preferences.timezone || "America/Manaus");
  const dateKey = `${parts.year}-${parts.month}-${parts.day}`;
  const currentTime = `${parts.hour}:${parts.minute}`;
  if (currentTime !== preferences.time || preferences.lastSentDate === dateKey) return;
  try {
    if (await sendDailyDigest(preferences)) {
      writePreferences({ ...preferences, lastSentDate: dateKey });
    }
  } catch (error) {
    console.error("Falha ao enviar resumo diario:", error.message);
  }
}

function saveNotificationPreferences(body) {
  const previous = readPreferences();
  const enabled = Boolean(body.enabled);
  const email = String(body.email || "").trim().slice(0, 320);
  const time = String(body.time || "");
  const timezone = String(body.timezone || "America/Manaus").slice(0, 100);
  const includeCompleted = Boolean(body.includeCompleted);
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validTime = /^\d{2}:\d{2}$/.test(time);

  if (enabled && (!validEmail || !validTime)) {
    return {
      status: 400,
      payload: {
        saved: false,
        error: "E-mail e horario validos sao obrigatorios para ativar o resumo."
      }
    };
  }

  const scheduleChanged =
    previous.email !== email ||
    previous.time !== time ||
    previous.timezone !== timezone ||
    previous.enabled !== enabled;
  writePreferences({
    enabled,
    email,
    time: validTime ? time : previous.time || "07:00",
    timezone,
    includeCompleted,
    tasks: Array.isArray(body.tasks) ? body.tasks.slice(0, 500) : [],
    lastSentDate: scheduleChanged ? null : previous.lastSentDate || null
  });
  return {
    status: 200,
    payload: {
      saved: true,
      enabled,
      emailConfigured: Boolean(process.env.RESEND_API_KEY)
    }
  };
}

module.exports = {
  checkDailyDigest,
  saveNotificationPreferences,
  sendDailyDigest
};
