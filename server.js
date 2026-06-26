const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

function loadLocalEnv() {
  try {
    const envFile = fs.readFileSync(path.join(__dirname, ".env"), "utf8");
    envFile.split(/\r\n/).forEach((line) => {
      const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (!match || process.env[match[1]]) return;
      process.env[match[1]] = match[2].trim().replace(/^(['"])(.*)\1$/, "$2");
    });
  } catch {
    // Environment variables can also be supplied directly by the host.
  }
}

loadLocalEnv();

const PORT = Number(process.env.PORT) || 3000;
const PUBLIC_DIR = path.join(__dirname, "public");
const DATA_DIR = path.join(__dirname, "data");
const PREFERENCES_FILE = path.join(DATA_DIR, "notification-preferences.json");

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webmanifest": "application/manifest+json"
};

function sendJson(response, status, payload) {
  response.writeHead(status, {
    "Cache-Control": "no-store",
    "Content-Type": "application/json; charset=utf-8"
  });
  response.end(JSON.stringify(payload));
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) request.destroy();
    });
    request.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
    request.on("error", reject);
  });
}

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

function extractOpenAiText(payload) {
  if (payload.output_text) return payload.output_text;
  return (payload.output || [])
    .flatMap((item) => item.content || [])
    .filter((content) => content.type === "output_text")
    .map((content) => content.text)
    .join("");
}

