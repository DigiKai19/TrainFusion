import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";

export default function AuthLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-8">
      <Link href="/" aria-label="TrainFusion home">
        <BrandMark />
      </Link>
      <div className="flex flex-1 items-center justify-center py-10">
        {children}
      </div>
    </main>
  );
}
