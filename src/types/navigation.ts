import { ShoppingItem } from './shopping';

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
};

export type MainTabParamList = {
  Home: undefined;
  ShareCost: { selectedItems?: string[] };
  Profile: undefined;
  HouseSettings: undefined;
};

export type ShareCostStackParamList = {
  ShareCostHome: { selectedItems?: string[] };
  ShoppingCostSplit: { items: ShoppingItem[] };
  ManualExpense: undefined;
  SplitPreview: {
    type: 'shopping' | 'manual';
    amount: number;
    description: string;
    items?: ShoppingItem[];
    splitBetween: string[];
  };
};