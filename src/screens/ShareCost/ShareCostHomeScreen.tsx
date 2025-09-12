import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../components/UI";
import { useShoppingSelection } from "../../context/ShoppingSelectionContext";
import { useUserTheme } from "../../hooks/useUserTheme";

const createDynamicStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.BACKGROUND,
    },
    content: {
      flex: 1,
      padding: 24,
      justifyContent: "center",
    },
    title: {
      fontSize: 32,
      fontWeight: "700",
      color: colors.TEXT_PRIMARY,
      textAlign: "center",
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: colors.TEXT_SECONDARY,
      textAlign: "center",
      marginBottom: 48,
    },
    options: {
      gap: 16,
    },
    optionButton: {
      minHeight: 60,
    },
  });

export default function ShareCostHomeScreen({ navigation }: any) {
  const { selectedShoppingItems } = useShoppingSelection();
  const { COLORS } = useUserTheme();
  const styles = createDynamicStyles(COLORS);

  // No automatic redirects - let user choose their action

  const handleShoppingReceiptPress = () => {
    // Always go to split screen - users can select items there
    navigation.navigate("ShoppingCostSplit");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Share the Cost</Text>
        <Text style={styles.subtitle}>Split expenses with your roommates</Text>

        <View style={styles.options}>
          <Button
            title={
              selectedShoppingItems.length > 0
                ? `Split Shopping Receipt (${
                    selectedShoppingItems.length
                  } item${
                    selectedShoppingItems.length > 1 ? "s" : ""
                  } selected)`
                : "Split Shopping Receipt"
            }
            onPress={handleShoppingReceiptPress}
            style={styles.optionButton}
          />

          <Button
            title="Add Manual Expense"
            onPress={() => navigation.navigate("ManualExpense")}
            variant="outline"
            style={styles.optionButton}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
