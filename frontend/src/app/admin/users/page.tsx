import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AppShell, formatDateTime } from "@/components/app/AppShell";
import { AuthAlert } from "@/components/auth/AuthAlert";
import { ApiRequestError, apiRequest, type TripMateUser } from "@/lib/api";
import { getAccessToken } from "@/lib/supabase/server";

// Reads the session cookie, so it must never be prerendered.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Users",
};

/** Admin view of everyone who registered, with their sign-in history. */
export default async function AdminUsersPage() {
  const token = await getAccessToken();
  if (!token) {
    redirect("/login?next=/admin/users");
  }

  let users: TripMateUser[] = [];
  let loadError: string | null = null;

  try {
    ({ users } = await apiRequest<{ users: TripMateUser[] }>("/api/admin/users", { token }));
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 403) {
      loadError =
        "Only admins can see this page. Add your email to ADMIN_EMAILS in backend/.env, restart the backend and sign in again.";
    } else {
      loadError = error instanceof Error ? error.message : "Could not load users.";
    }
  }

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

      {loadError ? (
        <AuthAlert className="mt-6" title="Cannot show users" message={loadError} />
      ) : (
        <>
          <p className="mt-2 text-sm text-ink-soft">
            {users.length} registered {users.length === 1 ? "user" : "users"}, newest first.
          </p>

          <div className="mt-6 overflow-x-auto rounded-2xl border border-line bg-white shadow-sm">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-line bg-canvas text-xs uppercase tracking-wide text-ink-soft">
                <tr>
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Role</th>
                  <th className="px-4 py-3 font-semibold">Registered</th>
                  <th className="px-4 py-3 font-semibold">Last sign-in</th>
                  <th className="px-4 py-3 text-right font-semibold">Sign-ins</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-4 py-3 font-medium text-ink">{user.name}</td>
                    <td className="px-4 py-3 text-ink-soft">{user.email}</td>
                    <td className="px-4 py-3 capitalize text-ink-soft">{user.role}</td>
                    <td className="px-4 py-3 text-ink-soft">{formatDateTime(user.createdAt)}</td>
                    <td className="px-4 py-3 text-ink-soft">{formatDateTime(user.lastLoginAt)}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-ink">{user.loginCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </AppShell>
  );
}
