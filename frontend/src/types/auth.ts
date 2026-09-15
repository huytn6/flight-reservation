import type { UserRoleEnum, UserStatusEnum } from '@/types/enums';

export type UserRole = UserRoleEnum;
export type UserStatus = UserStatusEnum;

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: UserRoleEnum;
  status?: UserStatusEnum;
  created_at?: string;
}

export interface AuthResponse {
  token: string;
  expires_at: string;
  user: AuthUser;
}

export interface RegisterPayload {
  email: string;
  password: string;
  full_name: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ChangePasswordPayload {
  old_password: string;
  new_password: string;
}

