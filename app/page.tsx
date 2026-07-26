import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-8">
        <nav className="flex items-center justify-between">
          <BrandMark />
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost">
              <Link href="/sign-in">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/sign-up">Get started</Link>
            </Button>
          </div>
        </nav>

        <div className="grid flex-1 items-center gap-12 py-16 md:grid-cols-[1.08fr_0.92fr]">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary">
              <Sparkles className="h-4 w-4" />
              Compatibility-first matching
            </div>
            <h1 className="max-w-3xl text-5xl font-semibold leading-[1.02] tracking-normal text-foreground md:text-7xl">
              Find the professional you are most likely to succeed with.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              TrainFusion connects clients with independent Personal Trainers
              and Nutrition Coaches using structured preferences, verified
              eligibility, and clear compatibility signals.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/sign-up">
                  Start matching <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="/sign-in">I already have an account</Link>
              </Button>
            </div>
          </div>

          <div className="border-y border-border py-8">
            <div className="grid gap-4">
              {[
                "Personal Trainer",
                "Nutrition Coach",
                "Trainer & Nutrition Coach"
              ].map((label, index) => (
                <div
                  key={label}
                  className="flex items-center justify-between rounded-md border border-border bg-card px-5 py-4"
                >
                  <div>
                    <p className="font-semibold">{label}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Verified eligibility before public matching.
                    </p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                    {index + 1}
                  </div>
                </div>
              ))}
              <div className="mt-2 flex items-start gap-3 rounded-md border border-border bg-[#1C1C1E] p-4 text-sm text-muted-foreground">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <p>
                  TrainFusion is a technology marketplace. It does not provide
                  training, nutrition coaching, medical advice, diagnosis,
                  treatment, or emergency services.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
