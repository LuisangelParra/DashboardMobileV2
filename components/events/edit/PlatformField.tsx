import React, { useState } from 'react';
import { View, Text, TextInput, useColorScheme, Platform } from 'react-native';
import { Monitor } from 'lucide-react-native';
import styles from './editEvent.styles';

interface Props {
  value: string;
  onChange: (text: string) => void;
  error?: string;
}

export function PlatformField({ value, onChange, error }: Props) {
  const isDark = useColorScheme() === 'dark';
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.inputContainer}>
      <Text style={[styles.label, { color: isDark ? '#FFF' : '#000' }]}>
        Plataforma *
      </Text>
      <View
        style={[
          styles.iconInput,
          {
            backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7',
            borderColor: isFocused ? '#0A84FF' : '#CCC',
          },
        ]}
      >
        <Monitor size={20} color={isDark ? '#8E8E93' : '#3C3C43'} />
        <TextInput
          style={[
            styles.input,
            { color: isDark ? '#FFF' : '#000', marginLeft: 8 },
            Platform.OS === 'web' ? { outlineWidth: 0 } : {},
          ]}
          placeholder="ej: Zoom, Google Meet, Teams"
          placeholderTextColor={isDark ? '#8E8E93' : '#3C3C43'}
          value={value}
          onChangeText={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}