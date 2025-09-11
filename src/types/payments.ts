import { User } from './auth';
import { House } from './houses';

export interface Payment {
  id: string;
  amount: number;
  memo?: string;
  paymentDate: string;
  createdAt: string;
  updatedAt: string;
  fromUser: User;
  toUser: User;
  house: House;
}

export interface CreatePaymentRequest {
  amount: number;
  toUserId: string;
  memo?: string;
  paymentDate: string;
}