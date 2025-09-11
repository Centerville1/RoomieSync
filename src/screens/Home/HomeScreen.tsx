import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { Card, Avatar, Button } from '../../components/UI';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../constants';
import { House } from '../../types/houses';
import { Balance } from '../../types/expenses';
import { ShoppingItem } from '../../types/shopping';

export default function HomeScreen() {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [currentHouse, setCurrentHouse] = useState<House | null>(null);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  // Mock data for demo
  useEffect(() => {
    loadMockData();
  }, []);

  const loadMockData = () => {
    // Mock house data
    setCurrentHouse({
      id: '1',
      name: 'The Squad House',
      address: '123 Main St',
      inviteCode: 'SQUAD123',
      color: '#10B981',
      imageUrl: undefined,
      isActive: true,
      createdAt: '2025-01-01',
      updatedAt: '2025-01-01',
      members: [
        { 
          id: '1', 
          displayName: 'You', 
          role: 'admin', 
          isActive: true, 
          joinedAt: '2025-01-01', 
          updatedAt: '2025-01-01',
          user: user!
        },
        { 
          id: '2', 
          displayName: 'Alex', 
          role: 'member', 
          isActive: true, 
          joinedAt: '2025-01-01', 
          updatedAt: '2025-01-01' 
        },
        { 
          id: '3', 
          displayName: 'Sam', 
          role: 'member', 
          isActive: true, 
          joinedAt: '2025-01-01', 
          updatedAt: '2025-01-01' 
        },
      ]
    });

    // Mock balance data
    setBalances([
      {
        id: '1',
        amount: 45.50,
        fromUser: { id: '2', firstName: 'Alex', lastName: 'Johnson' } as any,
        toUser: user!,
        house: {} as any,
        createdAt: '2025-01-01',
        updatedAt: '2025-01-01',
      },
      {
        id: '2',
        amount: 23.75,
        fromUser: user!,
        toUser: { id: '3', firstName: 'Sam', lastName: 'Wilson' } as any,
        house: {} as any,
        createdAt: '2025-01-01',
        updatedAt: '2025-01-01',
      },
    ]);

    // Mock shopping items
    setShoppingItems([
      {
        id: '1',
        name: 'Milk',
        quantity: 2,
        notes: '2% milk',
        isRecurring: true,
        recurringInterval: 7,
        createdAt: '2025-01-01',
        updatedAt: '2025-01-01',
      },
      {
        id: '2',
        name: 'Bread',
        quantity: 1,
        isRecurring: false,
        createdAt: '2025-01-01',
        updatedAt: '2025-01-01',
      },
      {
        id: '3',
        name: 'Eggs',
        quantity: 12,
        isRecurring: true,
        recurringInterval: 14,
        createdAt: '2025-01-01',
        updatedAt: '2025-01-01',
      },
    ]);

    // Mock recent activity
    setRecentActivity([
      { id: '1', type: 'expense', description: 'Grocery shopping', amount: 87.50, user: 'Alex', time: '2 hours ago' },
      { id: '2', type: 'payment', description: 'Rent payment', amount: 1200.00, user: 'Sam', time: '1 day ago' },
      { id: '3', type: 'shopping', description: 'Added milk to shopping list', user: 'You', time: '2 days ago' },
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // TODO: Refresh data from API
    setTimeout(() => setRefreshing(false), 1000);
  };

  const formatAmount = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'expense': return 'receipt-outline';
      case 'payment': return 'card-outline';
      case 'shopping': return 'bag-outline';
      default: return 'time-outline';
    }
  };

  if (!currentHouse) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No House Selected</Text>
          <Text style={styles.emptySubtitle}>Join or create a house to get started</Text>
          <Button title="Get Started" onPress={() => {}} style={styles.emptyButton} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with house info */}
      <LinearGradient
        colors={[currentHouse.color, currentHouse.color + '90']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.houseInfo}>
            <Avatar
              name={currentHouse.name}
              imageUrl={currentHouse.imageUrl}
              color={currentHouse.color}
              size="large"
            />
            <View style={styles.houseDetails}>
              <Text style={styles.houseName}>{currentHouse.name}</Text>
              <Text style={styles.memberCount}>
                {currentHouse.members?.length || 0} members
              </Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.settingsButton}>
            <Ionicons name="settings-outline" size={24} color={COLORS.TEXT_WHITE} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Balances Card */}
        <Card title="💰 Balances" headerColor={COLORS.BALANCE_HEADER}>
          {balances.length === 0 ? (
            <Text style={styles.emptyCardText}>All settled up! 🎉</Text>
          ) : (
            <>
              {balances.map((balance) => (
                <View key={balance.id} style={styles.balanceItem}>
                  <View style={styles.balanceInfo}>
                    <Text style={styles.balanceText}>
                      {balance.fromUser.id === user?.id 
                        ? `You owe ${balance.toUser.firstName}`
                        : `${balance.fromUser.firstName} owes you`
                      }
                    </Text>
                    <Text style={[
                      styles.balanceAmount,
                      { color: balance.fromUser.id === user?.id ? COLORS.ERROR : COLORS.SUCCESS }
                    ]}>
                      {formatAmount(balance.amount)}
                    </Text>
                  </View>
                  <TouchableOpacity style={styles.payButton}>
                    <Text style={styles.payButtonText}>
                      {balance.fromUser.id === user?.id ? 'Pay' : 'Remind'}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </>
          )}
        </Card>

        {/* Shopping List Card */}
        <Card title="🛒 Shopping List" headerColor={COLORS.SHOPPING_HEADER}>
          {shoppingItems.length === 0 ? (
            <Text style={styles.emptyCardText}>Shopping list is empty</Text>
          ) : (
            <>
              {shoppingItems.slice(0, 5).map((item) => (
                <View key={item.id} style={styles.shoppingItem}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
                  </View>
                  <TouchableOpacity style={styles.checkButton}>
                    <Ionicons name="checkmark-circle-outline" size={24} color={COLORS.SUCCESS} />
                  </TouchableOpacity>
                </View>
              ))}
              {shoppingItems.length > 5 && (
                <TouchableOpacity style={styles.viewAllButton}>
                  <Text style={styles.viewAllText}>View all {shoppingItems.length} items</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </Card>

        {/* Recent Activity Card */}
        <Card title="📋 Recent Activity" headerColor={COLORS.ACTIVITY_HEADER}>
          {recentActivity.length === 0 ? (
            <Text style={styles.emptyCardText}>No recent activity</Text>
          ) : (
            <>
              {recentActivity.map((activity) => (
                <View key={activity.id} style={styles.activityItem}>
                  <View style={styles.activityIcon}>
                    <Ionicons 
                      name={getActivityIcon(activity.type)} 
                      size={20} 
                      color={COLORS.TEXT_SECONDARY} 
                    />
                  </View>
                  <View style={styles.activityDetails}>
                    <Text style={styles.activityDescription}>{activity.description}</Text>
                    <Text style={styles.activityMeta}>
                      {activity.user} • {activity.time}
                    </Text>
                  </View>
                  {activity.amount && (
                    <Text style={styles.activityAmount}>
                      {formatAmount(activity.amount)}
                    </Text>
                  )}
                </View>
              ))}
            </>
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  houseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  houseDetails: {
    marginLeft: 16,
    flex: 1,
  },
  houseName: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.TEXT_WHITE,
  },
  memberCount: {
    fontSize: 16,
    color: COLORS.TEXT_WHITE + '90',
    marginTop: 4,
  },
  settingsButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginTop: 8,
  },
  emptyButton: {
    marginTop: 24,
    minWidth: 200,
  },
  emptyCardText: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  balanceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER_LIGHT,
  },
  balanceInfo: {
    flex: 1,
  },
  balanceText: {
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
  },
  balanceAmount: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 4,
  },
  payButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 6,
  },
  payButtonText: {
    color: COLORS.TEXT_WHITE,
    fontWeight: '600',
  },
  shoppingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER_LIGHT,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
  },
  itemQuantity: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 2,
  },
  checkButton: {
    padding: 4,
  },
  viewAllButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 16,
    color: COLORS.PRIMARY,
    fontWeight: '600',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER_LIGHT,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.BACKGROUND,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityDetails: {
    flex: 1,
  },
  activityDescription: {
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
  },
  activityMeta: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 2,
  },
  activityAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
});