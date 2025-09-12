import React from "react";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { HouseProvider } from "./src/context/HouseContext";
import { ThemeProvider, useTheme } from "./src/context/ThemeContext";
import RootNavigator from "./src/navigation/RootNavigator";
import { useUserTheme } from "./src/hooks/useUserTheme";

const createDynamicStyles = (COLORS: any) =>
  StyleSheet.create({
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: COLORS.BACKGROUND,
    },
  });

function AppContent() {
  const { isLoading } = useAuth();
  const { COLORS } = useUserTheme();
  const styles = createDynamicStyles(COLORS);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
      </View>
    );
  }

  return (
    <>
      <RootNavigator />
      <StatusBar style="light" backgroundColor={COLORS.PRIMARY} />
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <HouseProvider>
            <AppContent />
          </HouseProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
