create table public.provider_specialties (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.provider_profiles(id) on delete cascade,
  service_type public.service_type not null,
  specialty_name text not null,
  credential_required boolean not null default false,
  supporting_certification_id uuid references public.provider_certifications(id) on delete set null,
  review_status public.review_status not null default 'pending_review',
  prohibited_claim_flags text[] not null default '{}',
  admin_notes_private text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider_id, service_type, specialty_name)
);

create index provider_specialties_provider_idx on public.provider_specialties (provider_id);
create index provider_specialties_service_review_idx on public.provider_specialties (service_type, review_status);

create trigger provider_specialties_updated_at
  before update on public.provider_specialties
  for each row execute function public.touch_updated_at();

alter table public.provider_specialties enable row level security;

create policy "provider_specialties_owner_or_admin_select" on public.provider_specialties
  for select
  using (
    exists (
      select 1 from public.provider_profiles pp
      where pp.id = provider_id
      and pp.user_id = auth.uid()
    )
    or public.is_admin()
  );

create policy "provider_specialties_owner_insert" on public.provider_specialties
  for insert
  with check (
    exists (
      select 1 from public.provider_profiles pp
      where pp.id = provider_id
      and pp.user_id = auth.uid()
    )
    and review_status = 'pending_review'
    and admin_notes_private is null
  );

create policy "provider_specialties_owner_update" on public.provider_specialties
  for update
  using (
    exists (
      select 1 from public.provider_profiles pp
      where pp.id = provider_id
      and pp.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.provider_profiles pp
      where pp.id = provider_id
      and pp.user_id = auth.uid()
    )
    and review_status in ('draft', 'pending_review')
    and admin_notes_private is null
  );

create policy "provider_specialties_admin_all" on public.provider_specialties
  for all
  using (public.is_admin())
  with check (public.is_admin());
