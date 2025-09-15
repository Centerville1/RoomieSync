import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";

import { useUserTheme } from "../hooks/useUserTheme";
import { Transaction } from "../types/transactions";
import { Avatar } from "./UI";

interface TransactionDetailModalProps {
  visible: boolean;
  transaction: Transaction | null;
  onClose: () => void;
  currentUserId?: string;
}

const { height: screenHeight } = Dimensions.get("window");

const createDynamicStyles = (colors: any) =>
  StyleSheet.create({
    modalOverlay: {
      flex: 1,
      justifyContent: "flex-end",
    },
    modalContent: {
      backgroundColor: colors.CARD_BACKGROUND,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: screenHeight * 0.8,
      minHeight: screenHeight * 0.4,
    },
    dragHandle: {
      width: 40,
      height: 4,
      backgroundColor: colors.TEXT_LIGHT,
      borderRadius: 2,
      alignSelf: "center",
      marginTop: 12,
      marginBottom: 20,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingBottom: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.BORDER_LIGHT,
    },
    title: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.TEXT_PRIMARY,
      flex: 1,
    },
    closeButton: {
      padding: 8,
    },
    scrollContent: {
      paddingBottom: 20,
    },
    section: {
      paddingHorizontal: 20,
      paddingVertical: 16,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.TEXT_PRIMARY,
      marginBottom: 12,
    },
    infoRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    infoLabel: {
      fontSize: 14,
      color: colors.TEXT_SECONDARY,
      flex: 1,
    },
    infoValue: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.TEXT_PRIMARY,
      flex: 2,
      textAlign: "right",
    },
    participantRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },
    participantInfo: {
      flex: 1,
      marginLeft: 12,
    },
    participantName: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.TEXT_PRIMARY,
    },
    participantAmount: {
      fontSize: 14,
      color: colors.TEXT_SECONDARY,
    },
    totalAmount: {
      fontSize: 24,
      fontWeight: "700",
      textAlign: "center",
      marginVertical: 16,
    },
    divider: {
      height: 1,
      backgroundColor: colors.BORDER_LIGHT,
      marginHorizontal: 20,
    },
    categoryBadge: {
      backgroundColor: colors.BACKGROUND_LIGHT,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      alignSelf: "flex-start",
    },
    categoryText: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.TEXT_PRIMARY,
    },
  });

