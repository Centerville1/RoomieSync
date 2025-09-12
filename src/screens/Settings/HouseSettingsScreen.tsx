import CategoryEditor from "./CategoryEditor";
import MembersManager from "./MembersManager";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  Share,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import * as Clipboard from "expo-clipboard";

import { Card, Avatar, Button } from "../../components/UI";
import { House } from "../../types/houses";
import { useAuth } from "../../context/AuthContext";
import { houseService } from "../../services/houseService";
import { useUserTheme } from "../../hooks/useUserTheme";

const HOUSE_COLORS = [
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

const createstyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.BACKGROUND,
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
    },
    errorContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 32,
    },
    errorText: {
      fontSize: 18,
      color: colors.TEXT_PRIMARY,
      marginBottom: 20,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 16,
      backgroundColor: colors.CARD_BACKGROUND,
      borderBottomWidth: 1,
      borderBottomColor: colors.BORDER_LIGHT,
    },
    headerTitle: {
      flex: 1,
      fontSize: 18,
      fontWeight: "600",
      color: colors.TEXT_PRIMARY,
      textAlign: "center",
    },
    cameraOverlay: {
      position: "absolute",
      bottom: 0,
      right: 0,
      backgroundColor: colors.PRIMARY,
      borderRadius: 16,
      width: 32,
      height: 32,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 2,
      borderColor: colors.CARD_BACKGROUND,
    },
    imageHint: {
      fontSize: 14,
      color: colors.TEXT_SECONDARY,
      marginTop: 8,
    },
    inputGroup: {
      marginBottom: 16,
    },
    inputLabel: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.TEXT_PRIMARY,
      marginBottom: 8,
    },
    textInput: {
      backgroundColor: colors.BACKGROUND,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      color: colors.TEXT_PRIMARY,
      borderWidth: 1,
      borderColor: colors.BORDER_LIGHT,
    },
    sectionDescription: {
      fontSize: 14,
      color: colors.TEXT_SECONDARY,
      marginBottom: 20,
    },
    selectedColor: {
      borderWidth: 3,
      borderColor: colors.TEXT_PRIMARY,
    },
    autoSaveText: {
      fontSize: 14,
      color: colors.SUCCESS,
      marginLeft: 8,
      fontWeight: "500",
    },
    readOnlyLabel: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.TEXT_SECONDARY,
      marginBottom: 4,
    },
    readOnlyValue: {
      fontSize: 16,
      color: colors.TEXT_PRIMARY,
      backgroundColor: colors.BACKGROUND,
      padding: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.BORDER_LIGHT,
    },
    inviteCodeText: {
      fontSize: 24,
      fontWeight: "700",
      color: colors.PRIMARY,
      letterSpacing: 2,
    },
    inviteButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.PRIMARY,
      marginLeft: 8,
    },
    adminNoteText: {
      fontSize: 14,
      color: colors.TEXT_SECONDARY,
      marginLeft: 12,
      flex: 1,
    },
    inviteWarning: {
      color: colors.ERROR,
      fontSize: 13,
      marginTop: 8,
      marginBottom: 4,
    },
    dangerZoneTitle: {
      color: colors.ERROR,
      fontWeight: "bold",
      fontSize: 18,
      marginBottom: 8,
    },
    dangerZoneWarning: {
      color: colors.ERROR,
      fontSize: 14,
      marginBottom: 16,
      textAlign: "center",
    },
    backButton: {
      padding: 8,
    },
    headerSpacer: {
      width: 40,
    },
    content: {
      flex: 1,
      paddingHorizontal: 16,
    },
    profileSection: {
      alignItems: "center",
      marginBottom: 24,
    },
    avatarContainer: {
      position: "relative",
    },
    textArea: {
      minHeight: 80,
      paddingTop: 12,
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
    autoSaveContainer: {
      marginTop: 24,
      marginBottom: 32,
      alignItems: "center",
    },
    autoSaveIndicator: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
    },
    readOnlyField: {
      marginBottom: 16,
    },
    inviteCodeContainer: {
      marginTop: 16,
    },
    inviteCodeBox: {
      borderRadius: 8,
      padding: 16,
      alignItems: "center",
      marginBottom: 16,
      borderWidth: 2,
      borderStyle: "dashed",
    },
    inviteActions: {
      flexDirection: "row",
      justifyContent: "space-around",
    },
    inviteButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 8,
      minWidth: 100,
      justifyContent: "center",
    },
    adminNote: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      borderRadius: 8,
      margin: 16,
    },
    dangerZoneContainer: {
      marginTop: 32,
      padding: 16,
      backgroundColor: "#FFF0F0",
      borderRadius: 8,
      borderWidth: 1,
      alignItems: "center",
    },
    dangerZoneButton: {
      width: "100%",
    },
  });

