import type { Metadata } from "next";
import { AppShell } from "@/components/app/AppShell";
import { DashboardView } from "@/components/app/DashboardView";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return (
    <AppShell>
      <DashboardView />
    </AppShell>
  );
}
