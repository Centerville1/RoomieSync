import React, { useState, useEffect } from 'react';
import { NavigationContainer, useNavigationState } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, ActivityIndicator, Linking } from 'react-native';

import AuthNavigator from './AuthNavigator';
import MainTabNavigator from './MainTabNavigator';
import HouseSettingsScreen from '../screens/Settings/HouseSettingsScreen';
import EditProfileScreen from '../screens/Profile/EditProfileScreen';
import JoinHouseScreen from '../screens/Auth/JoinHouseScreen';
import CreateHouseScreen from '../screens/Auth/CreateHouseScreen';
import MultiHouseSelectionScreen from '../screens/Home/MultiHouseSelectionScreen';
import TransactionHistoryScreen from '../screens/TransactionHistory/TransactionHistoryScreen';
import ForgotPasswordScreen from '../screens/Auth/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/Auth/ResetPasswordScreen';
import { useAuth } from '../context/AuthContext';
import { useHouse } from '../context/HouseContext';
import { RootStackParamList } from '../types/navigation';
import { NAVIGATION_ROUTES } from '../constants';

const Stack = createStackNavigator<RootStackParamList>();

const linking = {
  prefixes: ['roomiesync://'],
  config: {
    screens: {
      [NAVIGATION_ROUTES.AUTH]: 'auth',
      [NAVIGATION_ROUTES.MAIN]: 'main',
      [NAVIGATION_ROUTES.RESET_PASSWORD]: 'reset-password',
      [NAVIGATION_ROUTES.FORGOT_PASSWORD]: 'forgot-password',
    },
  },
};

export default function RootNavigator() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { houses, isLoading: houseLoading } = useHouse();
  const [forceRender, setForceRender] = useState(0);
  
  // Force a re-render when auth state changes to ensure navigation updates
  useEffect(() => {
    setForceRender(prev => prev + 1);
  }, [isAuthenticated]);
  
  // Show loading while authentication is being checked, but not for house loading
  // when user is authenticated (they might be on Join/Create house screens)
  if (authLoading || (!isAuthenticated && houseLoading)) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  
  // Determine which screen to show based on auth and house status
  const shouldShowMain = isAuthenticated && houses.length > 0;
  
  return (
    <NavigationContainer
      linking={linking}
      key={`${shouldShowMain ? 'main' : 'auth'}-${forceRender}`}
    >
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {shouldShowMain ? (
          <>
            <Stack.Screen 
              name={NAVIGATION_ROUTES.MAIN} 
              component={MainTabNavigator} 
            />
            <Stack.Screen 
              name={NAVIGATION_ROUTES.HOUSE_SETTINGS}
              component={HouseSettingsScreen}
              options={{
                presentation: 'modal',
                headerShown: false,
              }}
            />
            <Stack.Screen 
              name={NAVIGATION_ROUTES.EDIT_PROFILE}
              component={EditProfileScreen}
              options={{
                presentation: 'modal',
                headerShown: false,
              }}
            />
            <Stack.Screen 
              name={NAVIGATION_ROUTES.JOIN_HOUSE}
              component={JoinHouseScreen}
              options={{
                presentation: 'modal',
                headerShown: true,
                title: 'Join House',
              }}
            />
            <Stack.Screen 
              name={NAVIGATION_ROUTES.CREATE_HOUSE}
              component={CreateHouseScreen}
              options={{
                presentation: 'modal',
                headerShown: true,
                title: 'Create House',
              }}
            />
            <Stack.Screen
              name={NAVIGATION_ROUTES.MULTI_HOUSE_SELECTION}
              component={MultiHouseSelectionScreen}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name={NAVIGATION_ROUTES.TRANSACTION_HISTORY}
              component={TransactionHistoryScreen}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name={NAVIGATION_ROUTES.FORGOT_PASSWORD}
              component={ForgotPasswordScreen}
              options={{
                presentation: 'modal',
                headerShown: false,
              }}
            />
            <Stack.Screen
              name={NAVIGATION_ROUTES.RESET_PASSWORD}
              component={ResetPasswordScreen}
              options={{
                presentation: 'modal',
                headerShown: false,
              }}
            />
          </>
        ) : (
          <Stack.Screen 
            name={NAVIGATION_ROUTES.AUTH} 
            component={AuthNavigator} 
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}