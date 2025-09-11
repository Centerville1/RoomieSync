import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, ActivityIndicator } from 'react-native';

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
  const [forceRender, setForceRender] = useState(0);
  
  // Force a re-render when auth state changes to ensure navigation updates
  useEffect(() => {
    setForceRender(prev => prev + 1);
  }, [isAuthenticated]);
  
  // Show loading while authentication or house data is being checked
  if (authLoading || houseLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  
  // Determine which screen to show based on auth and house status
  const shouldShowMain = isAuthenticated && houses.length > 0;
  
  return (
    <NavigationContainer key={`${shouldShowMain ? 'main' : 'auth'}-${forceRender}`}>
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