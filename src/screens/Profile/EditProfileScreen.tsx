import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { StackScreenProps } from "@react-navigation/stack";
import * as ImagePicker from "expo-image-picker";

import { Card, Avatar, Button } from "../../components/UI";
import { useAuth } from "../../context/AuthContext";
import { COLORS } from "../../constants";
import { RootStackParamList } from "../../types/navigation";

const USER_COLORS = [
  "#E76464",
  "#E55555",
  "#E24444",
  "#DF3131",
  "#E4783F",
  "#F1B347",
  "#EDC54B",
  "#EAD84E",
  "#BBCF58",
  "#5BBE6C",
  "#5BB383",
  "#5AA799",
  "#5A9BAF",
  "#598FC5",
  "#5E72E4",
  "#7071E3",
  "#826FE2",
  "#A56BDF",
  "#9552D7",
  "#8439CE",
  "#9C3AC8",
  "#B33BC1",
  "#CB3CBA",
  "#D53776",
];

type EditProfileScreenProps = StackScreenProps<
  RootStackParamList,
  "EditProfile"
>;

export default function EditProfileScreen({
  navigation,
}: EditProfileScreenProps) {
  const { user, updateProfile, uploadProfileImage } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phoneNumber: user?.phoneNumber || "",
    color: user?.color || COLORS.PRIMARY,
  });

  const NUM_COLUMNS = 4;
  const GAP = 8;

  const { width } = useWindowDimensions();
  const horizontalPadding = 16;
  const totalGaps = GAP * (NUM_COLUMNS + 1);
  const itemSize = Math.floor(
    (width - horizontalPadding * 2 - totalGaps) / NUM_COLUMNS
  );

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phoneNumber: user.phoneNumber || "",
        color: user.color || COLORS.PRIMARY,
      });
    }
  }, [user]);

  const handleColorSelect = (color: string) => {
    setFormData((prev) => ({ ...prev, color }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      await updateProfile(formData);
      setHasChanges(false);
      Alert.alert("Success", "Profile updated successfully", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = async () => {
    if (hasChanges) {
      try {
        setIsLoading(true);
        await updateProfile(formData);
      } catch (error) {
        console.error("Error auto-saving profile:", error);
      } finally {
        setIsLoading(false);
      }
    }
    navigation.goBack();
  };

  const handleImagePicker = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert(
        "Permission required",
        "Permission to access camera roll is required!"
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      try {
        setIsLoading(true);
        await uploadProfileImage(result.assets[0].uri);
        Alert.alert("Success", "Profile image updated successfully");
      } catch (error: any) {
        Alert.alert("Error", error.message || "Failed to update profile image");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <Ionicons name="chevron-back" size={24} color={COLORS.TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Image */}
        <View style={styles.imageSection}>
          <TouchableOpacity onPress={handleImagePicker} disabled={isLoading}>
            <Avatar
              name={user ? `${user.firstName} ${user.lastName}` : "User"}
              imageUrl={user?.profileImageUrl}
              color={formData.color}
              size="large"
            />
            <View style={styles.cameraIcon}>
              <Ionicons name="camera" size={20} color={COLORS.TEXT_WHITE} />
            </View>
          </TouchableOpacity>
          <Text style={styles.changePhotoText}>Tap to change photo</Text>
        </View>

        {/* Form Fields */}
        <Card title="Personal Information" headerColor={formData.color}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>First Name</Text>
            <TextInput
              style={styles.input}
              value={formData.firstName}
              onChangeText={(text) => {
                setFormData((prev) => ({ ...prev, firstName: text }));
                setHasChanges(true);
              }}
              placeholder="Enter your first name"
              placeholderTextColor={COLORS.TEXT_LIGHT}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Last Name</Text>
            <TextInput
              style={styles.input}
              value={formData.lastName}
              onChangeText={(text) => {
                setFormData((prev) => ({ ...prev, lastName: text }));
                setHasChanges(true);
              }}
              placeholder="Enter your last name"
              placeholderTextColor={COLORS.TEXT_LIGHT}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={formData.phoneNumber}
              onChangeText={(text) => {
                setFormData((prev) => ({ ...prev, phoneNumber: text }));
                setHasChanges(true);
              }}
              placeholder="Enter your phone number"
              placeholderTextColor={COLORS.TEXT_LIGHT}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={user?.email || ""}
              editable={false}
              placeholder="Email address"
              placeholderTextColor={COLORS.TEXT_LIGHT}
            />
            <Text style={styles.helperText}>Email cannot be changed</Text>
          </View>
        </Card>

        {/* Color Picker Section */}
        <Card title="🎨 Profile Color" headerColor={formData.color}>
          <Text style={styles.sectionDescription}>
            Choose a color that represents you. This will be used throughout the
            app.
          </Text>
          <View style={styles.colorGrid}>
            {USER_COLORS.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorOption,
                  {
                    width: itemSize,
                    height: itemSize,
                    margin: GAP / 2,
                    backgroundColor: color,
                  },
                  formData.color === color && styles.selectedColor,
                ]}
                onPress={() => handleColorSelect(color)}
              >
                {formData.color === color && (
                  <Ionicons
                    name="checkmark"
                    size={20}
                    color={COLORS.TEXT_WHITE}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Auto-save indicator */}
        {hasChanges && (
          <View style={styles.autoSaveContainer}>
            <View style={styles.autoSaveIndicator}>
              <Ionicons
                name="checkmark-circle"
                size={16}
                color={COLORS.SUCCESS}
              />
              <Text style={styles.autoSaveText}>
                Changes will be saved automatically
              </Text>
            </View>
          </View>
        )}

        <View style={styles.saveSection}>
          <Button
            title="Save Changes"
            onPress={handleSave}
            loading={isLoading}
            disabled={isLoading}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER_LIGHT,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.TEXT_PRIMARY,
  },
  imageSection: {
    alignItems: "center",
    paddingVertical: 32,
  },
  cameraIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.BACKGROUND,
  },
  changePhotoText: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 8,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.CARD_BACKGROUND,
    borderWidth: 1,
    borderColor: COLORS.BORDER_LIGHT,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
  },
  disabledInput: {
    backgroundColor: COLORS.BACKGROUND_LIGHT,
    color: COLORS.TEXT_LIGHT,
  },
  helperText: {
    fontSize: 12,
    color: COLORS.TEXT_LIGHT,
    marginTop: 4,
  },
  saveSection: {
    padding: 24,
    paddingBottom: 40,
  },
  sectionDescription: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 20,
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
  },
  colorOption: {
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  selectedColor: {
    borderWidth: 3,
    borderColor: COLORS.TEXT_PRIMARY,
  },
  autoSaveContainer: {
    marginTop: 24,
    marginBottom: 16,
    alignItems: "center",
  },
  autoSaveIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.SUCCESS + "20",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  autoSaveText: {
    fontSize: 14,
    color: COLORS.SUCCESS,
    marginLeft: 8,
    fontWeight: "500",
  },
});
