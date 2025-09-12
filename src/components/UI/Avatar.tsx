import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { useUserTheme } from "../../hooks/useUserTheme";

interface AvatarProps {
  imageUrl?: string;
  name: string;
  size?: "small" | "medium" | "large";
  color?: string;
  borderColor?: string;
  borderWidth?: number;
  style?: any;
}

const createDynamicStyles = (COLORS: any) =>
  StyleSheet.create({
    container: {
      justifyContent: "center",
      alignItems: "center",
      overflow: "hidden",
    },
    image: {
      width: "100%",
      height: "100%",
    },
    initials: {
      color: COLORS.TEXT_WHITE,
      fontWeight: "600",
    },
  });

export default function Avatar({
  imageUrl,
  name,
  size = "medium",
  color,
  borderColor,
  borderWidth = 2,
  style,
}: AvatarProps) {
  const { COLORS } = useUserTheme();
  const styles = createDynamicStyles(COLORS);
  const defaultColor = color || COLORS.DEFAULT_USER_COLOR;
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getSizeStyle = () => {
    switch (size) {
      case "small":
        return { width: 32, height: 32, borderRadius: 16 };
      case "large":
        return { width: 80, height: 80, borderRadius: 40 };
      default:
        return { width: 48, height: 48, borderRadius: 24 };
    }
  };

  const getTextSize = () => {
    switch (size) {
      case "small":
        return { fontSize: 12 };
      case "large":
        return { fontSize: 24 };
      default:
        return { fontSize: 16 };
    }
  };

  const getBorderStyle = () => {
    if (borderColor) {
      return {
        borderColor,
        borderWidth,
      };
    }
    return {};
  };

  return (
    <View
      style={[
        styles.container,
        getSizeStyle(),
        { backgroundColor: defaultColor },
        getBorderStyle(),
        style,
      ]}
    >
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={[styles.image, getSizeStyle()]}
          resizeMode="cover"
        />
      ) : (
        <Text style={[styles.initials, getTextSize()]}>
          {getInitials(name)}
        </Text>
      )}
    </View>
  );
}
