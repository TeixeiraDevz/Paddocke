const { execFile } = require("node:child_process");

const port = Number(process.argv[2]) || 3000;

function run(command, args) {
  return new Promise((resolve, reject) => {
    execFile(command, args, { windowsHide: true }, (error, stdout, stderr) => {
      if (error && !stdout) {
        reject(new Error(stderr || error.message));
        return;
      }
      resolve(stdout);
    });
  });
}

async function main() {
  if (process.platform !== "win32") {
    console.log("Este script foi preparado para Windows. Use Ctrl+C no terminal que esta rodando o servidor.");
    return;
  }

  const output = await run("netstat", ["-ano"]);
  const line = output
    .split(/\r?\n/)
    .find((entry) => entry.includes(`:${port}`) && entry.includes("LISTENING"));

  if (!line) {
    console.log(`Nenhum processo usando a porta ${port}.`);
    return;
  }

  const pid = line.trim().split(/\s+/).at(-1);
  if (!/^\d+$/.test(pid)) throw new Error("Nao foi possivel identificar o processo da porta.");

  await run("taskkill", ["/PID", pid, "/F"]);
  console.log(`Processo ${pid} encerrado. Porta ${port} liberada.`);
}

main().catch((error) => {
  console.error(`Nao foi possivel liberar a porta ${port}: ${error.message}`);
  process.exit(1);
});
