// components/events/edit/DateTimeFields.tsx

import React, { useState } from 'react';
import { View, Text, TextInput, useColorScheme, Platform } from 'react-native';
import { Calendar, Clock } from 'lucide-react-native';
import styles from './editEvent.styles';

interface Props {
  date: string;
  startTime: string;
  endTime: string;
  onDateChange: (text: string) => void;
  onStartTimeChange: (text: string) => void;
  onEndTimeChange: (text: string) => void;
  errors: {
    date?: string;
    startTime?: string;
    endTime?: string;
  };
}

export function DateTimeFields({
  date,
  startTime,
  endTime,
  onDateChange,
  onStartTimeChange,
  onEndTimeChange,
  errors,
}: Props) {
  const isDark = useColorScheme() === 'dark';
  const [focusField, setFocusField] = useState<'date' | 'start' | 'end' | null>(null);

  return (
    <View style={styles.dateTimeGroupContainer}>
      {/* Campo Fecha */}
      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: isDark ? '#FFF' : '#000' }]}>Date *</Text>
        <View
          style={[
            styles.iconInput,
            {
              backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7',
              borderColor: focusField === 'date' ? '#0A84FF' : '#CCC',
            },
          ]}
        >
          <Calendar size={20} color={isDark ? '#8E8E93' : '#3C3C43'} />
          <TextInput
            style={[
              styles.input,
              { color: isDark ? '#FFF' : '#000', marginLeft: 8 },
              Platform.OS === 'web' ? { outlineWidth: 0 } : {},
            ]}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={isDark ? '#8E8E93' : '#3C3C43'}
            value={date}
            onChangeText={onDateChange}
            onFocus={() => setFocusField('date')}
            onBlur={() => setFocusField(null)}
          />
        </View>
        {errors.date && <Text style={styles.errorText}>{errors.date}</Text>}
      </View>

      {/* Campos Hora */}
      <View style={styles.timeContainer}>
        {/* Start Time */}
        <View style={styles.timeFieldWrapper}>
          <Text style={[styles.label, { color: isDark ? '#FFF' : '#000' }]}>
            Start Time *
          </Text>
          <View
            style={[
              styles.iconInput,
              {
                backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7',
                borderColor: focusField === 'start' ? '#0A84FF' : '#CCC',
              },
            ]}
          >
            <Clock size={20} color={isDark ? '#8E8E93' : '#3C3C43'} />
            <TextInput
              style={[
                styles.input,
                { color: isDark ? '#FFF' : '#000', marginLeft: 8 },
                Platform.OS === 'web' ? { outlineWidth: 0 } : {},
              ]}
              placeholder="HH:MM"
              placeholderTextColor={isDark ? '#8E8E93' : '#3C3C43'}
              value={startTime}
              onChangeText={onStartTimeChange}
              onFocus={() => setFocusField('start')}
              onBlur={() => setFocusField(null)}
            />
          </View>
          {errors.startTime && <Text style={styles.errorText}>{errors.startTime}</Text>}
        </View>

        {/* End Time */}
        <View style={styles.timeFieldWrapper}>
          <Text style={[styles.label, { color: isDark ? '#FFF' : '#000' }]}>
            End Time *
          </Text>
          <View
            style={[
              styles.iconInput,
              {
                backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7',
                borderColor: focusField === 'end' ? '#0A84FF' : '#CCC',
              },
            ]}
          >
            <Clock size={20} color={isDark ? '#8E8E93' : '#3C3C43'} />
            <TextInput
              style={[
                styles.input,
                { color: isDark ? '#FFF' : '#000', marginLeft: 8 },
                Platform.OS === 'web' ? { outlineWidth: 0 } : {},
              ]}
              placeholder="HH:MM"
              placeholderTextColor={isDark ? '#8E8E93' : '#3C3C43'}
              value={endTime}
              onChangeText={onEndTimeChange}
              onFocus={() => setFocusField('end')}
              onBlur={() => setFocusField(null)}
            />
          </View>
          {errors.endTime && <Text style={styles.errorText}>{errors.endTime}</Text>}
        </View>
      </View>
    </View>
  );
}
