const { createAiResponse } = require("./assistant");
const { isAdminUser, requireAuthenticatedUser } = require("./auth");
const { createProCheckout, getBillingStatus, processWebhook } = require("./billing/mercado-pago");
const { getPublicConfig } = require("./config");
const { readJsonBody, readRawBody, sendJson } = require("./http");
const { saveNotificationPreferences, sendDailyDigest } = require("./notifications");
const { rateLimit } = require("./rate-limit");

async function handleApi(request, response, pathname) {
  if (request.method === "GET" && pathname === "/api/config") {
    sendJson(response, 200, getPublicConfig(request));
    return true;
  }

  if (request.method === "GET" && pathname === "/api/session") {
    if (rateLimit(request, response, { key: "session", max: 60, windowMs: 60_000 })) return true;
    const user = await requireAuthenticatedUser(request, response);
    if (!user) return true;
    sendJson(response, 200, {
      userId: user.id,
      isAdmin: isAdminUser(user)
    });
    return true;
  }

  if (request.method === "POST" && pathname === "/api/assistant") {
    if (rateLimit(request, response, { key: "assistant", max: 20, windowMs: 60_000 })) return true;
    const user = await requireAuthenticatedUser(request, response);
    if (!user) return true;
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

  if (request.method === "GET" && pathname === "/api/billing/status") {
    if (rateLimit(request, response, { key: "billing-status", max: 60, windowMs: 60_000 })) return true;
    const user = await requireAuthenticatedUser(request, response);
    if (!user) return true;
    try {
      const result = await getBillingStatus({ request, user });
      sendJson(response, 200, result);
    } catch (error) {
      console.error("Falha ao consultar billing:", error.message);
      sendJson(response, error.status || 503, { error: "Billing indisponivel no momento" });
    }
    return true;
  }

  if (request.method === "POST" && pathname === "/api/billing/checkout") {
    if (rateLimit(request, response, { key: "billing-checkout", max: 8, windowMs: 10 * 60_000 })) return true;
    const user = await requireAuthenticatedUser(request, response);
    if (!user) return true;
    try {
      const result = await createProCheckout({ request, user });
      sendJson(response, result.checkoutUrl ? 200 : 502, result);
    } catch (error) {
      console.error("Falha ao criar checkout:", error.message);
      sendJson(response, error.status || 503, {
        error: error.status === 503
          ? "Mercado Pago ainda nao configurado no servidor"
          : "Nao foi possivel iniciar a assinatura agora"
      });
    }
    return true;
  }

  if (request.method === "POST" && pathname === "/api/billing/webhook/mercadopago") {
    if (rateLimit(request, response, { key: "billing-webhook", max: 120, windowMs: 60_000 })) return true;
    try {
      const body = await readRawBody(request);
      const result = await processWebhook({ request, body });
      sendJson(response, 200, result);
    } catch (error) {
      console.error("Webhook Mercado Pago recusado:", error.message);
      sendJson(response, error.status || 400, { received: false });
    }
    return true;
  }

  if (request.method === "POST" && pathname === "/api/notifications/preferences") {
    if (rateLimit(request, response, { key: "notification-preferences", max: 30, windowMs: 60_000 })) return true;
    const user = await requireAuthenticatedUser(request, response);
    if (!user) return true;
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
    if (rateLimit(request, response, { key: "notification-test", max: 5, windowMs: 10 * 60_000 })) return true;
    const user = await requireAuthenticatedUser(request, response);
    if (!user) return true;
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
