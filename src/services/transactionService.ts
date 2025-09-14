import api from './api';
import { TransactionResponse, TransactionFilters } from '../types/transactions';
import { API_ENDPOINTS } from '../constants';

export const transactionService = {
  async getTransactionsByHouseId(
    houseId: string,
    filters?: TransactionFilters
  ): Promise<TransactionResponse> {
    const params = new URLSearchParams();

    if (filters?.userOnly) {
      params.append('userOnly', 'true');
    }
    if (filters?.startDate) {
      params.append('startDate', filters.startDate);
    }
    if (filters?.endDate) {
      params.append('endDate', filters.endDate);
    }
    if (filters?.type) {
      params.append('type', filters.type);
    }

    const url = `${API_ENDPOINTS.GET_TRANSACTIONS_BY_HOUSE_ID(houseId)}${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await api.get<TransactionResponse>(url);
    return response.data;
  },

  // Helper method for pagination - get transactions before a specific date
  async getTransactionsBeforeDate(
    houseId: string,
    beforeDate: string,
    filters?: Omit<TransactionFilters, 'endDate'>
  ): Promise<TransactionResponse> {
    return this.getTransactionsByHouseId(houseId, {
      ...filters,
      endDate: beforeDate
    });
  },

  // Helper method for user-specific transaction history
  async getUserTransactionHistory(
    houseId: string,
    filters?: Omit<TransactionFilters, 'userOnly'>
  ): Promise<TransactionResponse> {
    return this.getTransactionsByHouseId(houseId, {
      ...filters,
      userOnly: true
    });
  }
};