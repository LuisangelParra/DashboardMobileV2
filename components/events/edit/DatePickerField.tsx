import React, { useState } from 'react';
import { View, Text, Pressable, useColorScheme, Platform } from 'react-native';
import { Calendar } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import styles from './editEvent.styles';

interface Props {
  label: string;
  value: string; // YYYY-MM-DD format
  onChange: (date: string) => void;
  error?: string;
  minimumDate?: Date;
}

export function DatePickerField({ 
  label, 
  value, 
  onChange, 
  error,
  minimumDate = new Date() // Por defecto, fecha mínima es hoy
}: Props) {
  const isDark = useColorScheme() === 'dark';
  const [showPicker, setShowPicker] = useState(false);

  // Convertir string YYYY-MM-DD a Date
  const dateValue = value ? new Date(value + 'T00:00:00') : new Date();

  // Formatear fecha para mostrar al usuario
  const formatDisplayDate = (dateStr: string): string => {
    if (!dateStr) return 'Seleccionar fecha';
    
    try {
      const date = new Date(dateStr + 'T00:00:00');
      return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Fecha inválida';
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    
    if (selectedDate) {
      // Convertir Date a string YYYY-MM-DD
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;
      onChange(dateString);
    }
  };

  const openPicker = () => {
    if (Platform.OS === 'web') {
      // Para web, usar input type="date" nativo
      const input = document.createElement('input');
      input.type = 'date';
      input.min = minimumDate.toISOString().split('T')[0];
      input.value = value;
      input.onchange = (e) => {
        const target = e.target as HTMLInputElement;
        if (target.value) {
          onChange(target.value);
        }
      };
      input.click();
    } else {
      setShowPicker(true);
    }
  };

  return (
    <View style={styles.inputContainer}>
      <Text style={[styles.label, { color: isDark ? '#FFF' : '#000' }]}>
        {label}
      </Text>
      
      <Pressable
        style={[
          styles.datePickerButton,
          {
            backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7',
            borderColor: error ? '#FF453A' : (isDark ? '#3C3C43' : '#C7C7CC'),
            borderWidth: 1,
          },
        ]}
        onPress={openPicker}
      >
        <Calendar size={20} color={isDark ? '#8E8E93' : '#3C3C43'} />
        <Text
          style={[
            styles.datePickerText,
            { 
              color: value ? (isDark ? '#FFF' : '#000') : (isDark ? '#8E8E93' : '#3C3C43'),
              marginLeft: 8,
            }
          ]}
        >
          {formatDisplayDate(value)}
        </Text>
      </Pressable>

      {showPicker && Platform.OS !== 'web' && (
        <DateTimePicker
          value={dateValue}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          minimumDate={minimumDate}
          onChange={handleDateChange}
          onTouchCancel={() => setShowPicker(false)}
        />
      )}

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}