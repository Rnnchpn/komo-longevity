import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const U = Deno.env.get("SUPABASE_URL") ?? "";
const A = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const S = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const ORIGINS = new Set(["https://pulse.komolongevity.com", "https://komolongevity.com"]);
const ELIGIBLE_ROLES = new Set(["owner", "clinical_admin", "physician", "operator", "coordinator"]);
const SEX_VALUES = new Set(["female", "male", "intersex", "unknown", "not_stated"]);

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

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors(req) });
  if (req.method !== "POST") return json(req, { error: "method_not_allowed" }, 405);

  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!token) return json(req, { error: "unauthorized" }, 401);

  const uc = createClient(U, A, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false }
  });
  // Separate privileged client: never attach the caller JWT to this client.
  const svc = createClient(U, S, { auth: { persistSession: false } });

  const userResult = await uc.auth.getUser(token);
  const actor = userResult.data?.user;
  if (userResult.error || !actor) return json(req, { error: "unauthorized" }, 401);

  let body: any = {};
  try { body = await req.json(); } catch { return json(req, { error: "invalid_json" }, 400); }
  if (String(body.action ?? "create") !== "create") return json(req, { error: "unknown_action" }, 400);

  const organizationId = String(body.organization_id ?? "").trim();
  const firstName = String(body.first_name ?? "").trim().slice(0, 100);
  const lastName = String(body.last_name ?? "").trim().slice(0, 100);
  const birthDate = String(body.birth_date ?? "").trim();
  const sexAtBirth = String(body.sex_at_birth ?? "").trim();

  if (!organizationId || !firstName || !lastName || !/^\d{4}-\d{2}-\d{2}$/.test(birthDate) || !SEX_VALUES.has(sexAtBirth)) {
    return json(req, { error: "invalid_patient_fields" }, 400);
  }

  const [roleResult, membershipResult, orgResult] = await Promise.all([
    svc.from("account_roles").select("role").eq("user_id", actor.id).maybeSingle(),
    svc.from("organization_members").select("role,status,access_scope").eq("organization_id", organizationId).eq("user_id", actor.id).eq("status", "active").maybeSingle(),
    svc.from("organizations").select("id,name,status,clinical_data_status").eq("id", organizationId).maybeSingle()
  ]);

  if (roleResult.error) return json(req, { error: "role_check_failed", detail: roleResult.error.message }, 500);
  if (membershipResult.error) return json(req, { error: "membership_check_failed", detail: membershipResult.error.message }, 500);
  if (orgResult.error) return json(req, { error: "organization_check_failed", detail: orgResult.error.message }, 500);

  const isAdmin = roleResult.data?.role === "admin";
  const membership = membershipResult.data;
  const org = orgResult.data;
  if (!org || org.status !== "active") return json(req, { error: "active_organization_required" }, 409);
  if (!isAdmin && (!membership || !ELIGIBLE_ROLES.has(membership.role))) return json(req, { error: "patient_create_scope_required" }, 403);
  if (membership && !ELIGIBLE_ROLES.has(membership.role) && !isAdmin) return json(req, { error: "patient_create_scope_required" }, 403);

  const externalReference = `POC-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
  const now = new Date().toISOString();
  const patientInsert = await svc.from("patients").insert({
    organization_id: organizationId,
    external_reference: externalReference,
    first_name: firstName,
    last_name: lastName,
    birth_date: birthDate,
    sex_at_birth: sexAtBirth,
    locale: "fr-FR",
    status: "active",
    created_by: actor.id,
    data_classification: "synthetic",
    synthetic_attested_at: now,
    synthetic_attested_by: actor.id
  }).select("*").single();

  if (patientInsert.error) return json(req, { error: "patient_create_failed", detail: patientInsert.error.message }, 500);
  const patient = patientInsert.data;

  // The existing patients_assign_creator trigger normally creates this assignment.
  // Keep a narrow server-side fallback so a valid creator never receives an unreadable patient.
  if (membership && ELIGIBLE_ROLES.has(membership.role)) {
    const existing = await svc.from("patient_care_assignments").select("id").eq("patient_id", patient.id).eq("professional_user_id", actor.id).eq("status", "active").limit(1).maybeSingle();
    if (!existing.data) {
      const assignmentRole = membership.role === "physician" ? "clinical_practitioner"
        : membership.role === "operator" ? "motion_operator"
        : membership.role === "coordinator" ? "coordinator"
        : "primary";
      const assignment = await svc.from("patient_care_assignments").insert({
        organization_id: organizationId,
        patient_id: patient.id,
        professional_user_id: actor.id,
        assignment_role: assignmentRole,
        access_scope: membership.access_scope === "clinical" ? "clinical" : "motion",
        status: "active",
        source: "patient_created",
        assigned_by: actor.id,
        assigned_at: now
      });
      if (assignment.error) {
        await svc.from("patients").delete().eq("id", patient.id);
        return json(req, { error: "patient_assignment_failed", detail: assignment.error.message }, 500);
      }
    }
  }

  return json(req, { ok: true, patient, organization: { id: org.id, name: org.name } });
});
