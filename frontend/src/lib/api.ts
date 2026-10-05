/**
 * Calls the TripPilot Express API (backend/). Works from both client and
 * server code; pass the Firebase ID token for authenticated routes.
 */

export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000").replace(/\/$/, "");

export interface TripPilotUser {
  id: string;
  firebaseUid: string;
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
    throw new ApiRequestError(0, "Could not reach the TripPilot server. Is the backend running?");
  }

  const payload = (await response.json().catch(() => null)) as
    | (T & { success?: boolean; error?: { message?: string } })
    | null;

  if (!response.ok || !payload) {
    throw new ApiRequestError(response.status, payload?.error?.message ?? "The TripPilot server returned an error.");
  }

  return payload;
}

/** Saves the profile right after registration, before the email is verified. */
export async function registerProfile(token: string, name: string): Promise<TripPilotUser> {
  const { user } = await apiRequest<{ user: TripPilotUser }>("/api/auth/register", {
    method: "POST",
    token,
    body: { name },
  });
  return user;
}

/** Records a sign-in in MongoDB and creates the profile when it is missing. */
export async function syncLogin(token: string): Promise<TripPilotUser> {
  const { user } = await apiRequest<{ user: TripPilotUser }>("/api/auth/sync", { method: "POST", token });
  return user;
}
