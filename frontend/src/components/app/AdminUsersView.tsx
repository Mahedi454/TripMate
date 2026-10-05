"use client";

import { formatDateTime } from "@/components/app/AppShell";
import { AuthAlert } from "@/components/auth/AuthAlert";
import { ApiRequestError, type TripPilotUser } from "@/lib/api";
import { useAuthedRequest } from "@/lib/firebase/useAuthedRequest";

/** Admin table of everyone who registered, with their sign-in history. */
export function AdminUsersView() {
  const { data, error, isLoading } = useAuthedRequest<{ users: TripPilotUser[] }>(
    "/api/admin/users",
    "/admin/users",
  );

  if (isLoading) {
    return (
      <p className="mt-2 text-sm text-ink-soft" role="status" aria-live="polite">
        Loading users...
      </p>
    );
  }

  if (error || !data) {
    const message =
      error instanceof ApiRequestError && error.status === 403
        ? "Only admins can see this page. Add your email to ADMIN_EMAILS in backend/.env, restart the backend and sign in again."
        : (error?.message ?? "Could not load users.");
    return <AuthAlert className="mt-6" title="Cannot show users" message={message} />;
  }

  const { users } = data;

  return (
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
  );
}
