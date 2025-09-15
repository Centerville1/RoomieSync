import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp, useFocusEffect } from "@react-navigation/native";

import { Button, Avatar } from "../../components/UI";
import { ShareCostStackParamList } from "../../types/navigation";
import { useUserTheme } from "../../hooks/useUserTheme";
import { useHouse } from "../../context/HouseContext";
import { HouseMembership } from "../../types/auth";
import { expenseService } from "../../services/expenseService";
import { shoppingService } from "../../services/shoppingService";
import { categoryService } from "../../services/categoryService";
import { CreateExpenseRequest, Category } from "../../types/expenses";

type SplitPreviewScreenNavigationProp = StackNavigationProp<
  ShareCostStackParamList,
  "SplitPreview"
>;

type SplitPreviewScreenRouteProp = RouteProp<
  ShareCostStackParamList,
  "SplitPreview"
>;

interface Props {
  navigation: SplitPreviewScreenNavigationProp;
  route: SplitPreviewScreenRouteProp;
}

interface SelectableMember extends HouseMembership {
  isSelected: boolean;
}

const createDynamicStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.BACKGROUND,
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
      color: colors.TEXT_SECONDARY,
      marginTop: 16,
    },
    header: {
      paddingVertical: 24,
    },
    title: {
      fontSize: 24,
      fontWeight: "700",
      color: colors.TEXT_PRIMARY,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: colors.TEXT_SECONDARY,
      lineHeight: 22,
    },
    summaryCard: {
      backgroundColor: colors.CARD_BACKGROUND,
      borderRadius: 12,
      padding: 20,
      marginBottom: 24,
    },
    summaryTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.TEXT_PRIMARY,
      marginBottom: 16,
    },
    summaryRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    summaryLabel: {
      fontSize: 16,
      color: colors.TEXT_SECONDARY,
    },
    summaryValue: {
      fontSize: 16,
      color: colors.TEXT_PRIMARY,
      fontWeight: "500",
    },
    summaryAmount: {
      fontSize: 18,
      color: colors.PRIMARY,
      fontWeight: "700",
    },
    membersSection: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.TEXT_PRIMARY,
      marginBottom: 4,
    },
    sectionSubtitle: {
      fontSize: 14,
      color: colors.TEXT_SECONDARY,
      marginBottom: 16,
    },
    memberCard: {
      backgroundColor: colors.CARD_BACKGROUND,
      borderRadius: 12,
      marginBottom: 12,
      overflow: "hidden",
    },
    memberRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 16,
    },
    memberInfo: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    memberAvatar: {
      marginRight: 12,
    },
    memberDetails: {
      flex: 1,
    },
    memberName: {
      fontSize: 16,
      fontWeight: "500",
      color: colors.TEXT_PRIMARY,
    },
    memberRole: {
      fontSize: 14,
      color: colors.TEXT_SECONDARY,
      marginTop: 2,
    },
    checkbox: {
      marginLeft: 12,
    },
    breakdownCard: {
      backgroundColor: colors.CARD_BACKGROUND,
      borderRadius: 12,
      padding: 20,
      marginBottom: 24,
    },
    breakdownTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.TEXT_PRIMARY,
      marginBottom: 16,
    },
    breakdownRow: {
      marginBottom: 8,
    },
    breakdownLabel: {
      fontSize: 16,
      color: colors.TEXT_SECONDARY,
    },
    breakdownDivider: {
      height: 1,
      backgroundColor: colors.BORDER,
      marginVertical: 16,
    },
    breakdownResult: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.PRIMARY,
    },
    individualBreakdown: {
      marginTop: 16,
    },
    individualRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 8,
      paddingHorizontal: 12,
      backgroundColor: colors.BACKGROUND,
      borderRadius: 8,
      marginBottom: 8,
    },
    individualName: {
      fontSize: 14,
      color: colors.TEXT_PRIMARY,
      fontWeight: "500",
    },
    individualAmount: {
      fontSize: 14,
      color: colors.PRIMARY,
      fontWeight: "600",
    },
    actions: {
      paddingBottom: 24,
    },
    submitButton: {
      minHeight: 50,
    },
  });

