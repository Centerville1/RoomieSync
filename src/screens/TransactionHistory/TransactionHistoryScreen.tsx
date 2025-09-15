import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { useAuth } from "../../context/AuthContext";
import { useHouse } from "../../context/HouseContext";
import { useUserTheme } from "../../hooks/useUserTheme";
import TransactionDetailModal from "../../components/TransactionDetailModal";
import { transactionService } from "../../services/transactionService";
import { Transaction } from "../../types/transactions";
import { RootStackParamList } from "../../types/navigation";

type TransactionHistoryScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "TransactionHistory"
>;

interface ActivityItem {
  id: string;
  type: "expense" | "payment";
  description: string;
  amount?: number;
  userShare?: number;
  user: string;
  time: string;
  involvesMe: boolean;
  amountColor: "red" | "green" | "white";
  transaction: Transaction; // Keep reference to original transaction
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
      padding: 20,
      paddingBottom: 10,
      backgroundColor: colors.BACKGROUND,
    },
    backButton: {
      marginRight: 15,
    },
    title: {
      fontSize: 24,
      fontWeight: "700",
      color: colors.TEXT_PRIMARY,
      flex: 1,
    },
    activityItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.BORDER_LIGHT,
    },
    activityIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.BACKGROUND_LIGHT,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    activityDetails: {
      flex: 1,
    },
    activityDescription: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.TEXT_PRIMARY,
      marginBottom: 4,
    },
    activityMeta: {
      fontSize: 14,
      color: colors.TEXT_SECONDARY,
    },
    activityAmount: {
      fontSize: 16,
      fontWeight: "700",
    },
    monthSeparator: {
      paddingVertical: 15,
      paddingHorizontal: 20,
      backgroundColor: colors.BACKGROUND_LIGHT,
    },
    monthText: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.TEXT_PRIMARY,
    },
    loadingContainer: {
      padding: 20,
      alignItems: "center",
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 40,
    },
    emptyText: {
      fontSize: 16,
      color: colors.TEXT_SECONDARY,
      textAlign: "center",
      marginTop: 10,
    },
  });

