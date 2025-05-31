import React from 'react';
import { View, Text, Pressable, useColorScheme } from 'react-native';
import styles from './editEvent.styles';

interface Props {
  label: string;
  /** Lista completa de tracks disponibles */
  options: string[];
  /** Tracks actualmente seleccionados */
  selected: string[];
  /** Toggle: agrega o quita el track pulsado */
  onSelect: (track: string) => void;
  error?: string;
}

export function CategorySelector({
  label,
  options,
  selected,
  onSelect,
  error,
}: Props) {
  const isDark = useColorScheme() === 'dark';

  return (
    <View style={styles.inputContainer}>
      <Text style={[styles.label, { color: isDark ? '#FFF' : '#000' }]}>
        {label}
      </Text>

      <View style={styles.categoryContainer}>
        {options.map(opt => {
          const isSelected = selected.includes(opt);
          return (
            <Pressable
              key={opt}
              style={[
                styles.categoryChip,
                {
                  backgroundColor: isSelected
                    ? '#0A84FF'
                    : isDark
                    ? '#2C2C2E'
                    : '#F2F2F7',
                },
              ]}
              onPress={() => onSelect(opt)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  { color: isSelected ? '#FFF' : isDark ? '#FFF' : '#000' },
                ]}
              >
                {opt}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}
