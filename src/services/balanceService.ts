import api from './api';
import { Balance, UserBalance } from '../types/expenses';
import { API_ENDPOINTS } from '../constants';

export const balanceService = {
  async getBalancesByHouseId(houseId: string): Promise<Balance[]> {
    const response = await api.get<Balance[]>(API_ENDPOINTS.GET_BALANCES_BY_HOUSE_ID(houseId));
    return response.data;
  },

  async getUserBalancesByHouseId(houseId: string): Promise<UserBalance[]> {
    const response = await api.get<UserBalance[]>(API_ENDPOINTS.GET_USER_BALANCES_BY_HOUSE_ID(houseId));
    return response.data;
  },
};