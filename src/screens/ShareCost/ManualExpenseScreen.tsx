import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { StackNavigationProp } from "@react-navigation/stack";
import { useFocusEffect } from "@react-navigation/native";

import { Button } from "../../components/UI";
import { NAVIGATION_ROUTES } from "../../constants";
import { ShareCostStackParamList } from "../../types/navigation";
import { useUserTheme } from "../../hooks/useUserTheme";
import { useHouse } from "../../context/HouseContext";
import { categoryService } from "../../services/categoryService";
import { Category } from "../../types/expenses";

type ManualExpenseScreenNavigationProp = StackNavigationProp<
  ShareCostStackParamList,
  "ManualExpense"
>;

interface Props {
  navigation: ManualExpenseScreenNavigationProp;
}

export default function ManualExpenseScreen({ navigation }: Props) {
  const { COLORS } = useUserTheme();
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const { currentHouse } = useHouse();

  useFocusEffect(
    useCallback(() => {
      loadCategories();
    }, [currentHouse])
  );

  const loadCategories = async () => {
    if (!currentHouse?.id) return;

    try {
      setLoading(true);
      const categoriesData = await categoryService.getCategoriesByHouseId(
        currentHouse.id
      );
      setCategories(categoriesData);

      // Auto-select first category as default
      if (categoriesData.length > 0) {
        setSelectedCategory(categoriesData[0]);
      }
    } catch (error) {
      console.error("Error loading categories:", error);
      Alert.alert("Error", "Failed to load categories. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAmountChange = (value: string) => {
    // Allow only numbers and decimal point
    const numericValue = value.replace(/[^0-9.]/g, "");
    setAmount(numericValue);
  };

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    setShowCategoryDropdown(false);
  };

  const handleContinue = () => {
    if (!description.trim()) {
      Alert.alert(
        "Missing Description",
        "Please enter a description for the expense."
      );
      return;
    }

    const expenseAmount = parseFloat(amount);
    if (!expenseAmount || expenseAmount <= 0) {
      Alert.alert(
        "Invalid Amount",
        "Please enter a valid amount greater than 0."
      );
      return;
    }

    if (!selectedCategory) {
      Alert.alert(
        "Missing Category",
        "Please select a category for the expense."
      );
      return;
    }

    // Navigate to SplitPreviewScreen with manual expense data
    navigation.navigate(NAVIGATION_ROUTES.SPLIT_PREVIEW, {
      type: "manual",
      amount: expenseAmount,
      description: description.trim(),
      items: undefined, // No shopping items for manual expenses
      splitBetween: [], // Will be selected in preview screen
      categoryId: selectedCategory.id,
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
          <Text style={styles.loadingText}>Loading categories...</Text>
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
            <Text style={styles.title}>Add Manual Expense</Text>
            <Text style={styles.subtitle}>
              Enter the expense details and choose how to split it
            </Text>
          </View>

          {/* Description Input */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={styles.textInput}
              value={description}
              onChangeText={setDescription}
              placeholder="e.g., Dinner at restaurant, Uber ride, etc."
              returnKeyType="next"
              maxLength={100}
            />
          </View>

          {/* Amount Input */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Amount</Text>
            <View style={styles.amountInputContainer}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={handleAmountChange}
                placeholder="0.00"
                keyboardType="decimal-pad"
                returnKeyType="done"
              />
            </View>
          </View>

          {/* Category Selection */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Category</Text>
            <TouchableOpacity
              style={styles.categorySelector}
              onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
            >
              <View style={styles.categorySelectedContainer}>
                {selectedCategory && (
                  <View
                    style={[
                      styles.categoryColorDot,
                      { backgroundColor: selectedCategory.color },
                    ]}
                  />
                )}
                <Text style={styles.categorySelectedText}>
                  {selectedCategory
                    ? selectedCategory.name
                    : "Select a category"}
                </Text>
              </View>
              <Ionicons
                name={showCategoryDropdown ? "chevron-up" : "chevron-down"}
                size={20}
                color={COLORS.TEXT_SECONDARY}
              />
            </TouchableOpacity>

            {/* Category Dropdown */}
            {showCategoryDropdown && (
              <View style={styles.categoryDropdown}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryOption,
                      selectedCategory?.id === category.id &&
                        styles.categoryOptionSelected,
                    ]}
                    onPress={() => handleCategorySelect(category)}
                  >
                    <View
                      style={[
                        styles.categoryColorDot,
                        { backgroundColor: category.color },
                      ]}
                    />
                    <Text style={styles.categoryOptionText}>
                      {category.name}
                    </Text>
                    {selectedCategory?.id === category.id && (
                      <Ionicons
                        name="checkmark"
                        size={18}
                        color={COLORS.PRIMARY}
                        style={styles.categoryCheckmark}
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={styles.actions}>
            <Button
              title="Continue to Split"
              onPress={handleContinue}
              style={styles.continueButton}
              disabled={!description.trim() || !amount || !selectedCategory}
            />
          </View>
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
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 2,
    borderColor: COLORS.BORDER,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
    backgroundColor: COLORS.CARD_BACKGROUND,
  },
  amountInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.PRIMARY,
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.CARD_BACKGROUND,
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.TEXT_PRIMARY,
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.TEXT_PRIMARY,
    paddingVertical: 16,
  },
  categorySelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 2,
    borderColor: COLORS.BORDER,
    borderRadius: 12,
    padding: 16,
    backgroundColor: COLORS.CARD_BACKGROUND,
  },
  categorySelectedContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  categoryColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  categorySelectedText: {
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
  },
  categoryDropdown: {
    marginTop: 8,
    backgroundColor: COLORS.CARD_BACKGROUND,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    maxHeight: 200,
  },
  categoryOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  categoryOptionSelected: {
    backgroundColor: COLORS.PRIMARY + "10",
  },
  categoryOptionText: {
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
    flex: 1,
  },
  categoryCheckmark: {
    marginLeft: 8,
  },
  actions: {
    paddingBottom: 24,
    paddingTop: 16,
  },
  continueButton: {
    minHeight: 50,
  },
});
