create extension if not exists "pgcrypto";

create type public.user_role as enum ('client', 'provider', 'admin');
create type public.provider_type as enum ('personal_trainer', 'nutrition_coach', 'hybrid');
create type public.service_type as enum ('personal_training', 'nutrition');
create type public.certification_category as enum ('personal_training', 'nutrition', 'cpr_aed', 'specialty', 'insurance');
create type public.verification_status as enum ('not_submitted', 'pending_review', 'verified', 'expired', 'rejected');
create type public.provider_profile_status as enum ('draft', 'submitted', 'under_review', 'verified', 'rejected', 'suspended');
create type public.onboarding_status as enum ('not_started', 'in_progress', 'completed');
create type public.agreement_type as enum (
  'terms_of_service',
  'privacy_policy',
  'client_informed_risk',
  'provider_agreement',
  'independent_provider_acknowledgment',
  'scope_of_practice_agreement',
  'certification_accuracy_attestation',
  'insurance_attestation',
  'medical_disclaimer_acknowledgment'
);
create type public.review_status as enum ('draft', 'pending_review', 'approved', 'rejected', 'requires_changes');
create type public.incident_status as enum ('submitted', 'under_review', 'resolved', 'dismissed');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role,
  full_name text,
  avatar_path text,
  timezone text,
  onboarding_status public.onboarding_status not null default 'not_started',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.client_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  location jsonb not null default '{}'::jsonb,
  timezone text,
  experience_level text,
  onboarding_status public.onboarding_status not null default 'not_started',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.client_service_preferences (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null unique references public.client_profiles(id) on delete cascade,
  wants_personal_training boolean not null default false,
  wants_nutrition boolean not null default false,
  support_mode_preference text,
  environment_preferences text[] not null default '{}',
  open_to_hybrid_provider boolean not null default true,
  prefers_separate_specialists boolean not null default false,
  budget_preferences jsonb not null default '{}'::jsonb,
  schedule_preferences jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.provider_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  provider_type public.provider_type not null,
  public_display_name text,
  bio text,
  profile_status public.provider_profile_status not null default 'draft',
  identity_verification_status public.verification_status not null default 'not_submitted',
  claims_review_status public.review_status not null default 'draft',
  admin_notes_private text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.provider_services (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.provider_profiles(id) on delete cascade,
  service_type public.service_type not null,
  is_offered boolean not null default true,
  eligibility_status public.verification_status not null default 'not_submitted',
  online_supported boolean not null default false,
  in_person_supported boolean not null default false,
  training_environments text[] not null default '{}',
  service_area jsonb not null default '{}'::jsonb,
  pricing jsonb not null default '{}'::jsonb,
  admin_approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider_id, service_type)
);

