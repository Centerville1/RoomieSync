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
import {
  useNavigation,
  useFocusEffect,
  CompositeNavigationProp,
} from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";

import { Card, Avatar, Button } from "../../components/UI";
import { ShoppingListManager } from "../../components/Shopping";
import { useAuth } from "../../context/AuthContext";
import { useHouse } from "../../context/HouseContext";
import { useShoppingSelection } from "../../context/ShoppingSelectionContext";
import { useUserTheme } from "../../hooks/useUserTheme";
import { NAVIGATION_ROUTES } from "../../constants";
import { RootStackParamList, MainTabParamList } from "../../types/navigation";
import { ShareCostStackParamList } from "../../types/navigation";
import { House } from "../../types/houses";
import { UserBalance } from "../../types/expenses";
import { ShoppingItem } from "../../types/shopping";
import { houseService } from "../../services/houseService";
import { balanceService } from "../../services/balanceService";
import { shoppingService } from "../../services/shoppingService";
import { transactionService } from "../../services/transactionService";

interface ActivityItem {
  id: string;
  type: "expense" | "payment" | "shopping";
  description: string;
  amount?: number;
  userShare?: number; // For expenses: amount owed by current user
  user: string;
  time: string;
  fromUser?: string; // For payments: who paid
  toUser?: string; // For payments: who received
  involvesMe: boolean; // Whether current user is involved in this transaction
  amountColor: "red" | "green" | "white"; // Color for the amount display
}

type HomeScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, "Home">,
  StackNavigationProp<RootStackParamList & ShareCostStackParamList>
>;

const createDynamicStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.BACKGROUND,
    },
    header: {
      paddingTop: 20,
      paddingBottom: 30,
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
      color: colors.TEXT_WHITE,
    },
    memberCount: {
      fontSize: 16,
      color: colors.TEXT_WHITE + "90",
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
      color: colors.TEXT_PRIMARY,
      textAlign: "center",
    },
    emptySubtitle: {
      fontSize: 16,
      color: colors.TEXT_SECONDARY,
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
      minWidth: 150,
    },
    emptyCardText: {
      fontSize: 16,
      color: colors.TEXT_SECONDARY,
      textAlign: "center",
      fontStyle: "italic",
    },
    balanceEmptyState: {
      alignItems: "center",
      paddingVertical: 8,
    },
    emptyCardSubtext: {
      fontSize: 14,
      color: colors.TEXT_LIGHT,
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
      gap: 6,
    },
    addExpenseText: {
      fontSize: 14,
      fontWeight: "500",
    },
    balanceItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.BORDER_LIGHT,
    },
    balanceInfo: {
      flex: 1,
    },
    balanceText: {
      fontSize: 16,
      color: colors.TEXT_PRIMARY,
    },
    balanceAmount: {
      fontSize: 18,
      fontWeight: "600",
      marginTop: 4,
    },
    payButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 6,
    },
    payButtonText: {
      color: colors.TEXT_WHITE,
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
      fontWeight: "600",
    },
    activityItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.BORDER_LIGHT,
    },
    activityIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.BACKGROUND,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    activityDetails: {
      flex: 1,
    },
    activityDescription: {
      fontSize: 16,
      color: colors.TEXT_PRIMARY,
    },
    activityMeta: {
      fontSize: 14,
      color: colors.TEXT_SECONDARY,
      marginTop: 2,
    },
    activityAmount: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.TEXT_PRIMARY,
    },
  });

