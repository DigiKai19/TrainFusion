# TrainFusion

TrainFusion is a premium compatibility marketplace that connects clients with
independent Personal Trainers and Nutrition Coaches.

## MVP Scope

Phase 1 includes:

- Next.js App Router scaffold
- TrainFusion design tokens
- Supabase connection helpers
- base schema and enums
- authentication
- role selection
- protected routes
- initial RLS
- versioned legal acceptance infrastructure

TrainFusion is not a medical provider and does not provide medical advice,
diagnosis, treatment, exercise prescriptions, nutrition coaching, personal
training, or emergency services. Legal and provider-responsibility language is
placeholder architecture pending attorney review.

## Environment

Copy `.env.example` to `.env.local` and add Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Supabase

Apply the migration in `supabase/migrations/20260726000000_phase_1_foundation.sql`
to create the Phase 1 schema, RLS policies, storage buckets, and role-selection
RPC.

Then apply `supabase/migrations/20260726001000_provider_locations_and_gyms.sql`
before Phase 2 to add normalized gyms, gym partnerships, provider gym
affiliations, and provider locations for gym, private studio, outdoor, home,
and virtual services.

Apply `supabase/migrations/20260726002000_provider_specialties.sql` before
building provider onboarding to add approval-gated provider specialties.
