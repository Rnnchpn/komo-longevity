// KŌMØ Pulse — consultation flash (25/11/2026).
// Envoie le mini-rapport d'une consultation flash (préhension, debout yeux fermés, appui sur une jambe)
// à la personne testée, avec le lien de réservation du bilan complet.
// - Réservé aux comptes praticiens (account_roles admin/professional), comme motion-live-test.
// - Le contenu de l'e-mail est construit ici à partir de valeurs numériques bornées : aucun texte libre
//   en dehors du prénom et du nom, échappés.
// - Rien n'est enregistré en base. Les journaux ne contiennent ni nom, ni adresse, ni mesure.
// - Repères identiques à pulse-v14-src/flash/index.html (fonction model) : à modifier ensemble.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const db = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
const BOOKING_URL = "https://rdv-consultation.vercel.app";

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
const fr = (x: number | null, d = 1) => x == null ? "—" : x.toLocaleString("fr-FR", { minimumFractionDigits: d, maximumFractionDigits: d });

type Zone = "solid" | "consolidate" | "priority" | "reference";
const ZONE_LABEL: Record<Zone, string> = { solid: "Solide", consolidate: "À consolider", priority: "Priorité", reference: "Repère personnel" };
const ZONE_COLOR: Record<Zone, [string, string]> = { solid: ["#2f6b4a", "#e4efe7"], consolidate: ["#8a5a12", "#f6ecd9"], priority: ["#9b3426", "#f6e1dc"], reference: ["#4a5a6a", "#e7ecf1"] };
const GRIP_LOW: Record<string, number> = { female: 16, male: 27 };

function model(v: Record<string, number | string | null>, sex: string) {
  const out: { key: string; name: string; zone: Zone; value: string; why: string }[] = [];
  const gripR = v.gripR as number | null, gripL = v.gripL as number | null;
  if (gripR != null || gripL != null) {
    const best = Math.max(gripR ?? 0, gripL ?? 0), low = GRIP_LOW[sex] ?? 16;
    out.push({ key: "grip", name: "Force de préhension", zone: best < low ? "priority" : best < low + 5 ? "consolidate" : "solid",
      value: `Droite ${fr(gripR)} kg · Gauche ${fr(gripL)} kg`, why: "La force de la main reflète la force musculaire de tout le corps." });
    if (gripR != null && gripL != null && Math.max(gripR, gripL) > 0) {
      const sym = Math.round(Math.min(gripR, gripL) / Math.max(gripR, gripL) * 100);
      out.push({ key: "symmetry", name: "Symétrie des mains", zone: sym < 80 ? "priority" : sym < 90 ? "consolidate" : "solid",
        value: `${fr(sym, 0)} % (main la plus faible / la plus forte)`, why: "Un écart marqué entre les deux côtés se travaille en priorité du côté faible." });
    }
  }
  const qsVel = v.qsVel as number | null, qsAsym = v.qsAsym as number | null;
  if (qsVel != null || qsAsym != null) {
    const side = v.qsSide === "left" ? " à gauche" : v.qsSide === "right" ? " à droite" : "";
    out.push({ key: "quiet_stand", name: "Équilibre debout, yeux fermés", zone: qsAsym != null && qsAsym > 10 ? "consolidate" : "reference",
      value: [qsVel != null ? `Oscillation ${fr(qsVel)} mm/s` : null, qsAsym != null ? `charge décalée de ${fr(qsAsym)} %${side}` : null].filter(Boolean).join(" · "),
      why: "Sans la vue, l’équilibre repose sur l’oreille interne et sur les capteurs des pieds et des articulations. Cette valeur sert de point de départ." });
  }
  const l = v.slsL as number | null, r = v.slsR as number | null;
  if (l != null || r != null) {
    const weak = Math.min(l ?? 30, r ?? 30);
    out.push({ key: "single_leg", name: "Appui sur une jambe", zone: weak < 10 ? "priority" : (l != null && r != null && l >= 29.95 && r >= 29.95) ? "solid" : "consolidate",
      value: `Gauche ${l == null ? "—" : fr(l) + " s"} · Droite ${r == null ? "—" : fr(r) + " s"} (sur 30 s)`,
      why: "Tenir sur une jambe sollicite l’équilibre et la force des hanches et des chevilles." });
  }
  const order = ["single_leg", "grip", "symmetry"];
  const strength = out.filter((m) => m.zone === "solid").sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key))[0] || null;
  const focus = out.filter((m) => m.zone === "priority" || m.zone === "consolidate").sort((a, b) => (a.zone === "priority" ? 0 : 1) - (b.zone === "priority" ? 0 : 1))[0] || null;
  return { measures: out, strength, focus };
}

