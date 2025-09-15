import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { View, TouchableOpacity, StyleSheet, Text, Image } from "react-native";

import HomeScreen from "../screens/Home/HomeScreen";
import ShareCostNavigator from "./ShareCostNavigator";
import ProfileScreen from "../screens/Profile/ProfileScreen";
import { MainTabParamList } from "../types/navigation";
import { NAVIGATION_ROUTES } from "../constants";
import { ShoppingSelectionProvider } from "../context/ShoppingSelectionContext";
import { Avatar } from "../components/UI";
import { useUserTheme } from "../hooks/useUserTheme";

const Tab = createBottomTabNavigator<MainTabParamList>();

const CustomTabBarButton = ({ children, onPress, primaryColor }: any) => (
  <TouchableOpacity
    style={styles.customButton}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <View style={[styles.customButtonInner, { backgroundColor: primaryColor }]}>
      {children}
    </View>
  </TouchableOpacity>
);

export default function MainTabNavigator() {
  // const { primaryColor, contrastingTextColor, user, COLORS } = useUserTheme();
  const { primaryColor, contrastingTextColor, user, COLORS } = useUserTheme();

  return (
    <ShoppingSelectionProvider>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: COLORS.BACKGROUND,
            borderTopColor: COLORS.BORDER,
            borderTopWidth: 1,
            height: 90,
            paddingTop: 10,
            paddingBottom: 30,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "600",
          },
        }}
      >
        <Tab.Screen
          name={NAVIGATION_ROUTES.HOME}
          component={HomeScreen}
          options={{
            tabBarLabel: ({ focused }) => (
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  color: focused ? primaryColor : COLORS.TEXT_INACTIVE,
                }}
              >
                Home
              </Text>
            ),
            tabBarIcon: ({ focused, size }) => (
              <Ionicons name="home" size={size} color={primaryColor} />
            ),
          }}
        />

        <Tab.Screen
          name={NAVIGATION_ROUTES.SHARE_COST}
          component={ShareCostNavigator}
          options={({ navigation }) => ({
            tabBarButton: (props) => (
              <CustomTabBarButton
                {...props}
                primaryColor={primaryColor}
                contrastingTextColor={contrastingTextColor}
                onPress={() => {
                  // Navigate to the ShareCost tab and reset its stack
                  navigation.navigate(NAVIGATION_ROUTES.SHARE_COST, {
                    screen: NAVIGATION_ROUTES.SHARE_COST_HOME,
                  });
                }}
              >
                <Image
                  source={require("../assets/icons/icon-nobg.png")}
                  style={{ width: 50, tintColor: contrastingTextColor }}
                  resizeMode="contain"
                />
                <View style={styles.customButtonTextContainer}>
                  <Text
                    style={[styles.customButtonText, { color: primaryColor }]}
                  >
                    Share the Cost
                  </Text>
                </View>
              </CustomTabBarButton>
            ),
            tabBarIcon: () => (
              <Ionicons name="add" size={28} color={contrastingTextColor} />
            ),
          })}
        />

        <Tab.Screen
          name={NAVIGATION_ROUTES.PROFILE}
          component={ProfileScreen}
          options={{
            tabBarLabel: ({ focused }) => (
              <Text
                style={{
                  fontSize: 12,
                  marginTop: 4,
                  fontWeight: "600",
                  color: focused ? primaryColor : COLORS.TEXT_INACTIVE,
                }}
              >
                Profile
              </Text>
            ),
            tabBarIcon: ({ size }) => {
              const avatarSize = size + 16; // Make it 8px bigger than the default icon size
              return (
                <Avatar
                  name={user ? `${user.firstName} ${user.lastName}` : "User"}
                  imageUrl={user?.profileImageUrl}
                  color={user?.color}
                  size="small"
                  borderColor={primaryColor}
                  borderWidth={3}
                  style={{
                    width: avatarSize,
                    height: avatarSize,
                    borderRadius: avatarSize / 2,
                  }}
                />
              );
            },
          }}
        />
      </Tab.Navigator>
    </ShoppingSelectionProvider>
  );
}

const styles = StyleSheet.create({
  customButton: {
    top: -40,
    justifyContent: "center",
    alignItems: "center",
  },
  customButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 8,
  },
  customButtonTextContainer: {
    width: 100,
    position: "absolute",
    bottom: -20,
    alignItems: "center",
  },
  customButtonText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
