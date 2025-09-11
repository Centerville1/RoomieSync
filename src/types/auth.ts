export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  profileImageUrl?: string;
  color: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  houseMemberships?: HouseMembership[];
}

export interface HouseMembership {
  id: string;
  displayName: string;
  role: 'admin' | 'member';
  isActive: boolean;
  joinedAt: string;
  updatedAt: string;
  user?: User;
  house?: any; // Import from houses.ts when needed
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  inviteCode?: string;
  displayName?: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  profileImageUrl?: string;
  color?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}