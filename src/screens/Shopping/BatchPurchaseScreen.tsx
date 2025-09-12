import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import { ShoppingListManager } from "../../components/Shopping";
import { Button } from "../../components/UI";
import { useHouse } from "../../context/HouseContext";
import { useAuth } from "../../context/AuthContext";
import { COLORS, NAVIGATION_ROUTES } from "../../constants";
import { ShareCostStackParamList } from "../../types/navigation";
import { ShoppingItem } from "../../types/shopping";
import { shoppingService } from "../../services/shoppingService";

type BatchPurchaseScreenNavigationProp = StackNavigationProp<
  ShareCostStackParamList,
  "BatchPurchase"
>;

type BatchPurchaseScreenRouteProp = RouteProp<
  ShareCostStackParamList,
  "BatchPurchase"
>;

interface Props {
  navigation: BatchPurchaseScreenNavigationProp;
  route: BatchPurchaseScreenRouteProp;
}

export default function BatchPurchaseScreen({ navigation, route }: Props) {
  const { user } = useAuth();
  const { currentHouse } = useHouse();
  const [allItems, setAllItems] = useState<ShoppingItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>(
    route.params?.selectedItems || []
  );
  const [totalCost, setTotalCost] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadShoppingItems();
  }, [currentHouse]);

  const loadShoppingItems = async () => {
    if (!currentHouse?.id) return;

    try {
      setLoading(true);
      const items = await shoppingService.getShoppingItemsByHouseId(
        currentHouse.id
      );
      const activeItems = items.filter((item) => !item.purchasedAt);
      setAllItems(activeItems);
    } catch (error) {
      console.error("Error loading shopping items:", error);
      Alert.alert("Error", "Failed to load shopping items. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectionChange = (newSelection: string[]) => {
    setSelectedItems(newSelection);
  };

  const handleContinueToSplit = () => {
    if (selectedItems.length === 0) {
      Alert.alert(
        "No Items Selected",
        "Please select at least one item to purchase."
      );
      return;
    }

    const cost = parseFloat(totalCost);
    if (!totalCost || cost <= 0) {
      Alert.alert("Invalid Cost", "Please enter a valid total cost.");
      return;
    }

    const selectedItemsData = allItems.filter((item) =>
      selectedItems.includes(item.id)
    );

    navigation.navigate(NAVIGATION_ROUTES.SPLIT_PREVIEW, {
      type: "shopping",
      amount: cost,
      description: `Shopping: ${selectedItems.length} items`,
      items: selectedItemsData,
      splitBetween: [], // Will be selected in preview screen
    });
  };

  const formatCurrency = (value: string) => {
    // Remove any non-numeric characters except decimal point
    const numericValue = value.replace(/[^0-9.]/g, "");

    // Ensure only one decimal point
    const parts = numericValue.split(".");
    if (parts.length > 2) {
      return parts[0] + "." + parts.slice(1).join("");
    }

    return numericValue;
  };

  const handleCostChange = (value: string) => {
    const formattedValue = formatCurrency(value);
    setTotalCost(formattedValue);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.TEXT_PRIMARY} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Purchase Items</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading items...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Debug: Show what we have
  console.log('BatchPurchaseScreen render:', {
    loading,
    allItemsCount: allItems.length,
    selectedItemsCount: selectedItems.length,
    currentHouseId: currentHouse?.id,
    routeParams: route.params
  });

  // Temporary: Simple test render to debug white screen
  if (allItems.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.TEXT_PRIMARY} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Purchase Items</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>
            No items found. House ID: {currentHouse?.id || 'None'}
          </Text>
          <Text style={styles.loadingText}>
            Loading: {loading.toString()}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Purchase Items</Text>
        <View style={styles.headerRight}>
          <Text style={styles.selectedCount}>
            {selectedItems.length} selected
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.instructionsSection}>
          <Text style={styles.instructionsTitle}>Select Items to Purchase</Text>
          <Text style={styles.instructionsText}>
            Choose the items you're buying, then enter the total cost to split
            with your roommates.
          </Text>
        </View>

        <View style={styles.costSection}>
          <Text style={styles.costLabel}>Total Cost</Text>
          <View style={styles.costInputContainer}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={styles.costInput}
              value={totalCost}
              onChangeText={handleCostChange}
              placeholder="0.00"
              keyboardType="decimal-pad"
              returnKeyType="done"
            />
          </View>
        </View>

        <View style={styles.itemsSection}>
          <Text style={styles.sectionTitle}>Shopping List</Text>

          <ShoppingListManager
            items={allItems}
            isSelectable={true}
            selectedItems={selectedItems}
            onSelectionChange={handleSelectionChange}
            showAddForm={false}
            isEditable={false}
            showQuantity={true}
          />
        </View>
      </ScrollView>

      <View style={styles.bottomSection}>
        <Button
          title="Continue to Split Cost"
          onPress={handleContinueToSplit}
          style={styles.continueButton}
          disabled={selectedItems.length === 0 || !totalCost}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER_LIGHT,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.TEXT_PRIMARY,
    flex: 1,
    textAlign: "center",
  },
  headerRight: {
    alignItems: "flex-end",
  },
  headerSpacer: {
    width: 40,
  },
  selectedCount: {
    fontSize: 14,
    color: COLORS.PRIMARY,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
  },
  instructionsSection: {
    paddingVertical: 20,
  },
  instructionsTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 22,
  },
  costSection: {
    backgroundColor: COLORS.CARD_BACKGROUND,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  costLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 12,
  },
  costInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.PRIMARY,
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.BACKGROUND,
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.TEXT_PRIMARY,
    marginRight: 8,
  },
  costInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.TEXT_PRIMARY,
    paddingVertical: 16,
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
  bottomSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER_LIGHT,
    backgroundColor: COLORS.CARD_BACKGROUND,
  },
  continueButton: {
    minHeight: 50,
  },
});
