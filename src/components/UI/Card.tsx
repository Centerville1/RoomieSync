import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CardProps } from '../../types/ui';
import { COLORS } from '../../constants';
import { getContrastingTextColor } from '../../utils/colorUtils';

export default function Card({ title, headerColor, children, style }: CardProps) {
  // Determine text color based on background contrast
  const textColor = headerColor 
    ? getContrastingTextColor(headerColor) 
    : COLORS.TEXT_PRIMARY;

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.header, { backgroundColor: headerColor }]}>
        <Text style={[styles.title, { color: textColor }]}>{title}</Text>
      </View>
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.CARD_BACKGROUND,
    borderRadius: 12,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.TEXT_PRIMARY,
  },
  content: {
    padding: 16,
  },
});