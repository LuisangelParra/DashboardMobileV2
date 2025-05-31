import React from 'react';
import { View, TextInput, useColorScheme } from 'react-native';
import { Search } from 'lucide-react-native';
import styles from './events.styles';

interface Props {
  value: string;
  onChange: (text: string) => void;
}

export function SearchBar({ value, onChange }: Props) {
  const isDark = useColorScheme() === 'dark';
  return (
    <View style={[styles.searchInputContainer, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
      <Search size={20} color={isDark ? '#8E8E93' : '#3C3C43'} />
      <TextInput
        style={[styles.searchInput, { color: isDark ? '#FFFFFF' : '#000000' }]}
        placeholder="Search events..."
        placeholderTextColor={isDark ? '#8E8E93' : '#3C3C43'}
        value={value}
        onChangeText={onChange}
      />
    </View>
  );
}
