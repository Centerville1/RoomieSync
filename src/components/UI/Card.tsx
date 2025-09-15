import React from "react";
import { View, Text, StyleSheet } from "react-native";
import type { CardProps } from "../../types/ui";
import { getContrastingTextColor } from "../../utils/colorUtils";
import { useUserTheme } from "../../hooks/useUserTheme";

export default function Card({
  title,
  headerColor,
  children,
  style,
  headerRight,
}: CardProps) {
  const { COLORS } = useUserTheme();

  // Determine text color based on background contrast
  const textColor = headerColor
    ? getContrastingTextColor(headerColor)
    : COLORS.TEXT_PRIMARY;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: COLORS.CARD_BACKGROUND },
        style,
      ]}
    >
      <View style={[styles.header, { backgroundColor: headerColor }]}>
        <Text style={[styles.title, { color: textColor }]}>{title}</Text>
        {headerRight ? <View>{headerRight}</View> : null}
      </View>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
  },
  content: {
    padding: 16,
  },
});
