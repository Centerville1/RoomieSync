import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import AuthNavigator from './AuthNavigator';
import MainTabNavigator from './MainTabNavigator';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../types/navigation';
import { NAVIGATION_ROUTES } from '../constants';

const Stack = createStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { isAuthenticated } = useAuth();
  
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
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