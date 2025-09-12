export const NAVIGATION_ROUTES = {
  // Root stack routes
  AUTH: "Auth",
  MAIN: "Main",
  LOGIN: "Login",
  REGISTER: "Register",
  JOIN_HOUSE: "JoinHouse",
  CREATE_HOUSE: "CreateHouse",
  HOUSE_SELECTION: "HouseSelection",
  MULTI_HOUSE_SELECTION: "MultiHouseSelection",

  // Main tab routes
  HOME: "Home",
  SHARE_COST: "ShareCost",
  PROFILE: "Profile",
  HOUSE_SETTINGS: "HouseSettings",
  EDIT_PROFILE: "EditProfile",

  // Shopping routes
  SHOPPING_LIST: "ShoppingList",

  // Share cost stack routes
  SHARE_COST_HOME: "ShareCostHome",
  SHOPPING_COST_SPLIT: "ShoppingCostSplit",
  MANUAL_EXPENSE: "ManualExpense",
  SPLIT_PREVIEW: "SplitPreview",
  PAYMENT: "Payment",
} as const;
