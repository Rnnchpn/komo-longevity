import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { buildIcs, emailCancelPatient, emailCancelTeam, emailConfirmPatient, emailFollowup, emailReminder, emailTeam, type Booking } from "./mail.ts";

// KŌMØ — réservation publique en ligne (komolongevity.com).
// Créneaux, réservation, gestion par lien privé, rappels J-1 et invitation au contrôle.
// Aucune donnée de santé : identité de contact et créneau uniquement.

const U = Deno.env.get("SUPABASE_URL") ?? "";
const S = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const RESEND = Deno.env.get("RESEND_API_KEY") ?? "";
const FROM = Deno.env.get("BOOKING_EMAIL_FROM") ?? "KŌMØ Longevity <contact@komolongevity.com>";
const SITE = (Deno.env.get("BOOKING_SITE_ORIGIN") ?? "https://komolongevity.com").replace(/\/$/, "");

const ORIGINS = new Set(["https://komolongevity.com", "https://www.komolongevity.com", "https://pulse.komolongevity.com"]);
const PREVIEW = /^https:\/\/komo-longevity-[a-z0-9-]+\.vercel\.app$/;

function cors(req: Request) {
  const o = req.headers.get("origin") ?? "";
  return {
    "Access-Control-Allow-Origin": ORIGINS.has(o) || PREVIEW.test(o) ? o : "https://komolongevity.com",
    "Access-Control-Allow-Headers": "content-type, x-client-info, apikey, authorization",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}
const json = (req: Request, body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors(req), "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" } });

const db = createClient(U, S, { auth: { persistSession: false } });

