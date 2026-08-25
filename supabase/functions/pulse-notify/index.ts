import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const templates: Record<string, { subject: string; eyebrow: string; title: string; body: string }> = {
  welcome: { subject: "Welcome to KŌMØ", eyebrow: "KŌMØ PULSE", title: "Votre espace est prêt.", body: "Pulse rassemble vos repères, votre trajectoire et les prochaines étapes de votre parcours KŌMØ." },
  assessment_ready: { subject: "Your KŌMØ assessment is ready", eyebrow: "KŌMØ PULSE", title: "Votre nouvelle lecture est disponible.", body: "Connectez-vous à votre espace sécurisé KŌMØ Pulse pour retrouver les éléments qui ont été mis à votre disposition." },
  prepare_assessment: { subject: "Prepare for your upcoming KŌMØ assessment", eyebrow: "KŌMØ PULSE", title: "Votre prochaine évaluation approche.", body: "Les éléments utiles à préparer sont disponibles dans votre espace KŌMØ Pulse." },
  clinical_invitation: { subject: "You have been invited to KŌMØ Clinical", eyebrow: "KŌMØ CLINICAL", title: "Votre accès professionnel évolue.", body: "Une invitation KŌMØ Clinical vous attend. Connectez-vous à Pulse pour poursuivre dans l’environnement sécurisé." },
};

const escapeHtml = (value = "") => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store, max-age=0" } });
}

function renderEmail(template: (typeof templates)[string], displayName: string, appOrigin: string) {
  const safeName = escapeHtml(displayName || "");
  const greeting = safeName ? `Bonjour ${safeName},` : "Bonjour,";
  const safeOrigin = escapeHtml(appOrigin);
  return `<!doctype html><html><body style="margin:0;background:#f4f1eb;font-family:Arial,sans-serif;color:#202421"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:42px 18px"><table role="presentation" width="100%" style="max-width:620px;background:#ffffff;border-radius:24px;border:1px solid #e9e5de"><tr><td style="padding:42px"><div style="font-size:20px;letter-spacing:.18em;font-weight:700;margin-bottom:48px">KŌMØ</div><div style="font-size:11px;letter-spacing:.16em;color:#748078;margin-bottom:12px">${template.eyebrow}</div><h1 style="font-size:32px;line-height:1.12;font-weight:500;letter-spacing:-.03em;margin:0 0 24px">${template.title}</h1><p style="font-size:15px;line-height:1.7;color:#5f665f;margin:0 0 12px">${greeting}</p><p style="font-size:15px;line-height:1.7;color:#5f665f;margin:0 0 30px">${template.body}</p><a href="${safeOrigin}" style="display:inline-block;background:#202421;color:#ffffff;text-decoration:none;border-radius:12px;padding:14px 20px;font-size:14px;font-weight:600">Ouvrir KŌMØ Pulse</a><p style="font-size:12px;line-height:1.6;color:#8a8f8a;margin:38px 0 0">Pour protéger votre confidentialité, cet e-mail ne contient aucune donnée de santé ni résultat clinique.</p></td></tr></table></td></tr></table></body></html>`;
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return json({ ok: false, error: "method_not_allowed" }, 405);

  const authorization = req.headers.get("Authorization") || "";
  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
  const resendKey = Deno.env.get("RESEND_API_KEY") || "";
  const emailFrom = Deno.env.get("PULSE_EMAIL_FROM") || "";
  const replyTo = Deno.env.get("PULSE_EMAIL_REPLY_TO") || "";
  const appOrigin = Deno.env.get("PULSE_APP_ORIGIN") || "https://pulse.komolongevity.com/";

  const supabase = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authorization } }, auth: { persistSession: false, autoRefreshToken: false } });
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user?.id || !user.email) return json({ ok: false, error: "unauthorized" }, 401);

  const body = await req.json().catch(() => ({}));
  if (body?.action === "health") {
    const ready = Boolean(resendKey && emailFrom);
    return json({ ok: ready, checks: { resendApiKey: Boolean(resendKey), emailFrom: Boolean(emailFrom), appOrigin: Boolean(appOrigin) } }, ready ? 200 : 503);
  }

  const kind = String(body?.kind || "");
  const template = templates[kind];
  if (!template) return json({ ok: false, error: "unsupported_template" }, 400);
  if (!resendKey || !emailFrom) return json({ ok: false, error: "email_not_configured" }, 503);

  const eventReference = String(body?.eventReference || new Date().toISOString().slice(0, 10)).replace(/[^a-zA-Z0-9._:-]/g, "").slice(0, 100);
  const idempotencyKey = `pulse:${kind}:${user.id}:${eventReference}`.slice(0, 240);
  const displayName = String(user.user_metadata?.display_name || user.user_metadata?.full_name || "");

  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json", "Idempotency-Key": idempotencyKey },
    body: JSON.stringify({ from: emailFrom, to: [user.email], reply_to: replyTo || undefined, subject: template.subject, html: renderEmail(template, displayName, appOrigin) }),
  });

  const result = await resendResponse.json().catch(() => ({}));
  if (!resendResponse.ok) {
    console.error("[pulse-notify] delivery failed", { status: resendResponse.status, kind, userId: user.id });
    return json({ ok: false, error: "delivery_failed" }, 502);
  }
  return json({ ok: true, id: result?.id || null, kind });
});
