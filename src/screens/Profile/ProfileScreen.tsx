import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
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
  const { houses } = useHouse();
  const navigation = useNavigation<NavigationProp>();



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
    showArrow = true 
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    showArrow?: boolean;
  }) => (
    <TouchableOpacity style={styles.profileItem} onPress={onPress}>
      <View style={styles.itemLeft}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon as any} size={20} color={COLORS.PRIMARY} />
        </View>
        <View style={styles.itemContent}>
          <Text style={styles.itemTitle}>{title}</Text>
          {subtitle && <Text style={styles.itemSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {showArrow && (
        <Ionicons name="chevron-forward" size={20} color={COLORS.TEXT_LIGHT} />
      )}
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
            houses.map((house, index) => {
              // Get the user's role from the house membership data
              const role = house.membership?.role === 'admin' ? 'Admin' : 'Member';
              
              // For now, we don't have member count data from this endpoint
              // We could fetch it separately or the API could include it
              const subtitle = role;
              
              return (
                <ProfileItem
                  key={house.id}
                  icon="home-outline"
                  title={house.name}
                  subtitle={subtitle}
                  onPress={() => {}}
                  showArrow={index < houses.length - 1}
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