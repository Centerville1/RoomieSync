import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";

import { Button, Input } from "../../components/UI";
import { useHouse } from "../../context/HouseContext";
import { RootStackParamList } from "../../types/navigation";
import { COLORS, VALIDATION, NAVIGATION_ROUTES } from "../../constants";
import { JoinHouseRequest } from "../../types/houses";
import { houseService } from "../../services/houseService";
import { ScrollView } from "react-native-gesture-handler";

type JoinHouseScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "JoinHouse"
>;
type JoinHouseScreenRouteProp = RouteProp<RootStackParamList, "JoinHouse">;

interface Props {
  navigation: JoinHouseScreenNavigationProp;
  route: JoinHouseScreenRouteProp;
}

export default function JoinHouseScreen({ navigation, route }: Props) {
  const { joinHouse, isLoading } = useHouse();
  const [formData, setFormData] = useState({
    inviteCode: "",
    displayName: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Pre-fill invite code if provided through navigation params
  useEffect(() => {
    if (route.params?.inviteCode) {
      setFormData((prev) => ({
        ...prev,
        inviteCode: route.params.inviteCode || "",
      }));
    }
  }, [route.params?.inviteCode]);

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate invite code
    if (!formData.inviteCode.trim()) {
      newErrors.inviteCode = "Invite code is required";
    } else if (!houseService.validateInviteCode(formData.inviteCode.trim())) {
      newErrors.inviteCode =
        "Invalid invite code format (should be 6-8 characters)";
    }

    // Validate display name
    if (!formData.displayName.trim()) {
      newErrors.displayName = "Display name is required";
    } else if (
      formData.displayName.trim().length < VALIDATION.DISPLAY_NAME_MIN_LENGTH
    ) {
      newErrors.displayName = `Display name must be at least ${VALIDATION.DISPLAY_NAME_MIN_LENGTH} characters`;
    } else if (
      formData.displayName.trim().length > VALIDATION.DISPLAY_NAME_MAX_LENGTH
    ) {
      newErrors.displayName = `Display name must be less than ${VALIDATION.DISPLAY_NAME_MAX_LENGTH} characters`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleJoinHouse = async () => {
    if (!validateForm()) return;

    try {
      const joinData: JoinHouseRequest = {
        inviteCode: formData.inviteCode.trim().toUpperCase(),
        displayName: formData.displayName.trim(),
      };

      const joinedHouse = await joinHouse(joinData);

      // Show success message and navigate to main app
      Alert.alert(
        "Welcome!",
        `You've successfully joined ${joinedHouse.name}. You can now start managing expenses together.`,
        [
          {
            text: "Continue",
            onPress: () => {
              // Navigation will be handled by the root navigator
              // based on the authentication state
            },
          },
        ]
      );
    } catch (error: any) {
      console.error("Join house error:", error);

      let errorMessage = "An error occurred while joining the house";

      if (error.response?.data?.message) {
        if (Array.isArray(error.response.data.message)) {
          errorMessage = error.response.data.message.join("\n");
        } else {
          errorMessage = error.response.data.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Handle specific error cases
      if (error.response?.status === 404) {
        errorMessage = "House not found. Please check the invite code.";
      } else if (error.response?.status === 409) {
        if (error.response.data.message?.includes("already a member")) {
          errorMessage = "You are already a member of this house.";
        } else if (error.response.data.message?.includes("display name")) {
          errorMessage =
            "This display name is already taken in this house. Please choose a different one.";
        }
      }

      Alert.alert("Error", errorMessage);
    }
  };

  const formatInviteCode = (code: string): string => {
    // Convert to uppercase and remove any non-alphanumeric characters
    return code.toUpperCase().replace(/[^A-Z0-9]/g, "");
  };

  const handleInviteCodeChange = (value: string) => {
    const formatted = formatInviteCode(value);
    updateField("inviteCode", formatted);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Join a House</Text>
            <Text style={styles.subtitle}>
              Enter the invite code to join an existing shared house
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Invite Code *"
              placeholder="Enter the 6-8 character code"
              value={formData.inviteCode}
              onChangeText={handleInviteCodeChange}
              error={errors.inviteCode}
              autoCapitalize="characters"
              leftIcon="key-outline"
            />

            <Input
              label="Your Display Name *"
              placeholder="How others will see you in this house"
              value={formData.displayName}
              onChangeText={(value) => updateField("displayName", value)}
              error={errors.displayName}
              leftIcon="person-outline"
            />

            <Button
              title="Join House"
              onPress={handleJoinHouse}
              loading={isLoading}
              style={styles.joinButton}
            />

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <Button
              title="Create New House"
              onPress={() =>
                navigation.navigate(NAVIGATION_ROUTES.CREATE_HOUSE)
              }
              variant="outline"
              style={styles.createButton}
            />

            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>💡 Need an invite code?</Text>
              <Text style={styles.infoText}>
                Ask a member of the house to share their invite code with you.
                House admins can find this in the house settings.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  content: {
    // flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.TEXT_PRIMARY,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    textAlign: "center",
    lineHeight: 22,
  },
  form: {
    flex: 2,
  },
  joinButton: {
    marginTop: 24,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.BORDER_LIGHT,
  },
  dividerText: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    paddingHorizontal: 16,
    fontWeight: "500",
  },
  createButton: {
    marginBottom: 24,
  },
  infoBox: {
    backgroundColor: COLORS.CARD_BACKGROUND,
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.PRIMARY,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 20,
  },
});
