import React, { useState } from 'react';
import { View, Text, Pressable, TextInput, useColorScheme, Platform } from 'react-native';
import { Calendar } from 'lucide-react-native';
import styles from './editEvent.styles';

// Solo importar en móvil
let DateTimePicker: any = null;
if (Platform.OS !== 'web') {
  DateTimePicker = require('@react-native-community/datetimepicker').default;
}

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
  minimumDate = new Date()
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
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;
      onChange(dateString);
    }
  };

  // ✅ CORREGIDO: Permitir edición libre en web
  const handleWebDateChange = (text: string) => {
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
            styles.webDatePickerContainer,
            {
              backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7',
              borderColor: error ? '#FF453A' : (isDark ? '#3C3C43' : '#C7C7CC'),
              borderWidth: 1,
            },
          ]}
        >
          <Calendar size={20} color={isDark ? '#8E8E93' : '#3C3C43'} />
          <TextInput
            style={[
              styles.webDateInput,
              { 
                color: isDark ? '#FFF' : '#000',
                backgroundColor: 'transparent',
              }
            ]}
            value={value}
            onChangeText={handleWebDateChange} // ✅ Ahora permite edición libre
            placeholder="YYYY-MM-DD"
            placeholderTextColor={isDark ? '#8E8E93' : '#3C3C43'}
            autoCorrect={false}
            autoCapitalize="none"
          />
        </View>

        {/* ✅ Solo mostrar formato válido si la fecha es correcta */}
        {value && /^\d{4}-\d{2}-\d{2}$/.test(value) && (
          <Text style={[styles.dateDisplayText, { color: isDark ? '#8E8E93' : '#6C6C70' }]}>
            {formatDisplayDate(value)}
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
          styles.datePickerButton,
          {
            backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7',
            borderColor: error ? '#FF453A' : (isDark ? '#3C3C43' : '#C7C7CC'),
            borderWidth: 1,
          },
        ]}
        onPress={openMobilePicker}
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

      {showPicker && DateTimePicker && (
        <DateTimePicker
          value={dateValue}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          minimumDate={minimumDate}
          onChange={handleDateChange}
        />
      )}

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}