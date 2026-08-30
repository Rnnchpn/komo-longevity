import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const site=join(root,'site','pulse-v12');
const [patient,admin,edge,migration]=await Promise.all([
  readFile(join(site,'account-privacy-v1.js'),'utf8'),
  readFile(join(site,'admin-privacy-queue-v1.js'),'utf8'),
  readFile(join(root,'supabase','functions','privacy-export','index.ts'),'utf8'),
  readFile(join(root,'supabase','migrations','20260830_privacy_export_packages_v1.sql'),'utf8')
]);
const failures=[];
const ok=(label,value)=>{if(!value)failures.push(label);else console.log(`[pulse-privacy-export-v1] OK · ${label}`)};

ok('patient UI calls dedicated privacy-export API',patient.includes("invokeFunction('privacy-export'")&&patient.includes("action:'status'")&&patient.includes("action:'download'"));
ok('patient UI only exposes download when export is ready',patient.includes("state.export?.status==='ready'")&&patient.includes('Télécharger ma copie'));
ok('patient UI communicates ten-minute link lifetime',patient.includes('10 minutes'));
ok('Admin UI generates export through dedicated server action',admin.includes("action:'generate'")&&admin.includes('Générer la copie'));
ok('Admin UI no longer manually completes data exports',!admin.includes('data-kapq-complete'));

ok('export API authenticates caller',edge.includes('uc.auth.getUser(token)')&&edge.includes('if(ur.error||!caller)'));
ok('export generation requires Admin role',edge.includes('if(await role()!=="admin")'));
ok('download is constrained to authenticated owner',edge.includes('.eq("user_id",caller.id).eq("status","ready")'));
ok('download URL is short-lived and signed',edge.includes('createSignedUrl(found.data.object_path,600')&&edge.includes('expires_in_seconds:600'));
ok('export schema is explicitly versioned',edge.includes('const SCHEMA="komo-privacy-export-v1"'));
ok('export uses SHA-256 integrity digest',edge.includes('crypto.subtle.digest("SHA-256",bytes)')&&edge.includes('content_sha256:digest'));
ok('export excludes raw provider payload columns',!edge.includes('raw_payload'));
ok('export excludes payment provider external references',!edge.includes('external_checkout_reference')&&!edge.includes('external_payment_reference'));
ok('export excludes internal audit log table',!edge.includes('collect("audit_events"'));
ok('canonical scores are released-only',edge.includes('.eq("release_status","released")'));
ok('clinical context is signed-only',edge.includes('collect("clinical_context"')&&edge.includes('.eq("status","signed")'));
ok('canonical reports are released-only',edge.includes('collect("reports"')&&edge.includes('.eq("status","released")'));
ok('manifest explicitly states self-service exclusions',edge.includes('excluded_from_self_service')&&edge.includes('binary document file contents')&&edge.includes('draft or unreleased clinical work product'));
ok('private object is stored before registry is marked ready',edge.indexOf('.storage.from(BUCKET).upload(')<edge.indexOf('status:"ready"'));
ok('registry is marked ready before request completion',edge.indexOf('status:"ready"')<edge.indexOf('status:"completed"'));
ok('generation is idempotent for an already-ready request',edge.includes('idempotent:true')&&edge.includes('existing?.status==="ready"'));

ok('registry table is RLS protected',migration.includes('alter table public.account_privacy_exports enable row level security'));
ok('patient has no direct insert/update/delete rights',migration.includes('revoke insert, update, delete on public.account_privacy_exports from authenticated'));
ok('patient can select only own export registry rows',migration.includes('using (auth.uid() = user_id)'));
ok('storage bucket is private',migration.includes("values ('privacy-exports','privacy-exports',false"));
ok('storage bucket only accepts JSON',migration.includes("array['application/json']::text[]"));

if(failures.length){console.error(`[pulse-privacy-export-v1] FAILED · ${failures.join(' | ')}`);process.exit(1)}
console.log('[pulse-privacy-export-v1] PASS · allow-listed structured export · private storage · owner-only signed download · integrity + release-state guards');