async function sha256(text: string) {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
function b64(text: string) {
  let bin = "";
  for (const x of new TextEncoder().encode(text)) bin += String.fromCharCode(x);
  return btoa(bin);
}
function newToken() {
  const b = crypto.getRandomValues(new Uint8Array(24));
  return btoa(String.fromCharCode(...b)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
const clean = (v: unknown, max: number) => String(v ?? "").replace(/[\u0000-\u001f\u007f<>]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
const SLUG = /^[a-z0-9-]{2,40}$/;
const OFFER = /^[a-z0-9_]{2,30}$/;
const TOKEN = /^[A-Za-z0-9_-]{20,64}$/;

async function rpc<T = any>(fn: string, args: Record<string, unknown>): Promise<T> {
  const { data, error } = await db.rpc(fn, args);
  if (error) throw new Error(`${fn}: ${error.message}`);
  return data as T;
}

const manageUrl = (b: Booking, token: string) => `${SITE}${b.page_path || "/fr/rendez-vous-hiro/"}#gerer=${token}`;
const pageUrl = (b: Booking) => `${SITE}${b.page_path || "/fr/rendez-vous-hiro/"}`;

type Mail = { to: string; subject: string; html: string; text: string; replyTo?: string; ics?: string; key: string };
async function send(m: Mail): Promise<"sent" | "failed" | "not_configured"> {
  if (!RESEND) return "not_configured";
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND}`, "Content-Type": "application/json", "Idempotency-Key": m.key },
      body: JSON.stringify({
        from: FROM, to: [m.to], subject: m.subject, html: m.html, text: m.text,
        reply_to: m.replyTo || undefined,
        attachments: m.ics ? [{ filename: "komo-rendez-vous.ics", content: b64(m.ics) }] : undefined,
      }),
    });
    if (!r.ok) { console.error("[booking-public] resend", r.status, await r.text().catch(() => "")); return "failed"; }
    return "sent";
  } catch (e) { console.error("[booking-public] resend error", String(e)); return "failed"; }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors(req) });
  if (req.method !== "POST") return json(req, { ok: false, error: "method_not_allowed" }, 405);
  let body: any = {};
  try { body = await req.json(); } catch { return json(req, { ok: false, error: "invalid_json" }, 400); }
  const action = String(body?.action ?? "");

  try {
    if (action === "config") {
      const slug = String(body.center ?? "");
      if (!SLUG.test(slug)) return json(req, { ok: false, error: "center_not_found" }, 404);
      const center = await rpc("booking_public_config", { p_slug: slug });
      if (!center) return json(req, { ok: false, error: "center_not_found" }, 404);
      return json(req, { ok: true, center, email_ready: Boolean(RESEND) });
    }

    if (action === "slots") {
      const slug = String(body.center ?? ""), offer = String(body.offer ?? "");
      if (!SLUG.test(slug) || !OFFER.test(offer)) return json(req, { ok: false, error: "invalid_input" }, 400);
      const from = /^\d{4}-\d{2}-\d{2}$/.test(String(body.from ?? "")) ? String(body.from) : null;
      const days = Math.max(1, Math.min(62, Number(body.days) || 31));
      const rows = await rpc<{ starts_at: string; ends_at: string }[]>("booking_public_slots", { p_slug: slug, p_offer: offer, p_from: from, p_days: days });
      return json(req, { ok: true, slots: (rows ?? []).map((r) => ({ start: r.starts_at, end: r.ends_at })) });
    }

    if (action === "book") {
      if (String(body.website ?? "") !== "") return json(req, { ok: false, error: "invalid_input" }, 400); // pot de miel
      if (body.consent !== true) return json(req, { ok: false, error: "consent_required" }, 400);
      const slug = String(body.center ?? ""), offer = String(body.offer ?? "");
      const start = new Date(String(body.start ?? ""));
      if (!SLUG.test(slug) || !OFFER.test(offer) || Number.isNaN(start.getTime())) return json(req, { ok: false, error: "invalid_input" }, 400);
      const first = clean(body.first_name, 60), last = clean(body.last_name, 60);
      const email = clean(body.email, 160).toLowerCase(), phone = clean(body.phone, 35);
      if (!first || !last || !/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email) || (phone && !/^[+0-9 ().-]{6,35}$/.test(phone)))
        return json(req, { ok: false, error: "invalid_input" }, 400);
      const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
      const token = newToken();
      const res = await rpc<any>("booking_public_create", {
        p_slug: slug, p_offer: offer, p_start: start.toISOString(), p_first: first, p_last: last, p_email: email,
        p_phone: phone || null, p_source: clean(body.source, 40) || null,
        p_token_hash: await sha256(token), p_ip_hash: await sha256(`komo-booking|${ip}|${new Date().toISOString().slice(0, 10)}`),
      });
      if (!res?.ok) return json(req, { ok: false, error: res?.error ?? "booking_failed" }, res?.error === "rate_limited" ? 429 : 409);
      const b: Booking = res.booking;
      const link = manageUrl(b, token);
      const ics = buildIcs(b, "REQUEST_PUBLISH");
      const p = emailConfirmPatient(b, link);
      const t = emailTeam(b);
      const [ps, ts] = await Promise.all([
        send({ to: b.email, subject: p.subject, html: p.html, text: p.text, replyTo: b.team_email, ics, key: `confirm-${b.id}` }),
        send({ to: b.team_email, subject: t.subject, html: t.html, text: t.text, replyTo: b.email, ics, key: `team-${b.id}` }),
      ]);
      await Promise.all([
        rpc("booking_public_mark", { p_id: b.id, p_field: "patient", p_value: ps }),
        rpc("booking_public_mark", { p_id: b.id, p_field: "team", p_value: ts }),
      ]);
      return json(req, { ok: true, booking: publicView(b), manage_url: link, email: ps });
    }

    if (action === "manage" || action === "cancel") {
      const token = String(body.token ?? "");
      if (!TOKEN.test(token)) return json(req, { ok: false, error: "not_found" }, 404);
      const hash = await sha256(token);
      if (action === "manage") {
        const res = await rpc<any>("booking_public_get", { p_token_hash: hash });
        if (!res?.ok) return json(req, { ok: false, error: "not_found" }, 404);
        return json(req, { ok: true, booking: publicView(res.booking) });
      }
      const res = await rpc<any>("booking_public_cancel", { p_token_hash: hash });
      if (!res?.ok) return json(req, { ok: false, error: res?.error ?? "not_found", booking: res?.booking ? publicView(res.booking) : undefined }, 409);
      const b: Booking = res.booking;
      const ics = buildIcs(b, "CANCEL");
      const p = emailCancelPatient(b, pageUrl(b));
      const t = emailCancelTeam(b, Boolean(res.late));
      await Promise.all([
        send({ to: b.email, subject: p.subject, html: p.html, text: p.text, replyTo: b.team_email, ics, key: `cancel-${b.id}` }),
        send({ to: b.team_email, subject: t.subject, html: t.html, text: t.text, replyTo: b.email, ics, key: `cancel-team-${b.id}` }),
      ]);
      return json(req, { ok: true, booking: publicView(b), late: Boolean(res.late) });
    }

    if (action === "cron") {
      const key = req.headers.get("x-komo-cron") ?? "";
      if (!key || !(await rpc<boolean>("booking_cron_key_ok", { p_key: key }))) return json(req, { ok: false, error: "forbidden" }, 403);
      if (!RESEND) return json(req, { ok: true, skipped: "email_not_configured" });
      const due = await rpc<{ reminders: Booking[]; followups: Booking[] }>("booking_public_due", {});
      let reminders = 0, followups = 0;
      for (const b of due?.reminders ?? []) {
        const m = emailReminder(b, pageUrl(b));
        if ((await send({ to: b.email, subject: m.subject, html: m.html, text: m.text, replyTo: b.team_email, key: `reminder-${b.id}` })) === "sent") {
          await rpc("booking_public_mark", { p_id: b.id, p_field: "reminder", p_value: "sent" }); reminders++;
        }
      }
      for (const b of due?.followups ?? []) {
        const m = emailFollowup(b, `${pageUrl(b)}?offre=followup&src=relance`);
        if ((await send({ to: b.email, subject: m.subject, html: m.html, text: m.text, replyTo: b.team_email, key: `followup-${b.id}` })) === "sent") {
          await rpc("booking_public_mark", { p_id: b.id, p_field: "followup", p_value: "sent" }); followups++;
        }
      }
      return json(req, { ok: true, reminders, followups });
    }

    return json(req, { ok: false, error: "unknown_action" }, 400);
  } catch (e) {
    console.error("[booking-public]", action, String(e));
    return json(req, { ok: false, error: "server_error" }, 500);
  }
});

// Ce que la page publique peut afficher (pas d'IP, pas de statut interne).
function publicView(b: Booking) {
  return {
    status: b.status, offer_code: b.offer_code, offer_label: b.offer_label, duration_minutes: b.duration_minutes,
    price_cents: b.price_cents, currency: b.currency, starts_at: b.starts_at, ends_at: b.ends_at, timezone: b.timezone,
    center_name: b.center_name, center_place: b.center_place, address: b.address, access_note: b.access_note,
    first_name: b.first_name, email: b.email, team_email: b.team_email,
  };
}
