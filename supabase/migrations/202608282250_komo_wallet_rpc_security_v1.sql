-- KŌMØ Wallet RPC hardening: no anonymous execution.

revoke execute on function public.komo_engagement_summary() from public, anon;
revoke execute on function public.komo_log_steps(integer,date) from public, anon;
revoke execute on function public.komo_complete_daily_challenge(text) from public, anon;
revoke execute on function public.komo_wallet_summary() from public, anon;
revoke execute on function public.komo_create_life_redemption(integer) from public, anon;
revoke execute on function public.komo_attach_life_checkout(uuid,text) from public, anon;
revoke execute on function public.komo_finalize_life_redemption(uuid,text) from public, anon;
revoke execute on function public.komo_cancel_life_redemption(uuid) from public, anon;

grant execute on function public.komo_engagement_summary() to authenticated;
grant execute on function public.komo_log_steps(integer,date) to authenticated;
grant execute on function public.komo_complete_daily_challenge(text) to authenticated;
grant execute on function public.komo_wallet_summary() to authenticated;
grant execute on function public.komo_create_life_redemption(integer) to authenticated;
grant execute on function public.komo_attach_life_checkout(uuid,text) to authenticated;
grant execute on function public.komo_finalize_life_redemption(uuid,text) to authenticated;
grant execute on function public.komo_cancel_life_redemption(uuid) to authenticated;
