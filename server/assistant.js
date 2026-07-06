function extractOpenAiText(payload) {
  if (payload.output_text) return payload.output_text;
  return (payload.output || [])
    .flatMap((item) => item.content || [])
    .filter((content) => content.type === "output_text")
    .map((content) => content.text)
    .join("");
}

function normalizeCommandText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function extractExplicitTaskTitle(command) {
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
  const explicitTitle = extractExplicitTaskTitle(body.command);
  if (explicitTitle.length >= 2) {
    result.action.title = explicitTitle;
    result.reply = `Pronto. Criei a tarefa ${explicitTitle}.`;
  }
  return result;
}

function describeServerTasks(tasks, label) {
  if (!tasks.length) return `Voce nao tem tarefas ${label}.`;
  const list = tasks
    .slice(0, 6)
    .map((task, index) => `${index + 1}. ${task.title}${task.time ? `, as ${task.time}` : ""}`)
    .join(" ");
  const extra = tasks.length > 6 ? ` E mais ${tasks.length - 6}.` : "";
  return `Voce tem ${tasks.length} ${tasks.length === 1 ? "tarefa" : "tarefas"} ${label}: ${list}.${extra}`;
}

function createDeterministicAssistantResponse(body, tasks) {
  const normalized = normalizeCommandText(body.command);
  const profile = body.profile || {};
  const asksConcept =
    normalized.includes("o que e") ||
    normalized.includes("oque e") ||
    normalized.includes("que significa") ||
    normalized.includes("significa") ||
    normalized.includes("como funciona") ||
    normalized.includes("explique") ||
    normalized.includes("para que serve");

  if (asksConcept && (normalized.includes("pomodoro") || normalized.includes("modo foco"))) {
    return {
      reply: "Pomodoro e uma tecnica de foco: voce trabalha por um periodo curto, normalmente 25 minutos, e depois faz uma pausa. No Paddocke, isso ajuda a manter ritmo, registrar sessoes de foco e ganhar XP.",
      action: { type: "none" }
    };
  }

  if (asksConcept && (normalized.includes("patente") || normalized.includes("xp") || normalized.includes("nivel"))) {
    return {
      reply: "Patente, nivel e XP fazem parte da gamificacao do Paddocke. Voce ganha progresso ao concluir tarefas e sessoes de foco. A patente mostra sua evolucao ao longo do tempo.",
      action: { type: "none" }
    };
  }

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
      ? `Voce esta no nivel ${profile.level}, patente ${profile.rank}${xpLabel}. A proxima patente e ${profile.next.name}.`
      : `Voce esta no nivel ${profile.level}, patente ${profile.rank}${xpLabel}. Essa e a patente maxima do Paddocke.`;
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
  if (!process.env.OPENAI_API_KEY) return null;

  const prompt = [
    "Voce e o assistente por voz do Paddocke, um planejador pessoal.",
    "Responda em portugues brasileiro, de forma curta e natural para ser falada.",
    "Voce tambem pode explicar conceitos do app, como Pomodoro, XP, patentes, calendario e tarefas. Para perguntas explicativas, use action none.",
    "Escolha somente uma acao permitida e nunca invente IDs de tarefas.",
    "Acoes: none, create_task, complete_task, delete_task, move_task, clear_calendar_day, start_pomodoro, pause_pomodoro, reset_pomodoro, open_calendar.",
    "Para create_task, use title, category, date YYYY-MM-DD, time HH:MM ou vazio, priority low|medium|high e notes.",
    "Para move_task, use taskId e date YYYY-MM-DD quando o usuario pedir para mover ou reagendar uma tarefa.",
    "Para clear_calendar_day, use date YYYY-MM-DD somente quando o usuario pedir para limpar/remover um dia passado do calendario.",
    "O titulo deve ser somente o nome real da tarefa. Remova trechos de agendamento, categoria e instrucoes como 'adicionar no campo'.",
    "Quando o usuario disser 'chamada X', 'chamado X', 'nomeada X', 'com titulo X' ou 'nome da tarefa X', use apenas X como title.",
    "Exemplo: 'para as 14h chamada Verificar notas no portal do aluno, no campo faculdade' => title 'Verificar notas no portal do aluno', time '14:00', category 'Faculdade'.",
    "Para complete_task, delete_task, move_task ou start_pomodoro, use taskId apenas quando houver correspondencia segura.",
    "Retorne somente JSON valido neste formato:",
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

module.exports = { createAiResponse };
