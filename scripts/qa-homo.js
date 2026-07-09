const { execFileSync } = require("node:child_process");

const isWindows = process.platform === "win32";
const npx = isWindows ? "npx.cmd" : "npx";
const deployment = process.env.QA_HOMO_DEPLOYMENT || "homo-paddocke.vercel.app";

function run(command, args) {
  console.log(`\n> ${command} ${args.join(" ")}`);
  const executable = isWindows && command.endsWith(".cmd") ? process.env.ComSpec || "cmd.exe" : command;
  const executableArgs = isWindows && command.endsWith(".cmd") ? ["/d", "/s", "/c", command, ...args] : args;
  execFileSync(executable, executableArgs, {
    encoding: "utf8",
    stdio: "inherit"
  });
}

function runCapture(command, args) {
  console.log(`\n> ${command} ${args.join(" ")}`);
  const executable = isWindows && command.endsWith(".cmd") ? process.env.ComSpec || "cmd.exe" : command;
  const executableArgs = isWindows && command.endsWith(".cmd") ? ["/d", "/s", "/c", command, ...args] : args;
  return execFileSync(executable, executableArgs, {
    encoding: "utf8"
  });
}

run(npx, ["vercel", "curl", "/", "--deployment", deployment, "--", "-s", "-I"]);
const configResponse = runCapture(npx, ["vercel", "curl", "/api/config", "--deployment", deployment, "--", "-s"]);
const config = JSON.parse(configResponse.split("\n").find((line) => line.trim().startsWith("{")) || "{}");
if (Object.prototype.hasOwnProperty.call(config, "adminEmails")) {
  throw new Error("/api/config nao deve expor adminEmails em homologacao.");
}
if (config.supabaseEnvironment !== "homo") {
  throw new Error("/api/config deve apontar para o ambiente Supabase de homologacao.");
}
const protectedSessionResponse = runCapture(npx, [
  "vercel",
  "curl",
  "/api/session",
  "--deployment",
  deployment,
  "--",
  "-s"
]);
if (!protectedSessionResponse.includes("Sessao invalida")) {
  throw new Error("Endpoint /api/session deveria exigir sessao Supabase em homologacao.");
}
const protectedAssistantResponse = runCapture(npx, [
  "vercel",
  "curl",
  "/api/assistant",
  "--deployment",
  deployment,
  "--",
  "-s",
  "-X",
  "POST",
  "-H",
  "Content-Type: application/json",
  "-d",
  "{\"command\":\"qa sem sessao\",\"tasks\":[]}"
]);
if (!protectedAssistantResponse.includes("Sessao invalida")) {
  throw new Error("Endpoint /api/assistant deveria exigir sessao Supabase em homologacao.");
}
run("node", ["scripts/qa-assistant.js"]);
run("node", ["scripts/qa-mvp.js", "--local-only"]);

console.log(`\nQA de homologacao protegido ok: https://${deployment}`);
