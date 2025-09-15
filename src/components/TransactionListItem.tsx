import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useUserTheme } from "../hooks/useUserTheme";
import { Transaction } from "../types/transactions";

interface TransactionListItemProps {
  transaction: Transaction;
  currentUserId?: string;
  onPress: () => void;
}

const createDynamicStyles = (colors: any) =>
  StyleSheet.create({
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
  });

export default function TransactionListItem({
  transaction,
  currentUserId,
  onPress,
}: TransactionListItemProps) {
  const { COLORS } = useUserTheme();
  const styles = createDynamicStyles(COLORS);

  const formatAmount = (amount: number | undefined) => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return "$0.00";
    }
    return `$${amount.toFixed(2)}`;
  };

  const formatRelativeTime = (dateString: string): string => {
    let date: Date;

    // Handle date-only strings (YYYY-MM-DD) as local dates to avoid timezone issues
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      const [year, month, day] = dateString.split('-').map(Number);
      date = new Date(year, month - 1, day); // month is 0-indexed
    } else {
      date = new Date(dateString);
    }

    const now = new Date();

    // For date-only comparisons, compare just the date parts
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const nowOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const diffInMs = nowOnly.getTime() - dateOnly.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return "Today";
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

  const generateTransactionDescription = () => {
    if (transaction.type === "expense") {
      const createdByName =
        transaction.createdBy?.displayName ||
        transaction.createdBy?.firstName ||
        "Unknown";
      const iCreatedExpense = transaction.createdBy?.id === currentUserId;
      const createdByDisplayName = iCreatedExpense ? "You" : createdByName;
      const iAmInvolved =
        transaction.splitBetween?.some((u) => u.id === currentUserId) || false;

      // Handle different split scenarios
      let userDescription = "";

      if (!iAmInvolved) {
        // I'm not involved in the split at all
        const allParticipants = transaction.splitBetween?.map(
          (u) => u.displayName || u.firstName || "Unknown"
        ) || [];

        if (allParticipants.length === 1) {
          userDescription = `${createdByDisplayName} recorded an expense for ${allParticipants[0]}`;
        } else {
          const participantList = allParticipants.length === 2
            ? `${allParticipants[0]} and ${allParticipants[1]}`
            : allParticipants.length === 3
            ? `${allParticipants[0]}, ${allParticipants[1]} and ${allParticipants[2]}`
            : `${allParticipants[0]}, ${allParticipants[1]} and ${allParticipants.length - 2} others`;
          userDescription = `${createdByDisplayName} split with ${participantList}`;
        }
      } else if (iCreatedExpense) {
        // I created the expense and am involved
        const othersInSplit = transaction.splitBetween?.filter((u) => u.id !== currentUserId) || [];

        if (othersInSplit.length === 0) {
          // Only me in the split
          userDescription = "You recorded an expense for yourself";
        } else {
          // Check if I'm actually in the split or just charged others
          const iInSplit = transaction.splitBetween?.some((u) => u.id === currentUserId) || false;

          const otherNames = othersInSplit.map(
            (u) => u.displayName || u.firstName || "Unknown"
          );

          const otherList = otherNames.length === 1
            ? otherNames[0]
            : otherNames.length === 2
            ? `${otherNames[0]} and ${otherNames[1]}`
            : otherNames.length === 3
            ? `${otherNames[0]}, ${otherNames[1]} and ${otherNames[2]}`
            : `${otherNames[0]}, ${otherNames[1]} and ${otherNames.length - 2} others`;

          // If I'm in the split, use "split with", otherwise use "charged"
          userDescription = iInSplit
            ? `You split with ${otherList}`
            : `You charged ${otherList}`;
        }
      } else {
        // Someone else created the expense and I'm involved
        const othersInSplit = transaction.splitBetween?.filter(
          (u) => u.id !== currentUserId && u.id !== transaction.createdBy?.id
        ) || [];

        if (othersInSplit.length === 0) {
          // Just me and the creator
          userDescription = `${createdByDisplayName} split with you`;
        } else {
          // Me, creator, and others - don't include creator in the "split with" list
          const otherNames = othersInSplit.map(
            (u) => u.displayName || u.firstName || "Unknown"
          );

          const otherList = otherNames.length === 1
            ? `you and ${otherNames[0]}`
            : otherNames.length === 2
            ? `you, ${otherNames[0]} and ${otherNames[1]}`
            : `you, ${otherNames[0]} and ${otherNames.length} others`;

          userDescription = `${createdByDisplayName} split with ${otherList}`;
        }
      }

      return userDescription;
    } else {
      // Payment description
      const fromName =
        transaction.fromUser?.displayName ||
        transaction.fromUser?.firstName ||
        "Unknown";
      const toName =
        transaction.toUser?.displayName ||
        transaction.toUser?.firstName ||
        "Unknown";
      const iAmPaying = transaction.fromUser?.id === currentUserId;
      const iAmReceiving = transaction.toUser?.id === currentUserId;

      const displayFromName = iAmPaying ? "You" : fromName;
      const displayToName = iAmReceiving ? "you" : toName;

      return displayFromName;
    }
  };

  const getAmountColor = () => {
    if (transaction.type === "expense") {
      const iAmInvolved =
        transaction.splitBetween?.some((u) => u.id === currentUserId) || false;
      return iAmInvolved ? COLORS.ERROR : COLORS.TEXT_PRIMARY;
    } else {
      const iAmReceiving = transaction.toUser?.id === currentUserId;
      const iAmPaying = transaction.fromUser?.id === currentUserId;

      if (iAmReceiving) return COLORS.SUCCESS;
      if (iAmPaying) return COLORS.ERROR;
      return COLORS.TEXT_PRIMARY;
    }
  };

  const getDisplayAmount = () => {
    if (transaction.type === "expense") {
      const iAmInvolved =
        transaction.splitBetween?.some((u) => u.id === currentUserId) || false;
      const userShare = transaction.userShare || 0;

      return iAmInvolved && userShare > 0
        ? formatAmount(userShare)
        : formatAmount(transaction.amount);
    }
    return formatAmount(transaction.amount);
  };

  const showUserShareDetails = () => {
    return transaction.type === "expense" &&
           transaction.splitBetween?.some((u) => u.id === currentUserId) &&
           (transaction.userShare || 0) > 0;
  };

  const userDescription = generateTransactionDescription();
  const timeString = formatRelativeTime(transaction.date);

  return (
    <TouchableOpacity style={styles.activityItem} onPress={onPress}>
      <View style={styles.activityIcon}>
        <Ionicons
          name={getActivityIcon(transaction.type)}
          size={20}
          color={COLORS.TEXT_SECONDARY}
        />
      </View>
      <View style={styles.activityDetails}>
        <Text style={styles.activityDescription}>
          {transaction.type === "expense" ? "Expense" : ""}: {transaction.description}
        </Text>
        <Text style={styles.activityMeta}>
          {transaction.type === "expense" && userDescription
            ? `${userDescription} • ${timeString}`
            : transaction.type === "payment"
            ? `${userDescription} paid ${transaction.toUser?.id === currentUserId ? "you" : transaction.toUser?.displayName || transaction.toUser?.firstName}: ${transaction.description} • ${timeString}`
            : timeString
          }
        </Text>
      </View>
      <View style={{ alignItems: "flex-end" }}>
        <Text style={[styles.activityAmount, { color: getAmountColor() }]}>
          {getDisplayAmount()}
        </Text>
        {showUserShareDetails() && (
          <Text style={[styles.activityMeta, { fontSize: 12 }]}>
            of {formatAmount(transaction.amount)}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}