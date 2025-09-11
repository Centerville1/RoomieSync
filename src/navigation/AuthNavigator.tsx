import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import JoinHouseScreen from '../screens/Auth/JoinHouseScreen';
import CreateHouseScreen from '../screens/Auth/CreateHouseScreen';
import { RootStackParamList } from '../types/navigation';
import { NAVIGATION_ROUTES } from '../constants';

const Stack = createStackNavigator<RootStackParamList>();

export default function AuthNavigator() {
  return (
    <Stack.Navigator
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
        name={NAVIGATION_ROUTES.JOIN_HOUSE}
        component={JoinHouseScreen}
        options={{ headerShown: true, title: 'Join House' }}
      />
      <Stack.Screen
        name={NAVIGATION_ROUTES.CREATE_HOUSE}
        component={CreateHouseScreen}
        options={{ headerShown: true, title: 'Create House' }}
      />
    </Stack.Navigator>
  );
}