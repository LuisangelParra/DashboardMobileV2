// components/events/edit/LocationField.tsx

import React, { useState } from 'react';
import { View, Text, TextInput, useColorScheme, Platform } from 'react-native';
import { MapPin } from 'lucide-react-native';
import styles from './editEvent.styles';

interface Props {
  value: string;
  onChange: (text: string) => void;
  error?: string;
}

export function LocationField({ value, onChange, error }: Props) {
  const isDark = useColorScheme() === 'dark';
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.inputContainer}>
      <Text style={[styles.label, { color: isDark ? '#FFF' : '#000' }]}>
        Location *
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
        <MapPin size={20} color={isDark ? '#8E8E93' : '#3C3C43'} />
        <TextInput
          style={[
            styles.input,
            { color: isDark ? '#FFF' : '#000', marginLeft: 8 },
            // *Importante*: si quieres, aquí también podrías volver a
            // asegurar “outlineWidth: 0” en caso de no heredar correctamente.
            Platform.OS === 'web' ? { outlineWidth: 0 } : {},
          ]}
          placeholder="Enter location"
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
