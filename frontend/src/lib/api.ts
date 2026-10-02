/**
 * Calls the TripMate Express API (backend/). Works from both client and
 * server code; pass the Supabase access token for authenticated routes.
 */

export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000").replace(/\/$/, "");

export interface TripMateUser {
  id: string;
  supabaseId: string;
  name: string;
  email: string;
  avatar: string;
  role: "user" | "admin";
  status: "active" | "suspended";
  lastLoginAt: string | null;
  loginCount: number;
  createdAt: string;
  updatedAt: string;
}

export class ApiRequestError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
  }
}

interface ApiRequestOptions {
  method?: "GET" | "POST";
  token?: string;
  body?: unknown;
}

export async function apiRequest<T>(path: string, { method = "GET", token, body }: ApiRequestOptions = {}): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        ...(body === undefined ? {} : { "Content-Type": "application/json" }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
    });
  } catch {
    throw new ApiRequestError(0, "Could not reach the TripMate server. Is the backend running?");
  }

  const payload = (await response.json().catch(() => null)) as
    | (T & { success?: boolean; error?: { message?: string } })
    | null;

  if (!response.ok || !payload) {
    throw new ApiRequestError(response.status, payload?.error?.message ?? "The TripMate server returned an error.");
  }

  return payload;
}

/** Records a sign-in in MongoDB and creates the profile when it is missing. */
export async function syncLogin(token: string): Promise<TripMateUser> {
  const { user } = await apiRequest<{ user: TripMateUser }>("/api/auth/sync", { method: "POST", token });
  return user;
}
