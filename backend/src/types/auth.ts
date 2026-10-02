export const USER_ROLES = ["user", "admin"] as const;
export const USER_STATUSES = ["active", "suspended"] as const;

export type UserRole = (typeof USER_ROLES)[number];
export type UserStatus = (typeof USER_STATUSES)[number];

/** Shape returned to the frontend. Never includes any credential material. */
export interface PublicUser {
  id: string;
  supabaseId: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  status: UserStatus;
  lastLoginAt: string | null;
  loginCount: number;
  createdAt: string;
  updatedAt: string;
}

/** Verified identity attached to `req.auth` by the auth middleware. */
export interface AuthContext {
  supabaseId: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  profileId: string;
}

export interface CreateProfileResponse {
  success: true;
  user: PublicUser;
}

export interface UserResponse {
  success: true;
  user: PublicUser;
}

export interface UserListResponse {
  success: true;
  total: number;
  users: PublicUser[];
}

export interface HealthResponse {
  success: true;
  message: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}