import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useUserTheme } from "../../hooks/useUserTheme";
import { ShoppingItem, UpdateShoppingItemRequest } from "../../types/shopping";

interface Props {
  item: ShoppingItem;
  onUpdate: (
    itemId: string,
    updates: UpdateShoppingItemRequest
  ) => Promise<void>;
  onDelete: (itemId: string) => Promise<void>;
  onPurchase: (itemId: string) => Promise<void>;
  isEditable?: boolean;
  showQuantity?: boolean;
  isSelectable?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (itemId: string) => void;
}

const createDynamicStyles = (COLORS: any) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: 4,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.BORDER_LIGHT,
    },
    purchaseButton: {
      marginRight: 12,
      padding: 4,
    },
    selectButton: {
      marginRight: 12,
      padding: 4,
    },
    itemContent: {
      flex: 1,
    },
    itemHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
    },
    itemTitleRow: {
      flex: 1,
      marginRight: 8,
    },
    itemName: {
      fontSize: 16,
      color: COLORS.TEXT_PRIMARY,
      fontWeight: "500",
      marginBottom: 4,
    },
    recurringBadge: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 12,
      gap: 4,
      marginTop: 2,
    },
    recurringText: {
      fontSize: 10,
      fontWeight: "600",
    },
    assignedTo: {
      fontSize: 12,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 8,
    },
    itemDetails: {
      marginTop: 4,
    },
    itemQuantity: {
      fontSize: 14,
      color: COLORS.TEXT_SECONDARY,
    },
    itemNotes: {
      fontSize: 14,
      color: COLORS.TEXT_SECONDARY,
      fontStyle: "italic",
      marginTop: 2,
    },
    actions: {
      flexDirection: "row",
      alignItems: "center",
      marginLeft: 12,
    },
    editButton: {
      padding: 6,
      marginRight: 4,
    },
    deleteButton: {
      padding: 6,
    },
    editContainer: {
      paddingVertical: 12,
      paddingHorizontal: 4,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.BORDER_LIGHT,
      backgroundColor: COLORS.BACKGROUND + "80",
    },
    editRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
    editInput: {
      borderWidth: 1,
      borderColor: COLORS.BORDER,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: COLORS.CARD_BACKGROUND,
      fontSize: 16,
      color: COLORS.TEXT_PRIMARY,
    },
    nameInput: {
      flex: 1,
      marginRight: 8,
    },
    quantityInput: {
      width: 60,
    },
    notesInput: {
      marginBottom: 8,
      minHeight: 36,
    },
    editActions: {
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: 8,
    },
    actionButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 6,
      gap: 4,
    },
    cancelButton: {
      backgroundColor: COLORS.BACKGROUND,
      borderWidth: 1,
      borderColor: COLORS.BORDER,
    },
    cancelText: {
      fontSize: 14,
      color: COLORS.TEXT_SECONDARY,
      fontWeight: "500",
    },
    saveText: {
      fontSize: 14,
      color: COLORS.TEXT_WHITE,
      fontWeight: "500",
    },
    editRecurringSection: {
      marginBottom: 8,
    },
    editRecurringToggle: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 6,
    },
    editCheckbox: {
      marginRight: 6,
    },
    editRecurringLabel: {
      fontSize: 12,
      color: COLORS.TEXT_PRIMARY,
      fontWeight: "500",
    },
    editIntervalContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginLeft: 22,
      gap: 6,
    },
    editIntervalLabel: {
      fontSize: 12,
      color: COLORS.TEXT_SECONDARY,
    },
    editIntervalInput: {
      width: 50,
      height: 32,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    editIntervalUnit: {
      fontSize: 12,
      color: COLORS.TEXT_SECONDARY,
    },
  });

