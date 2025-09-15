import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StackNavigationProp } from "@react-navigation/stack";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import { ShoppingListManager } from "../../components/Shopping";
import { useHouse } from "../../context/HouseContext";
import { useShoppingSelection } from "../../context/ShoppingSelectionContext";
import { useUserTheme } from "../../hooks/useUserTheme";
import { ShareCostStackParamList } from "../../types/navigation";
import { ShoppingItem } from "../../types/shopping";
import { shoppingService } from "../../services/shoppingService";

type ShoppingListScreenNavigationProp = StackNavigationProp<
  ShareCostStackParamList,
  "ShoppingList"
>;

interface Props {
  navigation: ShoppingListScreenNavigationProp;
}

const createDynamicStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.BACKGROUND,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.BORDER_LIGHT,
    },
    backButton: {
      padding: 8,
      marginLeft: -8,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.TEXT_PRIMARY,
      flex: 1,
      textAlign: "center",
    },
    headerRight: {
      alignItems: "flex-end",
    },
    headerSpacer: {
      width: 40,
    },
    itemCount: {
      fontSize: 14,
      color: colors.TEXT_SECONDARY,
      fontWeight: "500",
      marginRight: 12,
    },
    selectedCount: {
      fontSize: 14,
      color: colors.PRIMARY,
      fontWeight: "600",
      marginRight: 12,
    },
    toggleButton: {
      padding: 4,
    },
    content: {
      flex: 1,
      paddingHorizontal: 16,
      paddingTop: 8,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 32,
    },
    loadingText: {
      fontSize: 16,
      color: colors.TEXT_SECONDARY,
      marginTop: 16,
    },
    errorContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 32,
    },
    errorTitle: {
      fontSize: 20,
      fontWeight: "600",
      color: colors.TEXT_PRIMARY,
      marginTop: 16,
      textAlign: "center",
    },
    errorSubtitle: {
      fontSize: 16,
      color: colors.TEXT_SECONDARY,
      marginTop: 8,
      textAlign: "center",
    },
    retryButton: {
      marginTop: 24,
      paddingHorizontal: 24,
      paddingVertical: 12,
      backgroundColor: colors.PRIMARY,
      borderRadius: 8,
    },
    retryButtonText: {
      color: colors.TEXT_WHITE,
      fontWeight: "600",
      fontSize: 16,
    },
    emptyState: {
      alignItems: "center",
      paddingVertical: 48,
      paddingHorizontal: 32,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: "600",
      color: colors.TEXT_PRIMARY,
      textAlign: "center",
      marginTop: 16,
    },
    emptySubtitle: {
      fontSize: 16,
      color: colors.TEXT_SECONDARY,
      textAlign: "center",
      marginTop: 8,
      lineHeight: 22,
    },
  });

export default function ShoppingListScreen({ navigation }: Props) {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // const [isSelectable, setIsSelectable] = useState(true);
  const { currentHouse } = useHouse();
  const { selectedShoppingItems, setSelectedShoppingItems } =
    useShoppingSelection();
  const { COLORS } = useUserTheme();
  const styles = createDynamicStyles(COLORS);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadItems();
    }, [currentHouse])
  );

  const loadItems = async () => {
    if (!currentHouse?.id) {
      setItems([]);
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const allItems = await shoppingService.getShoppingItemsByHouseId(
        currentHouse.id
      );
      const activeItems = allItems.filter((item) => !item.purchasedAt);
      setItems(activeItems);
    } catch (err) {
      console.error("Error loading shopping items:", err);
      setError("Failed to load shopping items. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadItems();
  };

  const handleItemsChange = (newItems: ShoppingItem[]) => {
    setItems(newItems);
    // Clear selection if items change
    const filteredSelection = selectedShoppingItems.filter((id) =>
      newItems.some((item) => item.id === id)
    );
    setSelectedShoppingItems(filteredSelection);
  };

  const handleSelectionChange = (newSelection: string[]) => {
    setSelectedShoppingItems(newSelection);
  };

  // const toggleSelectMode = () => {
  //   setIsSelectable(!isSelectable);
  //   if (isSelectable) {
  //     setSelectedShoppingItems([]);
  //   }
  // };

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: COLORS.BACKGROUND }]}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.TEXT_PRIMARY} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Shopping List</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
          <Text style={styles.loadingText}>Loading shopping list...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: COLORS.BACKGROUND }]}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.TEXT_PRIMARY} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Shopping List</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="warning-outline" size={48} color={COLORS.ERROR} />
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorSubtitle}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadItems}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: COLORS.BACKGROUND }]}
    >
      {items.length > 0 && (
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Shopping List</Text>
          <View style={styles.headerRight}>
            <Text style={styles.itemCount}>{items.length} items</Text>
          </View>
        </View>
      )}

      <View style={styles.content}>
        {items.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="bag-outline"
              size={64}
              color={COLORS.TEXT_SECONDARY}
            />
            <Text style={styles.emptyTitle}>Your shopping list is empty</Text>
            <Text style={styles.emptySubtitle}>
              Add items to your list to keep track of what you need to buy
            </Text>
          </View>
        ) : null}

        <ShoppingListManager
          items={items}
          onItemsChange={handleItemsChange}
          showQuantity={true}
          showAddForm={true}
          refreshing={refreshing}
          onRefresh={onRefresh}
          isSelectable={true}
          selectedItems={selectedShoppingItems}
          onSelectionChange={handleSelectionChange}
        />
      </View>
    </SafeAreaView>
  );
}
