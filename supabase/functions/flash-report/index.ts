// KŌMØ Pulse — consultation flash (25/11/2026). Rapport en français ou en anglais (champ lang).
// Envoie le mini-rapport d'une consultation flash (préhension, debout yeux fermés, appui sur une jambe)
// à la personne testée, avec le lien de réservation du bilan complet.
// - Réservé aux comptes praticiens (account_roles admin/professional), comme motion-live-test.
// - Le contenu de l'e-mail est construit ici à partir de valeurs numériques bornées : aucun texte libre
//   en dehors du prénom et du nom, échappés.
// - Rien n'est enregistré en base. Les journaux ne contiennent ni nom, ni adresse, ni mesure.
// - Repères et textes : ./flash-norms.mjs, copie identique de pulse-v14-src/flash/flash-norms.mjs (contrôlée au build).
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
// @ts-ignore module JavaScript partagé avec la page flash
import { flashModel, flashText, fmtDate, REPORT, BOOKING_URL } from "./flash-norms.mjs";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const db = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

const ORIGINS = new Set(["https://pulse.komolongevity.com", "https://komolongevity.com", "https://www.komolongevity.com"]);
const allowedOrigin = (o: string) => ORIGINS.has(o) || /^https:\/\/komo-longevity-[a-z0-9-]+-rnnchpns-projects\.vercel\.app$/.test(o);
function headers(req: Request) {
  const origin = req.headers.get("origin") || "";
  return {
    "Access-Control-Allow-Origin": allowedOrigin(origin) ? origin : "https://pulse.komolongevity.com",
    "Access-Control-Allow-Headers": "authorization,apikey,x-client-info,content-type",
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff", "Referrer-Policy": "no-referrer", "Vary": "Origin",
  };
}
const reply = (req: Request, data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: headers(req) });

async function practitioner(req: Request) {
  const jwt = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!jwt || jwt === req.headers.get("apikey")) return null;
  const { data, error } = await db.auth.getUser(jwt);
  const user = data?.user;
  if (error || !user) return null;
  const { data: role } = await db.from("account_roles").select("role").eq("user_id", user.id).maybeSingle();
  if (!["admin", "professional"].includes(role?.role || "")) return { user, allowed: false };
  return { user, allowed: true };
}

