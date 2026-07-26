import { redirect } from "next/navigation";
import { signOut } from "@/app/actions/auth";
import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import { getProfile } from "@/lib/auth";

export default async function DashboardLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  const profile = await getProfile();

  if (!profile) {
    redirect("/sign-in");
  }

  if (!profile.role) {
    redirect("/role");
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-8">
      <nav className="flex items-center justify-between border-b border-border pb-5">
        <BrandMark />
        <form action={signOut}>
          <Button variant="secondary" type="submit">
            Sign out
          </Button>
        </form>
      </nav>
      <div className="py-8">{children}</div>
    </main>
  );
}
