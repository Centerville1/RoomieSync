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

import { Button, Input } from "../../components/UI";
import { useAuth } from "../../context/AuthContext";
import { useUserTheme } from "../../hooks/useUserTheme";
import { RootStackParamList } from "../../types/navigation";
import { NAVIGATION_ROUTES, VALIDATION } from "../../constants";

type LoginScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Login"
>;

interface Props {
  navigation: LoginScreenNavigationProp;
}

const createDynamicStyles = (COLORS: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.BACKGROUND,
    },
    content: {
      flex: 1,
      paddingHorizontal: 24,
    },
    header: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingBottom: 32,
    },
    title: {
      fontSize: 32,
      fontWeight: "700",
      color: "#111827",
      textAlign: "center",
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: "#6B7280",
      textAlign: "center",
    },
    form: {
      flex: 2,
    },
    loginButton: {
      marginTop: 24,
    },
    footer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginTop: 32,
    },
    footerText: {
      fontSize: 16,
      color: "#6B7280",
    },
    linkText: {
      fontSize: 16,
      color: "#FF6B35",
      fontWeight: "600",
    },
  });

export default function LoginScreen({ navigation }: Props) {
  const { login, isLoading } = useAuth();
  const { COLORS, primaryColor } = useUserTheme();
  const styles = createDynamicStyles(COLORS);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!password.trim()) {
      newErrors.password = "Password is required";
    } else if (password.length < VALIDATION.PASSWORD_MIN_LENGTH) {
      newErrors.password = `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      await login({ email: email.trim(), password });
    } catch (error: any) {
      Alert.alert(
        "Login Failed",
        error.response?.data?.message || "An error occurred during login"
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Welcome to RoomieSync</Text>
          <Text style={styles.subtitle}>
            Sign in to manage your shared expenses
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon="mail"
            error={errors.email}
          />

          <Input
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            error={errors.password}
          />

          <Button
            title="Sign In"
            onPress={handleLogin}
            loading={isLoading}
            style={styles.loginButton}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate(NAVIGATION_ROUTES.REGISTER)}
            >
              <Text style={styles.linkText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
