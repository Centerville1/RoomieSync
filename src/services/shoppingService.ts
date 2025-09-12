import api from './api';
import { ShoppingItem } from '../types/shopping';
import { API_ENDPOINTS } from '../constants';

export const shoppingService = {
  async getShoppingItemsByHouseId(houseId: string): Promise<ShoppingItem[]> {
    const response = await api.get<ShoppingItem[]>(API_ENDPOINTS.GET_SHOPPING_ITEMS_BY_HOUSE_ID(houseId));
    return response.data;
  },

  async purchaseItem(houseId: string, itemId: string): Promise<void> {
    await api.post(API_ENDPOINTS.POST_PURCHASE_SHOPPING_ITEM(houseId, itemId));
  },

  async createShoppingItem(houseId: string, item: Omit<ShoppingItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<ShoppingItem> {
    const response = await api.post<ShoppingItem>(API_ENDPOINTS.POST_CREATE_SHOPPING_ITEM(houseId), item);
    return response.data;
  },

  async updateShoppingItem(houseId: string, itemId: string, updates: Partial<ShoppingItem>): Promise<ShoppingItem> {
    const response = await api.patch<ShoppingItem>(API_ENDPOINTS.PATCH_SHOPPING_ITEM_BY_ID(houseId, itemId), updates);
    return response.data;
  },

  async deleteShoppingItem(houseId: string, itemId: string): Promise<void> {
    await api.delete(API_ENDPOINTS.DELETE_SHOPPING_ITEM_BY_ID(houseId, itemId));
  },

  async batchPurchaseItems(houseId: string, itemIds: string[]): Promise<ShoppingItem[]> {
    const response = await api.post<ShoppingItem[]>(API_ENDPOINTS.POST_BATCH_PURCHASE_ITEMS(houseId), { itemIds });
    return response.data;
  },
};