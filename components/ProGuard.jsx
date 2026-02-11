"use client";

import { useState } from "react";
import { useAcademicStore } from "@/store/academicStore";
import { Button } from "@/components/ui/button";
import UpgradeModal from "./UpgradeModal";

export default function ProGuard({ children, featureName }) {
  const { isPro } = useAcademicStore();
  const [showUpgrade, setShowUpgrade] = useState(false);

  if (isPro) return children;

  return (
    <div className="relative border rounded-2xl p-6 bg-slate-100 dark:bg-slate-800">
      <div className="opacity-40 pointer-events-none">
        {children}
      </div>

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 backdrop-blur-sm">
        <p className="font-semibold text-center">
          🔒 {featureName} is a PRO feature
        </p>
        <Button onClick={() => setShowUpgrade(true)}>
          Upgrade to PRO
        </Button>
      </div>

      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
    </div>
  );
}
