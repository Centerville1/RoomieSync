import api from './api';
import { Category } from '../types/expenses';
import { API_ENDPOINTS } from '../constants';

export const categoryService = {
  async getCategoriesByHouseId(houseId: string): Promise<Category[]> {
    const response = await api.get<Category[]>(API_ENDPOINTS.GET_CATEGORIES_BY_HOUSE_ID(houseId));
    return response.data;
  },

  async createCategory(houseId: string, categoryData: {
    name: string;
    description?: string;
    color?: string;
    icon?: string;
    sortOrder?: number;
  }): Promise<Category> {
    const response = await api.post<Category>(API_ENDPOINTS.POST_CREATE_CATEGORY(houseId), categoryData);
    return response.data;
  },

  async updateCategory(houseId: string, categoryId: string, updates: Partial<{
    name: string;
    description: string;
    color: string;
    icon: string;
    sortOrder: number;
  }>): Promise<Category> {
    const response = await api.put<Category>(API_ENDPOINTS.PUT_UPDATE_CATEGORY(houseId, categoryId), updates);
    return response.data;
  },

  async deleteCategory(houseId: string, categoryId: string): Promise<void> {
    await api.delete(API_ENDPOINTS.DELETE_CATEGORY(houseId, categoryId));
  },
};