export default function HouseSettingsScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { COLORS } = useUserTheme();
  const styles = createstyles(COLORS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentHouse, setCurrentHouse] = useState<House | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [houseName, setHouseName] = useState("");
  const [houseAddress, setHouseAddress] = useState("");
  const [houseDescription, setHouseDescription] = useState("");
  const [selectedColor, setSelectedColor] = useState<string>("#FF6B35");
  const [hasChanges, setHasChanges] = useState(false);

  const ACTUAL_NUM_COLUMNS = 4; // change how many per row you want
  const NUM_COLUMNS = ACTUAL_NUM_COLUMNS + 1;
  const GAP = 8; // gap between tiles

  const { width } = useWindowDimensions();
  const horizontalPadding = 16; // parent padding if you want
  const totalGaps = GAP * (NUM_COLUMNS + 1);
  const itemSize = Math.floor(
    (width - horizontalPadding * 2 - totalGaps) / NUM_COLUMNS
  );

  useEffect(() => {
    loadHouseData();
  }, []);

  const loadHouseData = async () => {
    try {
      setLoading(true);
      const house = await houseService.getStoredCurrentHouse();
      if (house) {
        setCurrentHouse(house);
        setHouseName(house.name);
        setHouseAddress(house.address || "");
        setHouseDescription(house.description || "");
        setSelectedColor(house.color || "#FF6B35");

        // Check if current user is admin
        const userMembership =
          house.members?.find((member) => member.user?.id === user?.id) ||
          house.memberships?.find((member) => member.user?.id === user?.id) ||
          house.userMembership;
        setIsAdmin(userMembership?.role === "admin");
      }
    } catch (error) {
      console.error("Error loading house data:", error);
      Alert.alert("Error", "Failed to load house settings");
    } finally {
      setLoading(false);
    }
  };

  const handleNameChange = (text: string) => {
    setHouseName(text);
    setHasChanges(true);
  };

  const handleAddressChange = (text: string) => {
    setHouseAddress(text);
    setHasChanges(true);
  };

  const handleDescriptionChange = (text: string) => {
    setHouseDescription(text);
    setHasChanges(true);
  };

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    setHasChanges(true);
  };

  const handleImagePicker = async () => {
    if (!currentHouse) return;

    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant camera roll permissions to upload images."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSaving(true);
        try {
          const updatedHouse = await houseService.uploadHouseImage(
            currentHouse.id,
            result.assets[0].uri
          );
          setCurrentHouse(updatedHouse);
          Alert.alert("Success", "House image updated successfully!");
        } catch (error) {
          console.error("Error uploading image:", error);
          Alert.alert("Error", "Failed to update house image");
        } finally {
          setSaving(false);
        }
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image");
      setSaving(false);
    }
  };

  const handleBack = async () => {
    if (hasChanges) {
      // Auto-save changes before going back
      try {
        if (currentHouse && houseName.trim()) {
          setSaving(true);
          const updateData = {
            name: houseName.trim(),
            address: houseAddress.trim() || undefined,
            description: houseDescription.trim() || undefined,
            color: selectedColor,
          };
          await houseService.updateHouse(currentHouse.id, updateData);
          // Trigger a refresh of the home screen by updating stored house
          const updatedHouse = await houseService.getHouseDetails(
            currentHouse.id
          );
          await houseService.setCurrentHouse(updatedHouse);
        }
      } catch (error) {
        console.error("Error auto-saving house settings:", error);
        // Still navigate back even if save fails
      } finally {
        setSaving(false);
      }
    }
    navigation.goBack();
  };

  const handleCopyInviteCode = async () => {
    if (currentHouse?.inviteCode) {
      await Clipboard.setStringAsync(currentHouse.inviteCode);
      Alert.alert("Copied!", "Invite code copied to clipboard");
    }
  };

  const handleShareInviteCode = async () => {
    if (currentHouse?.inviteCode) {
      try {
        await Share.share({
          message: `Join our house "${currentHouse.name}" on RoomieSync! Use invite code: ${currentHouse.inviteCode}`,
          title: "Join My House",
        });
      } catch (error) {
        console.error("Error sharing invite code:", error);
      }
    }
  };

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: COLORS.BACKGROUND }]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text style={[styles.loadingText, { color: COLORS.TEXT_SECONDARY }]}>
            Loading house settings...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentHouse) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: COLORS.BACKGROUND }]}
      >
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: COLORS.TEXT_PRIMARY }]}>
            No house found
          </Text>
          <Button title="Go Back" onPress={() => navigation.goBack()} />
        </View>
      </SafeAreaView>
    );
  }

  if (!isAdmin) {
    return (
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View
          style={[
            styles.header,
            {
              backgroundColor: COLORS.CARD_BACKGROUND,
              borderBottomColor: COLORS.BORDER_LIGHT,
            },
          ]}
        >
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.TEXT_PRIMARY} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: COLORS.TEXT_PRIMARY }]}>
            House Info
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* FlatList now handles scrolling; removed ScrollView */}
        {/* House Info (Read-only) */}
        <Card title="🏠 House Information" headerColor={COLORS.BALANCE_HEADER}>
          <View style={styles.profileSection}>
            <Avatar
              name={currentHouse.name}
              imageUrl={currentHouse.imageUrl}
              color={currentHouse.color}
              size="large"
            />
          </View>
          <View style={styles.readOnlyField}>
            <Text style={styles.readOnlyLabel}>House Name</Text>
            <Text style={styles.readOnlyValue}>{currentHouse.name}</Text>
          </View>
          {currentHouse.address && (
            <View style={styles.readOnlyField}>
              <Text style={styles.readOnlyLabel}>Address</Text>
              <Text style={styles.readOnlyValue}>{currentHouse.address}</Text>
            </View>
          )}
          {currentHouse.description && (
            <View style={styles.readOnlyField}>
              <Text style={styles.readOnlyLabel}>Description</Text>
              <Text style={styles.readOnlyValue}>
                {currentHouse.description}
              </Text>
            </View>
          )}
        </Card>

        {/* Invite Code Section */}
        <Card title="📨 Invite Code" headerColor={COLORS.SHOPPING_HEADER}>
          <Text style={styles.sectionDescription}>
            Share this code with others to invite them to join your house.
          </Text>
          <View style={styles.inviteCodeContainer}>
            <View style={styles.inviteCodeBox}>
              <Text style={styles.inviteCodeText}>
                {currentHouse.inviteCode}
              </Text>
            </View>
            <View style={styles.inviteActions}>
              <TouchableOpacity
                style={styles.inviteButton}
                onPress={handleCopyInviteCode}
              >
                <Ionicons
                  name="copy-outline"
                  size={20}
                  color={COLORS.PRIMARY}
                />
                <Text style={styles.inviteButtonText}>Copy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.inviteButton}
                onPress={handleShareInviteCode}
              >
                <Ionicons
                  name="share-outline"
                  size={20}
                  color={COLORS.PRIMARY}
                />
                <Text style={styles.inviteButtonText}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.inviteWarning}>
            ⚠️ Anyone with the code can join (even if previously removed), and
            can rejoin with a new account. There is currently no way to block
            users from joining with the code.
          </Text>
        </Card>

        <View style={styles.adminNote}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color={COLORS.TEXT_SECONDARY}
          />
          <Text style={styles.adminNoteText}>
            Only house admins can modify house settings
          </Text>
        </View>
        <MembersManager houseId={currentHouse.id} isAdmin={isAdmin} />
        {/* End of FlatList scrolling */}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>House Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <FlatList
        style={styles.content}
        data={["profile", "invite", "categories", "color", "autosave"]}
        keyExtractor={(item) => item}
        renderItem={({ item }) => {
          switch (item) {
            case "profile":
              return (
                <Card
                  title="🏠 House Profile"
                  headerColor={COLORS.BALANCE_HEADER}
                >
                  <View style={styles.profileSection}>
                    <TouchableOpacity
                      onPress={handleImagePicker}
                      style={styles.avatarContainer}
                    >
                      <Avatar
                        name={currentHouse.name}
                        imageUrl={currentHouse.imageUrl}
                        color={selectedColor}
                        size="large"
                      />
                      <View style={styles.cameraOverlay}>
                        <Ionicons
                          name="camera"
                          size={20}
                          color={COLORS.TEXT_WHITE}
                        />
                      </View>
                    </TouchableOpacity>
                    <Text style={styles.imageHint}>
                      Tap to change house image
                    </Text>
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>House Name</Text>
                    <TextInput
                      style={styles.textInput}
                      value={houseName}
                      onChangeText={handleNameChange}
                      placeholder="Enter house name"
                      maxLength={50}
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Address (Optional)</Text>
                    <TextInput
                      style={styles.textInput}
                      value={houseAddress}
                      onChangeText={handleAddressChange}
                      placeholder="Enter house address"
                      maxLength={100}
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>
                      Description (Optional)
                    </Text>
                    <TextInput
                      style={[styles.textInput, styles.textArea]}
                      value={houseDescription}
                      onChangeText={handleDescriptionChange}
                      placeholder="Describe your house or add notes for roommates"
                      maxLength={200}
                      multiline
                      numberOfLines={3}
                      textAlignVertical="top"
                    />
                  </View>
                </Card>
              );
            case "invite":
              return (
                <Card
                  title="📨 Invite Code"
                  headerColor={COLORS.SHOPPING_HEADER}
                >
                  <Text style={styles.sectionDescription}>
                    Share this code with others to invite them to join your
                    house.
                  </Text>
                  <View style={styles.inviteCodeContainer}>
                    <View style={styles.inviteCodeBox}>
                      <Text style={styles.inviteCodeText}>
                        {currentHouse.inviteCode}
                      </Text>
                    </View>
                    <View style={styles.inviteActions}>
                      <TouchableOpacity
                        style={styles.inviteButton}
                        onPress={handleCopyInviteCode}
                      >
                        <Ionicons
                          name="copy-outline"
                          size={20}
                          color={COLORS.PRIMARY}
                        />
                        <Text style={styles.inviteButtonText}>Copy</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.inviteButton}
                        onPress={handleShareInviteCode}
                      >
                        <Ionicons
                          name="share-outline"
                          size={20}
                          color={COLORS.PRIMARY}
                        />
                        <Text style={styles.inviteButtonText}>Share</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <Text style={styles.inviteWarning}>
                    ⚠️ Anyone with the code can join (even if previously
                    removed), and can rejoin with a new account. There is
                    currently no way to block users from joining with the code.
                  </Text>
                </Card>
              );
            case "categories":
              return (
                <>
                  <MembersManager houseId={currentHouse.id} isAdmin={isAdmin} />
                  <CategoryEditor houseId={currentHouse.id} />
                </>
              );
            case "color":
              return (
                <Card
                  title="🎨 House Color"
                  headerColor={COLORS.ACTIVITY_HEADER}
                >
                  <Text style={styles.sectionDescription}>
                    Choose a color that represents your house. This will be used
                    throughout the app.
                  </Text>
                  <View style={styles.colorGrid}>
                    {HOUSE_COLORS.map((color) => (
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
                          selectedColor === color && styles.selectedColor,
                        ]}
                        onPress={() => handleColorSelect(color)}
                      >
                        {selectedColor === color && (
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
              );
            case "autosave":
              return hasChanges ? (
                <View style={styles.autoSaveContainer}>
                  <View
                    style={[
                      styles.autoSaveIndicator,
                      { backgroundColor: COLORS.SUCCESS + "20" },
                    ]}
                  >
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
              ) : null;
            default:
              return null;
          }
        }}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          isAdmin && currentHouse ? (
            <View
              style={[
                styles.dangerZoneContainer,
                { borderColor: COLORS.ERROR },
              ]}
            >
              <Text style={styles.dangerZoneTitle}>Danger Zone</Text>
              <Text style={styles.dangerZoneWarning}>
                Deleting the house is irreversible. All data will be lost. Are
                you sure?
              </Text>
              <Button
                title="Delete House"
                variant="danger"
                size="large"
                style={styles.dangerZoneButton}
                onPress={() => {
                  Alert.alert(
                    "Delete House",
                    "This action cannot be undone. Are you sure you want to delete the house?",
                    [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Delete",
                        style: "destructive",
                        onPress: async () => {
                          try {
                            await houseService.deleteHouse(currentHouse.id);
                            Alert.alert(
                              "House Deleted",
                              "The house has been deleted."
                            );
                            navigation.goBack();
                          } catch (err) {
                            Alert.alert("Error", "Failed to delete house.");
                          }
                        },
                      },
                    ]
                  );
                }}
              />
            </View>
          ) : (
            <View style={{ height: 32 }} />
          )
        }
      />
    </SafeAreaView>
  );
}
