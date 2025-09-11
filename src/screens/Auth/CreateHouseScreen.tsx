import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';

import { Button, Input } from '../../components/UI';
import { useHouse } from '../../context/HouseContext';
import { RootStackParamList } from '../../types/navigation';
import { COLORS, VALIDATION } from '../../constants';
import { CreateHouseRequest } from '../../types/houses';

type CreateHouseScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CreateHouse'>;

interface Props {
  navigation: CreateHouseScreenNavigationProp;
}

export default function CreateHouseScreen({ navigation }: Props) {
  const { createHouse, isLoading } = useHouse();
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    description: '',
    displayName: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate house name
    if (!formData.name.trim()) {
      newErrors.name = 'House name is required';
    } else if (formData.name.trim().length < VALIDATION.HOUSE_NAME_MIN_LENGTH) {
      newErrors.name = `House name must be at least ${VALIDATION.HOUSE_NAME_MIN_LENGTH} characters`;
    } else if (formData.name.trim().length > VALIDATION.HOUSE_NAME_MAX_LENGTH) {
      newErrors.name = `House name must be less than ${VALIDATION.HOUSE_NAME_MAX_LENGTH} characters`;
    }

    // Validate display name
    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Display name is required';
    } else if (formData.displayName.trim().length < VALIDATION.DISPLAY_NAME_MIN_LENGTH) {
      newErrors.displayName = `Display name must be at least ${VALIDATION.DISPLAY_NAME_MIN_LENGTH} characters`;
    } else if (formData.displayName.trim().length > VALIDATION.DISPLAY_NAME_MAX_LENGTH) {
      newErrors.displayName = `Display name must be less than ${VALIDATION.DISPLAY_NAME_MAX_LENGTH} characters`;
    }

    // Validate address (optional but if provided, should not be empty)
    if (formData.address && !formData.address.trim()) {
      newErrors.address = 'Address cannot be empty if provided';
    }

    // Validate description (optional but if provided, should not exceed max length)
    if (formData.description && formData.description.length > VALIDATION.NOTES_MAX_LENGTH) {
      newErrors.description = `Description must be less than ${VALIDATION.NOTES_MAX_LENGTH} characters`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateHouse = async () => {
    if (!validateForm()) return;

    try {
      const houseData: CreateHouseRequest = {
        name: formData.name.trim(),
        displayName: formData.displayName.trim(),
        address: formData.address.trim() || undefined,
        description: formData.description.trim() || undefined,
      };

      await createHouse(houseData);
      
      // Show success message and navigate back or to main app
      Alert.alert(
        'Success!',
        `${houseData.name} has been created successfully. You are now the admin of this house.`,
        [
          {
            text: 'Continue',
            onPress: () => {
              // Navigation will be handled by the root navigator
              // based on the authentication state
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Create house error:', error);
      
      let errorMessage = 'An error occurred while creating the house';
      
      if (error.response?.data?.message) {
        if (Array.isArray(error.response.data.message)) {
          errorMessage = error.response.data.message.join('\n');
        } else {
          errorMessage = error.response.data.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Error', errorMessage);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
          <View style={styles.header}>
            <Text style={styles.title}>Create Your House</Text>
            <Text style={styles.subtitle}>
              Set up your shared living space and start managing expenses together
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              label="House Name *"
              placeholder="e.g., The Beach House, Downtown Apartment"
              value={formData.name}
              onChangeText={(value) => updateField('name', value)}
              error={errors.name}
            />

            <Input
              label="Your Display Name *"
              placeholder="How others will see you in this house"
              value={formData.displayName}
              onChangeText={(value) => updateField('displayName', value)}
              error={errors.displayName}
            />

            <Input
              label="Address (Optional)"
              placeholder="e.g., 123 Main St, City, State"
              value={formData.address}
              onChangeText={(value) => updateField('address', value)}
              error={errors.address}
              leftIcon="location-outline"
            />

            <Input
              label="Description (Optional)"
              placeholder="Tell others about your house..."
              value={formData.description}
              onChangeText={(value) => updateField('description', value)}
              error={errors.description}
              multiline
              numberOfLines={3}
            />

            <Button
              title="Create House"
              onPress={handleCreateHouse}
              loading={isLoading}
              style={styles.createButton}
            />

            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                💡 As the house creator, you'll be the admin and can invite others using a unique invite code.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    paddingBottom: 32,
  },
  createButton: {
    marginTop: 24,
    marginBottom: 16,
  },
  infoBox: {
    backgroundColor: COLORS.CARD_BACKGROUND,
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.PRIMARY,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 20,
  },
});