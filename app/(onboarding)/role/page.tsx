import { BadgeCheck, Leaf, UserRound } from "lucide-react";
import { selectRole } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/auth";

export default async function RolePage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  await requireUser();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center px-6 py-10">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold text-primary">Role selection</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-normal">
          How will you use TrainFusion?
        </h1>
        <p className="mt-4 text-muted-foreground">
          Choose once to create the right onboarding path. Admin access is
          assigned separately and is not available through public signup.
        </p>
      </div>

      {params.error ? (
        <p className="mt-6 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {params.error}
        </p>
      ) : null}

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <form
          action={selectRole}
          className="rounded-md border border-border bg-card p-5"
        >
          <UserRound className="h-6 w-6 text-primary" />
          <h2 className="mt-4 text-xl font-semibold">Client</h2>
          <p className="mt-2 min-h-16 text-sm leading-6 text-muted-foreground">
            Find a Personal Trainer, Nutrition Coach, or both based on
            compatibility and verified service eligibility.
          </p>
          <input type="hidden" name="role" value="client" />
          <div className="mt-4 rounded-md border border-border bg-[#1C1C1E] p-3 text-xs leading-5 text-muted-foreground">
            Includes Terms, Privacy Policy, and a brief acknowledgment that
            TrainFusion is not a medical provider.
          </div>
          <Button className="mt-5 w-full" type="submit">
            Continue as client
          </Button>
        </form>

        <form
          action={selectRole}
          className="rounded-md border border-border bg-card p-5"
        >
          <div className="flex gap-2 text-primary">
            <BadgeCheck className="h-6 w-6" />
            <Leaf className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-xl font-semibold">Professional</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Offer services as an independent Personal Trainer, Nutrition Coach,
            or Trainer & Nutrition Coach.
          </p>
          <input type="hidden" name="role" value="provider" />
          <fieldset className="mt-4 grid gap-2 text-sm">
            {[
              ["personal_trainer", "Personal Trainer"],
              ["nutrition_coach", "Nutrition Coach"],
              ["hybrid", "Trainer & Nutrition Coach"]
            ].map(([value, label]) => (
              <label
                key={value}
                className="flex items-center gap-3 rounded-md border border-border bg-[#1C1C1E] px-3 py-2"
              >
                <input
                  className="h-4 w-4 accent-[#B7FF00]"
                  name="providerType"
                  type="radio"
                  value={value}
                  required
                />
                {label}
              </label>
            ))}
          </fieldset>
          <Button className="mt-5 w-full" type="submit">
            Continue as professional
          </Button>
        </form>
      </div>
    </main>
  );
}
