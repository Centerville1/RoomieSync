export const NAVIGATION_ROUTES = {
  // Root stack routes
  AUTH: 'Auth',
  MAIN: 'Main',
  LOGIN: 'Login',
  REGISTER: 'Register',
  JOIN_HOUSE: 'JoinHouse',
  CREATE_HOUSE: 'CreateHouse',
  HOUSE_SELECTION: 'HouseSelection',
  
  // Main tab routes
  HOME: 'Home',
  SHARE_COST: 'ShareCost',
  PROFILE: 'Profile',
  HOUSE_SETTINGS: 'HouseSettings',
  
  // Share cost stack routes
  SHARE_COST_HOME: 'ShareCostHome',
  SHOPPING_COST_SPLIT: 'ShoppingCostSplit',
  MANUAL_EXPENSE: 'ManualExpense',
  SPLIT_PREVIEW: 'SplitPreview',
} as const;

export const TAB_BAR_CONFIG = {
  ACTIVE_TINT_COLOR: '#FF6B35',
  INACTIVE_TINT_COLOR: '#6B7280',
  BACKGROUND_COLOR: '#FFFFFF',
  BORDER_COLOR: '#E5E7EB',
} as const;