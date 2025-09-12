import api from "./api";
import { Payment } from "../types/payments";
import { API_ENDPOINTS } from "../constants";

export const paymentService = {
  async getPaymentsByHouseId(houseId: string): Promise<Payment[]> {
    const response = await api.get<Payment[]>(
      API_ENDPOINTS.GET_PAYMENTS_BY_HOUSE_ID(houseId)
    );
    return response.data;
  },

  async createPayment(
    houseId: string,
    payment: Omit<Payment, "id" | "createdAt" | "updatedAt">
  ): Promise<Payment> {
    // Only send required fields to API
    const payload = {
      amount: payment.amount,
      toUserId: (payment as any).toUser?.id || (payment as any).toUserId,
      memo: payment.memo,
      paymentDate: payment.paymentDate,
    };
    const response = await api.post<Payment>(
      API_ENDPOINTS.POST_CREATE_PAYMENT(houseId),
      payload
    );
    return response.data;
  },
};
