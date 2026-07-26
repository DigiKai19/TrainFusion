import { requireRole } from "@/lib/auth";

export default async function AdminDashboard() {
  await requireRole(["admin"]);

  return (
    <section>
      <p className="text-sm font-semibold text-primary">Admin dashboard</p>
      <h1 className="mt-3 text-3xl font-semibold">
        Review workflows will live here.
      </h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        Admin access is manual-only. Phase 1 prepares the protected route and
        schema boundaries for future reviews.
      </p>
    </section>
  );
}
