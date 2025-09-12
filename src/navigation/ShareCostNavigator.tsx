import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import ShareCostHomeScreen from '../screens/ShareCost/ShareCostHomeScreen';
import ShoppingCostSplitScreen from '../screens/ShareCost/ShoppingCostSplitScreen';
import ManualExpenseScreen from '../screens/ShareCost/ManualExpenseScreen';
import SplitPreviewScreen from '../screens/ShareCost/SplitPreviewScreen';
import { ShoppingListScreen, BatchPurchaseScreen } from '../screens/Shopping';
import { ShareCostStackParamList } from '../types/navigation';
import { NAVIGATION_ROUTES } from '../constants';

const Stack = createStackNavigator<ShareCostStackParamList>();

export default function ShareCostNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerTintColor: '#000',
        headerStyle: {
          backgroundColor: '#fff',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 2,
        },
      }}
    >
      <Stack.Screen
        name={NAVIGATION_ROUTES.SHARE_COST_HOME}
        component={ShareCostHomeScreen}
        options={{ title: 'Share the Cost' }}
      />
      <Stack.Screen
        name={NAVIGATION_ROUTES.SHOPPING_COST_SPLIT}
        component={ShoppingCostSplitScreen}
        options={{ title: 'Split Shopping Cost' }}
      />
      <Stack.Screen
        name={NAVIGATION_ROUTES.MANUAL_EXPENSE}
        component={ManualExpenseScreen}
        options={{ title: 'Add Expense' }}
      />
      <Stack.Screen
        name={NAVIGATION_ROUTES.SPLIT_PREVIEW}
        component={SplitPreviewScreen}
        options={{ title: 'Split Preview' }}
      />
      <Stack.Screen
        name={NAVIGATION_ROUTES.SHOPPING_LIST}
        component={ShoppingListScreen}
        options={{ title: 'Shopping List' }}
      />
      <Stack.Screen
        name={NAVIGATION_ROUTES.BATCH_PURCHASE}
        component={BatchPurchaseScreen}
        options={{ title: 'Batch Purchase' }}
      />
    </Stack.Navigator>
  );
}