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
  return "home ok";
}

async function checkRuntimeConfig() {
  const response = await fetchOk(`${BASE_URL}/api/config`);
  const config = await response.json();
  assert(config.appUrl === "https://paddocke.vercel.app", "APP_URL should point to production");
  assert(config.aiConfigured === true, "OpenAI should be configured in production");
  assert(config.emailConfigured === true, "Resend should be configured in production");
  assert(Boolean(config.supabaseUrl), "Supabase URL should be present");
  assert(Boolean(config.supabaseAnonKey), "Supabase anon key should be present");
  assert(Boolean(config.adminEmails), "Admin emails should be present");
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
  const schema = read("supabase/schema.sql");
  const vercelIgnore = read(".vercelignore");
  const gitIgnore = read(".gitignore");

  assert(server.includes('require("./server/api")'), "Server entrypoint should use modular API router");
  assert(serverConfig.includes('if (process.env.VERCEL) return;'), "Vercel should not load local .env");
  assert(serverConfig.includes('".webp": "image/webp"'), "Server should serve WebP with correct MIME type");
  assert(vercelIgnore.includes(".env"), ".vercelignore should exclude .env");
  assert(gitIgnore.includes(".env"), ".gitignore should exclude .env");
  assert(app.includes('.eq("user_id", currentUser.id)'), "Tasks should be read by current user");
  assert(app.includes("user_id: currentUser.id"), "Tasks should be written with current user_id");
  assert(schema.includes("alter table public.tasks enable row level security"), "Tasks RLS should be enabled");
  assert(schema.includes("auth.uid() = user_id"), "RLS should scope rows by user_id");
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
  results.push(await checkRankAssets());
  results.push(checkSecurityInvariants());
  console.table(results.map((result) => ({ check: result })));
}

main().catch((error) => {
  console.error(`QA failed: ${error.message}`);
  process.exit(1);
});
