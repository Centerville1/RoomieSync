import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";

import { Button, Input } from "../../components/UI";
import { useUserTheme } from "../../hooks/useUserTheme";
import { authService } from "../../services/authService";
import { RootStackParamList } from "../../types/navigation";
import { NAVIGATION_ROUTES } from "../../constants";

type ResetPasswordScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "ResetPassword"
>;

type ResetPasswordScreenRouteProp = RouteProp<RootStackParamList, "ResetPassword">;

interface Props {
  navigation: ResetPasswordScreenNavigationProp;
  route: ResetPasswordScreenRouteProp;
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
      justifyContent: "center",
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
      textAlign: "center",
    },
    titleSection: {
      marginBottom: 32,
      alignItems: "center",
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
      lineHeight: 22,
    },
    form: {
      marginBottom: 32,
    },
    inputGroup: {
      marginBottom: 20,
    },
    passwordRequirements: {
      backgroundColor: colors.BACKGROUND_LIGHT,
      borderRadius: 8,
      padding: 16,
      marginBottom: 24,
    },
    requirementsTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.TEXT_PRIMARY,
      marginBottom: 8,
    },
    requirement: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 4,
    },
    requirementText: {
      fontSize: 14,
      color: colors.TEXT_SECONDARY,
      marginLeft: 8,
    },
    requirementMet: {
      color: colors.SUCCESS,
    },
    actions: {
      marginBottom: 32,
    },
  });

export default function ResetPasswordScreen({ navigation, route }: Props) {
  const { COLORS } = useUserTheme();
  const styles = createDynamicStyles(COLORS);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);

  // Extract token from deep link parameters or route params
  const token = route.params?.token;

  useEffect(() => {
    if (!token) {
      Alert.alert("Error", "Invalid reset link", [
        {
          text: "OK",
          onPress: () => navigation.navigate(NAVIGATION_ROUTES.LOGIN),
        },
      ]);
      return;
    }

    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    try {
      setVerifying(true);
      const response = await authService.verifyResetToken(token);

      if (!response.valid) {
        Alert.alert("Error", "This reset link has expired or is invalid", [
          {
            text: "OK",
            onPress: () => navigation.navigate(NAVIGATION_ROUTES.LOGIN),
          },
        ]);
      }
    } catch (error: any) {
      console.error("Token verification error:", error);
      Alert.alert("Error", "Unable to verify reset link", [
        {
          text: "OK",
          onPress: () => navigation.navigate(NAVIGATION_ROUTES.LOGIN),
        },
      ]);
    } finally {
      setVerifying(false);
    }
  };

  const validatePassword = (password: string) => {
    const requirements = {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[@$!%*?&]/.test(password),
    };

    return requirements;
  };

  const passwordRequirements = validatePassword(password);
  const isPasswordValid = Object.values(passwordRequirements).every(Boolean);

  const handleResetPassword = async () => {
    if (!isPasswordValid) {
      Alert.alert("Error", "Please ensure your password meets all requirements");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await authService.resetPassword(token, password);

      Alert.alert("Success", response.message, [
        {
          text: "OK",
          onPress: () => navigation.navigate(NAVIGATION_ROUTES.LOGIN),
        },
      ]);
    } catch (error: any) {
      console.error("Password reset error:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to reset password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
          <Text style={styles.loadingText}>Verifying reset link...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.content}>
          {/* Title */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>Reset Your Password</Text>
            <Text style={styles.subtitle}>
              Enter your new password below
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Input
                label="New Password"
                value={password}
                onChangeText={setPassword}
                placeholder="Enter new password"
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Input
                label="Confirm New Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm new password"
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            {/* Password Requirements */}
            <View style={styles.passwordRequirements}>
              <Text style={styles.requirementsTitle}>Password Requirements:</Text>

              <View style={styles.requirement}>
                <Text style={passwordRequirements.minLength ? styles.requirementMet : {}}>
                  {passwordRequirements.minLength ? "✓" : "○"}
                </Text>
                <Text style={[
                  styles.requirementText,
                  passwordRequirements.minLength && styles.requirementMet
                ]}>
                  At least 8 characters
                </Text>
              </View>

              <View style={styles.requirement}>
                <Text style={passwordRequirements.hasUppercase ? styles.requirementMet : {}}>
                  {passwordRequirements.hasUppercase ? "✓" : "○"}
                </Text>
                <Text style={[
                  styles.requirementText,
                  passwordRequirements.hasUppercase && styles.requirementMet
                ]}>
                  One uppercase letter
                </Text>
              </View>

              <View style={styles.requirement}>
                <Text style={passwordRequirements.hasLowercase ? styles.requirementMet : {}}>
                  {passwordRequirements.hasLowercase ? "✓" : "○"}
                </Text>
                <Text style={[
                  styles.requirementText,
                  passwordRequirements.hasLowercase && styles.requirementMet
                ]}>
                  One lowercase letter
                </Text>
              </View>

              <View style={styles.requirement}>
                <Text style={passwordRequirements.hasNumber ? styles.requirementMet : {}}>
                  {passwordRequirements.hasNumber ? "✓" : "○"}
                </Text>
                <Text style={[
                  styles.requirementText,
                  passwordRequirements.hasNumber && styles.requirementMet
                ]}>
                  One number
                </Text>
              </View>

              <View style={styles.requirement}>
                <Text style={passwordRequirements.hasSpecialChar ? styles.requirementMet : {}}>
                  {passwordRequirements.hasSpecialChar ? "✓" : "○"}
                </Text>
                <Text style={[
                  styles.requirementText,
                  passwordRequirements.hasSpecialChar && styles.requirementMet
                ]}>
                  One special character (@$!%*?&)
                </Text>
              </View>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <Button
              title={loading ? "Resetting..." : "Reset Password"}
              onPress={handleResetPassword}
              disabled={loading || !isPasswordValid || password !== confirmPassword}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}