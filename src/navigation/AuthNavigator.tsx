import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import JoinHouseScreen from '../screens/Auth/JoinHouseScreen';
import CreateHouseScreen from '../screens/Auth/CreateHouseScreen';
import HouseSelectionScreen from '../screens/Auth/HouseSelectionScreen';
import ForgotPasswordScreen from '../screens/Auth/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/Auth/ResetPasswordScreen';
import { useAuth } from '../context/AuthContext';
import { useHouse } from '../context/HouseContext';
import { RootStackParamList } from '../types/navigation';
import { NAVIGATION_ROUTES } from '../constants';

const Stack = createStackNavigator<RootStackParamList>();

export default function AuthNavigator() {
  const { isAuthenticated } = useAuth();
  const { houses } = useHouse();

  // Determine the initial route based on authentication and house status
  const getInitialRouteName = () => {
    if (!isAuthenticated) {
      return NAVIGATION_ROUTES.LOGIN;
    }
    
    // User is authenticated but has no houses
    if (houses.length === 0) {
      return NAVIGATION_ROUTES.HOUSE_SELECTION;
    }
    
    // This should not happen since RootNavigator handles main app flow
    return NAVIGATION_ROUTES.LOGIN;
  };

  return (
    <Stack.Navigator
      initialRouteName={getInitialRouteName()}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name={NAVIGATION_ROUTES.LOGIN}
        component={LoginScreen}
      />
      <Stack.Screen
        name={NAVIGATION_ROUTES.REGISTER}
        component={RegisterScreen}
      />
      <Stack.Screen
        name={NAVIGATION_ROUTES.HOUSE_SELECTION}
        component={HouseSelectionScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={NAVIGATION_ROUTES.JOIN_HOUSE}
        component={JoinHouseScreen}
        options={{ headerShown: true, title: 'Join House' }}
      />
      <Stack.Screen
        name={NAVIGATION_ROUTES.CREATE_HOUSE}
        component={CreateHouseScreen}
        options={{ headerShown: true, title: 'Create House' }}
      />
      <Stack.Screen
        name={NAVIGATION_ROUTES.FORGOT_PASSWORD}
        component={ForgotPasswordScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={NAVIGATION_ROUTES.RESET_PASSWORD}
        component={ResetPasswordScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}