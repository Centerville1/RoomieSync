export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3001',
  TIMEOUT: parseInt(process.env.EXPO_PUBLIC_API_TIMEOUT || '10000', 10),
} as const;

export const API_ENDPOINTS = {
  // Auth endpoints
  POST_LOGIN: '/auth/login',
  POST_REGISTER: '/auth/register',
  GET_PROFILE: '/auth/profile',
  PATCH_PROFILE: '/auth/profile',
  POST_UPLOAD_PROFILE_IMAGE: '/auth/upload-profile-image',
  
  // House endpoints
  POST_CREATE_HOUSE: '/houses',
  POST_JOIN_HOUSE: '/houses/join',
  GET_USER_HOUSES: '/houses',
  GET_HOUSE_BY_ID: (id: string) => `/houses/${id}`,
  PATCH_HOUSE_BY_ID: (id: string) => `/houses/${id}`,
  POST_UPLOAD_HOUSE_IMAGE: (id: string) => `/houses/${id}/upload-image`,
  
  // Expense endpoints
  POST_CREATE_EXPENSE: (houseId: string) => `/houses/${houseId}/expenses`,
  GET_EXPENSES_BY_HOUSE_ID: (houseId: string) => `/houses/${houseId}/expenses`,
  GET_EXPENSE_BY_ID: (houseId: string, expenseId: string) => `/houses/${houseId}/expenses/${expenseId}`,
  
  // Balance endpoints
  GET_BALANCES_BY_HOUSE_ID: (houseId: string) => `/houses/${houseId}/balances`,
  
  // Payment endpoints
  POST_CREATE_PAYMENT: (houseId: string) => `/houses/${houseId}/payments`,
  GET_PAYMENTS_BY_HOUSE_ID: (houseId: string) => `/houses/${houseId}/payments`,
  
  // Shopping endpoints
  GET_SHOPPING_LIST_BY_HOUSE_ID: (houseId: string) => `/houses/${houseId}/shopping-list`,
  GET_SHOPPING_ITEMS_BY_HOUSE_ID: (houseId: string) => `/houses/${houseId}/shopping-list/items`,
  POST_CREATE_SHOPPING_ITEM: (houseId: string) => `/houses/${houseId}/shopping-list/items`,
  PATCH_SHOPPING_ITEM_BY_ID: (houseId: string, itemId: string) => `/houses/${houseId}/shopping-list/items/${itemId}`,
  POST_PURCHASE_SHOPPING_ITEM: (houseId: string, itemId: string) => `/houses/${houseId}/shopping-list/items/${itemId}/purchase`,
  POST_BATCH_PURCHASE_ITEMS: (houseId: string) => `/houses/${houseId}/shopping-list/items/batch-purchase`,
  DELETE_SHOPPING_ITEM_BY_ID: (houseId: string, itemId: string) => `/houses/${houseId}/shopping-list/items/${itemId}`,
  GET_RECENT_RECURRING_ITEMS: (houseId: string) => `/houses/${houseId}/shopping-list/recent-recurring`,
  GET_SHOPPING_HISTORY: (houseId: string) => `/houses/${houseId}/shopping-list/history`,
} as const;