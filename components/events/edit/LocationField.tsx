// components/events/edit/LocationField.tsx

import React from 'react';
import { View, Text, TextInput, useColorScheme } from 'react-native';
import { MapPin } from 'lucide-react-native';
import styles from './editEvent.styles';

interface Props {
  value: string;
  onChange: (text: string) => void;
  error?: string;
}

export function LocationField({ value, onChange, error }: Props) {
  const isDark = useColorScheme() === 'dark';

  return (
    <View style={styles.inputContainer}>
      <Text style={[styles.label, { color: isDark ? '#FFF' : '#000' }]}>
        Location *
      </Text>
      <View style={styles.iconInput}>
        <MapPin size={20} color={isDark ? '#8E8E93' : '#3C3C43'} />
        <TextInput
          style={[
            styles.input,
            { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7', color: isDark ? '#FFF' : '#000' }
          ]}
          placeholder="Enter location"
          placeholderTextColor={isDark ? '#8E8E93' : '#3C3C43'}
          value={value}
          onChangeText={onChange}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}
