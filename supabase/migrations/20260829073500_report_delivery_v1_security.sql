revoke execute on function public.save_komo_report(uuid,uuid,uuid,jsonb,text) from public, anon;
revoke execute on function public.komo_report_snapshot(uuid) from public, anon;
revoke execute on function public.komo_mark_report_delivery(uuid,text,text,text) from public, anon;

grant execute on function public.save_komo_report(uuid,uuid,uuid,jsonb,text) to authenticated;
grant execute on function public.komo_report_snapshot(uuid) to authenticated;
grant execute on function public.komo_mark_report_delivery(uuid,text,text,text) to authenticated;
