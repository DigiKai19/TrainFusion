import { saveProviderOnboarding } from "@/app/actions/onboarding";
import { CheckboxOption } from "@/components/onboarding/checkbox-option";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requireRole } from "@/lib/auth";

export default async function ProviderOnboarding({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  await requireRole(["provider"]);

  return (
    <form action={saveProviderOnboarding} className="mx-auto max-w-5xl">
      <p className="text-sm font-semibold text-primary">Provider onboarding</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-normal">
        Set up your services for verification.
      </h1>
      <p className="mt-4 max-w-3xl text-muted-foreground">
        Personal Trainers and Nutrition Coaches are independent providers.
        Certifications, insurance, locations, specialties, and public claims
        require review before public matching.
      </p>

      {params.error ? (
        <p className="mt-6 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {params.error}
        </p>
      ) : null}

      <section className="mt-8 grid gap-4 border-t border-border pt-6 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="displayName">Public display name</Label>
          <Input id="displayName" name="displayName" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="bio">Short profile summary</Label>
          <Input
            id="bio"
            name="bio"
            placeholder="Scope-appropriate, reviewable profile language"
          />
        </div>
      </section>

      <section className="mt-8 border-t border-border pt-6">
        <h2 className="text-xl font-semibold">Which services do you offer?</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <CheckboxOption
            name="serviceType"
            value="personal_training"
            title="Personal training"
            description="Requires an approved personal training credential."
          />
          <CheckboxOption
            name="serviceType"
            value="nutrition"
            title="Nutrition coaching"
            description="Requires an accepted nutrition-related credential."
          />
        </div>
      </section>

      <section className="mt-8 border-t border-border pt-6">
        <h2 className="text-xl font-semibold">Support modes</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <CheckboxOption name="supportMode" value="online" title="Online" />
          <CheckboxOption
            name="supportMode"
            value="in_person"
            title="In person"
          />
        </div>
      </section>

      <section className="mt-8 border-t border-border pt-6">
        <h2 className="text-xl font-semibold">Locations and environments</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {[
            ["gym", "Gym"],
            ["private_studio", "Private studio"],
            ["outdoor", "Outdoor"],
            ["client_home", "Client home"],
            ["provider_home", "Provider home"],
            ["virtual", "Virtual"]
          ].map(([value, title]) => (
            <CheckboxOption
              key={value}
              name="locationKind"
              value={value}
              title={title}
            />
          ))}
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-4">
          <div className="grid gap-2 md:col-span-2">
            <Label htmlFor="locationName">Location or area name</Label>
            <Input
              id="locationName"
              name="locationName"
              placeholder="Studio name, neighborhood, park, or service area"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="city">City</Label>
            <Input id="city" name="city" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="region">State/region</Label>
            <Input id="region" name="region" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="postalCode">Postal code</Label>
            <Input id="postalCode" name="postalCode" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="serviceRadiusMiles">Service radius</Label>
            <Input
              id="serviceRadiusMiles"
              min="0"
              name="serviceRadiusMiles"
              placeholder="Miles"
              type="number"
            />
          </div>
        </div>
      </section>

      <section className="mt-8 border-t border-border pt-6">
        <h2 className="text-xl font-semibold">Training environments supported</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          {["gym", "home", "outdoor", "virtual"].map((value) => (
            <CheckboxOption
              key={value}
              name="environment"
              value={value}
              title={value}
            />
          ))}
        </div>
      </section>

      <section className="mt-8 border-t border-border pt-6">
        <h2 className="text-xl font-semibold">Pricing by service</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="personal_trainingPrice">Personal training</Label>
            <Input
              id="personal_trainingPrice"
              name="personal_trainingPrice"
              placeholder="Starting rate or range"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="nutritionPrice">Nutrition coaching</Label>
            <Input
              id="nutritionPrice"
              name="nutritionPrice"
              placeholder="Starting rate or range"
            />
          </div>
        </div>
      </section>

      <section className="mt-8 border-t border-border pt-6">
        <h2 className="text-xl font-semibold">Specialties for review</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {[
            "strength",
            "mobility",
            "endurance",
            "habits",
            "performance nutrition",
            "general wellness"
          ].map((specialty) => (
            <CheckboxOption
              key={specialty}
              name="specialty"
              value={specialty}
              title={specialty}
            />
          ))}
        </div>
      </section>

      <div className="mt-8 rounded-md border border-border bg-[#1C1C1E] p-4 text-sm leading-6 text-muted-foreground">
        Placeholder provider agreement language: providers are responsible for
        their own client intake, informed consent, health screening, waivers,
        scope-of-practice compliance, credentials, insurance, and emergency
        response procedures. Final language requires attorney review.
      </div>

      <Button className="mt-8" size="lg" type="submit">
        Submit provider setup
      </Button>
    </form>
  );
}
