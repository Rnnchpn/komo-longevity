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

  if (action === "list_professionals") {
    const roles = await svc.from("account_roles")
      .select("user_id,role,approved_at")
      .eq("role", "professional")
      .order("approved_at", { ascending: false });
    if (roles.error) return json(req, { error: "professionals_failed", detail: roles.error.message }, 500);

    const professionals = await Promise.all((roles.data ?? []).map(async (role: any) => {
      const [authUser, profile, memberships, applications] = await Promise.all([
        svc.auth.admin.getUserById(role.user_id),
        svc.from("profiles").select("display_name,first_name,last_name,phone,city,country").eq("id", role.user_id).maybeSingle(),
        svc.from("organization_members")
          .select("organization_id,role,status,access_scope,organizations(id,name,slug,clinical_data_status,status)")
          .eq("user_id", role.user_id)
          .eq("status", "active"),
        svc.from("professional_applications")
          .select("id,access_scope,registration_system,registration_identifier,professional_title,territory,status,reviewed_at")
          .eq("user_id", role.user_id)
          .order("submitted_at", { ascending: false })
          .limit(1)
      ]);
      const app = applications.data?.[0] ?? null;
      return {
        user_id: role.user_id,
        email: authUser.data?.user?.email ?? null,
        email_confirmed_at: authUser.data?.user?.email_confirmed_at ?? null,
        last_sign_in_at: authUser.data?.user?.last_sign_in_at ?? null,
        approved_at: role.approved_at ?? null,
        profile: profile.data ?? null,
        professional_title: app?.professional_title ?? null,
        registration_system: app?.registration_system ?? null,
        registration_identifier: app?.registration_identifier ?? null,
        territory: app?.territory ?? null,
        memberships: memberships.data ?? []
      };
    }));
    return json(req, { professionals, count: professionals.length });
  }

  if (action === "promote_clinical") {
    const userId = String(body.user_id ?? "");
    const organizationId = String(body.organization_id ?? "");
    const registrationSystem = String(body.registration_system ?? "").trim().slice(0, 120);
    const registrationIdentifier = String(body.registration_identifier ?? "").trim().slice(0, 160);
    if (!userId || !organizationId) return json(req, { error: "professional_and_organization_required" }, 400);
    if (!registrationSystem || !registrationIdentifier) return json(req, { error: "professional_registration_required", detail: "Un registre professionnel et un identifiant vérifiable sont requis pour Clinical." }, 400);

    const [accountRole, membership, authUser] = await Promise.all([
      svc.from("account_roles").select("role").eq("user_id", userId).maybeSingle(),
      svc.from("organization_members").select("role,access_scope,status").eq("user_id", userId).eq("organization_id", organizationId).eq("status", "active").maybeSingle(),
      svc.auth.admin.getUserById(userId)
    ]);
    if (accountRole.data?.role !== "professional") return json(req, { error: "professional_required" }, 409);
    if (!membership.data) return json(req, { error: "active_membership_required" }, 409);

    const previous = membership.data;
    const nextRole = ["owner", "clinical_admin"].includes(previous.role) ? previous.role : "physician";
    const updateMembership = await svc.from("organization_members")
      .update({ role: nextRole, access_scope: "clinical" })
      .eq("user_id", userId)
      .eq("organization_id", organizationId)
      .eq("status", "active");
    if (updateMembership.error) return json(req, { error: "clinical_promotion_failed", detail: updateMembership.error.message }, 409);

    const latestApp = await svc.from("professional_applications")
      .select("id")
      .eq("user_id", userId)
      .eq("status", "approved")
      .order("submitted_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (latestApp.data?.id) {
      await svc.from("professional_applications").update({
        access_scope: "clinical",
        selected_offer: "clinical",
        registration_system: registrationSystem,
        registration_identifier: registrationIdentifier,
        reviewed_at: new Date().toISOString(),
        reviewed_by: admin.id,
        review_note: "Clinical access granted from KŌMØ Admin professional registry."
      }).eq("id", latestApp.data.id);
    }

    await svc.from("audit_events").insert({
      organization_id: organizationId,
      actor_user_id: admin.id,
      event_type: "professional_clinical_access_granted",
      entity_type: "organization_member",
      entity_id: userId,
      event_detail: {
        previous_role: previous.role,
        previous_access_scope: previous.access_scope,
        new_role: nextRole,
        new_access_scope: "clinical",
        registration_system: registrationSystem,
        registration_identifier: registrationIdentifier
      }
    });

    const email = authUser.data?.user?.email ?? null;
    const emailSent = await mail(
      email,
      "Votre accès KŌMØ Clinical est activé",
      "<p>Votre habilitation <strong>KŌMØ Clinical</strong> est maintenant active.</p><p>Reconnectez-vous à Pulse puis ouvrez l’espace <strong>Pro</strong> pour accéder aux fonctions Clinical autorisées.</p>"
    );
    return json(req, { ok: true, user_id: userId, organization_id: organizationId, role: nextRole, access_scope: "clinical", email_sent: emailSent });
  }

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