export default function TransactionHistoryScreen() {
  const navigation = useNavigation<TransactionHistoryScreenNavigationProp>();
  const { user } = useAuth();
  const { currentHouse } = useHouse();
  const { COLORS } = useUserTheme();
  const styles = createDynamicStyles(COLORS);

  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [oldestDate, setOldestDate] = useState<string | null>(null);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const formatAmount = (amount: number | undefined) => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return "$0.00";
    }
    return `$${amount.toFixed(2)}`;
  };

  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return date.toLocaleDateString();
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "expense":
        return "receipt-outline";
      case "payment":
        return "card-outline";
      default:
        return "time-outline";
    }
  };

  const loadTransactions = useCallback(
    async (isRefresh = false) => {
      if (!currentHouse || !user) return;

      try {
        if (isRefresh) {
          setRefreshing(true);
          setOldestDate(null);
          setHasMoreData(true);
        } else if (!isRefresh && oldestDate && !hasMoreData) {
          return;
        }

        const filters = oldestDate ? { endDate: oldestDate } : undefined;
        const response = await transactionService.getTransactionsByHouseId(
          currentHouse.id,
          filters
        );

        // Transform transactions to activity items (similar to HomeScreen logic)
        const newActivities: ActivityItem[] = response.transactions.map(
          (transaction) => {
            if (transaction.type === "expense") {
              const createdByName =
                transaction.createdBy?.displayName ||
                transaction.createdBy?.firstName ||
                "Unknown";
              const iCreatedExpense = transaction.createdBy?.id === user.id;
              const createdByDisplayName = iCreatedExpense
                ? "You"
                : createdByName;
              const iAmInvolved =
                transaction.splitBetween?.some((u) => u.id === user.id) ||
                false;
              const myShare = transaction.userShare || 0;

              const otherParticipants =
                transaction.splitBetween?.filter((u) => u.id !== user.id) || [];
              const otherNames = otherParticipants.map(
                (u) => u.displayName || u.firstName || "Unknown"
              );

              let splitDescription = "";
              if (otherNames.length === 0) {
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

              const userDescription =
                otherNames.length === 0
                  ? splitDescription
                  : `${createdByDisplayName} split with ${splitDescription}`;

              return {
                id: `expense-${transaction.id}`,
                type: "expense",
                description: `Expense: ${transaction.description}`,
                amount: transaction.amount,
                userShare: myShare,
                user: userDescription,
                time: formatRelativeTime(transaction.date),
                involvesMe: iAmInvolved,
                amountColor: iAmInvolved ? "red" : "white",
                transaction,
              };
            } else {
              const fromName =
                transaction.fromUser?.displayName ||
                transaction.fromUser?.firstName ||
                "Unknown";
              const toName =
                transaction.toUser?.displayName ||
                transaction.toUser?.firstName ||
                "Unknown";
              const iAmReceiving = transaction.toUser?.id === user.id;
              const iAmPaying = transaction.fromUser?.id === user.id;
              const involvesMe = iAmReceiving || iAmPaying;

              const displayFromName = iAmPaying ? "You" : fromName;
              const displayToName = iAmReceiving ? "you" : toName;

              return {
                id: `payment-${transaction.id}`,
                type: "payment",
                description: `${displayFromName} paid ${displayToName}: ${transaction.description}`,
                amount: transaction.amount,
                user: displayFromName,
                time: formatRelativeTime(transaction.date),
                involvesMe: involvesMe,
                amountColor: iAmReceiving
                  ? "green"
                  : involvesMe
                  ? "red"
                  : "white",
                transaction,
              };
            }
          }
        );

        if (isRefresh) {
          setActivities(newActivities);
        } else {
          // Deduplicate activities based on their IDs
          setActivities((prev) => {
            const uniqueActivities = [...prev];
            newActivities.forEach((newActivity) => {
              if (
                !uniqueActivities.some(
                  (existing) => existing.id === newActivity.id
                )
              ) {
                uniqueActivities.push(newActivity);
              }
            });
            return uniqueActivities;
          });
        }

        // Update oldestDate for pagination
        if (response.transactions.length > 0) {
          const lastTransaction =
            response.transactions[response.transactions.length - 1];
          setOldestDate(lastTransaction.date);
        }

        // Check if we have more data
        setHasMoreData(response.transactions.length > 0);
      } catch (error) {
        console.error("Error loading transactions:", error);
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [currentHouse, user, oldestDate, hasMoreData]
  );

  useEffect(() => {
    loadTransactions();
  }, []);

  const [isLoadingMoreDebounced, setIsLoadingMoreDebounced] = useState(false);

  const handleLoadMore = () => {
    if (!loadingMore && !isLoadingMoreDebounced && hasMoreData) {
      setIsLoadingMoreDebounced(true);
      setLoadingMore(true);

      // Add a small delay to prevent rapid consecutive calls
      setTimeout(() => {
        loadTransactions().finally(() => {
          // Reset the debounce after a delay
          setTimeout(() => {
            setIsLoadingMoreDebounced(false);
          }, 1000);
        });
      }, 300);
    }
  };

  const handleRefresh = () => {
    if (!refreshing) {
      loadTransactions(true);
    }
  };

  const renderActivityItem = ({ item }: { item: ActivityItem }) => (
    <TouchableOpacity
      style={styles.activityItem}
      onPress={() => {
        setSelectedTransaction(item.transaction);
        setModalVisible(true);
      }}
    >
      <View style={styles.activityIcon}>
        <Ionicons
          name={getActivityIcon(item.type)}
          size={20}
          color={COLORS.TEXT_SECONDARY}
        />
      </View>
      <View style={styles.activityDetails}>
        <Text style={styles.activityDescription}>{item.description}</Text>
        <Text style={styles.activityMeta}>
          {item.type === "expense" && item.user
            ? `${item.user} • ${item.time}`
            : item.time}
        </Text>
      </View>
      {item.amount && (
        <View style={{ alignItems: "flex-end" }}>
          <Text
            style={[
              styles.activityAmount,
              {
                color:
                  item.amountColor === "red"
                    ? COLORS.ERROR
                    : item.amountColor === "green"
                    ? COLORS.SUCCESS
                    : COLORS.TEXT_PRIMARY,
              },
            ]}
          >
            {item.type === "expense" && item.involvesMe && item.userShare
              ? formatAmount(item.userShare)
              : formatAmount(item.amount)}
          </Text>
          {item.type === "expense" && item.involvesMe && (
            <Text style={[styles.activityMeta, { fontSize: 12 }]}>
              of {formatAmount(item.amount)}
            </Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={COLORS.TEXT_SECONDARY} />
      </View>
    );
  };

  if (loading && activities.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.TEXT_PRIMARY} />
          </TouchableOpacity>
          <Text style={styles.title}>House Transaction History</Text>
        </View>
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={COLORS.TEXT_SECONDARY} />
          <Text style={styles.emptyText}>Loading transactions...</Text>
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
        <Text style={styles.title}>House Transaction History</Text>
      </View>

      {activities.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="receipt-outline"
            size={64}
            color={COLORS.TEXT_SECONDARY}
          />
          <Text style={styles.emptyText}>No transactions found</Text>
        </View>
      ) : (
        <FlatList
          data={activities}
          renderItem={renderActivityItem}
          keyExtractor={(item) => item.id}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          initialNumToRender={10}
          windowSize={5}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[COLORS.TEXT_SECONDARY]}
            />
          }
          ListFooterComponent={renderFooter}
        />
      )}

      <TransactionDetailModal
        visible={modalVisible}
        transaction={selectedTransaction}
        onClose={() => {
          setModalVisible(false);
          setSelectedTransaction(null);
        }}
        currentUserId={user?.id}
      />
    </SafeAreaView>
  );
}
