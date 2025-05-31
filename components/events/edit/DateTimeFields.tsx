// components/events/edit/DateTimeFields.tsx

import React from 'react';
import { View, Text, TextInput, useColorScheme } from 'react-native';
import { Calendar, Clock } from 'lucide-react-native';
import styles from './editEvent.styles';

interface Props {
  date: string;
  startTime: string;
  endTime: string;
  onDateChange: (text: string) => void;
  onStartTimeChange: (text: string) => void;
  onEndTimeChange: (text: string) => void;
  errors?: {
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
  errors = {}
}: Props) {
  const isDark = useColorScheme() === 'dark';

  return (
    <>
      {/* Date */}
      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: isDark ? '#FFF' : '#000' }]}>Date *</Text>
        <View style={styles.iconInput}>
          <Calendar size={20} color={isDark ? '#8E8E93' : '#3C3C43'} />
          <TextInput
            style={[
              styles.input,
              { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7', color: isDark ? '#FFF' : '#000' }
            ]}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={isDark ? '#8E8E93' : '#3C3C43'}
            value={date}
            onChangeText={onDateChange}
          />
        </View>
        {errors.date && <Text style={styles.errorText}>{errors.date}</Text>}
      </View>

      {/* Time (Start / End) */}
      <View style={[styles.row, { marginBottom: 16 }]}>
        <View style={[styles.inputContainer, styles.flex1]}>
          <Text style={[styles.label, { color: isDark ? '#FFF' : '#000' }]}>Start Time *</Text>
          <View style={styles.iconInput}>
            <Clock size={20} color={isDark ? '#8E8E93' : '#3C3C43'} />
            <TextInput
              style={[
                styles.input,
                { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7', color: isDark ? '#FFF' : '#000' }
              ]}
              placeholder="HH:MM"
              placeholderTextColor={isDark ? '#8E8E93' : '#3C3C43'}
              value={startTime}
              onChangeText={onStartTimeChange}
            />
          </View>
          {errors.startTime && <Text style={styles.errorText}>{errors.startTime}</Text>}
        </View>

        <View style={[styles.inputContainer, styles.flex1]}>
          <Text style={[styles.label, { color: isDark ? '#FFF' : '#000' }]}>End Time *</Text>
          <View style={styles.iconInput}>
            <Clock size={20} color={isDark ? '#8E8E93' : '#3C3C43'} />
            <TextInput
              style={[
                styles.input,
                { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7', color: isDark ? '#FFF' : '#000' }
              ]}
              placeholder="HH:MM"
              placeholderTextColor={isDark ? '#8E8E93' : '#3C3C43'}
              value={endTime}
              onChangeText={onEndTimeChange}
            />
          </View>
          {errors.endTime && <Text style={styles.errorText}>{errors.endTime}</Text>}
        </View>
      </View>
    </>
  );
}
