import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StackNavigationProp } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";

import { Button, Avatar } from "../../components/UI";
import { useHouse } from "../../context/HouseContext";
import { RootStackParamList } from "../../types/navigation";
import { NAVIGATION_ROUTES } from "../../constants";
import { House } from "../../types/houses";
import { useUserTheme } from "../../hooks/useUserTheme";

type MultiHouseSelectionScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "MultiHouseSelection"
>;

interface Props {
  navigation: MultiHouseSelectionScreenNavigationProp;
}

const createDynamicStyles = (COLORS: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.BACKGROUND,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.BORDER_LIGHT,
    },
    backButton: {
      padding: 8,
      marginLeft: -8,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: COLORS.TEXT_PRIMARY,
      flex: 1,
      textAlign: "center",
    },
    headerSpacer: {
      width: 40,
    },
    content: {
      flex: 1,
      paddingHorizontal: 16,
    },
    description: {
      paddingVertical: 24,
      alignItems: "center",
    },
    descriptionText: {
      fontSize: 16,
      color: COLORS.TEXT_SECONDARY,
      textAlign: "center",
      lineHeight: 22,
    },
    housesList: {
      marginBottom: 32,
    },
    houseItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 16,
      backgroundColor: COLORS.CARD_BACKGROUND,
      borderRadius: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: COLORS.BORDER_LIGHT,
    },
    currentHouseItem: {
      borderColor: COLORS.SUCCESS,
      borderWidth: 4,
    },
    houseLeft: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
    },
    houseDetails: {
      flex: 1,
      marginLeft: 12,
    },
    houseTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 4,
    },
    houseName: {
      fontSize: 18,
      fontWeight: "600",
      color: COLORS.TEXT_PRIMARY,
      flex: 1,
    },
    currentBadge: {
      backgroundColor: COLORS.SUCCESS,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 10,
      marginLeft: 8,
    },
    currentBadgeText: {
      fontSize: 12,
      fontWeight: "600",
      color: COLORS.TEXT_WHITE,
    },
    memberCount: {
      fontSize: 14,
      color: COLORS.TEXT_SECONDARY,
      marginBottom: 2,
    },
    houseAddress: {
      fontSize: 13,
      color: COLORS.TEXT_SECONDARY,
      fontStyle: "italic",
    },
    houseRight: {
      paddingLeft: 12,
    },
    addHouseSection: {
      paddingVertical: 24,
      paddingHorizontal: 16,
      backgroundColor: COLORS.CARD_BACKGROUND,
      borderRadius: 12,
      marginBottom: 32,
      alignItems: "center",
    },
    addHouseTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: COLORS.TEXT_PRIMARY,
      marginBottom: 8,
    },
    addHouseDescription: {
      fontSize: 14,
      color: COLORS.TEXT_SECONDARY,
      textAlign: "center",
      marginBottom: 20,
      lineHeight: 20,
    },
    addHouseButtons: {
      flexDirection: "row",
      justifyContent: "space-around",
      width: "100%",
    },
    addHouseButton: {
      flex: 0.45,
    },
  });

export default function MultiHouseSelectionScreen({ navigation }: Props) {
  const { houses, currentHouse, switchToHouse, isLoading } = useHouse();
  const { COLORS } = useUserTheme();
  const styles = createDynamicStyles(COLORS);
  const [switchingHouse, setSwitchingHouse] = useState<string | null>(null);

  const handleHouseSelect = async (house: House) => {
    if (house.id === currentHouse?.id) {
      // If already selected, just go back to home
      navigation.navigate(NAVIGATION_ROUTES.MAIN);
      return;
    }

    try {
      setSwitchingHouse(house.id);
      const switchedHouse = await switchToHouse(house.id);

      if (switchedHouse) {
        // Successfully switched, navigate back to home
        navigation.navigate(NAVIGATION_ROUTES.MAIN);
      } else {
        Alert.alert(
          "Error",
          "Failed to switch to the selected house. Please try again."
        );
      }
    } catch (error) {
      console.error("Error switching house:", error);
      Alert.alert(
        "Error",
        "Failed to switch to the selected house. Please try again."
      );
    } finally {
      setSwitchingHouse(null);
    }
  };

  const formatMemberCount = (house: House): string => {
    const memberCount = house.members?.length || 0;
    return `${memberCount} ${memberCount === 1 ? "member" : "members"}`;
  };

  const isCurrentHouse = (house: House): boolean => {
    return house.id === currentHouse?.id;
  };

  const isSwitchingToHouse = (house: House): boolean => {
    return switchingHouse === house.id;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select House</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.description}>
          <Text style={styles.descriptionText}>
            Choose which house you'd like to view and manage
          </Text>
        </View>

        <View style={styles.housesList}>
          {houses.map((house) => (
            <TouchableOpacity
              key={house.id}
              style={[
                styles.houseItem,
                { backgroundColor: house.color + "70" },
                isCurrentHouse(house) && styles.currentHouseItem,
              ]}
              onPress={() => handleHouseSelect(house)}
              disabled={isSwitchingToHouse(house)}
            >
              <View style={styles.houseLeft}>
                <Avatar
                  name={house.name}
                  imageUrl={house.imageUrl}
                  color={house.color}
                  size="medium"
                />
                <View style={styles.houseDetails}>
                  <View style={styles.houseTitleRow}>
                    <Text style={styles.houseName}>{house.name}</Text>
                    {isCurrentHouse(house) && (
                      <View style={styles.currentBadge}>
                        <Text style={styles.currentBadgeText}>Current ⭐️</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.memberCount}>
                    {house.membership?.role === "admin" ? "Admin" : "Member"} •{" "}
                    {formatMemberCount(house)}
                  </Text>
                  {house.address && (
                    <Text style={styles.houseAddress}>{house.address}</Text>
                  )}
                </View>
              </View>

              <View style={styles.houseRight}>
                {isSwitchingToHouse(house) ? (
                  <ActivityIndicator size="small" color={COLORS.PRIMARY} />
                ) : (
                  <Ionicons
                    name={
                      isCurrentHouse(house)
                        ? "checkmark-circle"
                        : "chevron-forward"
                    }
                    size={24}
                    color={
                      isCurrentHouse(house)
                        ? COLORS.SUCCESS
                        : COLORS.TEXT_SECONDARY
                    }
                  />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.addHouseSection}>
          <Text style={styles.addHouseTitle}>Add More Houses</Text>
          <Text style={styles.addHouseDescription}>
            You can join additional houses or create new ones
          </Text>

          <View style={styles.addHouseButtons}>
            <Button
              title="Join House"
              variant="outline"
              onPress={() =>
                navigation.navigate(NAVIGATION_ROUTES.JOIN_HOUSE, {
                  inviteCode: undefined,
                })
              }
              style={styles.addHouseButton}
            />
            <Button
              title="Create House"
              onPress={() =>
                navigation.navigate(NAVIGATION_ROUTES.CREATE_HOUSE)
              }
              style={styles.addHouseButton}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