export default function TransactionDetailModal({
  visible,
  transaction,
  onClose,
  currentUserId,
}: TransactionDetailModalProps) {
  const { COLORS } = useUserTheme();
  const styles = createDynamicStyles(COLORS);

  if (!transaction) return null;

  const formatAmount = (amount: number) => `$${amount.toFixed(2)}`;

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const isExpense = transaction.type === "expense";
  const currentUserShare = transaction.userShare || 0;
  const currentUserInvolved = isExpense
    ? transaction.splitBetween?.some((u) => u.id === currentUserId)
    : transaction.fromUser?.id === currentUserId ||
      transaction.toUser?.id === currentUserId;

  const amountColor = isExpense
    ? currentUserInvolved
      ? COLORS.ERROR
      : COLORS.TEXT_PRIMARY
    : transaction.toUser?.id === currentUserId
    ? COLORS.SUCCESS
    : transaction.fromUser?.id === currentUserId
    ? COLORS.ERROR
    : COLORS.TEXT_PRIMARY;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <BlurView intensity={20} style={StyleSheet.absoluteFill} />

        <TouchableOpacity
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
          style={styles.modalContent}
        >
          <View style={styles.dragHandle} />

          <View style={styles.header}>
            <Text style={styles.title}>
              {isExpense ? "Expense Details" : "Payment Details"}
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color={COLORS.TEXT_SECONDARY} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Amount Section */}
            <View style={styles.section}>
              <Text style={[styles.totalAmount, { color: amountColor }]}>
                {isExpense && currentUserInvolved && currentUserShare > 0
                  ? formatAmount(currentUserShare)
                  : formatAmount(transaction.amount)}
              </Text>
              {isExpense && currentUserInvolved && currentUserShare > 0 && (
                <Text
                  style={[
                    styles.infoValue,
                    { textAlign: "center", marginTop: -8 },
                  ]}
                >
                  of {formatAmount(transaction.amount)} total
                </Text>
              )}
            </View>

            <View style={styles.divider} />

            {/* Basic Info Section */}
            <View style={styles.section}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Description</Text>
                <Text style={styles.infoValue}>{transaction.description}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Date & Time</Text>
                <Text style={styles.infoValue}>
                  {formatDateTime(transaction.date)}
                </Text>
              </View>

              {isExpense ? (
                <>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Paid by</Text>
                    <Text style={styles.infoValue}>
                      {transaction.createdBy?.id === currentUserId
                        ? "You"
                        : transaction.createdBy?.displayName ||
                          transaction.createdBy?.firstName ||
                          "Unknown"}
                    </Text>
                  </View>

                  {transaction.category && (
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Category</Text>
                      <View style={styles.categoryBadge}>
                        <Text style={styles.categoryText}>
                          {transaction.category}
                        </Text>
                      </View>
                    </View>
                  )}
                </>
              ) : (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Type</Text>
                  <Text style={styles.infoValue}>Payment</Text>
                </View>
              )}
            </View>

            {/* Split Details for Expenses */}
            {isExpense &&
              transaction.splitBetween &&
              transaction.splitBetween.length > 0 && (
                <>
                  <View style={styles.divider} />
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Split Between</Text>
                    {transaction.splitBetween.map((user, index) => {
                      const isCurrentUser = user.id === currentUserId;
                      const userAmount =
                        transaction.amount /
                        (transaction.splitBetween?.length || 1);

                      return (
                        <View
                          key={`${transaction.id}-${user.id}-${index}`}
                          style={styles.participantRow}
                        >
                          <Avatar
                            name={`${user.firstName} ${user.lastName}`}
                            imageUrl={user.profileImageUrl}
                            color={user.color}
                            size="small"
                          />
                          <View style={styles.participantInfo}>
                            <Text style={styles.participantName}>
                              {isCurrentUser
                                ? "You"
                                : user.displayName || user.firstName}
                            </Text>
                            <Text style={styles.participantAmount}>
                              {formatAmount(userAmount)}
                            </Text>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </>
              )}

            {/* Payment Details */}
            {!isExpense && (
              <>
                <View style={styles.divider} />
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Payment Details</Text>

                  <View style={styles.participantRow}>
                    <Avatar
                      name={`${transaction.fromUser?.firstName} ${transaction.fromUser?.lastName}`}
                      imageUrl={transaction.fromUser?.profileImageUrl}
                      color={transaction.fromUser?.color}
                      size="small"
                    />
                    <View style={styles.participantInfo}>
                      <Text style={styles.participantName}>
                        {transaction.fromUser?.id === currentUserId
                          ? "You"
                          : transaction.fromUser?.displayName ||
                            transaction.fromUser?.firstName}{" "}
                        (Paid)
                      </Text>
                      <Text style={styles.participantAmount}>Sender</Text>
                    </View>
                  </View>

                  <View style={{ marginVertical: 8, alignItems: "center" }}>
                    <Ionicons
                      name="arrow-down"
                      size={24}
                      color={COLORS.TEXT_SECONDARY}
                    />
                  </View>

                  <View style={styles.participantRow}>
                    <Avatar
                      name={`${transaction.toUser?.firstName} ${transaction.toUser?.lastName}`}
                      imageUrl={transaction.toUser?.profileImageUrl}
                      color={transaction.toUser?.color}
                      size="small"
                    />
                    <View style={styles.participantInfo}>
                      <Text style={styles.participantName}>
                        {transaction.toUser?.id === currentUserId
                          ? "You"
                          : transaction.toUser?.displayName ||
                            transaction.toUser?.firstName}{" "}
                        (Received)
                      </Text>
                      <Text style={styles.participantAmount}>Recipient</Text>
                    </View>
                  </View>
                </View>
              </>
            )}

            {/* TODO: Shopping Items Section - for expenses that came from shopping lists */}
            {/* This would require additional data from the API about which shopping items were included */}
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
