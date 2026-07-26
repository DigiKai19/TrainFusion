import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/types";

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return user;
}

export async function getProfile() {
  const supabase = await createClient();
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const { data } = await supabase
    .from("profiles")
    .select("id, role, full_name, onboarding_status")
    .eq("id", user.id)
    .maybeSingle();

  return data;
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  return user;
}

export async function requireRole(roles: UserRole[]) {
  const profile = await getProfile();

  if (!profile) {
    redirect("/sign-in");
  }

  if (!profile.role) {
    redirect("/role");
  }

  if (!roles.includes(profile.role as UserRole)) {
    redirect("/");
  }

  return profile;
}
