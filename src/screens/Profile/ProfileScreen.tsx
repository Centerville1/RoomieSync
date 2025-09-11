import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { Card, Avatar, Button } from '../../components/UI';
import { useAuth } from '../../context/AuthContext';
import { useHouse } from '../../context/HouseContext';
import { COLORS, NAVIGATION_ROUTES } from '../../constants';
import { RootStackParamList } from '../../types/navigation';

type NavigationProp = StackNavigationProp<RootStackParamList>;

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { houses, currentHouse, switchToHouse } = useHouse();
  const navigation = useNavigation<NavigationProp>();
  const [switchingHouse, setSwitchingHouse] = useState<string | null>(null);




  const handleHouseSwitch = async (houseId: string) => {
    if (houseId === currentHouse?.id) {
      // Already on this house, no need to switch
      return;
    }

    try {
      setSwitchingHouse(houseId);
      const switchedHouse = await switchToHouse(houseId);
      
      if (switchedHouse) {
        // Show success feedback
        Alert.alert(
          'House Switched',
          `Switched to ${switchedHouse.name}`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', 'Failed to switch to the selected house. Please try again.');
      }
    } catch (error) {
      console.error('Error switching house:', error);
      Alert.alert('Error', 'Failed to switch to the selected house. Please try again.');
    } finally {
      setSwitchingHouse(null);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: logout },
      ]
    );
  };

  const ProfileItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    showArrow = true,
    rightComponent,
    disabled = false
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    showArrow?: boolean;
    rightComponent?: React.ReactNode;
    disabled?: boolean;
  }) => (
    <TouchableOpacity 
      style={[styles.profileItem, disabled && styles.profileItemDisabled]} 
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
    >
      <View style={styles.itemLeft}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon as any} size={20} color={COLORS.PRIMARY} />
        </View>
        <View style={styles.itemContent}>
          <Text style={styles.itemTitle}>{title}</Text>
          {subtitle && <Text style={styles.itemSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightComponent ? (
        rightComponent
      ) : showArrow ? (
        <Ionicons name="chevron-forward" size={20} color={COLORS.TEXT_LIGHT} />
      ) : null}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.header}>
          <Avatar
            name={user ? `${user.firstName} ${user.lastName}` : 'User'}
            imageUrl={user?.profileImageUrl}
            color={user?.color}
            size="large"
          />
          <Text style={styles.userName}>
            {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.email || 'Loading...'}
          </Text>
          <Text style={styles.userEmail}>
            {user?.email || ''}
          </Text>
          
          <Button
            title="Edit Profile"
            variant="outline"
            size="small"
            onPress={() => navigation.navigate(NAVIGATION_ROUTES.EDIT_PROFILE as any)}
            style={styles.editButton}
          />
        </View>

        {/* Houses Section */}
        <Card title="🏠 Your Houses" headerColor={COLORS.BALANCE_HEADER}>
          {houses.length > 0 ? (
            houses.map((house) => {
              // Get the user's role from the house membership data
              const role = house.membership?.role === 'admin' ? 'Admin' : 'Member';
              const isCurrentHouse = house.id === currentHouse?.id;
              const isSwitching = switchingHouse === house.id;
              
              const subtitle = isCurrentHouse ? `${role} • Current` : role;
              
              return (
                <ProfileItem
                  key={house.id}
                  icon={isCurrentHouse ? "checkmark-circle" : "home-outline"}
                  title={house.name}
                  subtitle={subtitle}
                  onPress={() => handleHouseSwitch(house.id)}
                  showArrow={!isCurrentHouse && !isSwitching}
                  rightComponent={isSwitching ? (
                    <ActivityIndicator size="small" color={COLORS.PRIMARY} />
                  ) : isCurrentHouse ? (
                    <Ionicons name="checkmark-circle" size={20} color={COLORS.SUCCESS} />
                  ) : undefined}
                  disabled={isSwitching}
                />
              );
            })
          ) : (
            <View style={styles.noHousesContainer}>
              <Text style={styles.noHousesText}>You haven't joined any houses yet</Text>
            </View>
          )}
          <View style={styles.addHouseContainer}>
            <Button
              title="Join House"
              variant="outline"
              size="small"
              onPress={() => navigation.navigate(NAVIGATION_ROUTES.JOIN_HOUSE, { inviteCode: undefined })}
              style={styles.houseButton}
            />
            <Button
              title="Create House"
              size="small"
              onPress={() => navigation.navigate(NAVIGATION_ROUTES.CREATE_HOUSE)}
              style={styles.houseButton}
            />
          </View>
        </Card>

        {/* Account Settings */}
        <Card title="⚙️ Account Settings" headerColor={COLORS.ACTIVITY_HEADER}>
          <ProfileItem
            icon="person-outline"
            title="Personal Information"
            subtitle="Name, email, phone"
            onPress={() => {}}
          />
          <ProfileItem
            icon="notifications-outline"
            title="Notifications"
            subtitle="Push notifications, email alerts"
            onPress={() => {}}
          />
          <ProfileItem
            icon="lock-closed-outline"
            title="Privacy & Security"
            subtitle="Password, two-factor authentication"
            onPress={() => {}}
          />
        </Card>

        {/* Preferences */}
        <Card title="🎨 Preferences" headerColor={COLORS.SHOPPING_HEADER}>
          <ProfileItem
            icon="color-palette-outline"
            title="Theme"
            subtitle="Light mode"
            onPress={() => {}}
          />
          <ProfileItem
            icon="language-outline"
            title="Language"
            subtitle="English"
            onPress={() => {}}
          />
          <ProfileItem
            icon="card-outline"
            title="Currency"
            subtitle="USD ($)"
            onPress={() => {}}
          />
        </Card>

        {/* Support */}
        <Card title="🆘 Support" headerColor="#FEE2E2">
          <ProfileItem
            icon="help-circle-outline"
            title="Help Center"
            onPress={() => {}}
          />
          <ProfileItem
            icon="chatbubble-outline"
            title="Contact Support"
            onPress={() => {}}
          />
          <ProfileItem
            icon="information-circle-outline"
            title="About RoomieSync"
            subtitle="Version 1.0.0"
            onPress={() => {}}
          />
        </Card>

        {/* Sign Out */}
        <View style={styles.signOutContainer}>
          <Button
            title="Sign Out"
            variant="danger"
            onPress={handleLogout}
            style={styles.signOutButton}
          />
        </View>
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
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.TEXT_PRIMARY,
    marginTop: 16,
  },
  userEmail: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 4,
  },
  editButton: {
    marginTop: 16,
    paddingHorizontal: 24,
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER_LIGHT,
  },
  profileItemDisabled: {
    opacity: 0.6,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.PRIMARY + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  itemSubtitle: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 2,
  },
  addHouseContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  houseButton: {
    flex: 1,
  },
  signOutContainer: {
    padding: 24,
    paddingBottom: 40,
  },
  signOutButton: {
    marginTop: 16,
  },
  noHousesContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  noHousesText: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },
});