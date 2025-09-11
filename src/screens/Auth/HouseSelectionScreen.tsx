import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';

import { Button } from '../../components/UI';
import { RootStackParamList } from '../../types/navigation';
import { COLORS, NAVIGATION_ROUTES } from '../../constants';

type HouseSelectionScreenNavigationProp = StackNavigationProp<RootStackParamList, 'HouseSelection'>;

interface Props {
  navigation: HouseSelectionScreenNavigationProp;
}

export default function HouseSelectionScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>🏠</Text>
          </View>
          <Text style={styles.title}>Welcome to RoomieSync!</Text>
          <Text style={styles.subtitle}>
            To get started, you'll need to either create a new house or join an existing one.
          </Text>
        </View>

        <View style={styles.optionsContainer}>
          <View style={styles.optionCard}>
            <Text style={styles.optionIcon}>✨</Text>
            <Text style={styles.optionTitle}>Create New House</Text>
            <Text style={styles.optionDescription}>
              Start a new shared house and invite your roommates to join
            </Text>
            <Button
              title="Create House"
              onPress={() => navigation.navigate(NAVIGATION_ROUTES.CREATE_HOUSE as any)}
              style={styles.optionButton}
            />
          </View>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.optionCard}>
            <Text style={styles.optionIcon}>🔑</Text>
            <Text style={styles.optionTitle}>Join Existing House</Text>
            <Text style={styles.optionDescription}>
              Use an invite code to join a house that's already set up
            </Text>
            <Button
              title="Join House"
              onPress={() => navigation.navigate(NAVIGATION_ROUTES.JOIN_HOUSE as any)}
              variant="outline"
              style={styles.optionButton}
            />
          </View>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            💡 You can always create or join additional houses later from your profile settings.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  iconContainer: {
    width: 80,
    height: 80,
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  icon: {
    fontSize: 36,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 22,
  },
  optionsContainer: {
    flex: 1,
  },
  optionCard: {
    backgroundColor: COLORS.CARD_BACKGROUND,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.BORDER_LIGHT,
  },
  optionIcon: {
    fontSize: 32,
    marginBottom: 16,
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 8,
    textAlign: 'center',
  },
  optionDescription: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  optionButton: {
    minWidth: 140,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.BORDER_LIGHT,
  },
  dividerText: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    paddingHorizontal: 16,
    fontWeight: '500',
  },
  infoBox: {
    backgroundColor: COLORS.CARD_BACKGROUND,
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.PRIMARY,
    marginTop: 24,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 20,
    textAlign: 'center',
  },
});