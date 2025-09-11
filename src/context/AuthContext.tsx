import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { 
  AuthState, 
  User, 
  LoginRequest, 
  RegisterRequest,
  UpdateProfileRequest 
} from '../types/auth';
import { authService } from '../services/authService';

interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updateData: UpdateProfileRequest) => Promise<void>;
  uploadProfileImage: (imageUri: string) => Promise<void>;
  checkAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_TOKEN'; payload: string | null }
  | { type: 'RESET_AUTH' };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_USER':
      return { 
        ...state, 
        user: action.payload, 
        isAuthenticated: !!action.payload 
      };
    case 'SET_TOKEN':
      return { ...state, token: action.payload };
    case 'RESET_AUTH':
      return {
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      };
    default:
      return state;
  }
};

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const checkAuthStatus = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const token = await authService.getStoredToken();
      const user = await authService.getStoredUser();
      
      console.log('Auth check - Token exists:', !!token);
      console.log('Auth check - User exists:', !!user);
      
      if (token && user) {
        // Validate token by trying to fetch profile
        try {
          const currentUser = await authService.getProfile();
          dispatch({ type: 'SET_TOKEN', payload: token });
          dispatch({ type: 'SET_USER', payload: currentUser });
          console.log('Auth check - Token valid, user authenticated');
        } catch (profileError) {
          console.log('Auth check - Token invalid, clearing auth');
          // Token is invalid, clear auth data
          await authService.logout();
          dispatch({ type: 'RESET_AUTH' });
        }
      } else {
        console.log('Auth check - No token or user, not authenticated');
        dispatch({ type: 'RESET_AUTH' });
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      dispatch({ type: 'RESET_AUTH' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const login = async (credentials: LoginRequest) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await authService.login(credentials);
      
      dispatch({ type: 'SET_TOKEN', payload: response.access_token });
      dispatch({ type: 'SET_USER', payload: response.user });
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const register = async (userData: RegisterRequest) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await authService.register(userData);
      
      dispatch({ type: 'SET_TOKEN', payload: response.access_token });
      dispatch({ type: 'SET_USER', payload: response.user });
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      dispatch({ type: 'RESET_AUTH' });
    } catch (error) {
      console.error('Logout error:', error);
      // Still reset auth state even if logout fails
      dispatch({ type: 'RESET_AUTH' });
    }
  };

  const updateProfile = async (updateData: UpdateProfileRequest) => {
    try {
      const updatedUser = await authService.updateProfile(updateData);
      dispatch({ type: 'SET_USER', payload: updatedUser });
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  const uploadProfileImage = async (imageUri: string) => {
    try {
      const updatedUser = await authService.uploadProfileImage(imageUri);
      dispatch({ type: 'SET_USER', payload: updatedUser });
    } catch (error) {
      console.error('Upload profile image error:', error);
      throw error;
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    uploadProfileImage,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}