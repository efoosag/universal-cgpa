"use client";

import { useAcademicStore } from "@/store/academicStore";
import { Button } from "@/components/ui/button";

export default function UpgradeModal({ onClose }) {
  const { upgradeToPro } = useAcademicStore();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 w-full max-w-md space-y-6">
        <h2 className="text-xl font-bold text-center">
          Upgrade to PRO 🚀
        </h2>

        <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
          <li>✔ PDF & Excel Export</li>
          <li>✔ Advanced What-If Simulation</li>
          <li>✔ AI Target Planner</li>
          <li>✔ Future Premium Features</li>
        </ul>

        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600">
            ₦2,500 / year
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            className="w-full"
            onClick={() => {
              upgradeToPro();
              onClose();
            }}
          >
            Upgrade Now
          </Button>

          <Button
            variant="outline"
            className="w-full"
            onClick={onClose}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
