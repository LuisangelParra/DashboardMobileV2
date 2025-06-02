import React, { useState } from 'react';
import { View, Text, TextInput, useColorScheme, Platform } from 'react-native';
import styles from './editEvent.styles';

interface Props {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (text: string) => void;
  error?: string;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
}

export function TextField({
  label,
  value,
  placeholder,
  onChange,
  error,
  keyboardType = 'default',
}: Props) {
  const isDark = useColorScheme() === 'dark';
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.inputContainer}>
      <Text style={[styles.label, { color: isDark ? '#FFF' : '#000' }]}>
        {label}
      </Text>
      <View
        style={[
          styles.textFieldContainer,
          { 
            backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7',
            borderColor: isFocused ? '#0A84FF' : (isDark ? '#3C3C3E' : '#CCC'),
            borderWidth: 1,
          },
        ]}
      >
        <TextInput
          style={[
            styles.input, 
            { 
              color: isDark ? '#FFF' : '#000',
              ...Platform.select({
                web: { outlineWidth: 0 }
              })
            }
          ]}
          placeholder={placeholder}
          placeholderTextColor={isDark ? '#8E8E93' : '#3C3C43'}
          value={value}
          onChangeText={onChange}
          keyboardType={keyboardType}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}