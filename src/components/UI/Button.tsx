import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useUserTheme } from "../../hooks/useUserTheme";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "danger";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  loading?: boolean;
  style?: any;
}

const createDynamicStyles = (colors: any) =>
  StyleSheet.create({
    button: {
      borderRadius: 8,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
    },

    // Sizes
    small: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      minHeight: 32,
    },
    medium: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      minHeight: 44,
    },
    large: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      minHeight: 52,
    },

    // Variants
    primary: {
      backgroundColor: colors.PRIMARY,
      borderColor: colors.PRIMARY,
    },
    secondary: {
      backgroundColor: colors.SECONDARY,
      borderColor: colors.SECONDARY,
    },
    outline: {
      backgroundColor: "transparent",
      borderColor: colors.PRIMARY,
    },
    danger: {
      backgroundColor: colors.ERROR,
      borderColor: colors.ERROR,
    },
    disabled: {
      backgroundColor: colors.TEXT_LIGHT,
      borderColor: colors.TEXT_LIGHT,
    },

    // Text styles
    text: {
      fontWeight: "600",
      textAlign: "center",
    },
    smallText: {
      fontSize: 14,
    },
    mediumText: {
      fontSize: 16,
    },
    largeText: {
      fontSize: 18,
    },
    primaryText: {
      color: colors.TEXT_WHITE,
    },
    outlineText: {
      color: colors.PRIMARY,
    },
  });

export default function Button({
  title,
  onPress,
  variant = "primary",
  size = "medium",
  disabled = false,
  loading = false,
  style,
}: ButtonProps) {
  const { primaryColor, contrastingTextColor, COLORS } = useUserTheme();
  const styles = createDynamicStyles(COLORS);

  const getButtonStyle = () => {
    const baseStyle = [styles.button, styles[size] as any];

    if (disabled || loading) {
      baseStyle.push(styles.disabled);
    } else if (variant === "primary") {
      baseStyle.push({
        backgroundColor: primaryColor,
        borderColor: primaryColor,
      });
    } else if (variant === "outline") {
      baseStyle.push({
        backgroundColor: "transparent",
        borderColor: primaryColor,
      });
    } else {
      baseStyle.push(styles[variant] as any);
    }

    return baseStyle;
  };

  const getTextStyle = () => {
    const baseStyle = [
      styles.text,
      styles[`${size}Text` as keyof typeof styles] as any,
    ];

    if (variant === "outline") {
      baseStyle.push({ color: primaryColor });
    } else if (variant === "primary") {
      baseStyle.push({ color: contrastingTextColor });
    } else {
      baseStyle.push(styles.primaryText);
    }

    return baseStyle;
  };

  return (
    <TouchableOpacity
      style={[...getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          color={
            variant === "outline"
              ? primaryColor
              : variant === "primary"
              ? contrastingTextColor
              : COLORS.TEXT_WHITE
          }
        />
      ) : (
        <Text style={getTextStyle()}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}
