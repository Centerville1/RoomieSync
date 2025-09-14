import { User } from './auth';

export interface Transaction {
  id: string;
  type: 'expense' | 'payment';
  date: string;
  description: string;
  amount: number;
  userShare?: number; // For expenses: amount requested of current user
  createdBy?: User; // For expenses: who created the expense
  splitBetween?: User[]; // For expenses: who the expense was split between
  category?: string; // For expenses: category name
  fromUser?: User; // For payments: who made the payment
  toUser?: User; // For payments: who received the payment
}

export interface TransactionResponse {
  transactions: Transaction[];
}

export interface TransactionFilters {
  userOnly?: boolean;
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  type?: 'expense' | 'payment';
}