create table public.provider_certifications (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.provider_profiles(id) on delete cascade,
  certification_category public.certification_category not null,
  service_type_eligibility public.service_type,
  organization text not null,
  certification_name text not null,
  credential_id text,
  issue_date date,
  expiration_date date,
  document_path text,
  specialty text,
  verification_status public.verification_status not null default 'pending_review',
  admin_notes_private text,
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.provider_insurance_records (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.provider_profiles(id) on delete cascade,
  service_type public.service_type,
  insurer text,
  policy_type text,
  policy_number text,
  coverage_limits jsonb not null default '{}'::jsonb,
  effective_date date,
  expiration_date date,
  document_path text,
  verification_status public.verification_status not null default 'pending_review',
  admin_notes_private text,
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.legal_acceptances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  agreement_type public.agreement_type not null,
  agreement_version text not null,
  accepted_at timestamptz not null default now(),
  ip_address inet,
  user_agent text,
  acceptance_context jsonb not null default '{}'::jsonb,
  unique (user_id, agreement_type, agreement_version)
);

create table public.provider_claims (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.provider_profiles(id) on delete cascade,
  claim_text text not null,
  claim_type text,
  review_status public.review_status not null default 'pending_review',
  prohibited_claim_flags text[] not null default '{}',
  admin_notes_private text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.safety_incidents (
  id uuid primary key default gen_random_uuid(),
  reported_by uuid references public.profiles(id),
  client_id uuid references public.client_profiles(id),
  provider_id uuid references public.provider_profiles(id),
  incident_type text not null,
  description text not null,
  severity text,
  status public.incident_status not null default 'submitted',
  immediate_suspension_applied boolean not null default false,
  admin_notes_private text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.provider_complaints (
  id uuid primary key default gen_random_uuid(),
  submitted_by uuid references public.profiles(id),
  provider_id uuid not null references public.provider_profiles(id),
  complaint_type text not null,
  description text not null,
  status public.incident_status not null default 'submitted',
  admin_notes_private text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.incident_attachments (
  id uuid primary key default gen_random_uuid(),
  incident_id uuid not null references public.safety_incidents(id) on delete cascade,
  uploaded_by uuid not null references public.profiles(id),
  file_path text not null,
  created_at timestamptz not null default now()
);

create table public.admin_incident_actions (
  id uuid primary key default gen_random_uuid(),
  incident_id uuid not null references public.safety_incidents(id) on delete cascade,
  admin_id uuid not null references public.profiles(id),
  action text not null,
  notes_private text,
  created_at timestamptz not null default now()
);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles for each row execute function public.touch_updated_at();
create trigger client_profiles_updated_at before update on public.client_profiles for each row execute function public.touch_updated_at();
create trigger client_service_preferences_updated_at before update on public.client_service_preferences for each row execute function public.touch_updated_at();
create trigger provider_profiles_updated_at before update on public.provider_profiles for each row execute function public.touch_updated_at();
create trigger provider_services_updated_at before update on public.provider_services for each row execute function public.touch_updated_at();
create trigger provider_certifications_updated_at before update on public.provider_certifications for each row execute function public.touch_updated_at();
create trigger provider_insurance_records_updated_at before update on public.provider_insurance_records for each row execute function public.touch_updated_at();
create trigger provider_claims_updated_at before update on public.provider_claims for each row execute function public.touch_updated_at();
create trigger safety_incidents_updated_at before update on public.safety_incidents for each row execute function public.touch_updated_at();
create trigger provider_complaints_updated_at before update on public.provider_complaints for each row execute function public.touch_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
    and role = 'admin'
  );
$$;

create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.complete_role_selection(
  selected_role public.user_role,
  selected_provider_type public.provider_type,
  agreement_types public.agreement_type[],
  agreement_version text,
  request_ip inet,
  request_user_agent text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  agreement public.agreement_type;
  provider_profile_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required.';
  end if;

  if selected_role = 'admin' then
    raise exception 'Admin roles must be assigned manually.';
  end if;

  update public.profiles
  set role = selected_role,
      onboarding_status = 'in_progress'
  where id = auth.uid();

  if selected_role = 'client' then
    insert into public.client_profiles (user_id)
    values (auth.uid())
    on conflict (user_id) do nothing;
  elsif selected_role = 'provider' then
    if selected_provider_type is null then
      raise exception 'Provider type is required.';
    end if;

    insert into public.provider_profiles (user_id, provider_type)
    values (auth.uid(), selected_provider_type)
    on conflict (user_id) do update set provider_type = excluded.provider_type
    returning id into provider_profile_id;

    if selected_provider_type in ('personal_trainer', 'hybrid') then
      insert into public.provider_services (provider_id, service_type)
      values (provider_profile_id, 'personal_training')
      on conflict (provider_id, service_type) do nothing;
    end if;

    if selected_provider_type in ('nutrition_coach', 'hybrid') then
      insert into public.provider_services (provider_id, service_type)
      values (provider_profile_id, 'nutrition')
      on conflict (provider_id, service_type) do nothing;
    end if;
  end if;

  foreach agreement in array agreement_types loop
    insert into public.legal_acceptances (
      user_id,
      agreement_type,
      agreement_version,
      ip_address,
      user_agent
    )
    values (
      auth.uid(),
      agreement,
      agreement_version,
      request_ip,
      request_user_agent
    )
    on conflict (user_id, agreement_type, agreement_version) do nothing;
  end loop;
end;
$$;

alter table public.profiles enable row level security;
alter table public.client_profiles enable row level security;
alter table public.client_service_preferences enable row level security;
alter table public.provider_profiles enable row level security;
alter table public.provider_services enable row level security;
alter table public.provider_certifications enable row level security;
alter table public.provider_insurance_records enable row level security;
alter table public.legal_acceptances enable row level security;
alter table public.provider_claims enable row level security;
alter table public.safety_incidents enable row level security;
alter table public.provider_complaints enable row level security;
alter table public.incident_attachments enable row level security;
alter table public.admin_incident_actions enable row level security;

create policy "profiles_select_own_or_admin" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "profiles_update_own_basic" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid() and role is not distinct from public.current_user_role());
create policy "profiles_admin_all" on public.profiles for all using (public.is_admin()) with check (public.is_admin());

create policy "client_profiles_owner" on public.client_profiles for all using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());
create policy "client_service_preferences_owner" on public.client_service_preferences for all using (
  exists (select 1 from public.client_profiles cp where cp.id = client_id and cp.user_id = auth.uid()) or public.is_admin()
) with check (
  exists (select 1 from public.client_profiles cp where cp.id = client_id and cp.user_id = auth.uid()) or public.is_admin()
);

create policy "provider_profiles_owner_or_admin" on public.provider_profiles for select using (user_id = auth.uid() or public.is_admin());
create policy "provider_profiles_owner_update" on public.provider_profiles for update using (user_id = auth.uid()) with check (
  user_id = auth.uid()
  and profile_status in ('draft', 'submitted')
  and identity_verification_status = 'not_submitted'
  and claims_review_status in ('draft', 'pending_review')
  and admin_notes_private is null
);
create policy "provider_profiles_admin_all" on public.provider_profiles for all using (public.is_admin()) with check (public.is_admin());

create policy "provider_services_owner_or_admin" on public.provider_services for select using (
  exists (select 1 from public.provider_profiles pp where pp.id = provider_id and pp.user_id = auth.uid()) or public.is_admin()
);
create policy "provider_services_owner_insert" on public.provider_services for insert with check (
  exists (select 1 from public.provider_profiles pp where pp.id = provider_id and pp.user_id = auth.uid())
  and eligibility_status = 'not_submitted'
  and admin_approved_at is null
);
create policy "provider_services_owner_update" on public.provider_services for update using (
  exists (select 1 from public.provider_profiles pp where pp.id = provider_id and pp.user_id = auth.uid())
) with check (
  exists (select 1 from public.provider_profiles pp where pp.id = provider_id and pp.user_id = auth.uid())
  and eligibility_status = 'not_submitted'
  and admin_approved_at is null
);
create policy "provider_services_admin_all" on public.provider_services for all using (public.is_admin()) with check (public.is_admin());

create policy "provider_certifications_owner_or_admin" on public.provider_certifications for select using (
  exists (select 1 from public.provider_profiles pp where pp.id = provider_id and pp.user_id = auth.uid()) or public.is_admin()
);
create policy "provider_certifications_owner_insert" on public.provider_certifications for insert with check (
  exists (select 1 from public.provider_profiles pp where pp.id = provider_id and pp.user_id = auth.uid())
  and verification_status = 'pending_review'
  and admin_notes_private is null
  and reviewed_by is null
  and reviewed_at is null
);
create policy "provider_certifications_owner_update" on public.provider_certifications for update using (
  exists (select 1 from public.provider_profiles pp where pp.id = provider_id and pp.user_id = auth.uid())
) with check (
  exists (select 1 from public.provider_profiles pp where pp.id = provider_id and pp.user_id = auth.uid())
  and verification_status = 'pending_review'
  and admin_notes_private is null
  and reviewed_by is null
  and reviewed_at is null
);
create policy "provider_certifications_admin_all" on public.provider_certifications for all using (public.is_admin()) with check (public.is_admin());

create policy "provider_insurance_owner_or_admin" on public.provider_insurance_records for select using (
  exists (select 1 from public.provider_profiles pp where pp.id = provider_id and pp.user_id = auth.uid()) or public.is_admin()
);
create policy "provider_insurance_owner_insert" on public.provider_insurance_records for insert with check (
  exists (select 1 from public.provider_profiles pp where pp.id = provider_id and pp.user_id = auth.uid())
  and verification_status = 'pending_review'
  and admin_notes_private is null
  and reviewed_by is null
  and reviewed_at is null
);
create policy "provider_insurance_owner_update" on public.provider_insurance_records for update using (
  exists (select 1 from public.provider_profiles pp where pp.id = provider_id and pp.user_id = auth.uid())
) with check (
  exists (select 1 from public.provider_profiles pp where pp.id = provider_id and pp.user_id = auth.uid())
  and verification_status = 'pending_review'
  and admin_notes_private is null
  and reviewed_by is null
  and reviewed_at is null
);
create policy "provider_insurance_admin_all" on public.provider_insurance_records for all using (public.is_admin()) with check (public.is_admin());

create policy "legal_acceptances_owner_or_admin" on public.legal_acceptances for select using (user_id = auth.uid() or public.is_admin());
create policy "legal_acceptances_insert_own" on public.legal_acceptances for insert with check (user_id = auth.uid());
create policy "legal_acceptances_admin_all" on public.legal_acceptances for all using (public.is_admin()) with check (public.is_admin());

create policy "provider_claims_owner_or_admin" on public.provider_claims for select using (
  exists (select 1 from public.provider_profiles pp where pp.id = provider_id and pp.user_id = auth.uid()) or public.is_admin()
);
create policy "provider_claims_owner_insert" on public.provider_claims for insert with check (
  exists (select 1 from public.provider_profiles pp where pp.id = provider_id and pp.user_id = auth.uid())
);
create policy "provider_claims_admin_all" on public.provider_claims for all using (public.is_admin()) with check (public.is_admin());

create policy "incidents_participant_or_admin" on public.safety_incidents for select using (
  reported_by = auth.uid()
  or exists (select 1 from public.client_profiles cp where cp.id = client_id and cp.user_id = auth.uid())
  or exists (select 1 from public.provider_profiles pp where pp.id = provider_id and pp.user_id = auth.uid())
  or public.is_admin()
);
create policy "incidents_reporter_insert" on public.safety_incidents for insert with check (reported_by = auth.uid());
create policy "incidents_admin_all" on public.safety_incidents for all using (public.is_admin()) with check (public.is_admin());

create policy "complaints_reporter_provider_or_admin" on public.provider_complaints for select using (
  submitted_by = auth.uid()
  or exists (select 1 from public.provider_profiles pp where pp.id = provider_id and pp.user_id = auth.uid())
  or public.is_admin()
);
create policy "complaints_reporter_insert" on public.provider_complaints for insert with check (submitted_by = auth.uid());
create policy "complaints_admin_all" on public.provider_complaints for all using (public.is_admin()) with check (public.is_admin());

create policy "incident_attachments_limited" on public.incident_attachments for select using (
  uploaded_by = auth.uid()
  or exists (
    select 1 from public.safety_incidents si
    where si.id = incident_id
    and (
      si.reported_by = auth.uid()
      or exists (select 1 from public.client_profiles cp where cp.id = si.client_id and cp.user_id = auth.uid())
      or exists (select 1 from public.provider_profiles pp where pp.id = si.provider_id and pp.user_id = auth.uid())
    )
  )
  or public.is_admin()
);
create policy "incident_attachments_insert_own" on public.incident_attachments for insert with check (uploaded_by = auth.uid());
create policy "incident_attachments_admin_all" on public.incident_attachments for all using (public.is_admin()) with check (public.is_admin());

create policy "admin_incident_actions_admin_only" on public.admin_incident_actions for all using (public.is_admin()) with check (public.is_admin());

insert into storage.buckets (id, name, public)
values
  ('provider-certifications', 'provider-certifications', false),
  ('provider-insurance', 'provider-insurance', false),
  ('incident-attachments', 'incident-attachments', false)
on conflict (id) do nothing;
