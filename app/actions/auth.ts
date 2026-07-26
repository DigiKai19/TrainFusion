"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  CURRENT_AGREEMENT_VERSION,
  REQUIRED_CLIENT_AGREEMENTS,
  REQUIRED_PROVIDER_AGREEMENTS
} from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import type { AgreementType, ProviderType, UserRole } from "@/lib/types";

function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

export async function signUp(formData: FormData) {
  const supabase = await createClient();
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const fullName = String(formData.get("fullName") || "");

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${siteUrl()}/auth/callback`,
      data: { full_name: fullName }
    }
  });

  if (error) {
    redirect(`/sign-up?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/role");
}

export async function signIn(formData: FormData) {
  const supabase = await createClient();
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    redirect(`/sign-in?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/", "layout");
  redirect("/role");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/sign-in");
}

export async function selectRole(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const role = String(formData.get("role")) as UserRole;
  const providerType = String(formData.get("providerType") || "") as
    | ProviderType
    | "";

  if (!["client", "provider"].includes(role)) {
    redirect("/role?error=Choose a valid role.");
  }

  if (role === "provider" && !providerType) {
    redirect("/role?error=Choose the services you offer.");
  }

  const headerStore = await headers();
  const ipAddress = headerStore.get("x-forwarded-for")?.split(",")[0] || null;
  const userAgent = headerStore.get("user-agent");

  const { error } = await supabase.rpc("complete_role_selection", {
    selected_role: role,
    selected_provider_type: role === "provider" ? providerType : null,
    agreement_types:
      role === "client"
        ? [...REQUIRED_CLIENT_AGREEMENTS]
        : [...REQUIRED_PROVIDER_AGREEMENTS],
    agreement_version: CURRENT_AGREEMENT_VERSION,
    request_ip: ipAddress,
    request_user_agent: userAgent
  });

  if (error) {
    redirect(`/role?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/", "layout");
  redirect(role === "client" ? "/client" : "/provider");
}
