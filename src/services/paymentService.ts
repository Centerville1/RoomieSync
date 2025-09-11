import api from './api';
import { Payment } from '../types/payments';
import { API_ENDPOINTS } from '../constants';

export const paymentService = {
  async getPaymentsByHouseId(houseId: string): Promise<Payment[]> {
    const response = await api.get<Payment[]>(API_ENDPOINTS.GET_PAYMENTS_BY_HOUSE_ID(houseId));
    return response.data;
  },

  async createPayment(houseId: string, payment: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Payment> {
    const response = await api.post<Payment>(API_ENDPOINTS.POST_CREATE_PAYMENT(houseId), payment);
    return response.data;
  },
};