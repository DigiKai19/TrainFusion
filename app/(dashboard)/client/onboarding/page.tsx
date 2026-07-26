import { saveClientOnboarding } from "@/app/actions/onboarding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckboxOption } from "@/components/onboarding/checkbox-option";
import { RadioOption } from "@/components/onboarding/radio-option";
import { requireRole } from "@/lib/auth";

export default async function ClientOnboarding({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  await requireRole(["client"]);

  return (
    <form action={saveClientOnboarding} className="mx-auto max-w-4xl">
      <p className="text-sm font-semibold text-primary">Client onboarding</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-normal">
        Tell us what kind of support fits your life.
      </h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        This is not a medical intake. TrainFusion uses these preferences to
        prepare compatibility matching after the verified provider foundation is
        approved.
      </p>

      {params.error ? (
        <p className="mt-6 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {params.error}
        </p>
      ) : null}

      <section className="mt-8 border-t border-border pt-6">
        <h2 className="text-xl font-semibold">What are you looking for?</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <CheckboxOption
            name="wantsPersonalTraining"
            title="Personal Trainer"
            description="Fitness training support from a verified eligible professional."
          />
          <CheckboxOption
            name="wantsNutrition"
            title="Nutrition Coach"
            description="General wellness, habits, and nutrition education within scope."
          />
        </div>
      </section>

      <section className="mt-8 border-t border-border pt-6">
        <h2 className="text-xl font-semibold">Support format</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <RadioOption name="supportMode" value="online" title="Online" />
          <RadioOption name="supportMode" value="in_person" title="In person" />
          <RadioOption
            defaultChecked
            name="supportMode"
            value="both"
            title="Open to both"
          />
        </div>
      </section>

      <section className="mt-8 border-t border-border pt-6">
        <h2 className="text-xl font-semibold">Preferred environments</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          {[
            ["gym", "Gym-based"],
            ["home", "Home-based"],
            ["outdoor", "Outdoor"],
            ["virtual", "Virtual"]
          ].map(([value, title]) => (
            <CheckboxOption
              key={value}
              name="environment"
              value={value}
              title={title}
            />
          ))}
        </div>
      </section>

      <section className="mt-8 border-t border-border pt-6">
        <h2 className="text-xl font-semibold">Professional structure</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <CheckboxOption
            defaultChecked
            name="openToHybrid"
            title="Open to one professional for both"
            description="A verified Trainer & Nutrition Coach may be recommended later."
          />
          <CheckboxOption
            name="prefersSeparate"
            title="Prefer separate specialists"
            description="Useful if you want different professionals for training and nutrition."
          />
        </div>
      </section>

      <section className="mt-8 border-t border-border pt-6">
        <h2 className="text-xl font-semibold">Budget and availability</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="budgetRange">Budget range</Label>
            <Input
              id="budgetRange"
              name="budgetRange"
              placeholder="$75-$150 per session or monthly range"
            />
          </div>
          <div className="grid gap-2">
            <Label>Availability</Label>
            <div className="grid gap-2 sm:grid-cols-3">
              {["weekdays", "evenings", "weekends"].map((value) => (
                <CheckboxOption
                  key={value}
                  name="availability"
                  value={value}
                  title={value}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <Button className="mt-8" size="lg" type="submit">
        Save client preferences
      </Button>
    </form>
  );
}
