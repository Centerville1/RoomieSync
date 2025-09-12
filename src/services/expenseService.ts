import api from './api';
import { Expense, CreateExpenseRequest } from '../types/expenses';
import { API_ENDPOINTS } from '../constants';

export const expenseService = {
  async getExpensesByHouseId(houseId: string): Promise<Expense[]> {
    const response = await api.get<Expense[]>(API_ENDPOINTS.GET_EXPENSES_BY_HOUSE_ID(houseId));
    return response.data;
  },

  async createExpense(houseId: string, expense: CreateExpenseRequest): Promise<Expense> {
    const response = await api.post<Expense>(API_ENDPOINTS.POST_CREATE_EXPENSE(houseId), expense);
    return response.data;
  },

  async getExpenseById(houseId: string, expenseId: string): Promise<Expense> {
    const response = await api.get<Expense>(API_ENDPOINTS.GET_EXPENSE_BY_ID(houseId, expenseId));
    return response.data;
  },
};