// components/events/edit/TextField.tsx

import React from 'react';
import { View, Text, TextInput, useColorScheme } from 'react-native';
import styles from './editEvent.styles';

interface Props {
  label: string;
  value: string;
  placeholder: string;
  onChange: (text: string) => void;
  error?: string;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
}

export function TextField({
  label,
  value,
  placeholder,
  onChange,
  error,
  keyboardType = 'default'
}: Props) {
  const isDark = useColorScheme() === 'dark';

  return (
    <View style={styles.inputContainer}>
      <Text style={[styles.label, { color: isDark ? '#FFF' : '#000' }]}>
        {label}
      </Text>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7',
            color: isDark ? '#FFF' : '#000'
          }
        ]}
        placeholder={placeholder}
        placeholderTextColor={isDark ? '#8E8E93' : '#3C3C43'}
        value={value}
        onChangeText={onChange}
        keyboardType={keyboardType}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}
