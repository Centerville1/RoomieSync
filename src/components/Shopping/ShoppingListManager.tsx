import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  ShoppingItem,
  CreateShoppingItemRequest,
  UpdateShoppingItemRequest,
} from "../../types/shopping";
import { shoppingService } from "../../services/shoppingService";
import { useHouse } from "../../context/HouseContext";
import ShoppingListItem from "./ShoppingListItem";
import AddShoppingItemForm from "./AddShoppingItemForm";

interface Props {
  items?: ShoppingItem[];
  onItemsChange?: (items: ShoppingItem[]) => void;
  maxItemsToShow?: number;
  isEditable?: boolean;
  showAddForm?: boolean;
  showQuantity?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  isSelectable?: boolean;
  selectedItems?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
}

export default function ShoppingListManager({
  items: propItems,
  onItemsChange,
  maxItemsToShow,
  isEditable = true,
  showAddForm = true,
  showQuantity = true,
  refreshing = false,
  onRefresh,
  isSelectable = false,
  selectedItems = [],
  onSelectionChange,
}: Props) {
  const [items, setItems] = useState<ShoppingItem[]>(propItems || []);
  const { currentHouse } = useHouse();

  useEffect(() => {
    if (propItems) {
      setItems(propItems);
    }
  }, [propItems]);

  useEffect(() => {
    if (!propItems && currentHouse) {
      loadItems();
    }
  }, [currentHouse]);

  const loadItems = async () => {
    if (!currentHouse?.id) return;

    try {
      const allItems = await shoppingService.getShoppingItemsByHouseId(
        currentHouse.id
      );
      const activeItems = allItems.filter((item) => !item.purchasedAt);
      setItems(activeItems);
      onItemsChange?.(activeItems);
    } catch (error) {
      console.error("Error loading shopping items:", error);
      Alert.alert("Error", "Failed to load shopping items. Please try again.");
    }
  };

  const handleAddItem = async (itemData: CreateShoppingItemRequest) => {
    if (!currentHouse?.id) return;

    try {
      const itemToCreate = {
        ...itemData,
        quantity: itemData.quantity || 1,
        isRecurring: itemData.isRecurring || false,
      };
      const newItem = await shoppingService.createShoppingItem(
        currentHouse.id,
        itemToCreate
      );
      const updatedItems = [newItem, ...items];
      setItems(updatedItems);
      onItemsChange?.(updatedItems);
    } catch (error) {
      console.error("Error adding item:", error);
      throw error; // Re-throw to let the form handle the error
    }
  };

  const handleUpdateItem = async (
    itemId: string,
    updates: UpdateShoppingItemRequest
  ) => {
    if (!currentHouse?.id) return;

    try {
      const updatedItem = await shoppingService.updateShoppingItem(
        currentHouse.id,
        itemId,
        updates
      );
      const updatedItems = items.map((item) =>
        item.id === itemId ? updatedItem : item
      );
      setItems(updatedItems);
      onItemsChange?.(updatedItems);
    } catch (error) {
      console.error("Error updating item:", error);
      throw error;
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!currentHouse?.id) return;

    try {
      await shoppingService.deleteShoppingItem(currentHouse.id, itemId);
      const updatedItems = items.filter((item) => item.id !== itemId);
      setItems(updatedItems);
      onItemsChange?.(updatedItems);
    } catch (error) {
      console.error("Error deleting item:", error);
      Alert.alert("Error", "Failed to delete item. Please try again.");
    }
  };

  const handlePurchaseItem = async (itemId: string) => {
    if (!currentHouse?.id) return;

    try {
      await shoppingService.purchaseItem(currentHouse.id, itemId);
      const updatedItems = items.filter((item) => item.id !== itemId);
      setItems(updatedItems);
      onItemsChange?.(updatedItems);

      Alert.alert("Success", "Item marked as purchased!");
    } catch (error) {
      console.error("Error purchasing item:", error);
      Alert.alert(
        "Error",
        "Failed to mark item as purchased. Please try again."
      );
    }
  };

  const handleRefresh = useCallback(() => {
    if (onRefresh) {
      onRefresh();
    } else {
      loadItems();
    }
  }, [onRefresh]);

  const handleToggleSelect = (itemId: string) => {
    const newSelection = selectedItems.includes(itemId)
      ? selectedItems.filter((id) => id !== itemId)
      : [...selectedItems, itemId];

    onSelectionChange?.(newSelection);
  };

  const displayItems = maxItemsToShow ? items.slice(0, maxItemsToShow) : items;

  const content = (
    <View style={styles.container}>
      {showAddForm && isEditable && (
        <AddShoppingItemForm
          onAdd={handleAddItem}
          placeholder="Add item to shopping list..."
        />
      )}

      {displayItems.map((item) => (
        <ShoppingListItem
          key={item.id}
          item={item}
          onUpdate={handleUpdateItem}
          onDelete={handleDeleteItem}
          onPurchase={handlePurchaseItem}
          isEditable={isEditable}
          showQuantity={showQuantity}
          isSelectable={isSelectable}
          isSelected={selectedItems.includes(item.id)}
          onToggleSelect={handleToggleSelect}
        />
      ))}
    </View>
  );

  if (onRefresh) {
    return (
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {content}
      </ScrollView>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
});
