export const APP_CONFIG = {
  NAME: 'RoomieSync',
  VERSION: '1.0.0',
  DESCRIPTION: 'Manage shared expenses and household tasks with your roommates',
} as const;

export const FEATURES = {
  REAL_TIME_UPDATES: true,
  PUSH_NOTIFICATIONS: true,
  IMAGE_UPLOAD: true,
  BIOMETRIC_AUTH: false, // For future implementation
} as const;

export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  DISPLAY_NAME_MIN_LENGTH: 2,
  DISPLAY_NAME_MAX_LENGTH: 30,
  HOUSE_NAME_MIN_LENGTH: 2,
  HOUSE_NAME_MAX_LENGTH: 50,
  EXPENSE_DESCRIPTION_MAX_LENGTH: 200,
  SHOPPING_ITEM_NAME_MAX_LENGTH: 100,
  NOTES_MAX_LENGTH: 500,
} as const;