const esc = (v: unknown) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));
const cleanName = (v: unknown) => typeof v === "string" ? v.replace(/[\u0000-\u001f<>]/g, "").trim().slice(0, 60) : "";
const emailRe = /^[^\s@<>()",;:]+@[^\s@<>()",;:]+\.[^\s@<>()",;:]{2,}$/;
function bounded(v: unknown, min: number, max: number): number | null {
  if (v === null || v === undefined || v === "") return null;
  const x = Number(v);
  if (!Number.isFinite(x) || x < min || x > max) throw new Error("invalid_value");
  return Math.round(x * 10) / 10;
}

type Zone = "solid" | "consolidate" | "priority" | "reference";
const ZONE_COLOR: Record<Zone, [string, string]> = { solid: ["#2f6b4a", "#e4efe7"], consolidate: ["#8a5a12", "#f6ecd9"], priority: ["#9b3426", "#f6e1dc"], reference: ["#4a5a6a", "#e7ecf1"] };
type Model = { measures: { key: string; name: string; zone: Zone; value: string; norm: string; meaning: string }[]; strength: any; focus: any };

function renderEmail(firstName: string, dateText: string, age: number | null, m: Model, signature: string, lang: "fr" | "en") {
  const T = REPORT[lang];
  const rows = m.measures.map((x) => {
    const [fg, bg] = ZONE_COLOR[x.zone];
    return `<tr><td style="padding:14px 0;border-top:1px solid #ece6dc;vertical-align:top"><div style="font-weight:600;color:#1c342a;font-size:15px">${esc(x.name)}</div><div style="color:#1c342a;font-size:15px;margin-top:2px">${esc(x.value)}</div><div style="color:#3f4a42;font-size:13px;line-height:1.5;margin-top:6px">${esc(x.norm)}</div><div style="color:#3f4a42;font-size:13px;line-height:1.5;margin-top:4px;padding-left:10px;border-left:3px solid ${fg}">${esc(x.meaning)}</div></td><td style="padding:14px 0 14px 12px;border-top:1px solid #ece6dc;vertical-align:top;text-align:right;white-space:nowrap"><span style="display:inline-block;background:${bg};color:${fg};font-size:12px;font-weight:700;border-radius:999px;padding:4px 10px">${esc(T.zone[x.zone])}</span></td></tr>`;
  }).join("");
  const focusBlock = (m.strength ? `<p style="margin:4px 0"><b>${esc(T.strength)}</b> ${esc(m.strength.name.toLowerCase())}.</p>` : "") +
    (m.focus ? `<p style="margin:4px 0"><b>${esc(T.focus)}</b> ${esc(m.focus.name.toLowerCase())}.</p>` : `<p style="margin:4px 0">${esc(T.allSolid)}</p>`);
  return `<!doctype html><html lang="${lang}"><body style="margin:0;background:#f4f1eb;font-family:Arial,Helvetica,sans-serif;color:#3f4a42"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:32px 14px"><table role="presentation" width="100%" style="max-width:620px;background:#ffffff;border-radius:20px;border:1px solid #e9e5de"><tr><td style="padding:34px 30px">
<div style="font-size:18px;letter-spacing:.18em;font-weight:700;color:#1c342a;margin-bottom:28px">KŌMØ</div>
<div style="font-size:11px;letter-spacing:.16em;color:#748078;margin-bottom:10px">${esc(T.eyebrow)}</div>
<h1 style="font-family:Georgia,serif;font-size:28px;line-height:1.15;font-weight:400;color:#1c342a;margin:0 0 18px">${esc(T.heading(dateText))}</h1>
<p style="font-size:15px;line-height:1.6;margin:0 0 8px">${esc(T.hello(firstName))}</p>
<p style="font-size:15px;line-height:1.6;margin:0 0 18px">${esc(T.intro(age))}</p>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0">${rows}</table>
<div style="background:#f5f1ea;border-radius:12px;padding:12px 14px;margin:16px 0 22px;font-size:15px;line-height:1.5;color:#1c342a">${focusBlock}</div>
<div style="background:#e3ebe2;border-radius:12px;padding:18px 18px 20px">
<div style="font-family:Georgia,serif;font-size:19px;color:#1c342a;margin-bottom:6px">${esc(T.bookTitle)}</div>
<p style="font-size:14px;line-height:1.6;margin:0 0 14px">${esc(T.bookText)}</p>
<a href="${BOOKING_URL}" style="display:inline-block;background:#1c342a;color:#ffffff;text-decoration:none;border-radius:12px;padding:13px 20px;font-size:14px;font-weight:600">${esc(T.bookCta)}</a>
</div>
<p style="font-size:14px;line-height:1.6;margin:22px 0 0">${esc(signature)}</p>
<p style="font-size:12px;line-height:1.6;color:#8a8f8a;margin:26px 0 0">${esc(T.disclaimer)} ${esc(T.sources)} ${esc(T.consentNote)}</p>
</td></tr></table></td></tr></table></body></html>`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: headers(req) });
  if (req.method !== "POST") return reply(req, { ok: false, error: "method_not_allowed" }, 405);
  const origin = req.headers.get("origin") || "";
  if (origin && !allowedOrigin(origin)) return reply(req, { ok: false, error: "origin_forbidden" }, 403);
  const raw = await req.text();
  if (raw.length > 8000) return reply(req, { ok: false, error: "payload_too_large" }, 413);
  let b: any = {};
  try { b = JSON.parse(raw || "{}"); } catch { return reply(req, { ok: false, error: "invalid_json" }, 400); }

  const who = await practitioner(req);
  if (!who) return reply(req, { ok: false, error: "unauthorized" }, 401);
  if (!who.allowed) return reply(req, { ok: false, error: "forbidden" }, 403);

  const resendKey = Deno.env.get("RESEND_API_KEY") || "";
  const emailFrom = Deno.env.get("PULSE_EMAIL_FROM") || "";
  const fallbackReplyTo = Deno.env.get("PULSE_EMAIL_REPLY_TO") || "";
  if (b?.action === "health") {
    if (!resendKey || !emailFrom) return reply(req, { ok: false, error: "email_not_configured" }, 503);
    return reply(req, { ok: true });
  }
  if (b?.action !== "send") return reply(req, { ok: false, error: "unknown_action" }, 400);
  if (!resendKey || !emailFrom) return reply(req, { ok: false, error: "email_not_configured" }, 503);

  const firstName = cleanName(b?.patient?.firstName);
  const to = typeof b?.patient?.email === "string" ? b.patient.email.trim().slice(0, 120) : "";
  if (!firstName) return reply(req, { ok: false, error: "first_name_required" }, 400);
  if (!emailRe.test(to)) return reply(req, { ok: false, error: "invalid_email" }, 400);
  const consultationId = typeof b?.consultationId === "string" ? b.consultationId.replace(/[^a-zA-Z0-9-]/g, "").slice(0, 64) : "";
  if (!consultationId) return reply(req, { ok: false, error: "consultation_id_required" }, 400);
  const sex = b?.sex === "male" ? "male" : "female";

  let values: Record<string, number | string | null>;
  try {
    const v = b?.values || {};
    values = {
      gripR: bounded(v.gripR, 0.1, 120), gripL: bounded(v.gripL, 0.1, 120),
      qsVel: bounded(v.qsVel, 0, 300), qsAsym: bounded(v.qsAsym, 0, 100),
      qsSide: v.qsSide === "left" || v.qsSide === "right" ? v.qsSide : "",
      slsL: bounded(v.slsL, 0, 30), slsR: bounded(v.slsR, 0, 30),
    };
  } catch { return reply(req, { ok: false, error: "invalid_value" }, 400); }
  const age = Number.isInteger(b?.age) && b.age >= 18 && b.age <= 100 ? b.age : null;
  const lang: "fr" | "en" = b?.lang === "en" ? "en" : "fr";
  const m = flashModel(values, sex, age, lang) as Model;
  if (!m.measures.length) return reply(req, { ok: false, error: "no_measure" }, 400);

  const when = new Date(typeof b?.date === "string" ? b.date : Date.now());
  const dateText = fmtDate(isNaN(when.getTime()) ? new Date() : when, lang);
  const meta = who.user.user_metadata || {};
  const practitionerName = cleanName(meta.display_name || meta.full_name || "");
  const signature = practitionerName ? `${practitionerName} · KŌMØ Longevity` : REPORT[lang].team;
  const practitionerEmail = who.user.email && emailRe.test(who.user.email) ? who.user.email : "";
  const replyTo = practitionerEmail || fallbackReplyTo || undefined;
  const idempotencyKey = `flash:${who.user.id}:${consultationId}${b?.resend ? ":" + Date.now() : ""}`.slice(0, 240);

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json", "Idempotency-Key": idempotencyKey },
    body: JSON.stringify({
      from: emailFrom, to: [to], reply_to: replyTo,
      bcc: practitionerEmail && practitionerEmail.toLowerCase() !== to.toLowerCase() ? [practitionerEmail] : undefined,
      subject: REPORT[lang].subject(dateText),
      html: renderEmail(firstName, dateText, age, m, signature, lang),
      text: flashText({ firstName }, m, dateText, signature, age),
      tags: [{ name: "kind", value: "flash_report" }],
    }),
  });
  const result = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error("[flash-report] delivery failed", { status: res.status, practitioner: who.user.id });
    return reply(req, { ok: false, error: `delivery_failed_${res.status}` }, 502);
  }
  console.log("[flash-report] sent", { practitioner: who.user.id, measures: m.measures.length });
  return reply(req, { ok: true, id: result?.id || null });
});
