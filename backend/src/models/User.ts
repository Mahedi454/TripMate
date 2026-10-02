import mongoose, { type Model, type Types } from "mongoose";
import { USER_ROLES, USER_STATUSES, type UserRole, type UserStatus } from "../types/auth.js";

export interface UserDoc {
  _id: Types.ObjectId;
  supabaseId: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  status: UserStatus;
  lastLoginAt: Date | null;
  loginCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new mongoose.Schema<UserDoc>(
  {
    supabaseId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    avatar: {
      type: String,
      default: "",
    },
    // role is never read from the request body - see auth.service.ts
    role: {
      type: String,
      enum: USER_ROLES,
      default: "user",
    },
    status: {
      type: String,
      enum: USER_STATUSES,
      default: "active",
    },
    // Updated by POST /api/auth/sync every time the user signs in.
    lastLoginAt: {
      type: Date,
      default: null,
    },
    loginCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export type UserModel = Model<UserDoc>;

// Reuse the compiled model during tsx watch reloads, otherwise mongoose
// throws OverwriteModelError on every hot restart.
export const User: UserModel =
  (mongoose.models.User as UserModel | undefined) ??
  mongoose.model<UserDoc>("User", userSchema);