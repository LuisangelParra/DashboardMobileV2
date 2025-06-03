import React from 'react';
import { View, Text, useColorScheme } from 'react-native';

interface CategoryBadgeProps {
  category: string;
  size?: 'small' | 'medium';
}

export function CategoryBadge({ category, size = 'medium' }: CategoryBadgeProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const getCategoryColor = (category: string) => {
    const colors = {
      'Technology': '#007AFF',
      'Business': '#32D74B',
      'Design': '#FF9500',
      'Marketing': '#FF453A',
      'Development': '#5856D6',
      'AI': '#AF52DE',
      'Data': '#00C7BE',
      'Mobile': '#34C759',
      'Web': '#007AFF',
      'Cloud': '#5AC8FA',
    };
    
    return colors[category as keyof typeof colors] || '#8E8E93';
  };

  const backgroundColor = getCategoryColor(category);
  const isSmall = size === 'small';

  return (
    <View style={[
      styles.badge,
      { 
        backgroundColor: `${backgroundColor}20`,
        paddingHorizontal: isSmall ? 8 : 12,
        paddingVertical: isSmall ? 4 : 6,
      }
    ]}>
      <Text style={[
        isSmall ? styles.smallBadgeText : styles.badgeText,
        { color: backgroundColor }
      ]}>
        {category}
      </Text>
    </View>
  );
}

const styles = {
  badge: {
    borderRadius: 16,
    alignSelf: 'flex-start' as const,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  smallBadgeText: {
    fontSize: 10,
    fontWeight: '600' as const,
  },
};