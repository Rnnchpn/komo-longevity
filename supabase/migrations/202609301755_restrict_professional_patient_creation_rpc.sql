-- Friday demo security hardening.
revoke execute on function public.komo_professional_create_patient(uuid,text,text,date,text,text,text) from public, anon;
grant execute on function public.komo_professional_create_patient(uuid,text,text,date,text,text,text) to authenticated, service_role;
