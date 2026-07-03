const { createAiResponse } = require("./assistant");
const { getPublicConfig } = require("./config");
const { readJsonBody, sendJson } = require("./http");
const { saveNotificationPreferences, sendDailyDigest } = require("./notifications");

async function handleApi(request, response, pathname) {
  if (request.method === "GET" && pathname === "/api/config") {
    sendJson(response, 200, getPublicConfig());
    return true;
  }

  if (request.method === "POST" && pathname === "/api/assistant") {
    try {
      const body = await readJsonBody(request);
      const result = await createAiResponse(body);
      sendJson(response, 200, result ? { ...result, ai: true } : { ai: false });
    } catch (error) {
      console.error("Falha no assistente:", error.message);
      sendJson(response, 503, { ai: false, error: "Assistente indisponivel" });
    }
    return true;
  }

  if (request.method === "POST" && pathname === "/api/notifications/preferences") {
    try {
      const body = await readJsonBody(request);
      const result = saveNotificationPreferences(body);
      sendJson(response, result.status, result.payload);
    } catch (error) {
      sendJson(response, 400, { saved: false, error: error.message });
    }
    return true;
  }

  if (request.method === "POST" && pathname === "/api/notifications/test") {
    try {
      if (!process.env.RESEND_API_KEY) {
        sendJson(response, 503, { sent: false, error: "RESEND_API_KEY nao configurada" });
        return true;
      }
      const body = await readJsonBody(request);
      const preferences = {
        email: String(body.email || "").slice(0, 320),
        timezone: String(body.timezone || "America/Manaus").slice(0, 100),
        includeCompleted: Boolean(body.includeCompleted),
        tasks: Array.isArray(body.tasks) ? body.tasks.slice(0, 500) : []
      };
      if (!preferences.email) {
        sendJson(response, 400, { sent: false, error: "E-mail obrigatorio" });
        return true;
      }
      const sent = await sendDailyDigest(preferences, { test: true });
      sendJson(response, sent ? 200 : 502, {
        sent,
        error: sent ? null : "O provedor recusou o envio. Verifique remetente e destinatario."
      });
    } catch (error) {
      sendJson(response, 502, { sent: false, error: error.message });
    }
    return true;
  }

  return false;
}

module.exports = { handleApi };