export default function HomeScreen() {
  const { user } = useAuth();
  const { COLORS } = useUserTheme();
  const styles = createDynamicStyles(COLORS);
  const { houses } = useHouse();
  const { primaryColor } = useUserTheme();
  const { selectedShoppingItems, setSelectedShoppingItems } =
    useShoppingSelection();
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentHouse, setCurrentHouse] = useState<House | null>(null);
  const [userBalances, setUserBalances] = useState<UserBalance[]>([]);
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

      const [houseDetailsData, balancesData, shoppingData, transactionsData] =
        await Promise.allSettled([
          houseService.getHouseDetails(house.id),
          balanceService.getUserBalancesByHouseId(house.id),
          shoppingService.getShoppingItemsByHouseId(house.id),
          transactionService.getTransactionsByHouseId(house.id),
        ]);

      console.log("API calls completed in:", Date.now() - startTime, "ms");
      console.log("API results:", {
        houseDetails: houseDetailsData.status,
        balances: balancesData.status,
        shopping: shoppingData.status,
        transactions: transactionsData.status,
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

      // Set user balances
      if (balancesData.status === "fulfilled") {
        setUserBalances(balancesData.value);
      }

      // Set shopping items (filter out purchased ones for the home screen)
      if (shoppingData.status === "fulfilled") {
        const activeItems = shoppingData.value.filter(
          (item) => !item.purchasedAt
        );
        setShoppingItems(activeItems);
      }

      // Generate recent activity from transactions
      const activity: ActivityItem[] = [];

      if (transactionsData.status === "fulfilled") {
        console.log(
          "Transaction data:",
          transactionsData.value.transactions.slice(0, 2)
        );
        transactionsData.value.transactions
          .slice(0, 5)
          .forEach((transaction) => {
            if (transaction.type === "expense") {
              // For expenses: show who it was split with
              const createdByName =
                transaction.createdBy?.displayName ||
                transaction.createdBy?.firstName ||
                "Unknown";
              const iCreatedExpense = transaction.createdBy?.id === user?.id;
              const createdByDisplayName = iCreatedExpense
                ? "You"
                : createdByName;
              const iAmInvolved =
                transaction.splitBetween?.some((u) => u.id === user?.id) ||
                false;
              const myShare = transaction.userShare || 0;

              // Build list of people it was split with (excluding current user for display)
              const otherParticipants =
                transaction.splitBetween?.filter((u) => u.id !== user?.id) ||
                [];
              const otherNames = otherParticipants.map(
                (u) => u.displayName || u.firstName || "Unknown"
              );

              let splitDescription = "";
              if (otherNames.length === 0) {
                // Only current user involved
                splitDescription = iCreatedExpense
                  ? "You recorded an expense for yourself"
                  : "They recorded an expense for themselves";
              } else if (otherNames.length === 1) {
                splitDescription = otherNames[0];
              } else if (otherNames.length === 2) {
                splitDescription = `${otherNames[0]} and ${otherNames[1]}`;
              } else if (otherNames.length === 3) {
                splitDescription = `${otherNames[0]}, ${otherNames[1]} and ${otherNames[2]}`;
              } else {
                splitDescription = `${otherNames[0]}, ${otherNames[1]} and ${
                  otherNames.length - 2
                } others`;
              }

              console.log("otherParticipants:", otherNames);
              console.log("splitDescription:", splitDescription);
              console.log(
                "Final user string:",
                `${createdByDisplayName} split with ${splitDescription}`
              );

              const userDescription =
                otherNames.length === 0
                  ? splitDescription // Just the parenthetical message
                  : `${createdByDisplayName} split with ${splitDescription}`;

              activity.push({
                id: `expense-${transaction.id}`,
                type: "expense",
                description: `Expense: ${transaction.description}`,
                amount: transaction.amount,
                userShare: myShare,
                user: userDescription,
                time: formatRelativeTime(transaction.date),
                involvesMe: iAmInvolved,
                amountColor: iAmInvolved ? "red" : "white",
              });
            } else {
              // For payments: show who paid who with memo
              const fromName =
                transaction.fromUser?.displayName ||
                transaction.fromUser?.firstName ||
                "Unknown";
              const toName =
                transaction.toUser?.displayName ||
                transaction.toUser?.firstName ||
                "Unknown";
              const iAmReceiving = transaction.toUser?.id === user?.id;
              const iAmPaying = transaction.fromUser?.id === user?.id;
              const involvesMe = iAmReceiving || iAmPaying;

              const displayFromName = iAmPaying ? "You" : fromName;
              const displayToName = iAmReceiving ? "you" : toName;

              activity.push({
                id: `payment-${transaction.id}`,
                type: "payment",
                description: `${displayFromName} paid ${displayToName}: ${transaction.description}`,
                amount: transaction.amount,
                user: displayFromName,
                time: formatRelativeTime(transaction.date),
                fromUser: displayFromName,
                toUser: displayToName,
                involvesMe: involvesMe,
                amountColor: iAmReceiving
                  ? "green"
                  : involvesMe
                  ? "red"
                  : "white",
              });
            }
          });
      }

      setRecentActivity(activity);
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
      return "$0.00";
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
          <ActivityIndicator size="large" color={primaryColor} />
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
        colors={[
          currentHouse.color,
          currentHouse.color + "AA",
          currentHouse.color + "70",
          COLORS.BACKGROUND,
        ]}
        locations={[0, 0.7, 0.8, 1]}
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
          {userBalances.length === 0 ? (
            <View style={styles.balanceEmptyState}>
              <Text style={styles.emptyCardText}>All settled up! 🎉</Text>
              <Text style={styles.emptyCardSubtext}>
                Create expenses to track who owes what
              </Text>
              <TouchableOpacity
                style={[styles.addExpenseButton, { borderColor: primaryColor }]}
                onPress={() =>
                  navigation.navigate(NAVIGATION_ROUTES.SHARE_COST, {
                    screen: NAVIGATION_ROUTES.SHARE_COST_HOME,
                  })
                }
              >
                <Ionicons name="add" size={16} color={primaryColor} />
                <Text style={[styles.addExpenseText, { color: primaryColor }]}>
                  Add Expense
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {userBalances.map((balance) => (
                <View key={balance.id} style={styles.balanceItem}>
                  <View style={styles.balanceInfo}>
                    <Text style={styles.balanceText}>
                      {balance.type === "owes"
                        ? `You owe ${balance.otherUser.firstName}`
                        : `${balance.otherUser.firstName} owes you`}
                    </Text>
                    <Text
                      style={[
                        styles.balanceAmount,
                        {
                          color:
                            balance.type === "owes"
                              ? COLORS.ERROR
                              : COLORS.SUCCESS,
                        },
                      ]}
                    >
                      {formatAmount(balance.amount)}
                    </Text>
                  </View>
                  {balance.type === "owes" && (
                    <TouchableOpacity
                      style={[
                        styles.payButton,
                        { backgroundColor: primaryColor },
                      ]}
                      onPress={() =>
                        navigation.navigate(NAVIGATION_ROUTES.SHARE_COST, {
                          screen: NAVIGATION_ROUTES.PAYMENT,
                          params: { userId: balance.otherUser.id },
                        })
                      }
                    >
                      <Text style={styles.payButtonText}>Pay</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </>
          )}
        </Card>

        {/* Shopping List Card */}
        <Card
          title="🛒 Shopping List"
          headerColor={COLORS.SHOPPING_HEADER}
          headerRight={
            <TouchableOpacity
              onPress={() =>
                navigation.navigate(NAVIGATION_ROUTES.SHARE_COST, {
                  screen: NAVIGATION_ROUTES.SHOPPING_LIST,
                })
              }
              style={{ paddingHorizontal: 8, paddingVertical: 4 }}
              accessibilityLabel="View full shopping list"
            >
              <Ionicons name="list" size={22} color={COLORS.TEXT_PRIMARY} />
            </TouchableOpacity>
          }
        >
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
              <Text style={[styles.viewAllText, { color: primaryColor }]}>
                View all {shoppingItems.length} items
              </Text>
              <Ionicons name="chevron-forward" size={16} color={primaryColor} />
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
                      {activity.type === "expense" && activity.user
                        ? `${activity.user} • ${activity.time}`
                        : activity.time}
                    </Text>
                  </View>
                  {activity.amount && (
                    <View style={{ alignItems: "flex-end" }}>
                      <Text
                        style={[
                          styles.activityAmount,
                          {
                            color:
                              activity.amountColor === "red"
                                ? COLORS.ERROR
                                : activity.amountColor === "green"
                                ? COLORS.SUCCESS
                                : COLORS.TEXT_PRIMARY,
                          },
                        ]}
                      >
                        {activity.type === "expense" &&
                        activity.involvesMe &&
                        activity.userShare
                          ? formatAmount(activity.userShare)
                          : formatAmount(activity.amount)}
                      </Text>
                      {activity.type === "expense" && activity.involvesMe && (
                        <Text style={[styles.activityMeta, { fontSize: 12 }]}>
                          of {formatAmount(activity.amount)}
                        </Text>
                      )}
                    </View>
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
