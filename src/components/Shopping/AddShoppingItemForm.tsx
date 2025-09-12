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
import { COLORS } from "../../constants";
import { useUserTheme } from "../../hooks/useUserTheme";
import { CreateShoppingItemRequest } from "../../types/shopping";

interface Props {
  onAdd: (item: CreateShoppingItemRequest) => Promise<void>;
  onCancel?: () => void;
  placeholder?: string;
  showExpanded?: boolean;
  autoFocus?: boolean;
}

export default function AddShoppingItemForm({
  onAdd,
  onCancel,
  placeholder = "Add item to shopping list...",
  showExpanded = false,
  autoFocus = false,
}: Props) {
  const { primaryColor } = useUserTheme();
  const [isExpanded, setIsExpanded] = useState(showExpanded);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [notes, setNotes] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringInterval, setRecurringInterval] = useState("7");
  const [loading, setLoading] = useState(false);

  const { COLORS } = useUserTheme();

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter an item name");
      return;
    }

    const qty = parseInt(quantity) || 1;
    if (qty < 1) {
      Alert.alert("Error", "Quantity must be at least 1");
      return;
    }

    const item: CreateShoppingItemRequest = {
      name: name.trim(),
      quantity: qty,
      notes: notes.trim() || undefined,
      isRecurring,
      recurringInterval: isRecurring
        ? parseInt(recurringInterval) || 7
        : undefined,
    };

    try {
      setLoading(true);
      await onAdd(item);

      // Reset form
      setName("");
      setQuantity("1");
      setNotes("");
      setIsRecurring(false);
      setRecurringInterval("7");

      if (!showExpanded) {
        setIsExpanded(false);
      }
    } catch (error: any) {
      console.error("Error adding item:", error);

      // Handle duplicate detection (409 conflict)
      if (error?.response?.status === 409) {
        const duplicateMessage =
          error?.response?.data?.message ||
          "An item with this name already exists.";
        const suggestion =
          error?.response?.data?.warnings || "Would you like to add it anyway?";

        Alert.alert("Potential Duplicate Item Detected", `${suggestion}`, [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Add Anyway",
            onPress: async () => {
              try {
                const forceItem = { ...item, force: true };
                await onAdd(forceItem);

                // Reset form on success
                setName("");
                setQuantity("1");
                setNotes("");
                setIsRecurring(false);
                setRecurringInterval("7");

                if (!showExpanded) {
                  setIsExpanded(false);
                }
              } catch (forceError) {
                console.error("Error force-adding item:", forceError);
                Alert.alert("Error", "Failed to add item. Please try again.");
              }
            },
          },
        ]);
      } else {
        Alert.alert("Error", "Failed to add item. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setName("");
    setQuantity("1");
    setNotes("");
    setIsRecurring(false);
    setRecurringInterval("7");
    setIsExpanded(false);
    onCancel?.();
  };

  if (!isExpanded && !showExpanded) {
    return (
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setIsExpanded(true)}
      >
        <Ionicons name="add" size={20} color={primaryColor} />
        <Text style={styles.addButtonText}>{placeholder}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, styles.nameInput]}
          value={name}
          onChangeText={setName}
          placeholder="Item name"
          autoFocus={autoFocus || isExpanded}
          onSubmitEditing={() => {
            if (name.trim()) {
              handleSubmit();
            }
          }}
          returnKeyType="done"
        />
        <TextInput
          style={[styles.input, styles.quantityInput]}
          value={quantity}
          onChangeText={setQuantity}
          placeholder="Qty"
          keyboardType="numeric"
        />
      </View>

      <TextInput
        style={[styles.input, styles.notesInput]}
        value={notes}
        onChangeText={setNotes}
        placeholder="Notes (optional)"
        multiline
      />

      <View style={styles.recurringSection}>
        <TouchableOpacity
          style={styles.recurringToggle}
          onPress={() => setIsRecurring(!isRecurring)}
        >
          <View style={styles.checkbox}>
            {isRecurring ? (
              <Ionicons name="checkbox" size={20} color={primaryColor} />
            ) : (
              <Ionicons
                name="square-outline"
                size={20}
                color={COLORS.TEXT_SECONDARY}
              />
            )}
          </View>
          <Text style={styles.recurringLabel}>Make this a recurring item</Text>
        </TouchableOpacity>

        {isRecurring && (
          <View style={styles.intervalContainer}>
            <Text style={styles.intervalLabel}>Repeat</Text>
            <TextInput
              style={[styles.input, styles.intervalInput]}
              value={recurringInterval}
              onChangeText={setRecurringInterval}
              placeholder="7"
              keyboardType="numeric"
            />
            <Text style={styles.intervalUnit}>days after purchase</Text>
          </View>
        )}
      </View>

      <View style={styles.actions}>
        {!showExpanded && (
          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton]}
            onPress={handleCancel}
            disabled={loading}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: primaryColor }]}
          onPress={handleSubmit}
          disabled={loading || !name.trim()}
        >
          <Ionicons name="add" size={16} color={COLORS.TEXT_WHITE} />
          <Text style={styles.addText}>Add Item</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 4,
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    fontStyle: "italic",
  },
  container: {
    paddingHorizontal: 4,
    backgroundColor: COLORS.CARD_BACKGROUND,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.BORDER_LIGHT,
    marginVertical: 8,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: COLORS.BACKGROUND,
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
  },
  nameInput: {
    flex: 1,
  },
  quantityInput: {
    width: 70,
  },
  notesInput: {
    marginBottom: 12,
    minHeight: 40,
    textAlignVertical: "top",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
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
  addText: {
    fontSize: 14,
    color: COLORS.TEXT_WHITE,
    fontWeight: "500",
  },
  recurringSection: {
    marginBottom: 12,
  },
  recurringToggle: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  checkbox: {
    marginRight: 8,
  },
  recurringLabel: {
    fontSize: 14,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: "500",
  },
  intervalContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 28,
    gap: 8,
  },
  intervalLabel: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
  },
  intervalInput: {
    width: 60,
    height: 36,
  },
  intervalUnit: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
  },
});
