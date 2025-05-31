import React from 'react';
import { View, Text, TextInput, useColorScheme } from 'react-native';
import styles from './editEvent.styles';

interface Props {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (text: string) => void;
  error?: string;
}

export function TextField({
  label,
  value,
  placeholder,
  onChange,
  error,
}: Props) {
  const isDark = useColorScheme() === 'dark';

  return (
    <View style={styles.inputContainer}>
      <Text style={[styles.label, { color: isDark ? '#FFF' : '#000' }]}>
        {label}
      </Text>
      <View
        style={[
          styles.textFieldContainer,
          { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' },
        ]}
      >
        <TextInput
          style={[styles.input, { color: isDark ? '#FFF' : '#000', flex: 1 }]}
          placeholder={placeholder}
          placeholderTextColor={isDark ? '#8E8E93' : '#3C3C43'}
          value={value}
          onChangeText={onChange}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}
