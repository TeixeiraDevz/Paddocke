const { handleApi } = require("../server");

module.exports = async function handler(request, response) {
  const pathParam = request.query?.path;
  const pathParts = Array.isArray(pathParam) ? pathParam : pathParam ? [pathParam] : [];
  const pathname = `/api/${pathParts.join("/")}`.replace(/\/$/, "");
  const handled = await handleApi(request, response, pathname);

  if (!handled && !response.headersSent) {
    response.statusCode = 404;
    response.setHeader("Content-Type", "application/json; charset=utf-8");
    response.end(JSON.stringify({ error: "Rota nao encontrada" }));
  }
};
