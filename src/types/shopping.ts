import { User } from './auth';
import { House } from './houses';
import { Category } from './expenses';

export interface ShoppingList {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  items: ShoppingItem[];
  primaryForHouse?: House;
  house?: House;
}

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  notes?: string;
  purchasedAt?: string;
  isRecurring: boolean;
  recurringInterval?: number;
  lastRecurredAt?: string;
  createdAt: string;
  updatedAt: string;
  shoppingList?: ShoppingList;
  category?: Category;
  assignedTo?: User;
  purchasedBy?: User;
  daysUntilReturn?: number;
  hasRecurred?: boolean;
}

export interface CreateShoppingItemRequest {
  name: string;
  quantity?: number;
  notes?: string;
  categoryId?: string;
  assignedToId?: string;
  isRecurring?: boolean;
  recurringInterval?: number;
  force?: boolean;
}

export interface UpdateShoppingItemRequest {
  name?: string;
  quantity?: number;
  notes?: string;
  categoryId?: string;
  assignedToId?: string;
  isRecurring?: boolean;
  recurringInterval?: number;
}

export interface BatchPurchaseRequest {
  itemIds: string[];
}

export interface ShoppingListFilters {
  categoryId?: string;
  assignedToId?: string;
  includePurchased?: boolean;
}