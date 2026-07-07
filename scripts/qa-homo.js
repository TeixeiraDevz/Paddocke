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

run(npx, ["vercel", "curl", "/", "--deployment", deployment, "--", "-s", "-I"]);
run(npx, ["vercel", "curl", "/api/config", "--deployment", deployment, "--", "-s"]);
run("node", ["scripts/qa-mvp.js", "--local-only"]);

console.log(`\nQA de homologacao protegido ok: https://${deployment}`);
