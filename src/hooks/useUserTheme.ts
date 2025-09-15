import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import {
  getUserPrimaryColor,
  getContrastingTextColor,
} from "../utils/colorUtils";

/**
 * Custom hook to get user-themed colors
 * This replaces COLORS.PRIMARY with the user's chosen color throughout the app
 * and provides theme-aware colors
 */
export function useUserTheme() {
  const { user } = useAuth();
  const { colors, isDarkMode, themeMode, toggleTheme } = useTheme();

  const primaryColor = getUserPrimaryColor(user?.color, colors.PRIMARY);
  const contrastingTextColor = getContrastingTextColor(primaryColor);

  return {
    primaryColor,
    contrastingTextColor,
    COLORS: colors,
    isDarkMode,
    themeMode,
    toggleTheme,
    user,
  };
}
