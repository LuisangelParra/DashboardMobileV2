// components/events/edit/CategorySelector.tsx

import React from 'react';
import { View, Text, Pressable, useColorScheme } from 'react-native';
import styles from './editEvent.styles';
import { EventCategory } from '@/types';

interface Props {
  label: string;
  options: EventCategory[];
  selected: EventCategory | null;
  onSelect: (c: EventCategory) => void;
  error?: string;
}

export function CategorySelector({
  label,
  options,
  selected,
  onSelect,
  error
}: Props) {
  const isDark = useColorScheme() === 'dark';

  return (
    <View style={styles.inputContainer}>
      <Text style={[styles.label, { color: isDark ? '#FFF' : '#000' }]}>
        {label}
      </Text>
      <View style={styles.categoryContainer}>
        {options.map(opt => (
          <Pressable
            key={opt}
            style={[
              styles.categoryChip,
              {
                backgroundColor:
                  selected === opt ? '#0A84FF' : isDark ? '#2C2C2E' : '#F2F2F7'
              }
            ]}
            onPress={() => onSelect(opt)}
          >
            <Text
              style={[
                styles.categoryChipText,
                {
                  color: selected === opt ? '#FFF' : isDark ? '#FFF' : '#000'
                }
              ]}
            >
              {opt}
            </Text>
          </Pressable>
        ))}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}
