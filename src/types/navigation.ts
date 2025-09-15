import { ShoppingItem } from "./shopping";

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Login: undefined;
  Register: undefined;
  JoinHouse: { inviteCode?: string };
  CreateHouse: undefined;
  HouseSelection: undefined;
  MultiHouseSelection: undefined;
  HouseSettings: undefined;
  EditProfile: undefined;
  TransactionHistory: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  ShareCost:
    | { selectedItems?: string[] }
    | { screen: keyof ShareCostStackParamList; params?: any };
  Profile: undefined;
  HouseSettings: undefined;
};

export type ShareCostStackParamList = {
  ShareCostHome: { selectedItems?: string[] };
  ShoppingCostSplit: { items: ShoppingItem[] };
  ManualExpense: undefined;
  SplitPreview: {
    type: "shopping" | "manual";
    amount: number;
    description: string;
    items?: ShoppingItem[];
    splitBetween: string[];
    categoryId?: string;
  };
  ShoppingList: undefined;
  BatchPurchase: { selectedItems?: string[] };
  Payment: { userId?: string };
};
