import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Users } from "lucide-react";
import { AppShell, formatDateTime } from "@/components/app/AppShell";
import { AuthAlert } from "@/components/auth/AuthAlert";
import { buttonClasses } from "@/components/ui/button-styles";
import { apiRequest, type TripMateUser } from "@/lib/api";
import { getAccessToken } from "@/lib/supabase/server";

// Reads the session cookie, so it must never be prerendered.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const token = await getAccessToken();
  if (!token) {
    redirect("/login?next=/dashboard");
  }

  let user: TripMateUser | null = null;
  let loadError: string | null = null;

  try {
    ({ user } = await apiRequest<{ user: TripMateUser }>("/api/auth/me", { token }));
  } catch (error) {
    loadError = error instanceof Error ? error.message : "Could not load your profile.";
  }

  return (
    <AppShell>
      {loadError || !user ? (
        <AuthAlert
          title="Something went wrong"
          message={loadError ?? "Could not load your profile."}
        />
      ) : (
        <>
          <h1 className="text-3xl font-bold tracking-tight text-night">Welcome, {user.name}</h1>
          <p className="mt-2 text-sm text-ink-soft">You are signed in to TripMate.</p>

          <dl className="mt-8 grid gap-4 rounded-2xl border border-line bg-white p-6 shadow-sm sm:grid-cols-2">
            {[
              ["Email", user.email],
              ["Role", user.role],
              ["Registered", formatDateTime(user.createdAt)],
              ["Last sign-in", formatDateTime(user.lastLoginAt)],
              ["Total sign-ins", String(user.loginCount)],
              ["Status", user.status],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
                  {label}
                </dt>
                <dd className="mt-1 break-words text-sm font-medium capitalize text-ink">{value}</dd>
              </div>
            ))}
          </dl>

          {user.role === "admin" ? (
            <Link href="/admin/users" className={buttonClasses({ className: "mt-6" })}>
              <Users className="size-4" strokeWidth={1.9} aria-hidden="true" />
              View all users
            </Link>
          ) : null}
        </>
      )}
    </AppShell>
  );
}
