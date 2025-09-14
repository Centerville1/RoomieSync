import api from "./api";
import { Payment } from "../types/payments";
import { TransactionResponse } from "../types/transactions";
import { API_ENDPOINTS } from "../constants";

export const paymentService = {
  async getPaymentsByHouseId(houseId: string): Promise<Payment[]> {
    // Use the new transactions endpoint and filter for payments only
    const response = await api.get<TransactionResponse>(
      `${API_ENDPOINTS.GET_TRANSACTIONS_BY_HOUSE_ID(houseId)}?type=payment`
    );

    // Transform transactions to Payment objects
    return response.data.transactions.map(transaction => ({
      id: transaction.id,
      amount: transaction.amount,
      memo: transaction.description === 'Payment to ' + transaction.toUser?.displayName ? undefined : transaction.description,
      paymentDate: transaction.date,
      createdAt: transaction.date, // Using date as createdAt fallback
      updatedAt: transaction.date, // Using date as updatedAt fallback
      fromUser: transaction.fromUser!,
      toUser: transaction.toUser!,
      house: {} as any // House object not included in transaction response
    }));
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
