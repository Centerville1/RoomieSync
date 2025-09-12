import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect, CompositeNavigationProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";

import { Card, Avatar, Button } from "../../components/UI";
import { ShoppingListManager } from "../../components/Shopping";
import { useAuth } from "../../context/AuthContext";
import { useHouse } from "../../context/HouseContext";
import { useShoppingSelection } from "../../context/ShoppingSelectionContext";
import { COLORS, NAVIGATION_ROUTES } from "../../constants";
import { RootStackParamList, MainTabParamList, ShareCostStackParamList } from "../../types/navigation";
import { House } from "../../types/houses";
import { Balance } from "../../types/expenses";
import { ShoppingItem } from "../../types/shopping";
import { houseService } from "../../services/houseService";
import { balanceService } from "../../services/balanceService";
import { shoppingService } from "../../services/shoppingService";
import { expenseService } from "../../services/expenseService";
import { paymentService } from "../../services/paymentService";

interface ActivityItem {
  id: string;
  type: "expense" | "payment" | "shopping";
  description: string;
  amount?: number;
  user: string;
  time: string;
}

type HomeScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, "Home">,
  StackNavigationProp<RootStackParamList>
>;

export default function HomeScreen() {
  const { user } = useAuth();
  const { houses } = useHouse();
  const { selectedShoppingItems, setSelectedShoppingItems } =
    useShoppingSelection();
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentHouse, setCurrentHouse] = useState<House | null>(null);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  // Refresh data when screen comes into focus (e.g., returning from settings)
  useFocusEffect(
    useCallback(() => {
      if (user) {
        loadData();
      }
    }, [user])
  );

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Get current house from storage or user's houses
      let house = await houseService.getStoredCurrentHouse();

      if (!house) {
        const houses = await houseService.getUserHouses();
        if (houses.length > 0) {
          house = houses[0];
          await houseService.setCurrentHouse(house);
        }
      }

      if (!house) {
        setCurrentHouse(null);
        return;
      }

      // Load all data concurrently, including detailed house info with members
      console.log("Starting API calls for house:", house.name);
      const startTime = Date.now();

      const [
        houseDetailsData,
        balancesData,
        shoppingData,
        expensesData,
        paymentsData,
      ] = await Promise.allSettled([
        houseService.getHouseDetails(house.id),
        balanceService.getBalancesByHouseId(house.id),
        shoppingService.getShoppingItemsByHouseId(house.id),
        expenseService.getExpensesByHouseId(house.id),
        paymentService.getPaymentsByHouseId(house.id),
      ]);

      console.log("API calls completed in:", Date.now() - startTime, "ms");
      console.log("API results:", {
        houseDetails: houseDetailsData.status,
        balances: balancesData.status,
        shopping: shoppingData.status,
        expenses: expensesData.status,
        payments: paymentsData.status,
      });

      // Set house details with full member information
      if (houseDetailsData.status === "fulfilled") {
        const houseDetails = houseDetailsData.value;
        setCurrentHouse(houseDetails);
        // Update stored house with latest details
        await houseService.setCurrentHouse(houseDetails);
      } else {
        setCurrentHouse(house); // fallback to basic house data
      }

      // Set balances
      if (balancesData.status === "fulfilled") {
        setBalances(balancesData.value);
      }

      // Set shopping items (filter out purchased ones for the home screen)
      if (shoppingData.status === "fulfilled") {
        const activeItems = shoppingData.value.filter(
          (item) => !item.purchasedAt
        );
        setShoppingItems(activeItems);
      }

      // Generate recent activity from expenses and payments
      const activity: ActivityItem[] = [];

      if (expensesData.status === "fulfilled") {
        expensesData.value.slice(0, 3).forEach((expense) => {
          activity.push({
            id: `expense-${expense.id}`,
            type: "expense",
            description: expense.description,
            amount: typeof expense.amount === 'number' ? expense.amount : undefined,
            user: expense.paidBy?.firstName || "Unknown",
            time: formatRelativeTime(expense.createdAt),
          });
        });
      }

      if (paymentsData.status === "fulfilled") {
        paymentsData.value.slice(0, 2).forEach((payment) => {
          activity.push({
            id: `payment-${payment.id}`,
            type: "payment",
            description: payment.memo || "Payment",
            amount: typeof payment.amount === 'number' ? payment.amount : undefined,
            user: payment.fromUser?.firstName || "Unknown",
            time: formatRelativeTime(payment.createdAt),
          });
        });
      }

      // Sort by most recent and take top 5 (simple sort by creation order for now)
      activity.reverse();
      setRecentActivity(activity.slice(0, 5));
    } catch (err) {
      console.error("Error loading home screen data:", err);
      setError("Failed to load data. Please try refreshing.");
    } finally {
      setLoading(false);
    }
  };

  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Less than an hour ago";
    if (diffInHours < 24)
      return `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays === 1 ? "" : "s"} ago`;
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const formatAmount = (amount: number | undefined) => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return '$0.00';
    }
    return `$${amount.toFixed(2)}`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "expense":
        return "receipt-outline";
      case "payment":
        return "card-outline";
      case "shopping":
        return "bag-outline";
      default:
        return "time-outline";
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
          <Text style={styles.loadingText}>Loading your home...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="warning-outline" size={48} color={COLORS.ERROR} />
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorSubtitle}>{error}</Text>
          <Button
            title="Try Again"
            onPress={loadData}
            style={styles.retryButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (!currentHouse) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No House Selected</Text>
          <Text style={styles.emptySubtitle}>
            Join or create a house to get started
          </Text>
          <Button
            title="Get Started"
            onPress={() => {}}
            style={styles.emptyButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  const hasMultipleHouses = houses.length > 1;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with house info */}
      <LinearGradient
        colors={[currentHouse.color, currentHouse.color + "90"]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          {hasMultipleHouses && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() =>
                navigation.navigate(NAVIGATION_ROUTES.MULTI_HOUSE_SELECTION)
              }
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.TEXT_WHITE} />
            </TouchableOpacity>
          )}

          <View
            style={[
              styles.houseInfo,
              hasMultipleHouses && styles.houseInfoWithBack,
            ]}
          >
            <Avatar
              name={currentHouse.name}
              imageUrl={currentHouse.imageUrl}
              color={currentHouse.color}
              size="large"
            />
            <View style={styles.houseDetails}>
              <Text style={styles.houseName}>{currentHouse.name}</Text>
              <Text style={styles.memberCount}>
                {currentHouse.members?.length || 0} members
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() =>
              navigation.navigate(NAVIGATION_ROUTES.HOUSE_SETTINGS)
            }
          >
            <Ionicons
              name="settings-outline"
              size={24}
              color={COLORS.TEXT_WHITE}
            />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Balances Card */}
        <Card title="💰 Balances" headerColor={COLORS.BALANCE_HEADER}>
          {balances.length === 0 ? (
            <View style={styles.balanceEmptyState}>
              <Text style={styles.emptyCardText}>All settled up! 🎉</Text>
              <Text style={styles.emptyCardSubtext}>
                Create expenses to track who owes what
              </Text>
              <TouchableOpacity
                style={styles.addExpenseButton}
                onPress={() =>
                  navigation.navigate(NAVIGATION_ROUTES.SHARE_COST, {})
                }
              >
                <Ionicons name="add" size={16} color={COLORS.PRIMARY} />
                <Text style={styles.addExpenseText}>Add Expense</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {balances.map((balance) => (
                <View key={balance.id} style={styles.balanceItem}>
                  <View style={styles.balanceInfo}>
                    <Text style={styles.balanceText}>
                      {balance.fromUser.id === user?.id
                        ? `You owe ${balance.toUser.firstName}`
                        : `${balance.fromUser.firstName} owes you`}
                    </Text>
                    <Text
                      style={[
                        styles.balanceAmount,
                        {
                          color:
                            balance.fromUser.id === user?.id
                              ? COLORS.ERROR
                              : COLORS.SUCCESS,
                        },
                      ]}
                    >
                      {formatAmount(balance.amount)}
                    </Text>
                  </View>
                  <TouchableOpacity style={styles.payButton}>
                    <Text style={styles.payButtonText}>
                      {balance.fromUser.id === user?.id ? "Pay" : "Remind"}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </>
          )}
        </Card>

        {/* Shopping List Card */}
        <Card title="🛒 Shopping List" headerColor={COLORS.SHOPPING_HEADER}>
          <ShoppingListManager
            items={shoppingItems}
            onItemsChange={(items) => setShoppingItems(items)}
            maxItemsToShow={5}
            showQuantity={true}
            showAddForm={true}
            isSelectable={true}
            selectedItems={selectedShoppingItems}
            onSelectionChange={setSelectedShoppingItems}
          />
          {shoppingItems.length > 5 && (
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() =>
                navigation.navigate(NAVIGATION_ROUTES.SHARE_COST, {
                  screen: NAVIGATION_ROUTES.SHOPPING_LIST,
                })
              }
            >
              <Text style={styles.viewAllText}>
                View all {shoppingItems.length} items
              </Text>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={COLORS.PRIMARY}
              />
            </TouchableOpacity>
          )}
        </Card>

        {/* Recent Activity Card */}
        <Card title="📋 Recent Activity" headerColor={COLORS.ACTIVITY_HEADER}>
          {recentActivity.length === 0 ? (
            <Text style={styles.emptyCardText}>No recent activity</Text>
          ) : (
            <>
              {recentActivity.map((activity) => (
                <View key={activity.id} style={styles.activityItem}>
                  <View style={styles.activityIcon}>
                    <Ionicons
                      name={getActivityIcon(activity.type)}
                      size={20}
                      color={COLORS.TEXT_SECONDARY}
                    />
                  </View>
                  <View style={styles.activityDetails}>
                    <Text style={styles.activityDescription}>
                      {activity.description}
                    </Text>
                    <Text style={styles.activityMeta}>
                      {activity.user} • {activity.time}
                    </Text>
                  </View>
                  {activity.amount && (
                    <Text style={styles.activityAmount}>
                      {formatAmount(activity.amount)}
                    </Text>
                  )}
                </View>
              ))}
            </>
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  houseInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  houseInfoWithBack: {
    marginLeft: 0, // Reset margin when back button is present
  },
  houseDetails: {
    marginLeft: 16,
    flex: 1,
  },
  houseName: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.TEXT_WHITE,
  },
  memberCount: {
    fontSize: 16,
    color: COLORS.TEXT_WHITE + "90",
    marginTop: 4,
  },
  settingsButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: COLORS.TEXT_PRIMARY,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    textAlign: "center",
    marginTop: 8,
  },
  emptyButton: {
    marginTop: 24,
    minWidth: 200,
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.TEXT_PRIMARY,
    marginTop: 16,
    textAlign: "center",
  },
  errorSubtitle: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 8,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 24,
    minWidth: 150,
  },
  emptyCardText: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    textAlign: "center",
    fontStyle: "italic",
  },
  balanceEmptyState: {
    alignItems: "center",
    paddingVertical: 8,
  },
  emptyCardSubtext: {
    fontSize: 14,
    color: COLORS.TEXT_LIGHT,
    textAlign: "center",
    marginTop: 4,
    marginBottom: 16,
  },
  addExpenseButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.PRIMARY,
    gap: 6,
  },
  addExpenseText: {
    fontSize: 14,
    color: COLORS.PRIMARY,
    fontWeight: "500",
  },
  balanceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER_LIGHT,
  },
  balanceInfo: {
    flex: 1,
  },
  balanceText: {
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
  },
  balanceAmount: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 4,
  },
  payButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 6,
  },
  payButtonText: {
    color: COLORS.TEXT_WHITE,
    fontWeight: "600",
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    marginTop: 8,
    gap: 4,
  },
  viewAllText: {
    fontSize: 16,
    color: COLORS.PRIMARY,
    fontWeight: "600",
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER_LIGHT,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.BACKGROUND,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  activityDetails: {
    flex: 1,
  },
  activityDescription: {
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
  },
  activityMeta: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 2,
  },
  activityAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.TEXT_PRIMARY,
  },
});