export default function SplitPreviewScreen({ navigation, route }: Props) {
  const {
    type,
    amount,
    description,
    items,
    splitBetween,
    categoryId: passedCategoryId,
  } = route.params;
  const { COLORS } = useUserTheme();
  const styles = createDynamicStyles(COLORS);
  const [members, setMembers] = useState<SelectableMember[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { currentHouse } = useHouse();

  useFocusEffect(
    useCallback(() => {
      loadHouseData();
    }, [currentHouse])
  );

  const loadHouseData = async () => {
    if (!currentHouse?.members || !currentHouse?.id) {
      console.log("Missing house data:", {
        hasMembers: !!currentHouse?.members,
        hasId: !!currentHouse?.id,
        currentHouse,
      });
      return;
    }

    try {
      setLoading(true);
      console.log("Loading house data for house:", currentHouse.id);

      // Convert house members to selectable format first
      const selectableMembers = currentHouse.members.map((member) => ({
        ...member,
        isSelected: splitBetween.includes(member.user?.id || ""),
      }));
      setMembers(selectableMembers);

      // Load categories separately to avoid blocking the UI
      try {
        console.log("Fetching categories...");
        const categoriesData = await categoryService.getCategoriesByHouseId(
          currentHouse.id
        );
        console.log("Categories loaded:", categoriesData);
        setCategories(categoriesData);
      } catch (categoryError) {
        console.error("Error loading categories:", categoryError);
        // Don't fail the whole screen if categories fail - we'll handle missing categories in expense creation
        setCategories([]);
      }
    } catch (error) {
      console.error("Error loading house data:", error);
      Alert.alert("Error", "Failed to load house data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleMemberToggle = (userId: string) => {
    setMembers((prevMembers) =>
      prevMembers.map((member) =>
        member.user?.id === userId
          ? { ...member, isSelected: !member.isSelected }
          : member
      )
    );
  };

  const selectedMembers = useMemo(
    () => members.filter((member) => member.isSelected),
    [members]
  );

  const amountPerPerson = useMemo(() => {
    if (selectedMembers.length === 0) return 0;
    return amount / selectedMembers.length;
  }, [amount, selectedMembers.length]);

  const getAppropriateCategory = useCallback(() => {
    if (categories.length === 0) return null;

    // If a specific categoryId was passed (for manual expenses), use that
    if (passedCategoryId) {
      const passedCategory = categories.find(
        (cat) => cat.id === passedCategoryId
      );
      if (passedCategory) return passedCategory;
    }

    if (type === "shopping") {
      // For shopping expenses, look for "Groceries" category first
      const groceryCategory = categories.find(
        (cat) =>
          cat.name.toLowerCase().includes("groceries") ||
          cat.name.toLowerCase().includes("grocery")
      );
      if (groceryCategory) return groceryCategory;
    }

    // Fallback to the first default category or just the first category
    const defaultCategory = categories.find((cat) => cat.isDefault);
    return defaultCategory || categories[0];
  }, [categories, type, passedCategoryId]);

  const handleSubmitExpense = async () => {
    if (selectedMembers.length === 0) {
      Alert.alert(
        "No Members Selected",
        "Please select at least one person to split the expense with."
      );
      return;
    }

    if (!currentHouse?.id) {
      Alert.alert("Error", "No house selected. Please try again.");
      return;
    }

    try {
      setSubmitting(true);

      const splitBetweenIds = selectedMembers
        .map((member) => member.user?.id)
        .filter(Boolean) as string[];
      const selectedCategory = getAppropriateCategory();

      if (!selectedCategory) {
        Alert.alert(
          "Error",
          "No expense categories found. Please contact support."
        );
        return;
      }

      console.log("Creating expense with data:", {
        description,
        amount,
        expenseDate: new Date().toISOString().split("T")[0],
        splitBetween: splitBetweenIds,
        categoryId: selectedCategory.id,
        categoryName: selectedCategory.name,
        selectedMembers: selectedMembers.map((m) => ({
          id: m.user?.id,
          name: m.displayName,
        })),
      });

      // Create expense data with the appropriate category
      const expenseData: CreateExpenseRequest = {
        description,
        amount,
        expenseDate: new Date().toISOString().split("T")[0], // Today's date
        splitBetween: splitBetweenIds,
        categoryId: selectedCategory.id,
      };

      await expenseService.createExpense(currentHouse.id, expenseData);

      // Mark shopping items as purchased if this is a shopping expense
      if (type === "shopping" && items) {
        try {
          const itemIds = items.map((item) => item.id);
          await shoppingService.batchPurchaseItems(currentHouse.id, itemIds);
        } catch (purchaseError) {
          console.error("Error marking items as purchased:", purchaseError);
          // Don't fail the whole operation if purchase marking fails
        }
      }

      Alert.alert(
        "Success!",
        "Expense has been created and split between selected members.",
        [
          {
            text: "OK",
            onPress: () => {
              // Navigate back to ShareCost home
              navigation.reset({
                index: 0,
                routes: [{ name: "ShareCostHome" }],
              });
            },
          },
        ]
      );
    } catch (error: any) {
      console.error("Error creating expense:", error);
      Alert.alert(
        "Error",
        error?.response?.data?.message ||
          "Failed to create expense. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
          <Text style={styles.loadingText}>Loading house data...</Text>
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
            <Text style={styles.title}>Split Preview</Text>
            <Text style={styles.subtitle}>
              Select who to split this expense with and review the breakdown
            </Text>
          </View>

          {/* Expense Summary */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Expense Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Description:</Text>
              <Text style={styles.summaryValue}>{description}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Amount:</Text>
              <Text style={styles.summaryAmount}>
                ${(amount || 0).toFixed(2)}
              </Text>
            </View>
            {type === "shopping" && items && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Items:</Text>
                <Text style={styles.summaryValue}>
                  {items.length} selected items
                </Text>
              </View>
            )}
          </View>

          {/* Member Selection */}
          <View style={styles.membersSection}>
            <Text style={styles.sectionTitle}>Split Between</Text>
            <Text style={styles.sectionSubtitle}>
              Select the house members to split this expense with
            </Text>

            {members.map((member) => (
              <View key={member.id} style={styles.memberCard}>
                <TouchableOpacity
                  style={styles.memberRow}
                  onPress={() => handleMemberToggle(member.user?.id || "")}
                >
                  <View style={styles.memberInfo}>
                    <Avatar
                      name={
                        member.user?.firstName + " " + member.user?.lastName ||
                        member.displayName
                      }
                      imageUrl={member.user?.profileImageUrl}
                      color={member.user?.color}
                      size="medium"
                      style={styles.memberAvatar}
                    />
                    <View style={styles.memberDetails}>
                      <Text style={styles.memberName}>
                        {member.displayName}
                      </Text>
                      <Text style={styles.memberRole}>
                        {member.role === "admin" ? "Admin" : "Member"}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.checkbox}>
                    {member.isSelected ? (
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
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* Split Breakdown */}
          {selectedMembers.length > 0 && (
            <View style={styles.breakdownCard}>
              <Text style={styles.breakdownTitle}>Split Breakdown</Text>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>
                  Total Amount: ${(amount || 0).toFixed(2)}
                </Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>
                  Split {selectedMembers.length} way
                  {selectedMembers.length > 1 ? "s" : ""}
                </Text>
              </View>
              <View style={styles.breakdownDivider} />
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownResult}>
                  Each person pays: ${(amountPerPerson || 0).toFixed(2)}
                </Text>
              </View>

              {/* Show individual breakdown */}
              <View style={styles.individualBreakdown}>
                {selectedMembers.map((member) => (
                  <View key={member.id} style={styles.individualRow}>
                    <Text style={styles.individualName}>
                      {member.displayName}
                    </Text>
                    <Text style={styles.individualAmount}>
                      ${(amountPerPerson || 0).toFixed(2)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={styles.actions}>
            <Button
              title="Create Expense"
              onPress={handleSubmitExpense}
              style={styles.submitButton}
              disabled={selectedMembers.length === 0 || submitting}
              loading={submitting}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
