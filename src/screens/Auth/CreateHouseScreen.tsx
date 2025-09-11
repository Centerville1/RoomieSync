import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants';

export default function CreateHouseScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Create House Screen</Text>
      <Text style={styles.subtitle}>Coming soon...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND,
  },
  text: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 8,
  },
});