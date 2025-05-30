import React from 'react';
import { View, Text, StyleSheet, Pressable, useColorScheme } from 'react-native';

type SectionHeaderProps = {
  title: string;
  actionText?: string;
  onActionPress?: () => void;
};

export function SectionHeader({ 
  title, 
  actionText, 
  onActionPress 
}: SectionHeaderProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.title,
          { color: isDark ? '#FFFFFF' : '#000000' }
        ]}
      >
        {title}
      </Text>
      
      {actionText && (
        <Pressable onPress={onActionPress}>
          <Text style={styles.actionText}>
            {actionText}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
    marginTop: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0A84FF',
  },
});