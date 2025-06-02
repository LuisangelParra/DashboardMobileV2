import React, { useState } from 'react';
import { View, Text, Pressable, useColorScheme, Platform } from 'react-native';
import { Clock } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import styles from './editEvent.styles';

interface Props {
  label: string;
  value: string; // HH:MM format
  onChange: (time: string) => void;
  error?: string;
}

export function TimePickerField({ label, value, onChange, error }: Props) {
  const isDark = useColorScheme() === 'dark';
  const [showPicker, setShowPicker] = useState(false);

  // Convertir string HH:MM a Date
  const timeValue = (() => {
    if (!value) return new Date();
    
    const [hours, minutes] = value.split(':').map(Number);
    const date = new Date();
    date.setHours(hours || 0, minutes || 0, 0, 0);
    return date;
  })();

  // Formatear hora para mostrar al usuario
  const formatDisplayTime = (timeStr: string): string => {
    if (!timeStr) return 'Seleccionar hora';
    
    try {
      const [hours, minutes] = timeStr.split(':');
      const time = new Date();
      time.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      return time.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } catch {
      return 'Hora inválida';
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    
    if (selectedTime) {
      // Convertir Date a string HH:MM
      const hours = String(selectedTime.getHours()).padStart(2, '0');
      const minutes = String(selectedTime.getMinutes()).padStart(2, '0');
      const timeString = `${hours}:${minutes}`;
      onChange(timeString);
    }
  };

  const openPicker = () => {
    if (Platform.OS === 'web') {
      // Para web, usar input type="time" nativo
      const input = document.createElement('input');
      input.type = 'time';
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
          styles.timePickerButton,
          {
            backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7',
            borderColor: error ? '#FF453A' : (isDark ? '#3C3C43' : '#C7C7CC'),
            borderWidth: 1,
          },
        ]}
        onPress={openPicker}
      >
        <Clock size={20} color={isDark ? '#8E8E93' : '#3C3C43'} />
        <Text
          style={[
            styles.timePickerText,
            { 
              color: value ? (isDark ? '#FFF' : '#000') : (isDark ? '#8E8E93' : '#3C3C43'),
              marginLeft: 8,
            }
          ]}
        >
          {formatDisplayTime(value)}
        </Text>
      </Pressable>

      {showPicker && Platform.OS !== 'web' && (
        <DateTimePicker
          value={timeValue}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleTimeChange}
          onTouchCancel={() => setShowPicker(false)}
        />
      )}

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}