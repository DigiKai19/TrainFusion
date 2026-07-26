import Link from "next/link";
import { signUp } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function SignUp({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <form
      action={signUp}
      className="w-full max-w-md rounded-md border border-border bg-card p-6"
    >
      <h1 className="text-2xl font-semibold">Create your account</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Start with a secure account, then choose how you use TrainFusion.
      </p>
      {params.error ? (
        <p className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {params.error}
        </p>
      ) : null}
      <div className="mt-6 grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="fullName">Full name</Label>
          <Input id="fullName" name="fullName" autoComplete="name" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            minLength={8}
            required
          />
        </div>
      </div>
      <Button className="mt-6 w-full" type="submit">
        Create account
      </Button>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link className="text-primary" href="/sign-in">
          Sign in
        </Link>
      </p>
    </form>
  );
}
