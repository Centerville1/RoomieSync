import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StackNavigationProp } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";

import { Button, Input } from "../../components/UI";
import { useUserTheme } from "../../hooks/useUserTheme";
import { authService } from "../../services/authService";
import { RootStackParamList } from "../../types/navigation";
import { NAVIGATION_ROUTES, VALIDATION } from "../../constants";

type ForgotPasswordScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "ForgotPassword"
>;

interface Props {
  navigation: ForgotPasswordScreenNavigationProp;
}

const createDynamicStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.BACKGROUND,
    },
    content: {
      flex: 1,
      paddingHorizontal: 24,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingTop: 16,
      paddingBottom: 32,
    },
    backButton: {
      padding: 8,
      marginLeft: -8,
    },
    headerSpacer: {
      flex: 1,
    },
    titleSection: {
      paddingBottom: 32,
    },
    title: {
      fontSize: 32,
      fontWeight: "700",
      color: colors.TEXT_PRIMARY,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: colors.TEXT_SECONDARY,
      lineHeight: 22,
    },
    form: {
      flex: 1,
    },
    inputGroup: {
      marginBottom: 24,
    },
    actions: {
      paddingBottom: 32,
    },
    primaryButton: {
      marginBottom: 16,
    },
    footer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      paddingBottom: 16,
    },
    footerText: {
      fontSize: 16,
      color: colors.TEXT_SECONDARY,
    },
    footerLink: {
      fontSize: 16,
      color: colors.PRIMARY,
      fontWeight: "600",
      marginLeft: 4,
    },
  });

export default function ForgotPasswordScreen({ navigation }: Props) {
  const { COLORS } = useUserTheme();
  const styles = createDynamicStyles(COLORS);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string): boolean => {
    return VALIDATION.EMAIL_REGEX.test(email);
  };

  const handleRequestReset = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }

    if (!validateEmail(email.trim())) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      const response = await authService.requestPasswordReset(email.trim());

      Alert.alert(
        "Check Your Email",
        response.message,
        [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      console.error("Password reset request error:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Network error. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleBackToLogin = () => {
    navigation.navigate(NAVIGATION_ROUTES.LOGIN);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={COLORS.TEXT_PRIMARY} />
            </TouchableOpacity>
            <View style={styles.headerSpacer} />
          </View>

          {/* Title */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>Forgot Password?</Text>
            <Text style={styles.subtitle}>
              No worries! Enter your email address below and we'll send you a link to reset your password.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Input
                label="Email Address"
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                returnKeyType="done"
                onSubmitEditing={handleRequestReset}
              />
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <Button
              title={loading ? "Sending..." : "Send Reset Link"}
              onPress={handleRequestReset}
              disabled={loading}
              style={styles.primaryButton}
            />

            {/* Back to Login */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Remember your password?</Text>
              <TouchableOpacity onPress={handleBackToLogin}>
                <Text style={styles.footerLink}>Back to Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}