export default function ShoppingListItem({
  item,
  onUpdate,
  onDelete,
  onPurchase,
  isEditable = true,
  showQuantity = true,
  isSelectable = false,
  isSelected = false,
  onToggleSelect,
}: Props) {
  const { primaryColor, COLORS } = useUserTheme();
  const styles = createDynamicStyles(COLORS);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(item.name);
  const [editedQuantity, setEditedQuantity] = useState(
    item.quantity.toString()
  );
  const [editedNotes, setEditedNotes] = useState(item.notes || "");
  const [editedIsRecurring, setEditedIsRecurring] = useState(item.isRecurring);
  const [editedRecurringInterval, setEditedRecurringInterval] = useState(
    (item.recurringInterval || 7).toString()
  );
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!editedName.trim()) {
      Alert.alert("Error", "Item name cannot be empty");
      return;
    }

    const quantity = parseInt(editedQuantity) || 1;
    if (quantity < 1) {
      Alert.alert("Error", "Quantity must be at least 1");
      return;
    }

    try {
      setLoading(true);
      await onUpdate(item.id, {
        name: editedName.trim(),
        quantity,
        notes: editedNotes.trim() || undefined,
        isRecurring: editedIsRecurring,
        recurringInterval: editedIsRecurring
          ? parseInt(editedRecurringInterval) || 7
          : undefined,
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating item:", error);
      Alert.alert("Error", "Failed to update item. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditedName(item.name);
    setEditedQuantity(item.quantity.toString());
    setEditedNotes(item.notes || "");
    setEditedIsRecurring(item.isRecurring);
    setEditedRecurringInterval((item.recurringInterval || 7).toString());
    setIsEditing(false);
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Item",
      `Are you sure you want to delete "${item.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => onDelete(item.id),
        },
      ]
    );
  };

  const handlePurchase = () => {
    Alert.alert("Mark as Purchased", `Mark "${item.name}" as purchased?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Purchase",
        onPress: () => onPurchase(item.id),
      },
    ]);
  };

  if (isEditing && isEditable) {
    return (
      <View style={styles.editContainer}>
        <View style={styles.editRow}>
          <TextInput
            style={[styles.editInput, styles.nameInput]}
            value={editedName}
            onChangeText={setEditedName}
            placeholder="Item name"
            autoFocus
          />
          {showQuantity && (
            <TextInput
              style={[styles.editInput, styles.quantityInput]}
              value={editedQuantity}
              onChangeText={setEditedQuantity}
              placeholder="Qty"
              keyboardType="numeric"
            />
          )}
        </View>

        <TextInput
          style={[styles.editInput, styles.notesInput]}
          value={editedNotes}
          onChangeText={setEditedNotes}
          placeholder="Notes (optional)"
          multiline
        />

        <View style={styles.editRecurringSection}>
          <TouchableOpacity
            style={styles.editRecurringToggle}
            onPress={() => setEditedIsRecurring(!editedIsRecurring)}
          >
            <View style={styles.editCheckbox}>
              {editedIsRecurring ? (
                <Ionicons name="checkbox" size={16} color={primaryColor} />
              ) : (
                <Ionicons
                  name="square-outline"
                  size={16}
                  color={COLORS.TEXT_SECONDARY}
                />
              )}
            </View>
            <Text style={styles.editRecurringLabel}>Recurring item</Text>
          </TouchableOpacity>

          {editedIsRecurring && (
            <View style={styles.editIntervalContainer}>
              <Text style={styles.editIntervalLabel}>Repeat</Text>
              <TextInput
                style={[styles.editInput, styles.editIntervalInput]}
                value={editedRecurringInterval}
                onChangeText={setEditedRecurringInterval}
                placeholder="7"
                keyboardType="numeric"
              />
              <Text style={styles.editIntervalUnit}>days after purchase</Text>
            </View>
          )}
        </View>

        <View style={styles.editActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton]}
            onPress={handleCancel}
            disabled={loading}
          >
            <Ionicons name="close" size={16} color={COLORS.TEXT_SECONDARY} />
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: primaryColor }]}
            onPress={handleSave}
            disabled={loading}
          >
            <Ionicons name="checkmark" size={16} color={COLORS.TEXT_WHITE} />
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isSelectable ? (
        <TouchableOpacity
          style={styles.selectButton}
          onPress={() => onToggleSelect?.(item.id)}
          disabled={loading}
        >
          <Ionicons
            name={isSelected ? "checkbox" : "square-outline"}
            size={24}
            color={isSelected ? primaryColor : COLORS.TEXT_SECONDARY}
          />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.purchaseButton}
          onPress={handlePurchase}
          disabled={loading}
        >
          <Ionicons
            name="checkmark-circle-outline"
            size={24}
            color={COLORS.SUCCESS}
          />
        </TouchableOpacity>
      )}

      <View style={styles.itemContent}>
        <View style={styles.itemHeader}>
          <View style={styles.itemTitleRow}>
            <Text style={styles.itemName}>{item.name}</Text>
            {item.isRecurring && (
              <View
                style={[
                  styles.recurringBadge,
                  { backgroundColor: primaryColor + "15" },
                ]}
              >
                <Ionicons name="refresh" size={12} color={primaryColor} />
                <Text style={[styles.recurringText, { color: primaryColor }]}>
                  Repeats {item.recurringInterval}d after purchase
                </Text>
              </View>
            )}
          </View>
          {item.assignedTo && (
            <Text
              style={[
                styles.assignedTo,
                { color: primaryColor, backgroundColor: primaryColor + "15" },
              ]}
            >
              @{item.assignedTo.firstName}
            </Text>
          )}
        </View>

        {(showQuantity || item.notes) && (
          <View style={styles.itemDetails}>
            {showQuantity && (
              <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
            )}
            {item.notes && <Text style={styles.itemNotes}>{item.notes}</Text>}
          </View>
        )}
      </View>

      {isEditable && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setIsEditing(true)}
            disabled={loading}
          >
            <Ionicons name="pencil" size={16} color={COLORS.TEXT_SECONDARY} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
            disabled={loading}
          >
            <Ionicons name="trash" size={16} color={COLORS.ERROR} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
