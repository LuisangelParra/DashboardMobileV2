import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { EventCategory } from '@/types';

type CategoryBadgeProps = {
  category: EventCategory;
};

export function CategoryBadge({ category }: CategoryBadgeProps) {
  const getColorForCategory = (): { bg: string, text: string } => {
    switch (category) {
      case 'Workshop':
        return { bg: '#0A84FF33', text: '#0A84FF' };
      case 'Presentation':
        return { bg: '#5E5CE633', text: '#5E5CE6' };
      case 'Panel':
        return { bg: '#30D15833', text: '#30D158' };
      case 'Networking':
        return { bg: '#FF950033', text: '#FF9500' };
      default:
        return { bg: '#8E8E9333', text: '#8E8E93' };
    }
  };

  const colors = getColorForCategory();

  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }]}>
      <Text style={[styles.text, { color: colors.text }]}>
        {category}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});