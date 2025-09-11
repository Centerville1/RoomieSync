import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  User, 
  UpdateProfileRequest 
} from '../types/auth';
import { STORAGE_KEYS, API_ENDPOINTS } from '../constants';

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(API_ENDPOINTS.POST_LOGIN, credentials);
    
    // Store token and user data
    await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.data.access_token);
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data.user));
    
    return response.data;
  },

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(API_ENDPOINTS.POST_REGISTER, userData);
    
    // Store token and user data
    await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.data.access_token);
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data.user));
    
    return response.data;
  },

  async getProfile(): Promise<User> {
    const response = await api.get<User>(API_ENDPOINTS.GET_PROFILE);
    return response.data;
  },

  async updateProfile(updateData: UpdateProfileRequest): Promise<User> {
    const response = await api.patch<User>(API_ENDPOINTS.PATCH_PROFILE, updateData);
    
    // Update stored user data
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data));
    
    return response.data;
  },

  async uploadProfileImage(imageUri: string): Promise<User> {
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'profile.jpg',
    } as any);

    const response = await api.post<User>(API_ENDPOINTS.POST_UPLOAD_PROFILE_IMAGE, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // Update stored user data
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data));
    
    return response.data;
  },

  async logout(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    await AsyncStorage.removeItem(STORAGE_KEYS.USER);
    await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_HOUSE);
    await AsyncStorage.removeItem(STORAGE_KEYS.HOUSES);
  },

  async getStoredToken(): Promise<string | null> {
    return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  },

  async getStoredUser(): Promise<User | null> {
    const userStr = await AsyncStorage.getItem(STORAGE_KEYS.USER);
    return userStr ? JSON.parse(userStr) : null;
  },
};