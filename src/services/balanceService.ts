import api from './api';
import { Balance } from '../types/expenses';
import { API_ENDPOINTS } from '../constants';

export const balanceService = {
  async getBalancesByHouseId(houseId: string): Promise<Balance[]> {
    const response = await api.get<Balance[]>(API_ENDPOINTS.GET_BALANCES_BY_HOUSE_ID(houseId));
    return response.data;
  },
};