function extractExplicitTaskTitle(command) {
  const text = String(command || "").trim();
  const marker = text.match(
    /\b(?:chamad[ao]|nomead[ao]|com\s+(?:o\s+)titulo|t[ií]tulo|nome\s+da\s+tarefa)\s+["“”'](.+)$/i
  );
  if (!marker) return "";

  let title = marker[1].trim();
  title = title.split(/\s*,\s*(?:e\s+)(?:adicionar|adicione|colocar|coloque|criar|crie|agendar|agende)\b/i)[0];
  title = title.replace(/\s+(?:para|pra|no|na|em)\s+(?:o\s+)(?:dia|data|hor[aá]rio|campo|categoria)\b.*$/i, "");
  title = title.replace(/\s+(?:às|as|a)\s+\d{1,2}(?::|h)\d{0,2}\b.*$/i, "");
  return title.trim().replace(/^["“”']|["“”']$/g, "").replace(/[.!]+$/, "");
}

function normalizeCommandText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function extractExplicitTaskTitleV2(command) {
  const text = String(command || "").trim();
  const normalized = normalizeCommandText(text);
  const marker = normalized.match(/\b(?:chamad[ao]|nomead[ao]|com\s+(?:o\s+)titulo|titulo|nome\s+da\s+tarefa)\s+/);
  if (!marker) return "";

  let title = text.slice(marker.index + marker[0].length).trim();
  title = title.split(/\s*,\s*(?:e\s+)(?:adicionar|adicione|colocar|coloque|criar|crie|agendar|agende)\b/i)[0];
  title = title.replace(/\s+(?:para|pra|no|na|em)\s+(?:o\s+)(?:dia|data|horario|campo|categoria)\b.*$/i, "");
  title = title.replace(/\s+(?:as|a)\s+\d{1,2}(?::|h)\d{0,2}\b.*$/i, "");
  return title.trim().replace(/^["'\u201C\u201D]|["'\u201C\u201D]$/g, "").replace(/[.!]+$/, "");
}

function normalizeAssistantResult(result, body) {
  if (!result || result.action.type !== "create_task") return result;
  const explicitTitle = extractExplicitTaskTitleV2(body.command);
  if (explicitTitle.length >= 2) {
    result.action.title = explicitTitle;
    result.reply = `Pronto. Criei a tarefa ${explicitTitle}.`;
  }
  return result;
}

function describeServerTasks(tasks, label) {
  if (!tasks.length) return `Você não tem tarefas ${label}.`;
  const list = tasks
    .slice(0, 6)
    .map((task, index) => `${index + 1}. ${task.title}${task.time ? `, às ${task.time}` : ""}`)
    .join(" ");
  const extra = tasks.length > 6 ? ` E mais ${tasks.length - 6}.` : "";
  return `Você tem ${tasks.length} ${tasks.length === 1 ? "tarefa" : "tarefas"} ${label}: ${list}.${extra}`;
}

function createDeterministicAssistantResponse(body, tasks) {
  const normalized = normalizeCommandText(body.command);
  const profile = body.profile || {};

  if (
    normalized.includes("nivel") ||
    normalized.includes("experiencia") ||
    normalized.includes("patente") ||
    normalized.includes("progresso") ||
    normalized.includes("xp")
  ) {
    if (!profile.rank) return null;
    const xpLabel = profile.xpLabel ? `, com ${profile.xpLabel}` : "";
    const reply = profile.next
      ? `Você está no nível ${profile.level}, patente ${profile.rank}${xpLabel}. A próxima patente é ${profile.next.name}.`
      : `Você está no nível ${profile.level}, patente ${profile.rank}${xpLabel}. Essa é a patente máxima do Paddocke.`;
    return { reply, action: { type: "none" } };
  }

  if (
    normalized.includes("tarefas") &&
    (normalized.includes("hoje") || normalized.includes("o que fazer") || normalized.includes("meu dia"))
  ) {
    const todayTasks = tasks.filter((task) => task.date === body.today && !task.completed);
    return { reply: describeServerTasks(todayTasks, "para hoje"), action: { type: "none" } };
  }

  if (
    normalized.includes("iniciar pomodoro") ||
    normalized.includes("ativar pomodoro") ||
    normalized.includes("iniciar foco") ||
    normalized.includes("modo foco")
  ) {
    return { reply: "Pomodoro de 25 minutos iniciado. Hora de focar.", action: { type: "start_pomodoro" } };
  }

  return null;
}

async function createAiResponse(body) {
  if (!process.env.OPENAI_API_KEY) return null;
  const tasks = (body.tasks || []).slice(0, 100).map((task) => ({
    id: task.id,
    title: task.title,
    category: task.category,
    date: task.date,
    time: task.time,
    completed: task.completed
  }));
  const deterministicResult = createDeterministicAssistantResponse(body, tasks);
  if (deterministicResult) return deterministicResult;

  const prompt = [
    "Você é o assistente por voz do Paddocke, um planejador pessoal.",
    "Responda em português brasileiro, de forma curta e natural para ser falada.",
    "Escolha somente uma ação permitida e nunca invente IDs de tarefas.",
    "Ações: none, create_task, complete_task, delete_task, move_task, clear_calendar_day, start_pomodoro, pause_pomodoro, reset_pomodoro, open_calendar.",
    "Para create_task, use title, category, date YYYY-MM-DD, time HH:MM ou vazio, priority low|medium|high e notes.",
    "Para move_task, use taskId e date YYYY-MM-DD quando o usuário pedir para mover ou reagendar uma tarefa.",
    "Para clear_calendar_day, use date YYYY-MM-DD somente quando o usuário pedir para limpar/remover um dia passado do calendário.",
    "O título deve ser somente o nome real da tarefa. Remova trechos de agendamento, categoria e instruções como 'adicionar no campo'.",
    "Quando o usuário disser 'chamada X', 'chamado X', 'nomeada X', 'com título X' ou 'nome da tarefa X', use apenas X como title.",
    "Exemplo: 'para as 14h chamada Verificar notas no portal do aluno, no campo faculdade' => title 'Verificar notas no portal do aluno', time '14:00', category 'Faculdade'.",
    "Para complete_task, delete_task, move_task ou start_pomodoro, use taskId apenas quando houver correspondência segura.",
    "Retorne somente JSON válido neste formato:",
    '{"reply":"texto curto","action":{"type":"none"}}',
    `Data local atual: ${body.today}.`,
    `Perfil: ${JSON.stringify(body.profile || {})}.`,
    `Tarefas: ${JSON.stringify(tasks)}.`,
    `Pedido falado: ${String(body.command || "").slice(0, 500)}`
  ].join("\n");

  const aiResponse = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-5.4-mini",
      input: prompt,
      reasoning: { effort: "low" },
      max_output_tokens: 500
    })
  });

  if (!aiResponse.ok) {
    const errorBody = await aiResponse.text().catch(() => "");
    throw new Error(`OpenAI API returned ${aiResponse.status}: ${errorBody.slice(0, 500)}`);
  }
  const text = extractOpenAiText(await aiResponse.json()).trim();
  return normalizeAssistantResult(JSON.parse(text.replace(/^```json\s*|\s*```$/g, "")), body);
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
            `<li style="margin:0 0 12px"><strong>${escapeEmailHtml(task.title)}</strong><br><span style="color:#667085">${escapeEmailHtml(task.time || "Sem horário")} - ${escapeEmailHtml(task.category)}</span></li>`
        )
        .join("")
    : "<li>Você não tem tarefas pendentes para hoje.</li>";

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
          : "Paddocke: seu dia está livre",
      html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#101828"><h1 style="color:#176fdc">${options.test ? "Seu e-mail está conectado" : "Seu dia no Paddocke"}</h1><p>${options.test ? "Este é um teste do resumo diário. As tarefas de hoje aparecem abaixo:" : "Estas são suas tarefas para hoje:"}</p><ul style="padding-left:20px">${list}</ul><p style="color:#667085">Um passo de cada vez.</p></div>`
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
    console.error("Falha ao enviar resumo diário:", error.message);
  }
}

