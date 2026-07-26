import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { requireRole } from "@/lib/auth";

export default async function ClientDashboard() {
  await requireRole(["client"]);

  return (
    <section>
      <p className="text-sm font-semibold text-primary">Client dashboard</p>
      <h1 className="mt-3 text-3xl font-semibold">Compatibility starts here.</h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        Phase 1 protects this route and records required legal acceptances.
        Client onboarding, preferences, and matching will be added after the
        foundation is approved.
      </p>
      <Button asChild className="mt-6">
        <Link href="/client/onboarding">
          Continue onboarding <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
    </section>
  );
}
