-- Patient-facing booking directory for Friday demo.
-- Keep technical test centres available internally but remove them from the patient directory.
update public.organizations
set booking_published=false, updated_at=now()
where clinical_data_status='test_only'
  and name in ('Myodev','Komo Clinic');

update public.organizations
set name='KŌMØ Cannes',
    city='Cannes',
    country_code='FR',
    public_description='Bilans KŌMØ Motion et Clinical sur rendez-vous à Cannes et sur site.',
    booking_published=true,
    updated_at=now()
where clinical_data_status='test_only'
  and (name='KŌMØ POC' or slug='komo-poc');