async function handleApi(request, response, pathname) {
  if (request.method === "GET" && pathname === "/api/config") {
    sendJson(response, 200, {
      aiConfigured: Boolean(process.env.OPENAI_API_KEY),
      emailConfigured: Boolean(process.env.RESEND_API_KEY),
      supabaseUrl: process.env.SUPABASE_URL || "",
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY || ""
    });
    return true;
  }

  if (request.method === "POST" && pathname === "/api/assistant") {
    try {
      const body = await readJsonBody(request);
      const result = await createAiResponse(body);
      sendJson(response, 200, result ? { ...result, ai: true } : { ai: false });
    } catch (error) {
      console.error("Falha no assistente:", error.message);
      sendJson(response, 503, { ai: false, error: "Assistente indisponível" });
    }
    return true;
  }

  if (request.method === "POST" && pathname === "/api/notifications/preferences") {
    try {
      const body = await readJsonBody(request);
      const previous = readPreferences();
      const enabled = Boolean(body.enabled);
      const email = String(body.email || "").trim().slice(0, 320);
      const time = String(body.time || "");
      const timezone = String(body.timezone || "America/Manaus").slice(0, 100);
      const includeCompleted = Boolean(body.includeCompleted);
      const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      const validTime = /^\d{2}:\d{2}$/.test(time);

      if (enabled && (!validEmail || !validTime)) {
        sendJson(response, 400, {
          saved: false,
          error: "E-mail e horário válidos são obrigatórios para ativar o resumo."
        });
        return true;
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
      sendJson(response, 200, {
        saved: true,
        enabled,
        emailConfigured: Boolean(process.env.RESEND_API_KEY)
      });
    } catch (error) {
      sendJson(response, 400, { saved: false, error: error.message });
    }
    return true;
  }

  if (request.method === "POST" && pathname === "/api/notifications/test") {
    try {
      if (!process.env.RESEND_API_KEY) {
        sendJson(response, 503, { sent: false, error: "RESEND_API_KEY não configurada" });
        return true;
      }
      const body = await readJsonBody(request);
      const preferences = {
        email: String(body.email || "").slice(0, 320),
        timezone: String(body.timezone || "America/Manaus").slice(0, 100),
        includeCompleted: Boolean(body.includeCompleted),
        tasks: Array.isArray(body.tasks) ? body.tasks.slice(0, 500) : []
      };
      if (!preferences.email) {
        sendJson(response, 400, { sent: false, error: "E-mail obrigatório" });
        return true;
      }
      const sent = await sendDailyDigest(preferences, { test: true });
      sendJson(response, sent ? 200 : 502, {
        sent,
        error: sent ? null : "O provedor recusou o envio. Verifique remetente e destinatário."
      });
    } catch (error) {
      sendJson(response, 502, { sent: false, error: error.message });
    }
    return true;
  }

  return false;
}

const server = http.createServer(async (request, response) => {
  const pathname = decodeURIComponent(request.url.split("?")[0]);
  if (await handleApi(request, response, pathname)) return;

  const cleanPath = decodeURIComponent(request.url.split("?")[0]);
  const requestPath = cleanPath === "/" ? "/index.html" : cleanPath;
  const filePath = path.resolve(PUBLIC_DIR, `.${requestPath}`);

  if (!filePath.startsWith(PUBLIC_DIR)) {
    response.writeHead(403);
    response.end("Acesso negado");
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      if (error.code === "ENOENT") {
        fs.readFile(path.join(PUBLIC_DIR, "index.html"), (indexError, indexData) => {
          response.writeHead(indexError ? 404 : 200, {
            "Content-Type": "text/html; charset=utf-8"
          });
          response.end(indexError ? "Página não encontrada" : indexData);
        });
        return;
      }

      response.writeHead(500);
      response.end("Erro interno");
      return;
    }

    response.writeHead(200, {
      "Cache-Control": "no-cache",
      "Content-Type": MIME_TYPES[path.extname(filePath)] || "application/octet-stream"
    });
    response.end(data);
  });
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`A porta ${PORT} já está em uso.`);
    console.error("O Paddocke provavelmente já está rodando. Acesse http://localhost:3000 ou rode `npm run stop` antes de iniciar de novo.");
    process.exit(1);
  }

  console.error("Falha ao iniciar o servidor:", error.message);
  process.exit(1);
});

server.listen(PORT, () => {
  console.log(`Paddocke disponível em http://localhost:${PORT}`);
});

setInterval(checkDailyDigest, 30_000);
checkDailyDigest();
