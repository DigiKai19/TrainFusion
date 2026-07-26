"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function checked(formData: FormData, name: string) {
  return formData.get(name) === "on";
}

function values(formData: FormData, name: string) {
  return formData.getAll(name).map(String).filter(Boolean);
}

export async function saveClientOnboarding(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { data: clientProfile, error: profileError } = await supabase
    .from("client_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (profileError || !clientProfile) {
    redirect("/role?error=Complete role selection first.");
  }

  const wantsPersonalTraining = checked(formData, "wantsPersonalTraining");
  const wantsNutrition = checked(formData, "wantsNutrition");

  if (!wantsPersonalTraining && !wantsNutrition) {
    redirect("/client/onboarding?error=Choose at least one service.");
  }

  const { error } = await supabase
    .from("client_service_preferences")
    .upsert(
      {
        client_id: clientProfile.id,
        wants_personal_training: wantsPersonalTraining,
        wants_nutrition: wantsNutrition,
        support_mode_preference: String(formData.get("supportMode") || "both"),
        environment_preferences: values(formData, "environment"),
        open_to_hybrid_provider: checked(formData, "openToHybrid"),
        prefers_separate_specialists: checked(formData, "prefersSeparate"),
        budget_preferences: {
          range: String(formData.get("budgetRange") || "")
        },
        schedule_preferences: {
          availability: values(formData, "availability")
        }
      },
      { onConflict: "client_id" }
    );

  if (error) {
    redirect(`/client/onboarding?error=${encodeURIComponent(error.message)}`);
  }

  await supabase
    .from("client_profiles")
    .update({ onboarding_status: "completed" })
    .eq("id", clientProfile.id);

  await supabase
    .from("profiles")
    .update({ onboarding_status: "completed" })
    .eq("id", user.id);

  revalidatePath("/client");
  redirect("/client");
}

export async function saveProviderOnboarding(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { data: providerProfile, error: profileError } = await supabase
    .from("provider_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (profileError || !providerProfile) {
    redirect("/role?error=Complete role selection first.");
  }

  const serviceTypes = values(formData, "serviceType");
  if (serviceTypes.length === 0) {
    redirect("/provider/onboarding?error=Choose at least one service.");
  }

  const displayName = String(formData.get("displayName") || "");
  const bio = String(formData.get("bio") || "");
  const supportModes = values(formData, "supportMode");
  const environments = values(formData, "environment");

  const { error: providerError } = await supabase
    .from("provider_profiles")
    .update({
      public_display_name: displayName,
      bio,
      profile_status: "submitted",
      claims_review_status: "pending_review"
    })
    .eq("id", providerProfile.id);

  if (providerError) {
    redirect(`/provider/onboarding?error=${encodeURIComponent(providerError.message)}`);
  }

  for (const serviceType of serviceTypes) {
    await supabase.from("provider_services").upsert(
      {
        provider_id: providerProfile.id,
        service_type: serviceType,
        is_offered: true,
        online_supported: supportModes.includes("online"),
        in_person_supported: supportModes.includes("in_person"),
        training_environments: environments,
        pricing: {
          starting_at: String(formData.get(`${serviceType}Price`) || "")
        }
      },
      { onConflict: "provider_id,service_type" }
    );
  }

  const locationKinds = values(formData, "locationKind");
  for (const locationKind of locationKinds) {
    await supabase.from("provider_locations").insert({
      provider_id: providerProfile.id,
      location_kind: locationKind,
      pending_gym_name:
        locationKind === "gym"
          ? String(formData.get("locationName") || "")
          : null,
      display_name:
        locationKind === "virtual"
          ? "Virtual support"
          : String(formData.get("locationName") || "Service location"),
      service_types: serviceTypes,
      online_supported: locationKind === "virtual" || supportModes.includes("online"),
      in_person_supported: locationKind !== "virtual",
      city: String(formData.get("city") || ""),
      region: String(formData.get("region") || ""),
      postal_code: String(formData.get("postalCode") || ""),
      service_radius_miles: Number(formData.get("serviceRadiusMiles") || 0),
      environments
    });
  }

  for (const specialty of values(formData, "specialty")) {
    for (const serviceType of serviceTypes) {
      await supabase.from("provider_specialties").upsert(
        {
          provider_id: providerProfile.id,
          service_type: serviceType,
          specialty_name: specialty
        },
        { onConflict: "provider_id,service_type,specialty_name" }
      );
    }
  }

  await supabase
    .from("profiles")
    .update({ onboarding_status: "completed" })
    .eq("id", user.id);

  revalidatePath("/provider");
  redirect("/provider");
}
