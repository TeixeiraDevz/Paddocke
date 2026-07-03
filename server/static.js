const fs = require("node:fs");
const path = require("node:path");
const { MIME_TYPES, PUBLIC_DIR } = require("./config");
const { securityHeaders } = require("./http");

function serveStatic(request, response) {
  const cleanPath = decodeURIComponent(request.url.split("?")[0]);
  const requestPath = cleanPath === "/" ? "/index.html" : cleanPath;
  const filePath = path.resolve(PUBLIC_DIR, `.${requestPath}`);

  if (!filePath.startsWith(PUBLIC_DIR)) {
    response.writeHead(403, securityHeaders());
    response.end("Acesso negado");
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      if (error.code === "ENOENT") {
        fs.readFile(path.join(PUBLIC_DIR, "index.html"), (indexError, indexData) => {
          response.writeHead(indexError ? 404 : 200, {
            "Content-Type": "text/html; charset=utf-8",
            ...securityHeaders()
          });
          response.end(indexError ? "Pagina nao encontrada" : indexData);
        });
        return;
      }

      response.writeHead(500, securityHeaders());
      response.end("Erro interno");
      return;
    }

    response.writeHead(200, {
      "Cache-Control": "no-cache",
      "Content-Type": MIME_TYPES[path.extname(filePath)] || "application/octet-stream",
      ...securityHeaders()
    });
    response.end(data);
  });
}

module.exports = { serveStatic };
