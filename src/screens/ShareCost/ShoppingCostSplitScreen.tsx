import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp, useFocusEffect } from "@react-navigation/native";

import { Button } from "../../components/UI";
import { COLORS, NAVIGATION_ROUTES } from "../../constants";
import { ShareCostStackParamList } from "../../types/navigation";
import { ShoppingItem } from "../../types/shopping";
import { shoppingService } from "../../services/shoppingService";
import { useHouse } from "../../context/HouseContext";
import { useShoppingSelection } from "../../context/ShoppingSelectionContext";

type ShoppingCostSplitScreenNavigationProp = StackNavigationProp<
  ShareCostStackParamList,
  "ShoppingCostSplit"
>;

type ShoppingCostSplitScreenRouteProp = RouteProp<
  ShareCostStackParamList,
  "ShoppingCostSplit"
>;

interface Props {
  navigation: ShoppingCostSplitScreenNavigationProp;
  route: ShoppingCostSplitScreenRouteProp;
}

interface SelectableItem extends ShoppingItem {
  isSelected: boolean;
}

export default function ShoppingCostSplitScreen({ navigation }: Props) {
  const [purchasedItems, setPurchasedItems] = useState<SelectableItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalAmount, setTotalAmount] = useState("");
  const { currentHouse } = useHouse();
  const { selectedShoppingItems, setSelectedShoppingItems, clearSelection } = useShoppingSelection();

  useFocusEffect(
    useCallback(() => {
      loadPurchasedItems();
    }, [currentHouse])
  );

  // Update item selection when the shared context changes
  React.useEffect(() => {
    if (purchasedItems.length > 0) {
      setPurchasedItems((items) =>
        items.map((item) => ({
          ...item,
          isSelected: selectedShoppingItems.includes(item.id),
        }))
      );
    }
  }, [selectedShoppingItems, purchasedItems.length]);

  const loadPurchasedItems = async () => {
    if (!currentHouse?.id) return;

    try {
      setLoading(true);
      const response = await shoppingService.getShoppingItemsByHouseId(
        currentHouse.id
      );

      // Get all active shopping items (not yet purchased)
      const activeItems = response
        .filter((item) => !item.purchasedAt)
        .map((item) => ({
          ...item,
          isSelected: selectedShoppingItems.includes(item.id),
        }));

      setPurchasedItems(activeItems);
    } catch (error) {
      console.error("Error loading shopping items:", error);
      Alert.alert("Error", "Failed to load shopping items. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleItemToggle = (itemId: string) => {
    setPurchasedItems((items) => {
      const updatedItems = items.map((item) =>
        item.id === itemId ? { ...item, isSelected: !item.isSelected } : item
      );
      
      // Update the shared context with new selection
      const newSelectedItems = updatedItems
        .filter((item) => item.isSelected)
        .map((item) => item.id);
      setSelectedShoppingItems(newSelectedItems);
      
      return updatedItems;
    });
  };

  const handleTotalAmountChange = (value: string) => {
    // Allow only numbers and decimal point
    const numericValue = value.replace(/[^0-9.]/g, "");
    setTotalAmount(numericValue);
  };

  const handleContinue = () => {
    const selectedItems = purchasedItems.filter((item) => item.isSelected);

    if (selectedItems.length === 0) {
      Alert.alert(
        "No Items Selected",
        "Please select at least one item to split the cost."
      );
      return;
    }

    const totalCost = parseFloat(totalAmount);
    if (totalCost <= 0) {
      Alert.alert("Invalid Total", "Total amount must be greater than 0.");
      return;
    }

    // Clear the selection from context since we're moving forward
    clearSelection();

    navigation.navigate(NAVIGATION_ROUTES.SPLIT_PREVIEW, {
      type: "shopping",
      amount: totalCost,
      description: `Shopping: ${selectedItems.length} items`,
      items: selectedItems,
      splitBetween: [], // Will be selected in preview screen
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
          <Text style={styles.loadingText}>Loading purchased items...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={100}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Split Shopping Receipt</Text>
          <Text style={styles.subtitle}>
            Select the items you purchased and enter the total receipt amount
          </Text>
        </View>

        {purchasedItems.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="bag-outline"
              size={64}
              color={COLORS.TEXT_SECONDARY}
            />
            <Text style={styles.emptyTitle}>No Shopping Items</Text>
            <Text style={styles.emptySubtitle}>
              Add items to your shopping list first, then come back to split the
              cost.
            </Text>
            <Button
              title="Go to Shopping List"
              onPress={() =>
                navigation.navigate(NAVIGATION_ROUTES.SHOPPING_LIST)
              }
              style={styles.emptyButton}
            />
          </View>
        ) : (
          <>
            <View style={styles.totalSection}>
              <Text style={styles.costLabel}>Total Receipt Amount</Text>
              <View style={styles.costInputContainer}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={styles.costInput}
                  value={totalAmount}
                  onChangeText={handleTotalAmountChange}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  returnKeyType="done"
                />
              </View>
            </View>

            <View style={styles.itemsSection}>
              <Text style={styles.sectionTitle}>Select Items from Receipt</Text>

              {purchasedItems.map((item) => (
                <View key={item.id} style={styles.itemContainer}>
                  <TouchableOpacity
                    style={styles.itemRow}
                    onPress={() => handleItemToggle(item.id)}
                  >
                    <View style={styles.checkbox}>
                      {item.isSelected ? (
                        <Ionicons
                          name="checkbox"
                          size={24}
                          color={COLORS.PRIMARY}
                        />
                      ) : (
                        <Ionicons
                          name="square-outline"
                          size={24}
                          color={COLORS.TEXT_SECONDARY}
                        />
                      )}
                    </View>

                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemDetails}>
                        Qty: {item.quantity}
                        {item.assignedTo &&
                          ` • Assigned to ${item.assignedTo.firstName}`}
                        {item.notes && ` • ${item.notes}`}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            <View style={styles.actions}>
              <Button
                title="Continue to Split"
                onPress={handleContinue}
                style={styles.continueButton}
                disabled={
                  purchasedItems.filter((item) => item.isSelected).length === 0 ||
                  !totalAmount ||
                  parseFloat(totalAmount) <= 0
                }
              />
            </View>
          </>
        )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 16,
  },
  header: {
    paddingVertical: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 22,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.TEXT_PRIMARY,
    textAlign: "center",
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 22,
  },
  emptyButton: {
    marginTop: 24,
    minWidth: 200,
  },
  itemsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 16,
  },
  itemContainer: {
    backgroundColor: COLORS.CARD_BACKGROUND,
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  checkbox: {
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.TEXT_PRIMARY,
  },
  itemDetails: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 4,
  },
  costInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.PRIMARY,
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.CARD_BACKGROUND,
    marginTop: 12,
  },
  costLabel: {
    fontSize: 18,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: "600",
    marginBottom: 8,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: "600",
    color: COLORS.TEXT_PRIMARY,
    marginRight: 8,
  },
  costInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: "600",
    color: COLORS.TEXT_PRIMARY,
    paddingVertical: 16,
  },
  totalSection: {
    backgroundColor: COLORS.CARD_BACKGROUND,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    marginTop: 8,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.TEXT_PRIMARY,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.PRIMARY,
  },
  actions: {
    paddingBottom: 24,
  },
  continueButton: {
    minHeight: 50,
  },
});
