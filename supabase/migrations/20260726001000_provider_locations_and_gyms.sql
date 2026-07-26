create type public.location_kind as enum (
  'gym',
  'private_studio',
  'outdoor',
  'client_home',
  'provider_home',
  'virtual'
);

create type public.location_access_model as enum (
  'public',
  'members_only',
  'provider_affiliation_required',
  'invite_only',
  'virtual'
);

create type public.gym_relationship_status as enum (
  'unverified',
  'pending_review',
  'verified',
  'rejected',
  'inactive'
);

create table public.gyms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  website_url text,
  phone text,
  address_line1 text,
  address_line2 text,
  city text,
  region text,
  postal_code text,
  country text not null default 'US',
  latitude numeric(9, 6),
  longitude numeric(9, 6),
  access_model public.location_access_model not null default 'public',
  amenities text[] not null default '{}',
  admin_verified_at timestamptz,
  admin_notes_private text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint gyms_latitude_check check (latitude is null or latitude between -90 and 90),
  constraint gyms_longitude_check check (longitude is null or longitude between -180 and 180)
);

create table public.gym_partnerships (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references public.gyms(id) on delete cascade,
  status public.gym_relationship_status not null default 'pending_review',
  partnership_terms jsonb not null default '{}'::jsonb,
  starts_at date,
  ends_at date,
  admin_notes_private text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.provider_locations (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.provider_profiles(id) on delete cascade,
  location_kind public.location_kind not null,
  gym_id uuid references public.gyms(id) on delete set null,
  pending_gym_name text,
  display_name text,
  service_types public.service_type[] not null default '{}',
  online_supported boolean not null default false,
  in_person_supported boolean not null default true,
  address_visibility text not null default 'city_region',
  address_line1 text,
  address_line2 text,
  city text,
  region text,
  postal_code text,
  country text not null default 'US',
  latitude numeric(9, 6),
  longitude numeric(9, 6),
  service_radius_miles numeric(6, 2),
  environments text[] not null default '{}',
  access_notes text,
  is_primary boolean not null default false,
  is_active boolean not null default true,
  review_status public.review_status not null default 'pending_review',
  admin_notes_private text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint provider_locations_gym_required check (
    (location_kind = 'gym' and (gym_id is not null or pending_gym_name is not null))
    or (location_kind <> 'gym')
  ),
  constraint provider_locations_virtual_shape check (
    (location_kind = 'virtual' and online_supported = true)
    or (location_kind <> 'virtual')
  ),
  constraint provider_locations_latitude_check check (latitude is null or latitude between -90 and 90),
  constraint provider_locations_longitude_check check (longitude is null or longitude between -180 and 180),
  constraint provider_locations_radius_check check (service_radius_miles is null or service_radius_miles >= 0)
);

create table public.provider_gym_affiliations (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.provider_profiles(id) on delete cascade,
  gym_id uuid not null references public.gyms(id) on delete cascade,
  relationship_status public.gym_relationship_status not null default 'pending_review',
  relationship_type text,
  permission_to_train_clients boolean not null default false,
  employment_status text,
  proof_document_path text,
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  admin_notes_private text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider_id, gym_id)
);

create index gyms_city_region_country_idx on public.gyms (city, region, country);
create index gyms_geo_idx on public.gyms (latitude, longitude);
create index provider_locations_provider_idx on public.provider_locations (provider_id);
create index provider_locations_gym_idx on public.provider_locations (gym_id);
create index provider_locations_kind_active_idx on public.provider_locations (location_kind, is_active);
create index provider_gym_affiliations_provider_idx on public.provider_gym_affiliations (provider_id);
create index provider_gym_affiliations_gym_idx on public.provider_gym_affiliations (gym_id);

create trigger gyms_updated_at before update on public.gyms for each row execute function public.touch_updated_at();
create trigger gym_partnerships_updated_at before update on public.gym_partnerships for each row execute function public.touch_updated_at();
create trigger provider_locations_updated_at before update on public.provider_locations for each row execute function public.touch_updated_at();
create trigger provider_gym_affiliations_updated_at before update on public.provider_gym_affiliations for each row execute function public.touch_updated_at();

alter table public.gyms enable row level security;
alter table public.gym_partnerships enable row level security;
alter table public.provider_locations enable row level security;
alter table public.provider_gym_affiliations enable row level security;

create policy "gyms_read_authenticated" on public.gyms
  for select
  to authenticated
  using (true);

create policy "gyms_admin_all" on public.gyms
  for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "gym_partnerships_admin_only" on public.gym_partnerships
  for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "provider_locations_owner_or_admin_select" on public.provider_locations
  for select
  using (
    exists (
      select 1 from public.provider_profiles pp
      where pp.id = provider_id
      and pp.user_id = auth.uid()
    )
    or public.is_admin()
  );

create policy "provider_locations_owner_insert" on public.provider_locations
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

create policy "provider_locations_owner_update" on public.provider_locations
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

create policy "provider_locations_admin_all" on public.provider_locations
  for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "provider_gym_affiliations_owner_or_admin_select" on public.provider_gym_affiliations
  for select
  using (
    exists (
      select 1 from public.provider_profiles pp
      where pp.id = provider_id
      and pp.user_id = auth.uid()
    )
    or public.is_admin()
  );

create policy "provider_gym_affiliations_owner_insert" on public.provider_gym_affiliations
  for insert
  with check (
    exists (
      select 1 from public.provider_profiles pp
      where pp.id = provider_id
      and pp.user_id = auth.uid()
    )
    and relationship_status = 'pending_review'
    and permission_to_train_clients = false
    and reviewed_by is null
    and reviewed_at is null
    and admin_notes_private is null
  );

create policy "provider_gym_affiliations_owner_update" on public.provider_gym_affiliations
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
    and relationship_status = 'pending_review'
    and permission_to_train_clients = false
    and reviewed_by is null
    and reviewed_at is null
    and admin_notes_private is null
  );

create policy "provider_gym_affiliations_admin_all" on public.provider_gym_affiliations
  for all
  using (public.is_admin())
  with check (public.is_admin());
