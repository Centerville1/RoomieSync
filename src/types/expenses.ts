import { User } from './auth';
import { House } from './houses';

export interface Category {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  isActive: boolean;
  isDefault: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  house?: House;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  expenseDate: string;
  receiptUrl?: string;
  splitBetween: string[];
  createdAt: string;
  updatedAt: string;
  paidBy: User;
  house: House;
  category: Category;
}

export interface CreateExpenseRequest {
  description: string;
  amount: number;
  expenseDate: string;
  receiptUrl?: string;
  splitBetween: string[];
  categoryId: string;
}

export interface Balance {
  id: string;
  amount: number;
  createdAt: string;
  updatedAt: string;
  fromUser: User;
  toUser: User;
  house: House;
}

export interface UserBalance {
  id: string;
  amount: number;
  type: 'owes' | 'owed_by';
  updatedAt: string;
  otherUser: User;
}