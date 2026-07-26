import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { requireRole } from "@/lib/auth";

export default async function ProviderDashboard() {
  await requireRole(["provider"]);

  return (
    <section>
      <p className="text-sm font-semibold text-primary">Provider dashboard</p>
      <h1 className="mt-3 text-3xl font-semibold">
        Build your verified service profile.
      </h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        Phase 1 establishes protected access and provider attestations.
        Certification, insurance, and service eligibility workflows come next.
      </p>
      <Button asChild className="mt-6">
        <Link href="/provider/onboarding">
          Continue onboarding <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
    </section>
  );
}
