import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-center p-6">
      <h1 className="text-4xl font-bold mb-4">
        Universal CGPA Calculator
      </h1>
      <p className="text-muted-foreground mb-6 max-w-md">
        Track your academic performance, plan your GPA, and graduate with clarity.
      </p>

      <Link href="/onboarding">
        <Button size="lg">Get Started</Button>
      </Link>
    </main>
  );
}
