const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const ROOT_DIR = path.resolve(__dirname, "..");

function loadLocalEnv() {
  if (process.env.VERCEL) return;
  try {
    const envFile = fs.readFileSync(path.join(ROOT_DIR, ".env"), "utf8");
    envFile.split(/\r?\n/).forEach((line) => {
      const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (!match || process.env[match[1]]) return;
      process.env[match[1]] = match[2].trim().replace(/^(['"])(.*)\1$/, "$2");
    });
  } catch {
    // Environment variables can also be supplied directly by the host.
  }
}

loadLocalEnv();

const PORT = Number(process.env.PORT) || 3000;
const PUBLIC_DIR = path.join(ROOT_DIR, "public");
const DATA_DIR = process.env.VERCEL ? path.join(os.tmpdir(), "paddocke-data") : path.join(ROOT_DIR, "data");
const PREFERENCES_FILE = path.join(DATA_DIR, "notification-preferences.json");

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".webmanifest": "application/manifest+json"
};

function getPublicConfig() {
  const productionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "";
  return {
    aiConfigured: Boolean(process.env.OPENAI_API_KEY),
    emailConfigured: Boolean(process.env.RESEND_API_KEY),
    appUrl: process.env.APP_URL || process.env.PUBLIC_APP_URL || productionUrl,
    supabaseUrl: process.env.SUPABASE_URL || "",
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || "",
    adminEmails: process.env.PADDOCKE_ADMIN_EMAILS || process.env.ADMIN_EMAILS || ""
  };
}

module.exports = {
  DATA_DIR,
  MIME_TYPES,
  PORT,
  PREFERENCES_FILE,
  PUBLIC_DIR,
  ROOT_DIR,
  getPublicConfig
};
