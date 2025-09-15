import React from "react";
import { View, Text, StyleSheet, Image, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StackNavigationProp } from "@react-navigation/stack";

import { Button } from "../../components/UI";
import { RootStackParamList } from "../../types/navigation";
import { NAVIGATION_ROUTES } from "../../constants";
import { useUserTheme } from "../../hooks/useUserTheme";
import { useAuth } from "../../context/AuthContext";

type HouseSelectionScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "HouseSelection"
>;

interface Props {
  navigation: HouseSelectionScreenNavigationProp;
}

const createDynamicStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.BACKGROUND,
    },
    logoutButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      marginTop: 20,
      backgroundColor: colors.ERROR,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
    },
    content: {
      flex: 1,
      paddingHorizontal: 24,
      paddingVertical: 32,
    },
    header: {
      alignItems: "center",
      marginBottom: 48,
    },
    iconContainer: {
      width: 80,
      height: 80,
      backgroundColor: colors.PRIMARY,
      borderRadius: 40,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 24,
    },
    icon: {
      fontSize: 36,
    },
    title: {
      fontSize: 28,
      fontWeight: "700",
      color: colors.TEXT_PRIMARY,
      textAlign: "center",
      marginBottom: 12,
    },
    subtitle: {
      fontSize: 16,
      color: colors.TEXT_SECONDARY,
      textAlign: "center",
      lineHeight: 22,
    },
    optionsContainer: {
      flex: 1,
    },
    optionCard: {
      backgroundColor: colors.CARD_BACKGROUND,
      borderRadius: 12,
      padding: 24,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.BORDER_LIGHT,
    },
    optionIcon: {
      fontSize: 32,
      marginBottom: 16,
    },
    optionTitle: {
      fontSize: 20,
      fontWeight: "600",
      color: colors.TEXT_PRIMARY,
      marginBottom: 8,
      textAlign: "center",
    },
    optionDescription: {
      fontSize: 14,
      color: colors.TEXT_SECONDARY,
      textAlign: "center",
      lineHeight: 20,
      marginBottom: 20,
    },
    optionButton: {
      minWidth: 140,
    },
    divider: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: 32,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.BORDER_LIGHT,
    },
    dividerText: {
      fontSize: 14,
      color: colors.TEXT_SECONDARY,
      paddingHorizontal: 16,
      fontWeight: "500",
    },
    infoBox: {
      backgroundColor: colors.CARD_BACKGROUND,
      borderRadius: 8,
      padding: 16,
      borderLeftWidth: 4,
      borderLeftColor: colors.PRIMARY,
      marginTop: 24,
    },
    infoText: {
      fontSize: 14,
      color: colors.TEXT_SECONDARY,
      lineHeight: 20,
      textAlign: "center",
    },
  });

export default function HouseSelectionScreen({ navigation }: Props) {
  const { logout } = useAuth();
  const { COLORS } = useUserTheme();
  const styles = createDynamicStyles(COLORS);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>🏠</Text>
            </View>
            <Text style={styles.title}>Welcome to RoomieSync!</Text>
            <Text style={styles.subtitle}>
              To get started, you'll need to either create a new house or join
              an existing one.
            </Text>
          </View>

          <View style={styles.optionsContainer}>
            <View style={styles.optionCard}>
              <Text style={styles.optionIcon}>✨</Text>
              <Text style={styles.optionTitle}>Create New House</Text>
              <Text style={styles.optionDescription}>
                Start a new shared house and invite your roommates to join
              </Text>
              <Button
                title="Create House"
                onPress={() =>
                  navigation.navigate(NAVIGATION_ROUTES.CREATE_HOUSE as any)
                }
                style={styles.optionButton}
              />
            </View>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.optionCard}>
              <Text style={styles.optionIcon}>🔑</Text>
              <Text style={styles.optionTitle}>Join Existing House</Text>
              <Text style={styles.optionDescription}>
                Use an invite code to join a house that's already set up
              </Text>
              <Button
                title="Join House"
                onPress={() =>
                  navigation.navigate(NAVIGATION_ROUTES.JOIN_HOUSE as any)
                }
                variant="outline"
                style={styles.optionButton}
              />
            </View>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              💡 You can always create or join additional houses later from your
              profile settings.
            </Text>
          </View>
          <View>
            <Button
              title="🚪 Logout"
              onPress={handleLogout}
              style={styles.logoutButton}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
