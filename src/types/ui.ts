import React from "react";
import { Balance } from "./expenses";
import { ShoppingItem } from "./shopping";

export interface CardProps {
  title: string;
  headerColor: string;
  children: React.ReactNode;
  style?: any;
  headerRight?: React.ReactNode;
}

export interface BalanceItemProps {
  balance: Balance;
  currentUserId: string;
  onPayPress: (toUserId: string, amount: number) => void;
}

export interface ShoppingItemProps {
  item: ShoppingItem;
  onToggleSelect?: (itemId: string) => void;
  onPurchase?: (itemId: string) => void;
  onEdit?: (item: ShoppingItem) => void;
  onDelete?: (itemId: string) => void;
  isSelected?: boolean;
  showActions?: boolean;
}

export interface ApiError {
  statusCode: number;
  message: string | string[];
  error: string;
  warnings?: string[];
  suggestion?: string;
}
