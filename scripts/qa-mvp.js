const fs = require("node:fs");
const path = require("node:path");

const BASE_URL = process.env.QA_BASE_URL || "https://paddocke.vercel.app";
const ROOT = path.resolve(__dirname, "..");

function read(file) {
  return fs.readFileSync(path.join(ROOT, file), "utf8");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function fetchOk(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`${url} returned ${response.status}`);
  return response;
}

async function checkProductionShell() {
  const response = await fetchOk(BASE_URL);
  const html = await response.text();
  assert(html.includes("Paddocke"), "Home should contain Paddocke brand");
  assert(html.includes("app.js"), "Home should load app.js");
  assert(html.includes("auth-shell"), "Home should include auth shell");
  if (process.env.QA_STRICT_HEADERS === "true") {
    assert((response.headers.get("x-content-type-options") || "") === "nosniff", "Static responses should include nosniff");
    assert((response.headers.get("x-frame-options") || "") === "DENY", "Static responses should deny framing");
  }
  return "home ok";
}

async function checkRuntimeConfig() {
  const response = await fetchOk(`${BASE_URL}/api/config`);
  const config = await response.json();
  const isProduction = BASE_URL.includes("paddocke.vercel.app");
  if (isProduction) {
    assert(config.appUrl === "https://paddocke.vercel.app", "APP_URL should point to production");
  }
  assert(config.aiConfigured === true, "OpenAI should be configured in production");
  assert(config.emailConfigured === true, "Resend should be configured in production");
  assert(Boolean(config.supabaseUrl), "Supabase URL should be present");
  assert(Boolean(config.supabaseAnonKey), "Supabase anon key should be present");
  if (isProduction) assert(Boolean(config.adminEmails), "Admin emails should be present");
  return config;
}

async function checkGoogleOAuth(config) {
  const callback = encodeURIComponent("https://paddocke.vercel.app/auth/callback");
  const url = `${config.supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${callback}`;
  const response = await fetch(url, {
    headers: { apikey: config.supabaseAnonKey },
    redirect: "manual"
  });
  const location = response.headers.get("location") || "";
  assert(response.status >= 300 && response.status < 400, "Google OAuth should redirect");
  assert(location.startsWith("https://accounts.google.com"), "Google OAuth should redirect to Google");
  return "google oauth ok";
}

async function checkAssistantCommand() {
  const taskResponse = await fetchOk(`${BASE_URL}/api/assistant`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      command: "quais minhas tarefas de hoje",
      today: "2026-07-03",
      tasks: [
        { id: "qa-1", title: "Consulta medica", date: "2026-07-03", time: "09:25", completed: false }
      ]
    })
  });
  const taskResult = await taskResponse.json();
  assert(taskResult.reply && taskResult.reply.includes("Consulta medica"), "Assistant should answer today task queries");

  const conceptResponse = await fetchOk(`${BASE_URL}/api/assistant`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      command: "o que significa pomodoro",
      today: "2026-07-03",
      tasks: []
    })
  });
  const conceptResult = await conceptResponse.json();
  assert(conceptResult.reply && conceptResult.reply.toLowerCase().includes("tecnica de foco"), "Assistant should explain Pomodoro");
  assert(!conceptResult.reply.toLowerCase().includes("patente kwita"), "Pomodoro explanation should not answer profile rank");
  return "assistant command ok";
}

async function checkRankAssets() {
  const app = read("public/app.js");
  const appConfig = read("public/js/domain/app-config.js");
  assert(!app.includes("/assets/ranks/bronze.png"), "App should not reference heavy rank PNGs");
  assert(!appConfig.includes("/assets/ranks/bronze.png"), "App config should not reference heavy rank PNGs");
  assert(appConfig.includes("/assets/ranks/optimized/bronze.webp"), "App config should reference optimized WebP ranks");
  const ranks = ["bronze", "cobre", "prata", "ouro", "safira", "diamante", "diamante-vermelho", "kwita"];
  const sizes = [];
  for (const rank of ranks) {
    const file = `public/assets/ranks/optimized/${rank}.webp`;
    const stat = fs.statSync(path.join(ROOT, file));
    assert(stat.size < 50 * 1024, `${file} should stay below 50KB`);
    const response = await fetchOk(`${BASE_URL}/assets/ranks/optimized/${rank}.webp`);
    assert((response.headers.get("content-type") || "").includes("image/webp"), `${rank}.webp should be served as WebP`);
    sizes.push(stat.size);
  }
  return `${ranks.length} rank assets ok (${Math.round(sizes.reduce((sum, size) => sum + size, 0) / 1024)}KB total)`;
}

function checkSecurityInvariants() {
  const app = read("public/app.js");
  const server = read("server.js");
  const serverConfig = read("server/config.js");
  const serverApi = read("server/api.js");
  const serverHttp = read("server/http.js");
  const serverStatic = read("server/static.js");
  const schema = read("supabase/schema.sql");
  const plansMarkup = read("public/index.html");
  const vercelIgnore = read(".vercelignore");
  const gitIgnore = read(".gitignore");

  assert(server.includes('require("./server/api")'), "Server entrypoint should use modular API router");
  assert(serverApi.includes("rateLimit(request, response"), "Sensitive API routes should use rate limiting");
  assert(serverHttp.includes("X-Content-Type-Options"), "JSON responses should include security headers");
  assert(serverStatic.includes("securityHeaders()"), "Static responses should include security headers");
  assert(serverConfig.includes('if (process.env.VERCEL) return;'), "Vercel should not load local .env");
  assert(serverConfig.includes('".webp": "image/webp"'), "Server should serve WebP with correct MIME type");
  assert(vercelIgnore.includes(".env"), ".vercelignore should exclude .env");
  assert(gitIgnore.includes(".env"), ".gitignore should exclude .env");
  assert(app.includes('.eq("user_id", currentUser.id)'), "Tasks should be read by current user");
  assert(app.includes("user_id: currentUser.id"), "Tasks should be written with current user_id");
  assert(app.includes('from "./js/domain/time.js"'), "Task time normalization should live in a domain module");
  assert(!app.includes("[data-waitlist]"), "Plan waitlist handler should not exist in MVP");
  assert(!plansMarkup.includes("data-waitlist"), "Plan waitlist buttons should not exist in MVP");
  assert(!plansMarkup.includes(">Teams<"), "Teams plan should stay out of the MVP plan screen");
  assert(schema.includes("alter table public.tasks enable row level security"), "Tasks RLS should be enabled");
  assert(schema.includes("auth.uid() = user_id"), "RLS should scope rows by user_id");
  assert(schema.includes("with check (auth.uid() = user_id)"), "RLS updates should validate final user_id");
  assert(schema.includes("public.admin_emails"), "Admin entitlement should have a server-side database guard");
  assert(schema.includes("guard_profile_admin_fields"), "Profile admin fields should be guarded in the database");
  assert(app.includes("emailSchedulerSaved: false"), "Notification scheduler fallback should exist");
  assert(app.includes("startPendingSignupLogin"), "Email confirmation retry flow should exist");
  return "security invariants ok";
}

async function main() {
  const results = [];
  results.push(await checkProductionShell());
  const config = await checkRuntimeConfig();
  results.push("runtime config ok");
  results.push(await checkGoogleOAuth(config));
  results.push(await checkAssistantCommand());
  results.push(await checkRankAssets());
  results.push(checkSecurityInvariants());
  console.table(results.map((result) => ({ check: result })));
}

main().catch((error) => {
  console.error(`QA failed: ${error.message}`);
  process.exit(1);
});
