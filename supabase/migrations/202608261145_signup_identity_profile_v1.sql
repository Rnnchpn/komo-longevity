-- Applied to production on 2026-08-26.
alter table public.profiles add column if not exists address_line1 text;
alter table public.profiles add column if not exists postal_code text;

-- The production handle_new_komo_user() trigger now copies common signup metadata into profiles:
-- first_name, last_name, birth_date, phone, address_line1, postal_code, city, country and locale.
-- It continues to create account_roles(member) and, when komo_pro_application=true,
-- creates the professional_applications row server-side before email confirmation.
-- See the live database function public.handle_new_komo_user() for the canonical implementation.
