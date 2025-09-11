import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import AuthNavigator from './AuthNavigator';
import MainTabNavigator from './MainTabNavigator';
import { useAuth } from '../context/AuthContext';
import { useHouse } from '../context/HouseContext';
import { RootStackParamList } from '../types/navigation';
import { NAVIGATION_ROUTES } from '../constants';

const Stack = createStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { houses, isLoading: houseLoading } = useHouse();
  
  // Show loading while authentication or house data is being checked
  if (authLoading || houseLoading) {
    return null; // Or show a loading component
  }
  
  // Determine which screen to show based on auth and house status
  const shouldShowMain = isAuthenticated && houses.length > 0;
  
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {shouldShowMain ? (
          <Stack.Screen 
            name={NAVIGATION_ROUTES.MAIN} 
            component={MainTabNavigator} 
          />
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