function renderEmail(firstName: string, dateText: string, m: ReturnType<typeof model>, signature: string) {
  const rows = m.measures.map((x) => {
    const [fg, bg] = ZONE_COLOR[x.zone];
    return `<tr><td style="padding:14px 0;border-top:1px solid #ece6dc;vertical-align:top"><div style="font-weight:600;color:#1c342a;font-size:15px">${esc(x.name)}</div><div style="color:#1c342a;font-size:15px;margin-top:2px">${esc(x.value)}</div><div style="color:#6b6f66;font-size:13px;line-height:1.5;margin-top:4px">${esc(x.why)}</div></td><td style="padding:14px 0 14px 12px;border-top:1px solid #ece6dc;vertical-align:top;text-align:right;white-space:nowrap"><span style="display:inline-block;background:${bg};color:${fg};font-size:12px;font-weight:700;border-radius:999px;padding:4px 10px">${ZONE_LABEL[x.zone]}</span></td></tr>`;
  }).join("");
  const focusBlock = (m.strength ? `<p style="margin:4px 0"><b>Votre point fort ce soir :</b> ${esc(m.strength.name.toLowerCase())}.</p>` : "") +
    (m.focus ? `<p style="margin:4px 0"><b>À regarder de plus près :</b> ${esc(m.focus.name.toLowerCase())}.</p>` : `<p style="margin:4px 0">Tout est solide ce soir : le bilan complet fixe votre point de départ et suit votre trajectoire.</p>`);
  return `<!doctype html><html lang="fr"><body style="margin:0;background:#f4f1eb;font-family:Arial,Helvetica,sans-serif;color:#3f4a42"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:32px 14px"><table role="presentation" width="100%" style="max-width:620px;background:#ffffff;border-radius:20px;border:1px solid #e9e5de"><tr><td style="padding:34px 30px">
<div style="font-size:18px;letter-spacing:.18em;font-weight:700;color:#1c342a;margin-bottom:28px">KŌMØ</div>
<div style="font-size:11px;letter-spacing:.16em;color:#748078;margin-bottom:10px">MINI-BILAN · KŌMØ MOTION</div>
<h1 style="font-family:Georgia,serif;font-size:28px;line-height:1.15;font-weight:400;color:#1c342a;margin:0 0 18px">Votre mini-bilan du ${esc(dateText)}</h1>
<p style="font-size:15px;line-height:1.6;margin:0 0 8px">Bonjour ${esc(firstName)},</p>
<p style="font-size:15px;line-height:1.6;margin:0 0 18px">Merci d’avoir fait le mini-bilan KŌMØ Motion. Voici vos mesures, réalisées en 5 minutes.</p>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0">${rows}</table>
<div style="background:#f5f1ea;border-radius:12px;padding:12px 14px;margin:16px 0 22px;font-size:15px;line-height:1.5;color:#1c342a">${focusBlock}</div>
<div style="background:#e3ebe2;border-radius:12px;padding:18px 18px 20px">
<div style="font-family:Georgia,serif;font-size:19px;color:#1c342a;margin-bottom:6px">Aller plus loin : le bilan complet</div>
<p style="font-size:14px;line-height:1.6;margin:0 0 14px">14 mesures en une heure, un passeport de mouvement et un programme de 6 semaines, avec des contrôles à 6 et 12 semaines.</p>
<a href="${BOOKING_URL}" style="display:inline-block;background:#1c342a;color:#ffffff;text-decoration:none;border-radius:12px;padding:13px 20px;font-size:14px;font-weight:600">Réserver mon bilan complet</a>
</div>
<p style="font-size:14px;line-height:1.6;margin:22px 0 0">${esc(signature)}</p>
<p style="font-size:12px;line-height:1.6;color:#8a8f8a;margin:26px 0 0">Mesures de démonstration réalisées en 5 minutes : elles ne constituent pas un diagnostic médical. Vous recevez cet e-mail parce que vous avez accepté de recevoir votre mini-rapport. Pour toute question, répondez simplement à cet e-mail.</p>
</td></tr></table></td></tr></table></body></html>`;
}

function renderText(firstName: string, dateText: string, m: ReturnType<typeof model>, signature: string) {
  return `Bonjour ${firstName},\n\nMerci d’avoir fait le mini-bilan KŌMØ Motion du ${dateText}. Voici vos mesures :\n\n` +
    m.measures.map((x) => `• ${x.name} : ${x.value} — ${ZONE_LABEL[x.zone]}`).join("\n") +
    (m.strength ? `\n\nVotre point fort : ${m.strength.name.toLowerCase()}.` : "") +
    (m.focus ? `\nÀ regarder de plus près : ${m.focus.name.toLowerCase()}.` : "") +
    `\n\nLe bilan complet mesure 14 paramètres en une heure, avec un programme de 6 semaines. Réserver : ${BOOKING_URL}\n\n${signature}\n\nMesures de démonstration réalisées en 5 minutes, sans valeur de diagnostic médical.`;
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
  const m = model(values, sex);
  if (!m.measures.length) return reply(req, { ok: false, error: "no_measure" }, 400);

  const when = new Date(typeof b?.date === "string" ? b.date : Date.now());
  const dateText = (isNaN(when.getTime()) ? new Date() : when).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Paris" });
  const meta = who.user.user_metadata || {};
  const practitionerName = cleanName(meta.display_name || meta.full_name || "");
  const signature = practitionerName ? `${practitionerName} · KŌMØ Longevity` : "L’équipe KŌMØ Longevity";
  const practitionerEmail = who.user.email && emailRe.test(who.user.email) ? who.user.email : "";
  const replyTo = practitionerEmail || fallbackReplyTo || undefined;
  const idempotencyKey = `flash:${who.user.id}:${consultationId}${b?.resend ? ":" + Date.now() : ""}`.slice(0, 240);

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json", "Idempotency-Key": idempotencyKey },
    body: JSON.stringify({
      from: emailFrom, to: [to], reply_to: replyTo,
      bcc: practitionerEmail && practitionerEmail.toLowerCase() !== to.toLowerCase() ? [practitionerEmail] : undefined,
      subject: `Votre mini-bilan KŌMØ Motion du ${dateText}`,
      html: renderEmail(firstName, dateText, m, signature),
      text: renderText(firstName, dateText, m, signature),
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
