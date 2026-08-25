import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const ALLOWED_ORIGINS = new Set([
  "https://pulse.komolongevity.com",
  "https://komolongevity.com",
]);

function cors(req: Request) {
  const origin = req.headers.get("origin") ?? "";
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS.has(origin) ? origin : "https://pulse.komolongevity.com",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}
function json(req: Request, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...cors(req), "Content-Type": "application/json; charset=utf-8" } });
}
function slugify(value: string) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 52) || "komo-partner";
}
function countryCode(territory = "") {
  const t = territory.toLowerCase();
  if (/spain|espagne|españa/.test(t)) return "ES";
  if (/belgium|belgique|belgië/.test(t)) return "BE";
  if (/switzerland|suisse|schweiz/.test(t)) return "CH";
  if (/italy|italie|italia/.test(t)) return "IT";
  if (/portugal/.test(t)) return "PT";
  if (/germany|allemagne|deutschland/.test(t)) return "DE";
  if (/united kingdom|royaume-uni|uk/.test(t)) return "GB";
  return "FR";
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors(req) });
  if (req.method !== "POST") return json(req, { error: "method_not_allowed" }, 405);
  if (!SUPABASE_URL || !ANON_KEY || !SERVICE_KEY) return json(req, { error: "server_configuration_missing" }, 500);
  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) return json(req, { error: "unauthorized" }, 401);

  const userClient = createClient(SUPABASE_URL, ANON_KEY, { global: { headers: { Authorization: `Bearer ${token}` } }, auth: { persistSession: false } });
  const service = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
  const { data: userData, error: userError } = await userClient.auth.getUser(token);
  const adminUser = userData?.user;
  if (userError || !adminUser) return json(req, { error: "unauthorized" }, 401);
  const { data: roleRow, error: roleError } = await service.from("account_roles").select("role").eq("user_id", adminUser.id).maybeSingle();
  if (roleError) return json(req, { error: "role_check_failed", detail: roleError.message }, 500);
  if (roleRow?.role !== "admin") return json(req, { error: "admin_required" }, 403);

  let body: any = {};
  try { body = await req.json(); } catch { return json(req, { error: "invalid_json" }, 400); }
  const action = String(body?.action ?? "list");

  if (action === "list") {
    const { data, error } = await service.from("professional_applications")
      .select("id,user_id,organization_name,professional_title,registration_identifier,territory,website,selected_offer,message,status,submitted_at,reviewed_at,review_note")
      .order("submitted_at", { ascending: false }).limit(100);
    if (error) return json(req, { error: "list_failed", detail: error.message }, 500);
    const applications = await Promise.all((data ?? []).map(async (app: any) => {
      const [authRes, roleRes, membershipsRes] = await Promise.all([
        service.auth.admin.getUserById(app.user_id),
        service.from("account_roles").select("role,approved_at").eq("user_id", app.user_id).maybeSingle(),
        service.from("organization_members").select("organization_id,role,status,organizations(id,name,slug,clinical_data_status)").eq("user_id", app.user_id).eq("status", "active"),
      ]);
      return { ...app, email: authRes.data?.user?.email ?? null, account_role: roleRes.data?.role ?? "member", approved_at: roleRes.data?.approved_at ?? null, memberships: membershipsRes.data ?? [] };
    }));
    const counts = applications.reduce((acc: Record<string, number>, a: any) => { acc[a.status] = (acc[a.status] ?? 0) + 1; return acc; }, {});
    return json(req, { applications, counts });
  }

  const applicationId = String(body?.application_id ?? "");
  if (!applicationId) return json(req, { error: "application_id_required" }, 400);
  const reviewNote = String(body?.review_note ?? "").trim().slice(0, 1500) || null;
  const { data: app, error: appError } = await service.from("professional_applications").select("*").eq("id", applicationId).maybeSingle();
  if (appError) return json(req, { error: "application_lookup_failed", detail: appError.message }, 500);
  if (!app) return json(req, { error: "application_not_found" }, 404);

  const event = async (eventType: string, previousStatus: string | null, status: string, detail: Record<string, unknown> = {}) => {
    const r = await service.from("professional_application_events").insert({ application_id: app.id, user_id: app.user_id, actor_user_id: adminUser.id, event_type: eventType, previous_status: previousStatus, status, event_detail: detail });
    if (r.error) console.error("professional_application_event_failed", r.error.message);
  };

  if (action === "review") {
    if (!["submitted", "under_review"].includes(app.status)) return json(req, { error: "invalid_status_transition", status: app.status }, 409);
    const previous = app.status;
    const { error } = await service.from("professional_applications").update({ status: "under_review", reviewed_at: new Date().toISOString(), reviewed_by: adminUser.id, review_note: reviewNote }).eq("id", app.id);
    if (error) return json(req, { error: "review_failed", detail: error.message }, 500);
    await event("under_review", previous, "under_review", { review_note: reviewNote });
    return json(req, { ok: true, status: "under_review" });
  }

  if (action === "decline") {
    if (!["submitted", "under_review"].includes(app.status)) return json(req, { error: "invalid_status_transition", status: app.status }, 409);
    const previous = app.status;
    const { error } = await service.from("professional_applications").update({ status: "declined", reviewed_at: new Date().toISOString(), reviewed_by: adminUser.id, review_note: reviewNote }).eq("id", app.id);
    if (error) return json(req, { error: "decline_failed", detail: error.message }, 500);
    await event("declined", previous, "declined", { review_note: reviewNote });
    return json(req, { ok: true, status: "declined" });
  }

  if (action === "approve") {
    if (!["submitted", "under_review"].includes(app.status)) return json(req, { error: "invalid_status_transition", status: app.status }, 409);
    const organizationName = String(body?.organization_name ?? app.organization_name ?? "").trim().slice(0, 180);
    if (organizationName.length < 2) return json(req, { error: "organization_name_required" }, 400);
    const requestedOrgRole = String(body?.organization_role ?? "owner");
    const organizationRole = ["owner", "clinical_admin", "physician", "operator", "coordinator", "viewer"].includes(requestedOrgRole) ? requestedOrgRole : "owner";
    const reviewedAt = new Date().toISOString();
    const previous = app.status;
    const decision = await service.from("professional_applications").update({ status: "approved", reviewed_at: reviewedAt, reviewed_by: adminUser.id, review_note: reviewNote }).eq("id", app.id);
    if (decision.error) return json(req, { error: "approval_decision_failed", detail: decision.error.message }, 500);

    let organization: any = null;
    const existingOrg = await service.from("organizations").select("id,name,slug,clinical_data_status,status").ilike("name", organizationName).limit(1);
    if (existingOrg.error) return json(req, { error: "organization_lookup_failed", detail: existingOrg.error.message, decision_recorded: true }, 500);
    organization = existingOrg.data?.[0] ?? null;
    if (!organization) {
      const created = await service.from("organizations").insert({ name: organizationName, slug: `${slugify(organizationName)}-${app.id.slice(0, 6)}`, country_code: countryCode(app.territory), timezone: "Europe/Paris", status: "active", created_by: adminUser.id, clinical_data_status: "test_only" }).select("id,name,slug,clinical_data_status,status").single();
      if (created.error) return json(req, { error: "organization_create_failed", detail: created.error.message, decision_recorded: true }, 500);
      organization = created.data;
    }

    const membership = await service.from("organization_members").select("id,role,status").eq("organization_id", organization.id).eq("user_id", app.user_id).limit(1);
    if (membership.error) return json(req, { error: "membership_lookup_failed", detail: membership.error.message, decision_recorded: true, organization }, 500);
    const existingMembership = membership.data?.[0];
    if (existingMembership) {
      const mr = await service.from("organization_members").update({ role: organizationRole, status: "active", updated_at: reviewedAt }).eq("id", existingMembership.id);
      if (mr.error) return json(req, { error: "membership_update_failed", detail: mr.error.message, decision_recorded: true, organization }, 500);
    } else {
      const mr = await service.from("organization_members").insert({ organization_id: organization.id, user_id: app.user_id, role: organizationRole, status: "active", invited_by: adminUser.id, joined_at: reviewedAt });
      if (mr.error) return json(req, { error: "membership_create_failed", detail: mr.error.message, decision_recorded: true, organization }, 500);
    }

    const roleUpsert = await service.from("account_roles").upsert({ user_id: app.user_id, role: "professional", approved_at: reviewedAt, approved_by: adminUser.id }, { onConflict: "user_id" });
    if (roleUpsert.error) return json(req, { error: "professional_role_failed", detail: roleUpsert.error.message, decision_recorded: true, organization }, 500);
    await event("approved", previous, "approved", { organization_id: organization.id, organization_name: organization.name, organization_role: organizationRole, clinical_data_status: organization.clinical_data_status, selected_offer: app.selected_offer, review_note: reviewNote });
    return json(req, { ok: true, status: "approved", organization, organization_role: organizationRole, account_role: "professional", clinical_data_status: organization.clinical_data_status });
  }
  return json(req, { error: "unknown_action" }, 400);
});
