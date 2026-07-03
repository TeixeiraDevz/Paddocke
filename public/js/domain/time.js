export function normalizeTaskTimeValue(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "";

  const colonMatch = trimmed.match(/^(\d{1,2})\s*:\s*(\d{1,2})$/);
  const digits = trimmed.replace(/\D/g, "");
  let rawHour = "";
  let rawMinute = "";

  if (colonMatch) {
    rawHour = colonMatch[1];
    rawMinute = colonMatch[2];
  } else if (digits.length <= 2) {
    rawHour = digits;
    rawMinute = "0";
  } else {
    rawHour = digits.slice(0, -2);
    rawMinute = digits.slice(-2);
  }

  const hour = Math.min(23, Math.max(0, Number(rawHour || 0)));
  const minute = Math.min(59, Math.max(0, Number(rawMinute || 0)));
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}
