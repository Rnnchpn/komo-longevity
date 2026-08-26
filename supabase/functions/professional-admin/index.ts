import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const U = Deno.env.get("SUPABASE_URL") ?? "";
const A = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const S = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const R = Deno.env.get("RESEND_API_KEY") ?? "";
const FROM = Deno.env.get("PULSE_EMAIL_FROM") ?? "KŌMØ Pulse <noreply@auth.komolongevity.com>";
const ORIGINS = new Set(["https://pulse.komolongevity.com", "https://komolongevity.com"]);

function cors(req: Request) {
  const origin = req.headers.get("origin") ?? "";
  return {
    "Access-Control-Allow-Origin": ORIGINS.has(origin) ? origin : "https://pulse.komolongevity.com",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin"
  };
}

function json(req: Request, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors(req), "Content-Type": "application/json; charset=utf-8" }
  });
}

async function mail(to: string | null | undefined, subject: string, html: string) {
  if (!R || !to) return false;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${R}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: FROM, to: [to], subject, html, reply_to: "contact@komolongevity.com" })
  });
  return response.ok;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors(req) });
  if (req.method !== "POST") return json(req, { error: "method_not_allowed" }, 405);

  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!token) return json(req, { error: "unauthorized" }, 401);

  const uc = createClient(U, A, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false }
  });
  const svc = createClient(U, S, { auth: { persistSession: false } });
  const userResult = await uc.auth.getUser(token);
  const admin = userResult.data?.user;
  if (userResult.error || !admin) return json(req, { error: "unauthorized" }, 401);

  const roleResult = await svc.from("account_roles").select("role").eq("user_id", admin.id).maybeSingle();
  if (roleResult.error) return json(req, { error: "role_check_failed", detail: roleResult.error.message }, 500);
  if (roleResult.data?.role !== "admin") return json(req, { error: "admin_required" }, 403);

  let body: any = {};
  try { body = await req.json(); } catch { return json(req, { error: "invalid_json" }, 400); }
  const action = String(body.action ?? "list");

  if (action === "list") {
    const result = await svc.from("professional_applications")
      .select("id,user_id,organization_name,professional_title,registration_identifier,registration_system,territory,website,selected_offer,access_scope,message,status,submitted_at,reviewed_at,review_note")
      .order("submitted_at", { ascending: false })
      .limit(100);
    if (result.error) return json(req, { error: "list_failed", detail: result.error.message }, 500);

    const applications = await Promise.all((result.data ?? []).map(async (app: any) => {
      const [authUser, accountRole, memberships] = await Promise.all([
        svc.auth.admin.getUserById(app.user_id),
        svc.from("account_roles").select("role,approved_at").eq("user_id", app.user_id).maybeSingle(),
        svc.from("organization_members")
          .select("organization_id,role,status,access_scope,organizations(id,name,slug,clinical_data_status)")
          .eq("user_id", app.user_id)
          .eq("status", "active")
      ]);
      return {
        ...app,
        email: authUser.data?.user?.email ?? null,
        account_role: accountRole.data?.role ?? "member",
        approved_at: accountRole.data?.approved_at ?? null,
        memberships: memberships.data ?? []
      };
    }));

    const counts = applications.reduce((map: any, item: any) => {
      map[item.status] = (map[item.status] ?? 0) + 1;
      return map;
    }, {});
    return json(req, { applications, counts });
  }

  const id = String(body.application_id ?? "");
  if (!id) return json(req, { error: "application_id_required" }, 400);
  const note = String(body.review_note ?? "").trim().slice(0, 1500) || null;

  const lookup = await svc.from("professional_applications").select("*").eq("id", id).maybeSingle();
  if (lookup.error) return json(req, { error: "application_lookup_failed", detail: lookup.error.message }, 500);
  const app = lookup.data;
  if (!app) return json(req, { error: "application_not_found" }, 404);

  const authUser = await svc.auth.admin.getUserById(app.user_id);
  const applicantEmail = authUser.data?.user?.email ?? null;

  const event = async (eventType: string, previousStatus: string | null, status: string, detail: any = {}) => {
    const result = await svc.from("professional_application_events").insert({
      application_id: app.id,
      user_id: app.user_id,
      actor_user_id: admin.id,
      event_type: eventType,
      previous_status: previousStatus,
      status,
      event_detail: detail
    });
    if (result.error) console.error("professional_application_events", result.error.message);
  };

  if (action === "review" || action === "decline") {
    if (!["submitted", "under_review"].includes(app.status)) {
      return json(req, { error: "invalid_status_transition", status: app.status }, 409);
    }
    const next = action === "review" ? "under_review" : "declined";
    const now = new Date().toISOString();
    const update = await svc.from("professional_applications")
      .update({ status: next, reviewed_at: now, reviewed_by: admin.id, review_note: note })
      .eq("id", app.id);
    if (update.error) return json(req, { error: `${action}_failed`, detail: update.error.message }, 500);
    await event(next, app.status, next, { review_note: note, access_scope: app.access_scope });
    if (next === "declined") {
      await mail(applicantEmail, "Mise à jour de votre demande KŌMØ Pro", "<p>Votre demande KŌMØ Pro ne peut pas être activée dans sa forme actuelle.</p><p>Vous pouvez contacter l’équipe KŌMØ si vous souhaitez préciser votre projet.</p>");
    }
    return json(req, { ok: true, status: next });
  }

  if (action !== "approve") return json(req, { error: "unknown_action" }, 400);

  const requestedRole = String(body.organization_role ?? (app.access_scope === "motion" ? "operator" : "physician"));
  const rpc = await uc.rpc("approve_professional_application_v1", {
    p_application_id: app.id,
    p_organization_role: requestedRole,
    p_review_note: note
  });

  if (rpc.error) {
    console.error("approve_professional_application_v1", rpc.error);
    return json(req, { error: "approval_failed", detail: rpc.error.message }, 409);
  }

  const result: any = rpc.data ?? {};
  const label = result.access_scope === "motion" ? "KŌMØ Motion" : "KŌMØ Clinical";
  const organizationName = result.organization?.name ?? app.organization_name ?? "votre établissement";
  const emailSent = await mail(
    applicantEmail,
    "Votre accès KŌMØ Pro est activé",
    `<p>Votre accès <strong>${label}</strong> est maintenant activé.</p><p>Établissement : <strong>${organizationName}</strong></p><p>Connectez-vous à <strong>pulse.komolongevity.com</strong> avec votre compte habituel puis ouvrez l’espace <strong>Pro</strong>.</p>`
  );

  return json(req, { ...result, email_sent: emailSent });
});
