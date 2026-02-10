import DashboardGuard from "@/components/DashboardGuard";

export default function DashboardLayout({ children }) {
  return (
    <DashboardGuard>
      {children}
    </DashboardGuard>
  );
}
