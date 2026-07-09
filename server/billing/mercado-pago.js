const crypto = require("node:crypto");
const { getPublicConfig } = require("../config");
const { assertSupabaseAdminConfigured, supabaseAdminRequest } = require("../supabase-admin");

const MERCADO_PAGO_API = "https://api.mercadopago.com";
const ACTIVE_STATUSES = new Set(["authorized", "active"]);

function getAccessToken() {
  return process.env.MERCADO_PAGO_ACCESS_TOKEN || "";
}

function getProPrice() {
  const price = Number(String(process.env.MERCADO_PAGO_PRO_PRICE || "19.9").replace(",", "."));
  return Number.isFinite(price) && price > 0 ? price : 19.9;
}

function getAppUrl(request) {
  const configured = process.env.APP_URL || process.env.PUBLIC_APP_URL || getPublicConfig(request).appUrl;
  if (configured) return configured.replace(/\/+$/, "");
  const host = request.headers.host;
  return host ? `https://${host}` : "https://paddocke.vercel.app";
}

function encodeQuery(params) {
  return new URLSearchParams(params).toString();
}

async function mercadoPagoRequest(path, options = {}) {
  const accessToken = getAccessToken();
  if (!accessToken) {
    const error = new Error("Mercado Pago ainda nao configurado");
    error.status = 503;
    throw error;
  }

  const response = await fetch(`${MERCADO_PAGO_API}${path}`, {
    method: options.method || "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "X-Idempotency-Key": options.idempotencyKey || crypto.randomUUID(),
      ...(options.headers || {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const text = await response.text();
  let payload = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }
  if (!response.ok) {
    const detail = typeof payload === "string" ? payload : payload?.message || response.statusText;
    const error = new Error(detail || "Mercado Pago recusou a requisicao");
    error.status = response.status;
    error.payload = payload;
    throw error;
  }
  return payload;
}

function subscriptionPayload({ user, request, externalReference }) {
  return {
    reason: "Paddocke Pro",
    external_reference: externalReference,
    payer_email: user.email,
    auto_recurring: {
      frequency: 1,
      frequency_type: "months",
      transaction_amount: getProPrice(),
      currency_id: "BRL"
    },
    back_url: `${getAppUrl(request)}/?billing=return`,
    status: "pending"
  };
}

function toSubscriptionRecord({ userId, subscription, externalReference }) {
  return {
    user_id: userId,
    provider: "mercado_pago",
    provider_subscription_id: String(subscription.id || ""),
    provider_plan_id: subscription.preapproval_plan_id ? String(subscription.preapproval_plan_id) : null,
    external_reference: externalReference || subscription.external_reference || "",
    plan: "pro",
    status: String(subscription.status || "pending"),
    checkout_url: subscription.init_point || subscription.sandbox_init_point || "",
    raw: subscription,
    updated_at: new Date().toISOString()
  };
}

async function saveSubscription(request, record) {
  const params = encodeQuery({ on_conflict: "provider,provider_subscription_id" });
  const rows = await supabaseAdminRequest(request, `/subscriptions?${params}`, {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=representation" },
    body: [record]
  });
  return Array.isArray(rows) ? rows[0] : rows;
}

async function createProCheckout({ request, user }) {
  if (!user?.id || !user?.email) {
    const error = new Error("Usuario autenticado obrigatorio");
    error.status = 401;
    throw error;
  }
  assertSupabaseAdminConfigured(request);

  const externalReference = `paddocke:${user.id}:pro:${Date.now()}`;
  const payload = subscriptionPayload({ user, request, externalReference });
  const subscription = await mercadoPagoRequest("/preapproval", {
    method: "POST",
    idempotencyKey: externalReference,
    body: payload
  });
  const record = await saveSubscription(request, toSubscriptionRecord({
    userId: user.id,
    subscription,
    externalReference
  }));

  return {
    checkoutUrl: record.checkout_url || subscription.init_point || subscription.sandbox_init_point || "",
    provider: "mercado_pago",
    status: record.status || subscription.status || "pending"
  };
}

async function getBillingStatus({ request, user }) {
  const params = encodeQuery({
    user_id: `eq.${user.id}`,
    provider: "eq.mercado_pago",
    order: "created_at.desc",
    limit: "1"
  });
  const rows = await supabaseAdminRequest(request, `/subscriptions?${params}`);
  const subscription = Array.isArray(rows) ? rows[0] : null;
  const status = subscription?.status || "inactive";
  return {
    plan: ACTIVE_STATUSES.has(status) ? "pro" : "free",
    provider: subscription?.provider || "mercado_pago",
    status,
    checkoutUrl: subscription?.checkout_url || ""
  };
}

function parseMercadoPagoSignature(signatureHeader) {
  return String(signatureHeader || "")
    .split(",")
    .map((part) => part.trim().split("="))
    .reduce((acc, [key, value]) => {
      if (key && value) acc[key] = value;
      return acc;
    }, {});
}

function verifyWebhookSignature({ request, body, notificationId }) {
  const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;
  if (!secret) return { verified: false, required: true, missingSecret: true };

  const requestId = String(request.headers["x-request-id"] || "");
  const signature = parseMercadoPagoSignature(request.headers["x-signature"]);
  if (!requestId || !signature.ts || !signature.v1) return { verified: false, required: true };

  const manifest = `id:${notificationId};request-id:${requestId};ts:${signature.ts};`;
  const digest = crypto.createHmac("sha256", secret).update(manifest).digest("hex");
  const received = Buffer.from(signature.v1, "hex");
  const expected = Buffer.from(digest, "hex");
  return {
    verified: received.length === expected.length && crypto.timingSafeEqual(received, expected),
    required: true,
    bodyLength: body.length
  };
}

function extractWebhookData(body, request) {
  const parsed = body ? JSON.parse(body) : {};
  const url = new URL(request.url, "http://localhost");
  const notificationId = String(parsed?.data?.id || parsed.id || url.searchParams.get("data.id") || url.searchParams.get("id") || "");
  const topic = String(parsed.type || parsed.topic || url.searchParams.get("topic") || "");
  return { notificationId, parsed, topic };
}

async function fetchSubscriptionFromNotification(notificationId) {
  if (!notificationId) return null;
  return mercadoPagoRequest(`/preapproval/${encodeURIComponent(notificationId)}`, {
    method: "GET",
    idempotencyKey: `webhook-fetch-${notificationId}`
  });
}

async function processWebhook({ request, body }) {
  const { notificationId, parsed, topic } = extractWebhookData(body, request);
  const signature = verifyWebhookSignature({ request, body, notificationId });
  if (signature.missingSecret) {
    const error = new Error("Webhook Mercado Pago sem segredo configurado");
    error.status = 503;
    throw error;
  }
  if (signature.required && !signature.verified) {
    const error = new Error("Assinatura do Mercado Pago invalida");
    error.status = 401;
    throw error;
  }

  const eventId = String(parsed.id || notificationId || crypto.randomUUID());
  await supabaseAdminRequest(request, "/billing_events", {
    method: "POST",
    headers: { Prefer: "resolution=ignore-duplicates" },
    body: [{
      provider: "mercado_pago",
      provider_event_id: eventId,
      event_type: topic || "unknown",
      resource_id: notificationId,
      raw: parsed
    }]
  });

  if (!notificationId) return { received: true, processed: false };
  let subscription = null;
  try {
    subscription = await fetchSubscriptionFromNotification(notificationId);
  } catch {
    return { received: true, processed: false };
  }

  const externalReference = String(subscription.external_reference || "");
  const userId = externalReference.split(":")[1] || "";
  if (!userId || !externalReference.startsWith("paddocke:")) {
    return { received: true, processed: false };
  }

  await saveSubscription(request, toSubscriptionRecord({
    userId,
    subscription,
    externalReference
  }));

  await supabaseAdminRequest(request, `/billing_events?${encodeQuery({ provider_event_id: `eq.${eventId}` })}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: { processed_at: new Date().toISOString() }
  });

  return { received: true, processed: true, status: subscription.status || "pending" };
}

module.exports = {
  createProCheckout,
  getBillingStatus,
  processWebhook
};
