import React, { useState } from 'react';
import { View, Text, Pressable, TextInput, useColorScheme, Platform } from 'react-native';
import { Clock } from 'lucide-react-native';
import styles from './editEvent.styles';

// Solo importar en móvil
let DateTimePicker: any = null;
if (Platform.OS !== 'web') {
  DateTimePicker = require('@react-native-community/datetimepicker').default;
}

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
      if (!hours || !minutes) return timeStr; // Mostrar tal como está si no es formato completo
      
      const time = new Date();
      time.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      return time.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } catch {
      return timeStr; // Mostrar tal como está si hay error
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    
    if (selectedTime) {
      const hours = String(selectedTime.getHours()).padStart(2, '0');
      const minutes = String(selectedTime.getMinutes()).padStart(2, '0');
      const timeString = `${hours}:${minutes}`;
      onChange(timeString);
    }
  };

  // ✅ CORREGIDO: Permitir edición libre en web
  const handleWebTimeChange = (text: string) => {
    // Permitir cualquier cambio, sin validación estricta
    onChange(text);
  };

  const openMobilePicker = () => {
    setShowPicker(true);
  };

  if (Platform.OS === 'web') {
    return (
      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: isDark ? '#FFF' : '#000' }]}>
          {label}
        </Text>
        
        <View
          style={[
            styles.webTimePickerContainer,
            {
              backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7',
              borderColor: error ? '#FF453A' : (isDark ? '#3C3C43' : '#C7C7CC'),
              borderWidth: 1,
            },
          ]}
        >
          <Clock size={20} color={isDark ? '#8E8E93' : '#3C3C43'} />
          <TextInput
            style={[
              styles.webTimeInput,
              { 
                color: isDark ? '#FFF' : '#000',
                backgroundColor: 'transparent',
              }
            ]}
            value={value}
            onChangeText={handleWebTimeChange} // ✅ Ahora permite edición libre
            placeholder="HH:MM"
            placeholderTextColor={isDark ? '#8E8E93' : '#3C3C43'}
            autoCorrect={false}
            autoCapitalize="none"
          />
        </View>

        {/* ✅ Solo mostrar formato válido si la hora es correcta */}
        {value && /^\d{1,2}:\d{2}$/.test(value) && (
          <Text style={[styles.timeDisplayText, { color: isDark ? '#8E8E93' : '#6C6C70' }]}>
            {formatDisplayTime(value)}
          </Text>
        )}

        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    );
  }

  // Versión móvil (sin cambios)
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
        onPress={openMobilePicker}
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

      {showPicker && DateTimePicker && (
        <DateTimePicker
          value={timeValue}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleTimeChange}
        />
      )}

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}