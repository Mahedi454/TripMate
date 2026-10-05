import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminUsersView } from "@/components/app/AdminUsersView";
import { AppShell } from "@/components/app/AppShell";

export const metadata: Metadata = {
  title: "Users",
};

export default function AdminUsersPage() {
  return (
    <AppShell>
      <Link
        href="/dashboard"
        className="-my-1 inline-flex min-h-10 items-center gap-1.5 rounded-lg text-[13px] font-medium text-ink-soft transition hover:text-brand-600"
      >
        <ArrowLeft className="size-4" strokeWidth={2} aria-hidden="true" />
        Back to dashboard
      </Link>

      <h1 className="mt-2 text-3xl font-bold tracking-tight text-night">Users</h1>

      <AdminUsersView />
    </AppShell>
  );
}
