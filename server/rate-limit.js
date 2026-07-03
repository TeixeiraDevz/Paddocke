const buckets = new Map();

function getClientIp(request) {
  const forwardedFor = String(request.headers["x-forwarded-for"] || "").split(",")[0].trim();
  return forwardedFor || request.socket?.remoteAddress || "unknown";
}

function rateLimit(request, response, options = {}) {
  const windowMs = options.windowMs || 60_000;
  const max = options.max || 30;
  const now = Date.now();
  const key = `${options.key || request.url}:${getClientIp(request)}`;
  const current = buckets.get(key) || { count: 0, resetAt: now + windowMs };

  if (current.resetAt <= now) {
    current.count = 0;
    current.resetAt = now + windowMs;
  }

  current.count += 1;
  buckets.set(key, current);

  if (current.count <= max) return false;

  response.writeHead(429, {
    "Cache-Control": "no-store",
    "Content-Type": "application/json; charset=utf-8",
    "Retry-After": String(Math.ceil((current.resetAt - now) / 1000))
  });
  response.end(JSON.stringify({
    error: "Muitas tentativas em pouco tempo. Aguarde alguns instantes e tente novamente."
  }));
  return true;
}

module.exports = { rateLimit };
