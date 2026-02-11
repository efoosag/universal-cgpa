"use client";

import { useRouter } from "next/router";
import { useAcademicStore } from "@/store/academicStore";
import { Button } from "@/components/ui/button";

export default function ProGuard({ children, featureName }) {
  const { isPro } = useAcademicStore();
  const router = useRouter();

  if (isPro) return children;

  return (
    <div className="rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-900/20 p-6 text-center space-y-4">
      <p className="font-medium">
        {featureName} is a Pro feature
      </p>
      <Button
        className="bg-blue-600 hover:bg-blue-700 text-white"
        onClick={() => router.push("/upgrade")}
      >
        Upgrade to Unlock
      </Button>
    </div>
  );
}
