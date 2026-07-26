export const PROVIDER_LABELS = {
  personal_trainer: "Personal Trainer",
  nutrition_coach: "Nutrition Coach",
  hybrid: "Trainer & Nutrition Coach"
} as const;

export const REQUIRED_CLIENT_AGREEMENTS = [
  "terms_of_service",
  "privacy_policy",
  "medical_disclaimer_acknowledgment"
] as const;

export const REQUIRED_PROVIDER_AGREEMENTS = [
  "terms_of_service",
  "privacy_policy",
  "provider_agreement",
  "independent_provider_acknowledgment",
  "scope_of_practice_agreement",
  "certification_accuracy_attestation",
  "insurance_attestation"
] as const;

export const CURRENT_AGREEMENT_VERSION = "2026-07-26-mvp-placeholder";
