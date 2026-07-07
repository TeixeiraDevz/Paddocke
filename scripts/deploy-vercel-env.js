const { execFileSync } = require("node:child_process");

const ENVIRONMENTS = {
  homo: {
    alias: "homo-paddocke.vercel.app",
    baseUrl: "https://homo-paddocke.vercel.app",
    prod: false,
    productionRuntime: true
  },
  prod: {
    alias: "paddocke.vercel.app",
    baseUrl: "https://paddocke.vercel.app",
    prod: true
  }
};

const target = process.argv[2];
const environment = ENVIRONMENTS[target];
const isWindows = process.platform === "win32";
const npx = isWindows ? "npx.cmd" : "npx";

if (!environment) {
  console.error("Uso: node scripts/deploy-vercel-env.js <homo|prod>");
  process.exit(1);
}

function run(command, args, options = {}) {
  console.log(`\n> ${command} ${args.join(" ")}`);
  const executable = isWindows && command.endsWith(".cmd") ? process.env.ComSpec || "cmd.exe" : command;
  const executableArgs = isWindows && command.endsWith(".cmd") ? ["/d", "/s", "/c", command, ...args] : args;
  return execFileSync(executable, executableArgs, {
    encoding: "utf8",
    stdio: options.capture ? ["ignore", "pipe", "inherit"] : "inherit"
  });
}

function extractDeploymentUrl(output) {
  const urls = output.match(/https:\/\/[^\s]+\.vercel\.app/g) || [];
  const deploymentUrl = urls.find((url) => !url.includes("vercel.com/"));
  if (!deploymentUrl) {
    console.error(output);
    throw new Error("Nao foi possivel identificar a URL do deployment.");
  }
  return deploymentUrl;
}

const buildArgs = ["vercel", "build", "--yes"];
const deployArgs = ["vercel", "deploy", "--prebuilt", "--yes"];

if (environment.prod || environment.productionRuntime) {
  buildArgs.splice(3, 0, "--prod");
  deployArgs.splice(3, 0, "--prod");
}

if (!environment.prod && environment.productionRuntime) {
  deployArgs.splice(4, 0, "--skip-domain");
}

run(npx, buildArgs);
const deployOutput = run(npx, deployArgs, { capture: true });
console.log(deployOutput);

const deploymentUrl = extractDeploymentUrl(deployOutput);
console.log(`Deployment publicado: ${deploymentUrl}`);

if (!environment.prod) {
  run(npx, ["vercel", "alias", "set", deploymentUrl.replace(/^https:\/\//, ""), environment.alias]);
}

if (environment.prod) {
  run("node", ["scripts/qa-mvp.js", `--base-url=${environment.baseUrl}`]);
} else {
  run("node", ["scripts/qa-homo.js"]);
}

console.log(`\n${target} pronto: ${environment.baseUrl}`);
