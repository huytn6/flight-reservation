export type UserRole = 'CUSTOMER' | 'STAFF' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'BANNED';

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  status?: UserStatus;
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

export interface ActiveSession {
  id: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  expires_at: string;
}

export interface SavedPassenger {
  id: string;
  user_id?: string;
  full_name: string;
  date_of_birth?: string;
  nationality?: string;
  passport_number?: string;
  passport_expiry?: string;
  created_at?: string;
}
