export type ColorPalette = {
  PRIMARY: string;
  SECONDARY: string;
  SUCCESS: string;
  WARNING: string;
  ERROR: string;
  BALANCE_HEADER: string;
  SHOPPING_HEADER: string;
  ACTIVITY_HEADER: string;
  BACKGROUND: string;
  BACKGROUND_LIGHT: string;
  CARD_BACKGROUND: string;
  OVERLAY: string;
  TEXT_PRIMARY: string;
  TEXT_SECONDARY: string;
  TEXT_LIGHT: string;
  TEXT_WHITE: string;
  TEXT_INACTIVE: string;
  BORDER: string;
  BORDER_LIGHT: string;
  BORDER_MEDIUM: string;
  DEFAULT_USER_COLOR: string;
  DEFAULT_HOUSE_COLOR: string;
};
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
