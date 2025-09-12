import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Avatar } from "../../components/UI";
import { useHouse } from "../../context/HouseContext";
import { paymentService } from "../../services/paymentService";
import { useAuth } from "../../context/AuthContext";

interface PaymentScreenProps {
  navigation?: any;
  route?: {
    params?: {
      userId?: string;
    };
  };
}

const PaymentScreen: React.FC<PaymentScreenProps> = ({ navigation, route }) => {
  const [iouBalance, setIouBalance] = useState<number | null>(null);
  const { currentHouse } = useHouse();
  const { user } = useAuth();
  const [members, setMembers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(
    route?.params?.userId || null
  );
  const [amount, setAmount] = useState<string>("");
  const [memo, setMemo] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentHouse?.members) {
      setMembers(currentHouse.members);
      // Preselect user if passed in route params
      if (route?.params?.userId) {
        setSelectedUserId(route.params.userId);
      }
    }
  }, [currentHouse, route?.params?.userId]);

  // Update IOU balance whenever selectedUserId changes
  useEffect(() => {
    if (currentHouse?.id && selectedUserId && members.length > 0) {
      import("../../services/balanceService").then(({ balanceService }) => {
        balanceService
          .getUserBalancesByHouseId(currentHouse.id)
          .then((balances) => {
            const match = balances.find(
              (b: any) => b.type === "owes" && b.otherUser.id === selectedUserId
            );
            setIouBalance(match ? match.amount : null);
          });
      });
    } else {
      setIouBalance(null);
    }
  }, [currentHouse?.id, selectedUserId, members.length]);

  // Update IOU balance whenever selectedUserId changes
  useEffect(() => {
    if (currentHouse?.id && selectedUserId && members.length > 0) {
      import("../../services/balanceService").then(({ balanceService }) => {
        balanceService
          .getUserBalancesByHouseId(currentHouse.id)
          .then((balances) => {
            const match = balances.find(
              (b: any) => b.type === "owes" && b.otherUser.id === selectedUserId
            );
            setIouBalance(match ? match.amount : null);
          });
      });
    } else {
      setIouBalance(null);
    }
  }, [currentHouse?.id, selectedUserId, members.length]);

  const handleSubmitPayment = async () => {
    if (!selectedUserId) {
      Alert.alert("Missing User", "Please select a user to pay.");
      return;
    }
    const paymentAmount = parseFloat(amount);
    if (!paymentAmount || paymentAmount <= 0) {
      Alert.alert(
        "Invalid Amount",
        "Please enter a valid amount greater than 0."
      );
      return;
    }
    setLoading(true);
    try {
      if (currentHouse?.id === undefined || !user) {
        throw new Error("No house or user selected.");
      }
      // Find the full user object from members
      const selectedMember = members.find(
        (member) => member.user?.id === selectedUserId
      );
      if (!selectedMember || !selectedMember.user) {
        throw new Error("Selected user not found.");
      }
      const paymentPayload = {
        toUser: selectedMember.user,
        fromUser: user,
        house: currentHouse,
        amount: paymentAmount,
        memo,
        paymentDate: new Date().toISOString().slice(0, 10),
      };
      console.log("Payment payload:", paymentPayload);
      await paymentService.createPayment(currentHouse.id, paymentPayload);
      navigation.goBack();
      setTimeout(() => {
        setLoading(false);
        Alert.alert("Success", "Payment recorded successfully.");
      }, 1000);
    } catch (error: any) {
      setLoading(false);
      console.error("Payment error:", error);
      Alert.alert(
        "Error",
        `Failed to record payment. ${error?.message || "Please try again."}`
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Record Payment</Text>
        <View style={styles.content}>
          <Text style={styles.label}>Select user to pay:</Text>
          {selectedUserId &&
            (iouBalance !== null && iouBalance > 0 ? (
              <Text style={styles.iouText}>
                You owe this person: ${iouBalance.toFixed(2)}
              </Text>
            ) : (
              <Text style={styles.iouText}>
                You don't owe this person anything
              </Text>
            ))}
          {members.map((member) => (
            <TouchableOpacity
              key={member.id}
              style={[
                styles.radioButton,
                selectedUserId === member.user?.id && styles.radioSelected,
              ]}
              onPress={() => setSelectedUserId(member.user?.id)}
            >
              <Avatar
                name={member.user?.firstName || member.displayName}
                imageUrl={member.user?.profileImageUrl}
                color={member.user?.color}
                size="small"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.radioText}>{member.displayName}</Text>
            </TouchableOpacity>
          ))}

          <Text style={styles.label}>Amount:</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="Enter amount"
            value={amount}
            onChangeText={setAmount}
          />

          <Text style={styles.label}>Memo (optional):</Text>
          <TextInput
            style={styles.input}
            placeholder="Add a note"
            value={memo}
            onChangeText={setMemo}
          />

          {loading ? (
            <ActivityIndicator
              size="large"
              color="#6366F1"
              style={{ marginTop: 16 }}
            />
          ) : (
            <Button
              title="Record Payment"
              onPress={handleSubmitPayment}
              disabled={!selectedUserId || !amount}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  iouText: {
    fontSize: 16,
    color: "#EF4444",
    fontWeight: "bold",
    marginBottom: 8,
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
  },
  content: {
    flex: 1,
    justifyContent: "center",
  },
  label: { fontSize: 16, marginTop: 16, marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 8,
  },
  radioButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 8,
  },
  radioSelected: {
    borderColor: "#6366F1",
    backgroundColor: "#EEF2FF",
  },
  radioText: { fontSize: 16 },
});

export default PaymentScreen;
