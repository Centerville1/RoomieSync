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
  console.log("In userTheme hook");
  const { user } = useAuth();
  const { colors, isDarkMode, themeMode, toggleTheme } = useTheme();

  const primaryColor = getUserPrimaryColor(user?.color, colors.PRIMARY);
  const contrastingTextColor = getContrastingTextColor(primaryColor);

  const returnValue = {
    primaryColor,
    contrastingTextColor,
    COLORS: colors,
    isDarkMode,
    themeMode,
    toggleTheme,
    user,
  };
  console.log("useUserTheme return value:", returnValue);
  return returnValue;
}
