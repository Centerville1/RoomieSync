import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useUserTheme } from "../hooks/useUserTheme";
import { Category } from "../types/expenses";

interface CategoryChipProps {
  category: Category;
  onPress?: () => void;
  size?: "small" | "medium" | "large";
  showDescription?: boolean;
  disabled?: boolean;
}

const createDynamicStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "flex-start",
    },
    chip: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: 20,
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor: "transparent",
    },
    chipSmall: {
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderRadius: 16,
    },
    chipLarge: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 24,
    },
    chipPressed: {
      opacity: 0.8,
    },
    colorDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginRight: 8,
    },
    colorDotSmall: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: 6,
    },
    colorDotLarge: {
      width: 16,
      height: 16,
      borderRadius: 8,
      marginRight: 10,
    },
    icon: {
      marginRight: 6,
    },
    iconSmall: {
      marginRight: 4,
    },
    iconLarge: {
      marginRight: 8,
    },
    text: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.TEXT_PRIMARY,
    },
    textSmall: {
      fontSize: 12,
      fontWeight: "500",
    },
    textLarge: {
      fontSize: 16,
      fontWeight: "600",
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    modalContent: {
      backgroundColor: colors.CARD_BACKGROUND,
      borderRadius: 16,
      padding: 24,
      margin: 32,
      maxWidth: 320,
      width: "100%",
    },
    modalHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
    },
    modalColorDot: {
      width: 24,
      height: 24,
      borderRadius: 12,
      marginRight: 12,
    },
    modalIcon: {
      marginRight: 8,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.TEXT_PRIMARY,
      flex: 1,
    },
    modalDescription: {
      fontSize: 16,
      color: colors.TEXT_SECONDARY,
      lineHeight: 22,
      marginBottom: 20,
    },
    modalCloseButton: {
      backgroundColor: colors.PRIMARY,
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 24,
      alignItems: "center",
    },
    modalCloseText: {
      color: colors.TEXT_WHITE,
      fontSize: 16,
      fontWeight: "600",
    },
  });

export default function CategoryChip({
  category,
  onPress,
  size = "medium",
  showDescription = true,
  disabled = false,
}: CategoryChipProps) {
  const { COLORS } = useUserTheme();
  const styles = createDynamicStyles(COLORS);
  const [modalVisible, setModalVisible] = useState(false);

  const handlePress = () => {
    if (disabled) return;

    if (onPress) {
      onPress();
    } else if (showDescription && category.description) {
      setModalVisible(true);
    }
  };

  const getIconSize = () => {
    switch (size) {
      case "small":
        return 12;
      case "large":
        return 18;
      default:
        return 14;
    }
  };

  const getIconName = (iconId?: string): keyof typeof Ionicons.glyphMap => {
    if (!iconId) return "pricetag-outline";

    // Map common icon names to Ionicons
    const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
      "shopping-cart": "basket-outline",
      "lightbulb": "bulb-outline",
      "movie": "film-outline",
      "car": "car-outline",
      "home": "home-outline",
      "restaurant": "restaurant-outline",
      "medical": "medical-outline",
      "fitness": "fitness-outline",
      "airplane": "airplane-outline",
      "gift": "gift-outline",
      "phone": "call-outline",
      "wifi": "wifi-outline",
      "game": "game-controller-outline",
      "music": "musical-notes-outline",
      "book": "book-outline",
      "pet": "paw-outline",
      "garden": "leaf-outline",
      "tool": "hammer-outline",
      "cleaning": "sparkles-outline",
    };

    return iconMap[iconId] || "pricetag-outline";
  };

  const chipStyle = [
    styles.chip,
    size === "small" && styles.chipSmall,
    size === "large" && styles.chipLarge,
    { backgroundColor: COLORS.BACKGROUND_LIGHT },
  ];

  const colorDotStyle = [
    styles.colorDot,
    size === "small" && styles.colorDotSmall,
    size === "large" && styles.colorDotLarge,
    { backgroundColor: category.color },
  ];

  const iconStyle = [
    styles.icon,
    size === "small" && styles.iconSmall,
    size === "large" && styles.iconLarge,
  ];

  const textStyle = [
    styles.text,
    size === "small" && styles.textSmall,
    size === "large" && styles.textLarge,
  ];

  const isClickable = !disabled && (onPress || (showDescription && category.description));

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={chipStyle}
        onPress={handlePress}
        disabled={!isClickable}
        activeOpacity={isClickable ? 0.7 : 1}
      >
        <View style={colorDotStyle} />
        {category.icon && (
          <Ionicons
            name={getIconName(category.icon)}
            size={getIconSize()}
            color={COLORS.TEXT_SECONDARY}
            style={iconStyle}
          />
        )}
        <Text style={textStyle}>{category.name}</Text>
      </TouchableOpacity>

      {/* Description Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalContent}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <View style={styles.modalColorDot} backgroundColor={category.color} />
              {category.icon && (
                <Ionicons
                  name={getIconName(category.icon)}
                  size={20}
                  color={COLORS.TEXT_SECONDARY}
                  style={styles.modalIcon}
                />
              )}
              <Text style={styles.modalTitle}>{category.name}</Text>
            </View>

            {category.description && (
              <ScrollView style={{ maxHeight: 200 }}>
                <Text style={styles.modalDescription}>{category.description}</Text>
              </ScrollView>
            )}

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}