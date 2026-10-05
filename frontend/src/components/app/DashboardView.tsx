"use client";

import Link from "next/link";
import { Users } from "lucide-react";
import { formatDateTime } from "@/components/app/AppShell";
import { AuthAlert } from "@/components/auth/AuthAlert";
import { buttonClasses } from "@/components/ui/button-styles";
import type { TripPilotUser } from "@/lib/api";
import { useAuthedRequest } from "@/lib/firebase/useAuthedRequest";

/** The signed-in user's profile and sign-in stats. */
export function DashboardView() {
  const { data, error, isLoading } = useAuthedRequest<{ user: TripPilotUser }>(
    "/api/auth/me",
    "/dashboard",
  );

  if (isLoading) {
    return (
      <p className="text-sm text-ink-soft" role="status" aria-live="polite">
        Loading your profile...
      </p>
    );
  }

  if (error || !data) {
    return (
      <AuthAlert
        title="Something went wrong"
        message={error?.message ?? "Could not load your profile."}
      />
    );
  }

  const { user } = data;
  const details: [label: string, value: string, capitalize?: boolean][] = [
    ["Email", user.email],
    ["Role", user.role, true],
    ["Registered", formatDateTime(user.createdAt)],
    ["Last sign-in", formatDateTime(user.lastLoginAt)],
    ["Total sign-ins", String(user.loginCount)],
    ["Status", user.status, true],
  ];

  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight text-night">Welcome, {user.name}</h1>
      <p className="mt-2 text-sm text-ink-soft">You are signed in to TripPilot.</p>

      <dl className="mt-8 grid gap-4 rounded-2xl border border-line bg-white p-6 shadow-sm sm:grid-cols-2">
        {details.map(([label, value, capitalize]) => (
          <div key={label}>
            <dt className="text-xs font-semibold uppercase tracking-wide text-ink-soft">{label}</dt>
            <dd
              className={`mt-1 break-words text-sm font-medium text-ink ${capitalize ? "capitalize" : ""}`}
            >
              {value}
            </dd>
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
  );
}
