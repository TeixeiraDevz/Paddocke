const { createAiResponse } = require("../server/assistant");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function runCase(name, body, verify) {
  const previousOpenAiKey = process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_API_KEY;
  try {
    const result = await createAiResponse(body);
    verify(result);
    return name;
  } finally {
    if (previousOpenAiKey) process.env.OPENAI_API_KEY = previousOpenAiKey;
  }
}

async function main() {
  const today = "2026-07-09";
  const tasks = [
    {
      id: "task-1",
      title: "Consulta medica",
      category: "Pessoais",
      date: today,
      time: "09:25",
      completed: false
    },
    {
      id: "task-2",
      title: "Revisar Java",
      category: "Faculdade",
      date: today,
      time: "15:00",
      completed: false
    },
    {
      id: "task-3",
      title: "Comprar material",
      category: "Pessoais",
      date: today,
      time: "",
      completed: true
    }
  ];

  const results = [];

  results.push(await runCase(
    "pomodoro concept",
    { command: "O que significa pomodoro?", today, tasks },
    (result) => {
      assert(result?.action?.type === "none", "Pomodoro concept should not trigger an action");
      assert(/tecnica de foco/i.test(result.reply), "Pomodoro concept should explain focus technique");
    }
  ));

  results.push(await runCase(
    "today tasks",
    { command: "Quais sao minhas tarefas de hoje?", today, tasks },
    (result) => {
      assert(result?.action?.type === "none", "Today tasks should not trigger an action");
      assert(result.reply.includes("Consulta medica"), "Today tasks should include pending task");
      assert(result.reply.includes("Revisar Java"), "Today tasks should include second pending task");
      assert(!result.reply.includes("Comprar material"), "Today tasks should ignore completed task");
    }
  ));

  results.push(await runCase(
    "start pomodoro",
    { command: "Iniciar pomodoro", today, tasks },
    (result) => {
      assert(result?.action?.type === "start_pomodoro", "Start pomodoro should trigger start_pomodoro");
      assert(/25 minutos/i.test(result.reply), "Start pomodoro should mention duration");
    }
  ));

  results.push(await runCase(
    "rank status",
    {
      command: "Qual meu nivel e patente?",
      today,
      tasks,
      profile: {
        level: 300,
        rank: "Kwita",
        xpLabel: "300.000 XP total",
        next: null
      }
    },
    (result) => {
      assert(result?.action?.type === "none", "Rank status should not trigger an action");
      assert(result.reply.includes("Kwita"), "Rank status should mention current rank");
      assert(result.reply.includes("300.000 XP total"), "Rank status should mention XP label");
    }
  ));

  console.table(results.map((check) => ({ check })));
}

main().catch((error) => {
  console.error(`QA assistant failed: ${error.message}`);
  process.exit(1);
});
