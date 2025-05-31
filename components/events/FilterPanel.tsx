import React from 'react';
import { View, Text, Pressable, useColorScheme } from 'react-native';
import { Filter } from 'lucide-react-native';
import styles from './events.styles';
import { EventCategory } from '@/types';

interface Props {
  visible: boolean;
  onToggle: () => void;
  categories: EventCategory[];
  selected: EventCategory | null;
  onSelect: (c: EventCategory | null) => void;
}

export function FilterPanel({ visible, onToggle, categories, selected, onSelect }: Props) {
  const isDark = useColorScheme() === 'dark';

  if (!visible) {
    return (
      <Pressable
        style={[styles.filterButton, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}
        onPress={onToggle}
      >
        <Filter size={20} color={isDark ? '#FFFFFF' : '#000000'} />
      </Pressable>
    );
  }

  return (
    <View style={[styles.filtersContainer, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
      <View style={styles.filterHeader}>
        <Text style={[styles.filterTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
          Filter by Category
        </Text>
        <Pressable onPress={() => onSelect(null)} style={styles.clearFilterButton}>
          <Text style={styles.clearFilterText}>Clear</Text>
        </Pressable>
      </View>

      <View style={styles.categoriesContainer}>
        {categories.map(cat => (
          <Pressable
            key={cat}
            style={[
              styles.categoryChip,
              { backgroundColor: selected === cat ? '#0A84FF' : isDark ? '#2C2C2E' : '#E5E5EA' }
            ]}
            onPress={() => onSelect(selected === cat ? null : cat)}
          >
            <Text
              style={[
                styles.categoryChipText,
                { color: selected === cat ? '#FFFFFF' : isDark ? '#FFFFFF' : '#000000' }
              ]}
            >
              {cat}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
