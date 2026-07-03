const http = require("node:http");
const { handleApi } = require("./server/api");
const { PORT } = require("./server/config");
const { checkDailyDigest } = require("./server/notifications");
const { serveStatic } = require("./server/static");

const server = http.createServer(async (request, response) => {
  const pathname = decodeURIComponent(request.url.split("?")[0]);
  if (await handleApi(request, response, pathname)) return;
  serveStatic(request, response);
});

function startServer() {
  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      console.error(`A porta ${PORT} ja esta em uso.`);
      console.error("O Paddocke provavelmente ja esta rodando. Acesse http://localhost:3000 ou rode `npm run stop` antes de iniciar de novo.");
      process.exit(1);
    }

    console.error("Falha ao iniciar o servidor:", error.message);
    process.exit(1);
  });

  server.listen(PORT, () => {
    console.log(`Paddocke disponivel em http://localhost:${PORT}`);
  });

  setInterval(checkDailyDigest, 30_000);
  checkDailyDigest();
}

if (require.main === module) {
  startServer();
}

function vercelHandler(request, response) {
  server.emit("request", request, response);
}

vercelHandler.handleApi = handleApi;
vercelHandler.server = server;
vercelHandler.startServer = startServer;

module.exports = vercelHandler;
