import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, TouchableOpacity, StyleSheet } from 'react-native';

import HomeScreen from '../screens/Home/HomeScreen';
import ShareCostNavigator from './ShareCostNavigator';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import { MainTabParamList } from '../types/navigation';
import { COLORS, NAVIGATION_ROUTES, TAB_BAR_CONFIG } from '../constants';

const Tab = createBottomTabNavigator<MainTabParamList>();

const CustomTabBarButton = ({ children, onPress }: any) => (
  <TouchableOpacity
    style={styles.customButton}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <View style={styles.customButtonInner}>
      {children}
    </View>
  </TouchableOpacity>
);

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: TAB_BAR_CONFIG.ACTIVE_TINT_COLOR,
        tabBarInactiveTintColor: TAB_BAR_CONFIG.INACTIVE_TINT_COLOR,
        tabBarStyle: {
          backgroundColor: TAB_BAR_CONFIG.BACKGROUND_COLOR,
          borderTopColor: TAB_BAR_CONFIG.BORDER_COLOR,
          borderTopWidth: 1,
          height: 90,
          paddingTop: 10,
          paddingBottom: 30,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name={NAVIGATION_ROUTES.HOME}
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      
      <Tab.Screen
        name={NAVIGATION_ROUTES.SHARE_COST}
        component={ShareCostNavigator}
        options={{
          tabBarLabel: 'Share Cost',
          tabBarButton: (props) => <CustomTabBarButton {...props} />,
          tabBarIcon: ({ color }) => (
            <Ionicons name="add" size={28} color={COLORS.TEXT_WHITE} />
          ),
        }}
      />
      
      <Tab.Screen
        name={NAVIGATION_ROUTES.PROFILE}
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  customButton: {
    top: -20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 8,
  },
});