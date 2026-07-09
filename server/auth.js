const { getAdminEmails, getSupabaseSettings } = require("./config");
const { sendJson } = require("./http");

function getBearerToken(request) {
  const authorization = String(request.headers.authorization || "");
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : "";
}

async function getAuthenticatedUser(request) {
  const token = getBearerToken(request);
  const { supabaseUrl, supabaseAnonKey } = getSupabaseSettings(request);
  if (!supabaseUrl || !supabaseAnonKey || !token) return null;

  const response = await fetch(`${supabaseUrl.replace(/\/+$/, "")}/auth/v1/user`, {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) return null;
  const user = await response.json();
  return user?.id ? user : null;
}

async function requireAuthenticatedUser(request, response) {
  const user = await getAuthenticatedUser(request);
  if (user) return user;
  sendJson(response, 401, {
    error: "Sessao invalida ou expirada. Entre novamente para continuar."
  });
  return null;
}

function isAdminUser(user) {
  const email = String(user?.email || "").trim().toLowerCase();
  return Boolean(email && getAdminEmails().includes(email));
}

module.exports = {
  getAuthenticatedUser,
  isAdminUser,
  requireAuthenticatedUser
};
