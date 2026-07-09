const { getRuntimeEnvironment, getSupabaseSettings } = require("./config");

function getServiceRoleKey(request) {
  const environment = getRuntimeEnvironment(request);
  if (environment === "homo" && process.env.SUPABASE_HOMO_SERVICE_ROLE_KEY) {
    return process.env.SUPABASE_HOMO_SERVICE_ROLE_KEY;
  }
  return process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || "";
}

function getAdminClientSettings(request) {
  const { supabaseUrl } = getSupabaseSettings(request);
  const serviceRoleKey = getServiceRoleKey(request);
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase service role nao configurado no servidor");
  }
  return {
    baseUrl: supabaseUrl.replace(/\/+$/, ""),
    serviceRoleKey
  };
}

function assertSupabaseAdminConfigured(request) {
  getAdminClientSettings(request);
}

async function supabaseAdminRequest(request, path, options = {}) {
  const { baseUrl, serviceRoleKey } = getAdminClientSettings(request);
  const headers = {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    "Content-Type": "application/json",
    ...(options.headers || {})
  };
  const response = await fetch(`${baseUrl}/rest/v1${path}`, {
    method: options.method || "GET",
    headers,
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
    throw new Error(`Supabase admin falhou: ${detail}`);
  }
  return payload;
}

module.exports = { assertSupabaseAdminConfigured, getServiceRoleKey, supabaseAdminRequest };
