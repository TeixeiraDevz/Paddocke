import { createClient } from "npm:@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey =
  Deno.env.get("SUPABASE_SECRET_KEY") ||
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ||
  "";
const resendApiKey = Deno.env.get("RESEND_API_KEY") || "";
const emailFrom = Deno.env.get("EMAIL_FROM") || "Paddocke <onboarding@resend.dev>";
const cronSecret = Deno.env.get("CRON_SECRET") || "";

const supabase = createClient(supabaseUrl, supabaseKey);

function localParts(timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  }).formatToParts(new Date());

  return Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value])
  ) as Record<string, string>;
}

function normalizeTime(value: unknown) {
  return String(value || "").slice(0, 5);
}

function escapeHtml(value: unknown) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function buildTaskList(tasks: Array<{ title: string; category: string; due_time: string | null }>) {
  if (!tasks.length) return "<li>Você não tem tarefas pendentes para hoje.</li>";

  return tasks
    .map((task) => {
      const time = task.due_time ? normalizeTime(task.due_time) : "Sem horário";
      return `<li style="margin:0 0 12px"><strong>${escapeHtml(task.title)}</strong><br><span style="color:#667085">${escapeHtml(time)} - ${escapeHtml(task.category)}</span></li>`;
    })
    .join("");
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204 });
  }

  if (!supabaseUrl || !supabaseKey || !resendApiKey || !cronSecret) {
    return Response.json(
      {
        error: "Missing required environment variables.",
        required: ["SUPABASE_URL", "SUPABASE_SECRET_KEY", "RESEND_API_KEY", "CRON_SECRET"]
      },
      { status: 500 }
    );
  }

  if (request.headers.get("x-cron-secret") !== cronSecret) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { data: preferences, error: preferencesError } = await supabase
    .from("notification_preferences")
    .select("*")
    .eq("enabled", true)
    .neq("email", "");

  if (preferencesError) {
    return Response.json({ error: preferencesError.message }, { status: 500 });
  }

  let due = 0;
  let sent = 0;
  const errors: Array<{ user_id: string; message: string }> = [];

  for (const preference of preferences || []) {
    const parts = localParts(preference.timezone || "America/Manaus");
    const today = `${parts.year}-${parts.month}-${parts.day}`;
    const currentTime = `${parts.hour}:${parts.minute}`;

    if (currentTime !== normalizeTime(preference.delivery_time)) continue;
    if (preference.last_sent_date === today) continue;
    due += 1;

    const { data: tasks, error: tasksError } = await supabase
      .from("tasks")
      .select("title, category, due_time")
      .eq("user_id", preference.user_id)
      .eq("due_date", today)
      .eq("completed", false)
      .order("due_time", { ascending: true });

    if (tasksError) {
      errors.push({ user_id: preference.user_id, message: tasksError.message });
      continue;
    }

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `paddocke-${preference.user_id}-${today}`
      },
      body: JSON.stringify({
        from: emailFrom,
        to: [preference.email],
        subject: `Paddocke: suas tarefas de ${parts.day}/${parts.month}`,
        html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#101828"><h1 style="color:#176fdc">Seu dia no Paddocke</h1><p>Estas são suas tarefas pendentes para hoje:</p><ul style="padding-left:20px">${buildTaskList(tasks || [])}</ul><p style="color:#667085">Um passo de cada vez.</p></div>`
      })
    });

    if (!emailResponse.ok) {
      errors.push({
        user_id: preference.user_id,
        message: `Resend returned ${emailResponse.status}: ${await emailResponse.text()}`
      });
      continue;
    }

    const { error: updateError } = await supabase
      .from("notification_preferences")
      .update({ last_sent_date: today, updated_at: new Date().toISOString() })
      .eq("user_id", preference.user_id);

    if (updateError) {
      errors.push({ user_id: preference.user_id, message: updateError.message });
      continue;
    }

    sent += 1;
  }

  return Response.json({
    checked: preferences?.length || 0,
    due,
    sent,
    errors
  });
});
